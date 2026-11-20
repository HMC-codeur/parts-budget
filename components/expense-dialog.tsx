"use client";

import { useId, useState } from "react";
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
import type { Category, Expense } from "@/lib/budget";
import { isISODate } from "@/lib/dates";
import { useI18n } from "@/components/i18n";
import { Money } from "@/components/money";
import { displayCategoryName } from "@/lib/i18n";
import { formatEditable, parseShekels } from "@/lib/money";
import { cn } from "@/lib/utils";

export function ExpenseDialog({
  expense,
  categories,
  available,
  today,
  onClose,
  onSubmit,
  onDelete,
}: {
  expense: Expense | null;
  categories: Category[];
  available: Record<string, number>;
  today: string;
  onClose: () => void;
  onSubmit: (expense: Expense) => void;
  onDelete?: () => void;
}) {
  const { locale, t } = useI18n();
  const amountId = useId();
  const labelId = useId();
  const dateId = useId();
  const [amountText, setAmountText] = useState(expense ? formatEditable(expense.amount, locale) : "");
  const [label, setLabel] = useState(expense?.label ?? "");
  const [date, setDate] = useState(expense?.date ?? today);
  const [categoryId, setCategoryId] = useState(expense?.categoryId ?? categories[0]?.id ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const amount = parseShekels(amountText);
  const positive = amount != null && amount > 0 ? amount : null;
  const room = available[categoryId] ?? 0;
  const over = positive != null && positive > room;
  const canSave = positive != null && !over && categoryId !== "" && isISODate(date);

  const note = !categoryId ? (
    t("chooseEnvelope")
  ) : positive == null ? (
    <>
      {t("balance")} : <Money agorot={room} />.
    </>
  ) : over ? (
    <>
      {t("leftPrefix")} <Money agorot={room} /> {t("remainsIn")}
    </>
  ) : (
    <>
      {t("wouldRemain")} <Money agorot={room - positive} />.
    </>
  );

  function save() {
    if (!canSave || positive == null) return;
    onSubmit({
      id: expense?.id ?? crypto.randomUUID(),
      amount: positive,
      label: label.trim(),
      categoryId,
      date,
      createdAt: expense?.createdAt ?? new Date().toISOString(),
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
          title={expense ? t("editExpense") : t("newExpense")}
          description={t("expenseHelp")}
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
                onChange={(event) => setAmountText(event.target.value)}
                aria-invalid={over}
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
                placeholder={t("expensePlaceholder")}
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

          <fieldset className="mt-8">
            <legend className="font-heading text-xl font-normal tracking-tight">{t("envelope")}</legend>
            <div className="mt-3 grid gap-2" role="radiogroup" aria-label={t("envelope")}>
              {categories.map((category) => {
                const selected = category.id === categoryId;
                const balance = available[category.id] ?? 0;
                return (
                  <button
                    key={category.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setCategoryId(category.id)}
                    className={cn(
                      "flex min-h-14 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-start transition-colors",
                      selected ? "border-primary bg-primary/10" : "border-border hover:bg-muted",
                    )}
                  >
                    <span>{displayCategoryName(category, locale)}</span>
                    <span className="font-heading tracking-tight">
                      <Money agorot={balance} />
                    </span>
                  </button>
                );
              })}
            </div>
            <p className={cn("mt-4 text-sm", over ? "text-primary" : "text-muted-foreground")} aria-live="polite">
              {note}
            </p>
          </fieldset>

          {onDelete && (
            <div className="mt-8">
              {confirmDelete ? (
                <div className="grid gap-3">
                  <p className="text-sm text-muted-foreground">{t("deleteExpenseConfirm")}</p>
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
                  {t("deleteExpense")}
                </button>
              )}
            </div>
          )}
        </div>
        <div className={sheetFooterClass}>
          <Button type="submit" className="h-12 w-full rounded-full text-base" disabled={!canSave} data-testid="save-expense">
            {t("save")}
          </Button>
        </div>
      </form>
    </SheetFrame>
  );
}
