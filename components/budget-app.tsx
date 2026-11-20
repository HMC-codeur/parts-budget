"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { CategoriesDialog } from "@/components/categories-dialog";
import { ExpenseDialog } from "@/components/expense-dialog";
import { IncomeDialog } from "@/components/income-dialog";
import { Overview } from "@/components/overview";
import { ServiceWorker } from "@/components/service-worker";
import { useI18n } from "@/components/i18n";
import {
  type BudgetData,
  type Expense,
  type Income,
  availableBalance,
  categoryIsUsed,
} from "@/lib/budget";
import { currentMonth, monthKey, monthOffsetFrom, shiftMonth, todayISO } from "@/lib/dates";
import {
  readBudgetSnapshot,
  serverBudgetSnapshot,
  subscribeBudget,
  writeBudget,
} from "@/lib/storage";
import { buildMonthView } from "@/lib/view";

function noopSubscribe() {
  return () => {};
}

function clientMonth() {
  return currentMonth(new Date());
}

function serverMonth() {
  return "";
}

type IncomeSession = { income: Income | null; today: string };
type ExpenseSession = { expense: Expense | null; today: string };

function Skeleton() {
  return (
    <div className="pt-8">
      <p className="font-heading text-[2rem] leading-none tracking-tight italic">Parts</p>
      <p className="sr-only">…</p>
      <div className="mt-8 h-11 rounded-full bg-muted" />
      <div className="mt-16 h-28 rounded-3xl bg-muted" />
    </div>
  );
}

export function BudgetApp() {
  const data = useSyncExternalStore(subscribeBudget, readBudgetSnapshot, serverBudgetSnapshot);
  const baseMonth = useSyncExternalStore(noopSubscribe, clientMonth, serverMonth);
  const [monthOffset, setMonthOffset] = useState(0);
  const [filterId, setFilterId] = useState<string | null>(null);
  const [incomeSession, setIncomeSession] = useState<IncomeSession | null>(null);
  const [expenseSession, setExpenseSession] = useState<ExpenseSession | null>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const { locale } = useI18n();
  const month = baseMonth ? shiftMonth(baseMonth, monthOffset) : null;

  const view = useMemo(
    () => (month ? buildMonthView(data, month, filterId, locale) : null),
    [data, month, filterId, locale],
  );

  function update(recipe: (current: BudgetData) => BudgetData) {
    writeBudget(recipe(data));
  }

  function openIncome(income: Income | null) {
    setIncomeSession({ income, today: todayISO(new Date()) });
  }

  function openExpense(expense: Expense | null) {
    setExpenseSession({ expense, today: todayISO(new Date()) });
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5">
      <ServiceWorker />
      {month && view ? (
        <Overview
          month={month}
          view={view}
          filterId={filterId}
          onMonth={(delta) => setMonthOffset((current) => current + delta)}
          onFilter={setFilterId}
          onOpenIncome={() => openIncome(null)}
          onOpenExpense={() => openExpense(null)}
          onOpenCategories={() => setCategoriesOpen(true)}
          onEditIncome={(id) => openIncome(data.incomes.find((income) => income.id === id) ?? null)}
          onEditExpense={(id) => openExpense(data.expenses.find((expense) => expense.id === id) ?? null)}
        />
      ) : (
        <Skeleton />
      )}

      {data && incomeSession && (
        <IncomeDialog
          key={incomeSession.income?.id ?? "nouveau-revenu"}
          income={incomeSession.income}
          categories={data.categories}
          today={incomeSession.today}
          onClose={() => setIncomeSession(null)}
          onSubmit={(income) => {
            update((current) => ({
              ...current,
              incomes: current.incomes.some((item) => item.id === income.id)
                ? current.incomes.map((item) => (item.id === income.id ? income : item))
                : [income, ...current.incomes],
            }));
            setMonthOffset(monthOffsetFrom(baseMonth, monthKey(income.date)));
            setIncomeSession(null);
          }}
          onDelete={
            incomeSession.income
              ? () => {
                  const id = incomeSession.income?.id;
                  update((current) => ({
                    ...current,
                    incomes: current.incomes.filter((item) => item.id !== id),
                  }));
                  setIncomeSession(null);
                }
              : undefined
          }
        />
      )}

      {data && expenseSession && (
        <ExpenseDialog
          key={expenseSession.expense?.id ?? "nouvelle-depense"}
          expense={expenseSession.expense}
          categories={data.categories}
          today={expenseSession.today}
          available={Object.fromEntries(
            data.categories.map((category) => [
              category.id,
              availableBalance(data, category.id, expenseSession.expense?.id),
            ]),
          )}
          onClose={() => setExpenseSession(null)}
          onSubmit={(expense) => {
            update((current) => ({
              ...current,
              expenses: current.expenses.some((item) => item.id === expense.id)
                ? current.expenses.map((item) => (item.id === expense.id ? expense : item))
                : [expense, ...current.expenses],
            }));
            setMonthOffset(monthOffsetFrom(baseMonth, monthKey(expense.date)));
            setExpenseSession(null);
          }}
          onDelete={
            expenseSession.expense
              ? () => {
                  const id = expenseSession.expense?.id;
                  update((current) => ({
                    ...current,
                    expenses: current.expenses.filter((item) => item.id !== id),
                  }));
                  setExpenseSession(null);
                }
              : undefined
          }
        />
      )}

      {data && categoriesOpen && (
        <CategoriesDialog
          categories={data.categories}
          usedIds={new Set(data.categories.filter((category) => categoryIsUsed(data, category.id)).map((category) => category.id))}
          onClose={() => setCategoriesOpen(false)}
          onRename={(id, name) =>
            update((current) => ({
              ...current,
              categories: current.categories.map((category) =>
                category.id === id ? { ...category, name } : category,
              ),
            }))
          }
          onAdd={(name) =>
            update((current) => ({
              ...current,
              categories: [...current.categories, { id: crypto.randomUUID(), name }],
            }))
          }
          onRemove={(id) => {
            update((current) => ({
              ...current,
              categories: current.categories.filter((category) => category.id !== id),
            }));
            setFilterId((current) => (current === id ? null : current));
          }}
        />
      )}
    </div>
  );
}
