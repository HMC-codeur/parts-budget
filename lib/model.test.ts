import assert from "node:assert/strict";
import test from "node:test";
import {
  availableBalance,
  categoryBalance,
  emptyBudget,
  pourRemainder,
  presetPercents,
  scaleToTotal,
  sharesFromPreset,
  sumAmounts,
  type BudgetData,
} from "./budget";
import { formatMonth, isISODate, shiftMonth } from "./dates";
import { formatEditable, formatShekels, parseShekels } from "./money";
import { displayCategoryName } from "./i18n";
import { sanitizeBudget } from "./storage";

test("parseShekels accepts French and plain amounts", () => {
  assert.equal(parseShekels("14000"), 1_400_000);
  assert.equal(parseShekels("14 000"), 1_400_000);
  assert.equal(parseShekels("14\u00a0000,50"), 1_400_050);
  assert.equal(parseShekels("14000.5"), 1_400_050);
  assert.equal(parseShekels("1.240,50"), 124_050);
  assert.equal(parseShekels("0"), 0);
  assert.equal(parseShekels(""), null);
  assert.equal(parseShekels("-5"), null);
  assert.equal(parseShekels("abc"), null);
  assert.equal(parseShekels("12,345"), 1_234_500);
  assert.equal(parseShekels("12,34"), 1_234);
  assert.equal(parseShekels("12,3456"), null);
});

test("formatShekels keeps whole shekels short and shows agorot", () => {
  assert.match(formatShekels(1_400_000), /14[\s\u00a0\u202f]000/);
  assert.match(formatShekels(1_400_000), /₪/);
  assert.match(formatShekels(1_400_050), /50/);
  assert.equal(formatShekels(-18_000).startsWith("−"), true);
  assert.equal(formatEditable(1_400_050), "14000,50");
  assert.equal(formatEditable(1_400_000), "14000");
  assert.match(formatShekels(1_400_000, "he"), /14,000/);
  assert.match(formatShekels(1_400_000, "he"), /₪/);
  assert.equal(formatEditable(1_400_050, "he"), "14000.50");
});

test("scaleToTotal sums exactly and preserves ratios", () => {
  assert.deepEqual(scaleToTotal(10, [33, 33, 34]), [3, 3, 4]);
  const prudent = scaleToTotal(1_400_000, [20, 30, 50]);
  assert.deepEqual(prudent, [280_000, 420_000, 700_000]);
  assert.equal(
    prudent.reduce((sum, value) => sum + value, 0),
    1_400_000,
  );
  assert.equal(
    scaleToTotal(100, [1, 1, 1]).reduce((sum, value) => sum + value, 0),
    100,
  );
});

test("presets land on a complete split", () => {
  const categories = emptyBudget().categories;
  assert.deepEqual(presetPercents("equilibre", categories), [34, 33, 33]);
  assert.deepEqual(presetPercents("prudent", categories), [20, 30, 50]);
  assert.deepEqual(presetPercents("libre", categories), [50, 15, 35]);
  const shares = sharesFromPreset("prudent", categories, 1_400_000);
  assert.equal(sumAmounts(shares), 1_400_000);
  assert.equal(shares.epargne, 700_000);
});

test("pouring the remainder fills Épargne", () => {
  const categories = emptyBudget().categories;
  const filled = pourRemainder({ loisirs: 200, imprevus: 0, epargne: 300 }, categories, 1000);
  assert.equal(filled.epargne, 800);
  assert.equal(sumAmounts(filled), 1000);
});

test("balances subtract expenses and restore the one being edited", () => {
  const data: BudgetData = {
    ...emptyBudget(),
    incomes: [
      {
        id: "in-1",
        amount: 10_000,
        label: "Salaire",
        date: "2026-11-02",
        createdAt: "2026-11-02T00:00:00.000Z",
        allocations: [
          { categoryId: "loisirs", amount: 4_000 },
          { categoryId: "epargne", amount: 6_000 },
        ],
      },
    ],
    expenses: [
      {
        id: "ex-1",
        amount: 1_500,
        label: "Courses",
        categoryId: "loisirs",
        date: "2026-11-04",
        createdAt: "2026-11-04T00:00:00.000Z",
      },
    ],
  };
  assert.equal(categoryBalance(data, "loisirs"), 2_500);
  assert.equal(categoryBalance(data, "epargne"), 6_000);
  assert.equal(availableBalance(data, "loisirs", "ex-1"), 4_000);
  assert.equal(availableBalance(data, "epargne", "ex-1"), 6_000);
});

test("months cross the year boundary", () => {
  assert.equal(shiftMonth("2026-01", -1), "2025-12");
  assert.equal(shiftMonth("2026-11", 1), "2026-12");
  assert.match(formatMonth("2026-11"), /novembre 2026/);
  assert.equal(isISODate("2026-11-02"), true);
  assert.equal(isISODate("2026-02-31"), false);
});

test("sanitize keeps valid entries and restores default envelopes", () => {
  const cleaned = sanitizeBudget({
    version: 1,
    categories: [{ id: "cadeaux", name: "Cadeaux" }, { id: "", name: "Nope" }],
    incomes: [
      {
        id: "in-1",
        amount: 500,
        label: "Cachet",
        date: "2026-11-01",
        allocations: [{ categoryId: "cadeaux", amount: 500 }, { categoryId: "cadeaux", amount: -1 }],
        createdAt: "2026-11-01T00:00:00.000Z",
      },
      { id: "bad", amount: 0, label: "", date: "nope", allocations: [] },
    ],
    expenses: [{ id: "ex-1", amount: 100, label: "Fleurs", categoryId: "cadeaux", date: "2026-11-03" }],
  });
  assert.deepEqual(cleaned.categories, [{ id: "cadeaux", name: "Cadeaux" }]);
  assert.equal(cleaned.incomes.length, 1);
  assert.equal(cleaned.incomes[0].allocations.length, 1);
  assert.equal(cleaned.expenses.length, 1);
  assert.equal(sanitizeBudget(null).categories.length, 3);
});

test("default envelope names follow the language until they are renamed", () => {
  assert.equal(displayCategoryName({ id: "loisirs", name: "Loisirs" }, "he"), "פנאי");
  assert.equal(displayCategoryName({ id: "imprevus", name: "בלתי צפוי" }, "fr"), "Imprévus");
  assert.equal(displayCategoryName({ id: "epargne", name: "Épargne" }, "he"), "חיסכון");
  assert.equal(displayCategoryName({ id: "loisirs", name: "Sorties" }, "he"), "Sorties");
  assert.equal(displayCategoryName({ id: "cadeaux", name: "Cadeaux" }, "he"), "Cadeaux");
  assert.match(formatMonth("2026-11", "he"), /נובמבר/);
});
