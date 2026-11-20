import {
  type Allocation,
  type BudgetData,
  type Category,
  type Expense,
  type Income,
  emptyBudget,
} from "./budget";

export const STORAGE_KEY = "parts.budget.v1";

function isId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 80;
}

function isName(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= 40;
}

function isAgorot(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 999_999_999;
}

function isDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function readAllocation(value: unknown): Allocation | null {
  if (!value || typeof value !== "object") return null;
  const allocation = value as Partial<Allocation>;
  if (!isId(allocation.categoryId) || !isAgorot(allocation.amount)) return null;
  return { categoryId: allocation.categoryId, amount: allocation.amount };
}

function readIncome(value: unknown): Income | null {
  if (!value || typeof value !== "object") return null;
  const income = value as Partial<Income>;
  if (!isId(income.id) || !isAgorot(income.amount) || income.amount <= 0) return null;
  if (!isDate(income.date) || typeof income.label !== "string") return null;
  if (!Array.isArray(income.allocations)) return null;
  const allocations = income.allocations
    .map(readAllocation)
    .filter((allocation): allocation is Allocation => allocation !== null && allocation.amount > 0);
  return {
    id: income.id,
    amount: income.amount,
    label: income.label.slice(0, 80),
    date: income.date,
    allocations,
    createdAt: typeof income.createdAt === "string" ? income.createdAt : `${income.date}T00:00:00.000Z`,
  };
}

function readExpense(value: unknown): Expense | null {
  if (!value || typeof value !== "object") return null;
  const expense = value as Partial<Expense>;
  if (!isId(expense.id) || !isId(expense.categoryId) || !isAgorot(expense.amount) || expense.amount <= 0) {
    return null;
  }
  if (!isDate(expense.date) || typeof expense.label !== "string") return null;
  return {
    id: expense.id,
    amount: expense.amount,
    label: expense.label.slice(0, 80),
    categoryId: expense.categoryId,
    date: expense.date,
    createdAt: typeof expense.createdAt === "string" ? expense.createdAt : `${expense.date}T00:00:00.000Z`,
  };
}

function readCategory(value: unknown): Category | null {
  if (!value || typeof value !== "object") return null;
  const category = value as Partial<Category>;
  if (!isId(category.id) || !isName(category.name)) return null;
  return { id: category.id, name: category.name.trim() };
}

export function sanitizeBudget(value: unknown): BudgetData {
  const fallback = emptyBudget();
  if (!value || typeof value !== "object") return fallback;
  const record = value as Partial<BudgetData>;
  const categories = Array.isArray(record.categories)
    ? record.categories.map(readCategory).filter((category): category is Category => category !== null)
    : [];
  const unique: Category[] = [];
  for (const category of categories) {
    if (unique.some((item) => item.id === category.id)) continue;
    unique.push(category);
  }
  return {
    version: 1,
    categories: unique.length > 0 ? unique : fallback.categories,
    incomes: Array.isArray(record.incomes)
      ? record.incomes.map(readIncome).filter((income): income is Income => income !== null)
      : [],
    expenses: Array.isArray(record.expenses)
      ? record.expenses.map(readExpense).filter((expense): expense is Expense => expense !== null)
      : [],
  };
}

const SERVER_BUDGET = emptyBudget();
let cachedRaw: string | null | undefined;
let cachedData: BudgetData = SERVER_BUDGET;

export function serverBudgetSnapshot(): BudgetData {
  return SERVER_BUDGET;
}

export function readBudgetSnapshot(): BudgetData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedData;
    cachedRaw = raw;
    if (!raw) {
      cachedData = SERVER_BUDGET;
      return cachedData;
    }
    cachedData = sanitizeBudget(JSON.parse(raw));
    return cachedData;
  } catch {
    cachedRaw = null;
    cachedData = SERVER_BUDGET;
    return cachedData;
  }
}

export function subscribeBudget(callback: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    callback();
  };
  const onLocal = () => callback();
  window.addEventListener("storage", onStorage);
  window.addEventListener("parts-budget-change", onLocal);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("parts-budget-change", onLocal);
  };
}

export function writeBudget(data: BudgetData): void {
  const raw = JSON.stringify(data);
  cachedRaw = raw;
  cachedData = data;
  try {
    localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    // The screen keeps the change even if private-mode storage is full.
  }
  window.dispatchEvent(new Event("parts-budget-change"));
}
