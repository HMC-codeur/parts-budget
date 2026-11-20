"use client";

import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SheetFrame,
  SheetHeader,
  sheetBodyClass,
  sheetFooterClass,
  sheetFormClass,
} from "@/components/sheet-frame";
import {
  type Category,
  type Income,
  pourRemainder,
  remainderTarget,
  scaleShares,
  sharesFromPreset,
  sumAmounts,
} from "@/lib/budget";
import { isISODate } from "@/lib/dates";
import { useI18n } from "@/components/i18n";
import { Money } from "@/components/money";
import { displayCategoryName } from "@/lib/i18n";
import { formatEditable, parseShekels } from "@/lib/money";
import { cn } from "@/lib/utils";

const PRESET_IDS = ["equilibre", "prudent", "libre"] as const;

function initialShares(categories: Category[], income: Income | null): Record<string, number> {
  return Object.fromEntries(
    categories.map((category) => [
      category.id,
      income?.allocations.find((allocation) => allocation.categoryId === category.id)?.amount ?? 0,
    ]),
  );
}

function draftsFromShares(
  shares: Record<string, number>,
  categories: Category[],
  locale: "fr" | "he",
): Record<string, string> {
  return Object.fromEntries(
    categories.map((category) => [category.id, formatEditable(shares[category.id] ?? 0, locale)]),
  );
}

