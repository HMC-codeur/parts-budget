export type Category = {
  id: string;
  name: string;
};

export type Allocation = {
  categoryId: string;
  amount: number;
};

export type Income = {
  id: string;
  amount: number;
  label: string;
  date: string;
  allocations: Allocation[];
  createdAt: string;
};

export type Expense = {
  id: string;
  amount: number;
  label: string;
  categoryId: string;
  date: string;
  createdAt: string;
};

export type BudgetData = {
  version: 1;
  categories: Category[];
  incomes: Income[];
  expenses: Expense[];
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "loisirs", name: "Loisirs" },
  { id: "imprevus", name: "Imprévus" },
  { id: "epargne", name: "Épargne" },
];

const PRESET_WEIGHTS: Record<string, Record<string, number>> = {
  prudent: { loisirs: 20, imprevus: 30, epargne: 50 },
  libre: { loisirs: 50, imprevus: 15, epargne: 35 },
};

export function emptyBudget(): BudgetData {
  return {
    version: 1,
    categories: DEFAULT_CATEGORIES.map((category) => ({ ...category })),
    incomes: [],
    expenses: [],
  };
}

export function sumAmounts(amounts: Record<string, number>): number {
  return Object.values(amounts).reduce((total, amount) => total + amount, 0);
}

/** Largest-remainder split so integer agorot follow the weights and sum to `total`. */
export function scaleToTotal(total: number, weights: number[]): number[] {
  if (weights.length === 0) return [];
  if (total <= 0) return weights.map(() => 0);
  const weightSum = weights.reduce((totalWeight, weight) => totalWeight + weight, 0);
  if (weightSum <= 0) return weights.map(() => 0);

  const raw = weights.map((weight) => (total * weight) / weightSum);
  const floors = raw.map((value) => Math.floor(value + 1e-9));
  let remainder = total - floors.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, fraction: value - floors[index] }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  const amounts = [...floors];
  for (const item of order) {
    if (remainder <= 0) break;
    amounts[item.index] += 1;
    remainder -= 1;
  }
  return amounts;
}

export function presetPercents(presetId: string, categories: Category[]): number[] {
  if (categories.length === 0) return [];
  if (presetId === "equilibre") {
    return scaleToTotal(
      100,
      categories.map(() => 1),
    );
  }

  const weights = PRESET_WEIGHTS[presetId];
  if (!weights) return presetPercents("equilibre", categories);
  const known = categories.reduce((sum, category) => sum + (weights[category.id] ?? 0), 0);
  if (known <= 0) return presetPercents("equilibre", categories);
  return scaleToTotal(
    100,
    categories.map((category) => weights[category.id] ?? 0),
  );
}

export function sharesFromPreset(
  presetId: string,
  categories: Category[],
  total: number,
): Record<string, number> {
  const percents = presetPercents(presetId, categories);
  const amounts = scaleToTotal(total, percents);
  return Object.fromEntries(categories.map((category, index) => [category.id, amounts[index] ?? 0]));
}

export function scaleShares(
  shares: Record<string, number>,
  categories: Category[],
  total: number,
): Record<string, number> {
  const weights = categories.map((category) => shares[category.id] ?? 0);
  const amounts = scaleToTotal(total, weights);
  return Object.fromEntries(categories.map((category, index) => [category.id, amounts[index] ?? 0]));
}

export function pourRemainder(
  shares: Record<string, number>,
  categories: Category[],
  total: number,
): Record<string, number> {
  const remaining = total - sumAmounts(shares);
  if (remaining <= 0 || categories.length === 0) return shares;
  const target = categories.find((category) => category.id === "epargne") ?? categories[categories.length - 1];
  return {
    ...shares,
    [target.id]: (shares[target.id] ?? 0) + remaining,
  };
}

export function remainderTarget(categories: Category[]): Category | null {
  if (categories.length === 0) return null;
  return categories.find((category) => category.id === "epargne") ?? categories[categories.length - 1];
}

export function categoryAllocated(data: BudgetData, categoryId: string): number {
  return data.incomes.reduce((total, income) => {
    const allocation = income.allocations.find((item) => item.categoryId === categoryId);
    return total + (allocation?.amount ?? 0);
  }, 0);
}

export function categorySpent(data: BudgetData, categoryId: string): number {
  return data.expenses.reduce(
    (total, expense) => (expense.categoryId === categoryId ? total + expense.amount : total),
    0,
  );
}

export function categoryBalance(data: BudgetData, categoryId: string): number {
  return categoryAllocated(data, categoryId) - categorySpent(data, categoryId);
}

export function availableBalance(
  data: BudgetData,
  categoryId: string,
  editingExpenseId?: string,
): number {
  let balance = categoryBalance(data, categoryId);
  if (!editingExpenseId) return balance;
  const existing = data.expenses.find((expense) => expense.id === editingExpenseId);
  if (existing && existing.categoryId === categoryId) balance += existing.amount;
  return balance;
}

export function categoryIsUsed(data: BudgetData, categoryId: string): boolean {
  const allocated = data.incomes.some((income) =>
    income.allocations.some((allocation) => allocation.categoryId === categoryId && allocation.amount > 0),
  );
  const spent = data.expenses.some((expense) => expense.categoryId === categoryId);
  return allocated || spent;
}

export function sameName(a: string, b: string, locale: "fr" | "he" = "fr"): boolean {
  return a.trim().localeCompare(b.trim(), locale === "he" ? "he" : "fr", { sensitivity: "base" }) === 0;
}
