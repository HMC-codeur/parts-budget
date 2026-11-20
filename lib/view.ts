import {
  type BudgetData,
  type Category,
  categoryBalance,
} from "./budget";
import { monthKey } from "./dates";
import { type Locale, displayCategoryName, translate } from "./i18n";

export type Envelope = Category & {
  balance: number;
  monthAllocated: number;
  monthSpent: number;
};

export type Movement = {
  id: string;
  kind: "income" | "expense";
  label: string;
  amount: number;
  date: string;
  detail: string;
  createdAt: string;
};

export type MonthView = {
  incomeTotal: number;
  allocatedTotal: number;
  envelopes: Envelope[];
  movements: Movement[];
};

export function buildMonthView(
  data: BudgetData,
  month: string,
  filterId: string | null,
  locale: Locale = "fr",
): MonthView {
  const monthIncomes = data.incomes.filter((income) => monthKey(income.date) === month);
  const monthExpenses = data.expenses.filter((expense) => monthKey(expense.date) === month);
  const nameOf = (category: Category) => displayCategoryName(category, locale);
  const envelopes: Envelope[] = data.categories.map((category) => ({
    ...category,
    name: nameOf(category),
    balance: categoryBalance(data, category.id),
    monthAllocated: monthIncomes.reduce((total, income) => {
      const allocation = income.allocations.find((item) => item.categoryId === category.id);
      return total + (allocation?.amount ?? 0);
    }, 0),
    monthSpent: monthExpenses.reduce(
      (total, expense) => (expense.categoryId === category.id ? total + expense.amount : total),
      0,
    ),
  }));

  const incomeMovements: Movement[] = monthIncomes.flatMap((income) => {
    const allocation = filterId
      ? (income.allocations.find((item) => item.categoryId === filterId)?.amount ?? 0)
      : income.amount;
    if (filterId && allocation <= 0) return [];
    const placed = income.allocations.reduce((total, item) => total + item.amount, 0);
    const detail = filterId
      ? translate(locale, "detailShare")
      : placed === income.amount
        ? translate(locale, "detailAllocated")
        : translate(locale, "detailPartial");
    return [
      {
        id: income.id,
        kind: "income" as const,
        label: income.label.trim() || translate(locale, "income"),
        amount: allocation,
        date: income.date,
        detail,
        createdAt: income.createdAt,
      },
    ];
  });

  const expenseMovements: Movement[] = monthExpenses
    .filter((expense) => !filterId || expense.categoryId === filterId)
    .map((expense) => {
      const category = data.categories.find((item) => item.id === expense.categoryId);
      const categoryName = category ? nameOf(category) : translate(locale, "envelope");
      return {
        id: expense.id,
        kind: "expense" as const,
        label: expense.label.trim() || categoryName || translate(locale, "expense"),
        amount: expense.amount,
        date: expense.date,
        detail: categoryName,
        createdAt: expense.createdAt,
      };
    });

  const movements = [...incomeMovements, ...expenseMovements].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1;
    return a.id < b.id ? 1 : -1;
  });

  return {
    incomeTotal: monthIncomes.reduce((total, income) => total + income.amount, 0),
    allocatedTotal: envelopes.reduce((total, envelope) => total + envelope.monthAllocated, 0),
    envelopes,
    movements,
  };
}