export function IncomeDialog({
  income,
  categories,
  today,
  onClose,
  onSubmit,
  onDelete,
}: {
  income: Income | null;
  categories: Category[];
  today: string;
  onClose: () => void;
  onSubmit: (income: Income) => void;
  onDelete?: () => void;
}) {
  const { locale, t } = useI18n();
  const amountId = useId();
  const labelId = useId();
  const dateId = useId();
  const startingShares = initialShares(categories, income);
  const startingTotal = income?.amount ?? null;
  const [amountText, setAmountText] = useState(income ? formatEditable(income.amount, locale) : "");
  const [label, setLabel] = useState(income?.label ?? "");
  const [date, setDate] = useState(income?.date ?? today);
  const [mode, setMode] = useState<"percent" | "amount">("percent");
  const [shares, setShares] = useState(startingShares);
  const [drafts, setDrafts] = useState(() => draftsFromShares(startingShares, categories, locale));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const sharesRef = useRef(startingShares);
  const anchorRef = useRef<number | null>(
    startingTotal != null && sumAmounts(startingShares) === startingTotal ? startingTotal : null,
  );

  const total = parseShekels(amountText);
  const positiveTotal = total != null && total > 0 ? total : null;
  const placed = sumAmounts(shares);
  const remaining = positiveTotal == null ? null : positiveTotal - placed;
  const target = remainderTarget(categories);
  const incompleteDraft =
    mode === "amount" &&
    categories.some((category) => {
      const text = drafts[category.id] ?? "";
      if (text.trim() === "") return false;
      return parseShekels(text) == null;
    });

  function commit(nextShares: Record<string, number>, nextTotal: number | null) {
    sharesRef.current = nextShares;
    setShares(nextShares);
    setDrafts(draftsFromShares(nextShares, categories, locale));
    if (nextTotal != null && sumAmounts(nextShares) === nextTotal) anchorRef.current = nextTotal;
  }

  function onAmount(text: string) {
    setAmountText(text);
    const next = parseShekels(text);
    if (next == null || next <= 0) return;
    const current = sharesRef.current;
    const sum = sumAmounts(current);
    if (sum === 0) {
      commit(sharesFromPreset("equilibre", categories, next), next);
      return;
    }
    if (anchorRef.current != null && sum === anchorRef.current) {
      commit(scaleShares(current, categories, next), next);
    }
  }

  function onPercent(categoryId: string, percent: number) {
    if (positiveTotal == null) return;
    const nextAmount = Math.round((positiveTotal * percent) / 100);
    commit({ ...sharesRef.current, [categoryId]: nextAmount }, positiveTotal);
  }

  function onShareText(categoryId: string, text: string) {
    setDrafts((current) => ({ ...current, [categoryId]: text }));
    if (text.trim() === "") {
      commit({ ...sharesRef.current, [categoryId]: 0 }, positiveTotal);
      return;
    }
    const parsed = parseShekels(text);
    if (parsed == null) return;
    commit({ ...sharesRef.current, [categoryId]: parsed }, positiveTotal);
  }

  function applyPreset(presetId: string) {
    if (positiveTotal == null) {
      setAttempted(true);
      return;
    }
    commit(sharesFromPreset(presetId, categories, positiveTotal), positiveTotal);
  }

  function pour() {
    if (positiveTotal == null) return;
    commit(pourRemainder(sharesRef.current, categories, positiveTotal), positiveTotal);
  }

  function matchesPreset(presetId: string): boolean {
    if (positiveTotal == null) return false;
    const expected = sharesFromPreset(presetId, categories, positiveTotal);
    return categories.every((category) => (shares[category.id] ?? 0) === expected[category.id]);
  }

  let status = t("needAmount");
  if (positiveTotal == null && amountText.trim() !== "") status = t("badAmount");
  else if (incompleteDraft) status = t("incompleteShare");
  else if (remaining === 0) status = t("allPlaced");

  const canSave =
    positiveTotal != null && remaining === 0 && !incompleteDraft && isISODate(date) && categories.length > 0;

  function save() {
    setAttempted(true);
    if (!canSave || positiveTotal == null) return;
    onSubmit({
      id: income?.id ?? crypto.randomUUID(),
      amount: positiveTotal,
      label: label.trim(),
      date,
      allocations: categories
        .map((category) => ({ categoryId: category.id, amount: shares[category.id] ?? 0 }))
        .filter((allocation) => allocation.amount > 0),
      createdAt: income?.createdAt ?? new Date().toISOString(),
    });
  }

  return (
    <SheetFrame open onOpenChange={(next) => !next && onClose()}>
      <form
        className={sheetFormClass}
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        <SheetHeader
          title={income ? t("editIncome") : t("newIncome")}
          description={t("incomeHelp")}
        />
        <div className={sheetBodyClass}>
          <div className="border-b border-border pb-3">
            <Label htmlFor={amountId} className="section-kicker">
              {t("amount")}
            </Label>
            <div className="relative mt-2">
              <Input
                id={amountId}
                inputMode="decimal"
                autoComplete="off"
                autoFocus
                placeholder="0"
                value={amountText}
                onChange={(event) => onAmount(event.target.value)}
                aria-invalid={attempted && positiveTotal == null}
                className="h-auto rounded-none border-0 bg-transparent px-0 py-1 pe-10 font-heading text-5xl tracking-tight shadow-none focus-visible:ring-0 md:text-5xl"
              />
              <span
                className="shekel-mark pointer-events-none absolute top-1/2 end-0 -translate-y-1/2 text-2xl text-muted-foreground"
                style={{ fontFamily: "shekel, sans-serif" }}
              >
                ₪
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor={labelId}>
                {t("label")} <span className="font-normal text-muted-foreground">{t("optional")}</span>
              </Label>
              <Input
                id={labelId}
                value={label}
                maxLength={80}
                placeholder={t("incomePlaceholder")}
                onChange={(event) => setLabel(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={dateId}>{t("date")}</Label>
              <Input
                id={dateId}
                type="date"
                lang={locale === "he" ? "he-IL" : "fr-FR"}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-end justify-between gap-3">
              <h2 className="font-heading text-xl font-normal tracking-tight">{t("split")}</h2>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-full bg-muted p-1">
              <Button
                type="button"
                variant={mode === "percent" ? "secondary" : "ghost"}
                className="h-10 rounded-full"
                onClick={() => setMode("percent")}
              >
                {t("percent")}
              </Button>
              <Button
                type="button"
                variant={mode === "amount" ? "secondary" : "ghost"}
                className="h-10 rounded-full"
                onClick={() => setMode("amount")}
              >
                {t("amount")}
              </Button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {PRESET_IDS.map((presetId) => (
                <Button
                  key={presetId}
                  type="button"
                  variant={matchesPreset(presetId) ? "default" : "outline"}
                  className="h-10 rounded-full px-2 text-sm"
                  onClick={() => applyPreset(presetId)}
                >
                  {t(presetId === "equilibre" ? "presetEqual" : presetId === "prudent" ? "presetPrudent" : "presetFree")}
                </Button>
              ))}
            </div>

            <ul className="mt-6 grid gap-5">
              {categories.map((category) => {
                const name = displayCategoryName(category, locale);
                const amount = shares[category.id] ?? 0;
                const percent = positiveTotal ? Math.round((amount / positiveTotal) * 100) : 0;
                return (
                  <li key={category.id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm">{name}</p>
                      <p className="font-heading text-lg tracking-tight">
                        {mode === "percent" ? <Money agorot={amount} /> : `${percent} %`}
                      </p>
                    </div>
                    {mode === "percent" ? (
                      <div className="mt-1 flex items-center gap-3">
                        <input
                          className="parts-range"
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={positiveTotal ? percent : 0}
                          aria-label={t("percentOf", { name })}
                          disabled={positiveTotal == null}
                          onChange={(event) => onPercent(category.id, Number(event.target.value))}
                        />
                        <span className="w-12 shrink-0 text-end text-sm text-muted-foreground tabular-nums">
                          {percent} %
                        </span>
                      </div>
                    ) : (
                      <div className="relative mt-2">
                        <Input
                          inputMode="decimal"
                          autoComplete="off"
                          aria-label={t("amountFor", { name })}
                          value={drafts[category.id] ?? ""}
                          onChange={(event) => onShareText(category.id, event.target.value)}
                          className="pe-10"
                        />
                        <span
                          className="shekel-mark pointer-events-none absolute top-1/2 end-3 -translate-y-1/2 text-sm text-muted-foreground"
                          style={{ fontFamily: "shekel, sans-serif" }}
                        >
                          ₪
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            <div
              className={cn(
                "mt-6 rounded-2xl px-4 py-4 transition-colors",
                remaining === 0 ? "bg-muted" : "bg-primary/10",
              )}
              aria-live="polite"
            >
              <p className="section-kicker">
                {remaining === 0 ? t("split") : remaining != null && remaining < 0 ? t("overSplit") : t("leftToSplit")}
              </p>
              <p className="mt-1 font-heading text-2xl tracking-tight">
                {remaining != null && remaining > 0 && !incompleteDraft && positiveTotal != null ? (
                  <>
                    {t("remainLead")} <Money agorot={remaining} /> {t("remainTail")}
                  </>
                ) : remaining != null && remaining < 0 && !incompleteDraft ? (
                  <>
                    {t("tooMuchLead")} <Money agorot={Math.abs(remaining)} /> {t("tooMuchTail")}
                  </>
                ) : (
                  status
                )}
              </p>
              {remaining != null && remaining > 0 && target && (
                <button type="button" className="mt-2 text-sm text-primary underline-offset-4 hover:underline" onClick={pour}>
                  {t("pourRest", { name: displayCategoryName(target, locale) })}
                </button>
              )}
            </div>

            {onDelete && (
              <div className="mt-8">
                {confirmDelete ? (
                  <div className="grid gap-3">
                    <p className="text-sm text-muted-foreground">{t("deleteIncomeConfirm")}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button type="button" variant="outline" className="h-11 rounded-full" onClick={() => setConfirmDelete(false)}>
                        {t("cancel")}
                      </Button>
                      <Button type="button" className="h-11 rounded-full" onClick={onDelete}>
                        {t("delete")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    onClick={() => setConfirmDelete(true)}
                  >
                    {t("deleteIncome")}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className={sheetFooterClass}>
          <Button type="submit" className="h-12 w-full rounded-full text-base" disabled={!canSave} data-testid="save-income">
            {t("save")}
          </Button>
        </div>
      </form>
    </SheetFrame>
  );
}
