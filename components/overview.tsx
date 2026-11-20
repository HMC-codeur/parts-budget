"use client";

import { LanguageSwitch } from "@/components/language-switch";
import { Money } from "@/components/money";
import { RingChart } from "@/components/ring-chart";
import { useI18n } from "@/components/i18n";
import { Button } from "@/components/ui/button";
import { formatDay, formatMonth } from "@/lib/dates";
import type { MonthView } from "@/lib/view";
import { cn } from "@/lib/utils";

export function Overview({
  month,
  view,
  filterId,
  onMonth,
  onFilter,
  onOpenIncome,
  onOpenExpense,
  onOpenCategories,
  onEditIncome,
  onEditExpense,
}: {
  month: string;
  view: MonthView;
  filterId: string | null;
  onMonth: (delta: number) => void;
  onFilter: (categoryId: string | null) => void;
  onOpenIncome: () => void;
  onOpenExpense: () => void;
  onOpenCategories: () => void;
  onEditIncome: (id: string) => void;
  onEditExpense: (id: string) => void;
}) {
  const { locale, t } = useI18n();
  const rawMonth = formatMonth(month, locale);
  const monthLabel = locale === "fr" ? rawMonth.replace(/^\p{L}/u, (letter) => letter.toLocaleUpperCase("fr")) : rawMonth;
  const filter = view.envelopes.find((envelope) => envelope.id === filterId) ?? null;
  const unallocated = Math.max(0, view.incomeTotal - view.allocatedTotal);

  return (
    <>
      <header className="pt-8">
        <div className="flex items-center justify-between gap-4">
          <p className="brand-mark font-heading text-[2rem] leading-none tracking-tight italic">Parts</p>
          <LanguageSwitch />
        </div>
        <div className="mt-6 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 rounded-full text-2xl"
            aria-label={t("previousMonth")}
            onClick={() => onMonth(-1)}
          >
            <span className="chevron">‹</span>
          </Button>
          <h1 className="font-heading text-xl font-normal tracking-tight">{monthLabel}</h1>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 rounded-full text-2xl"
            aria-label={t("nextMonth")}
            onClick={() => onMonth(1)}
          >
            <span className="chevron">›</span>
          </Button>
        </div>
      </header>

      <main className="parts-rise flex-1 pb-32" key={month}>
        <section className="mt-8" aria-label={t("thisMonth")}>
          {view.incomeTotal > 0 ? (
            <>
              <RingChart
                total={view.incomeTotal}
                segments={view.envelopes.map((envelope) => ({
                  id: envelope.id,
                  value: envelope.monthAllocated,
                }))}
              />
              <ul className="mt-8 grid gap-4">
                {view.envelopes
                  .filter((envelope) => envelope.monthAllocated > 0)
                  .map((envelope) => {
                    const share = Math.round((envelope.monthAllocated / view.incomeTotal) * 100);
                    return (
                      <li key={envelope.id}>
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                          <span>{envelope.name}</span>
                          <span className="text-muted-foreground tabular-nums">
                            <Money agorot={envelope.monthAllocated} /> · {share} %
                          </span>
                        </div>
                        <div className="mt-2 h-0.5 bg-border">
                          <div className="h-0.5 bg-primary" style={{ width: `${Math.min(share, 100)}%` }} />
                        </div>
                      </li>
                    );
                  })}
                {unallocated > 0 && (
                  <li className="flex items-baseline justify-between gap-3 text-sm text-primary">
                    <span>{t("unallocated")}</span>
                    <span className="tabular-nums">
                      <Money agorot={unallocated} />
                    </span>
                  </li>
                )}
              </ul>
            </>
          ) : (
            <div className="py-6">
              <p className="font-heading text-[2rem] tracking-tight">{t("emptyMonth")}</p>
              <p className="mt-3 max-w-64 text-sm leading-6 text-muted-foreground">{t("emptyMonthHint")}</p>
            </div>
          )}
        </section>

        <section className="mt-12" aria-label={t("envelopes")}>
          <div className="flex items-end justify-between gap-3">
            <h2 className="section-kicker">{t("envelopes")}</h2>
            <button
              type="button"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              onClick={onOpenCategories}
            >
              {t("manage")}
            </button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{t("balancesCarry")}</p>
          <ul className="mt-2">
            {view.envelopes.map((envelope) => {
              const selected = filterId === envelope.id;
              return (
                <li key={envelope.id} className="border-b border-border">
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onFilter(selected ? null : envelope.id)}
                    className="flex w-full items-end justify-between gap-4 py-5 text-start"
                  >
                    <span>
                      <span className={cn("block text-sm", selected ? "text-primary" : "text-muted-foreground")}>
                        {envelope.name}
                      </span>
                      <span className="mt-1 block font-heading text-[1.85rem] leading-none tracking-tight">
                        <Money agorot={envelope.balance} />
                      </span>
                    </span>
                    <span className="pb-1 text-end text-xs leading-5 text-muted-foreground tabular-nums">
                      {envelope.monthAllocated > 0 && (
                        <span className="block">
                          <Money agorot={envelope.monthAllocated} signed="plus" />
                        </span>
                      )}
                      {envelope.monthSpent > 0 && (
                        <span className="block">
                          <Money agorot={envelope.monthSpent} signed="minus" />
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-12" aria-label={t("movements")}>
          <div className="flex items-end justify-between gap-3">
            <h2 className="section-kicker">{filter ? filter.name : t("movements")}</h2>
            {filter && (
              <button
                type="button"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                onClick={() => onFilter(null)}
              >
                {t("all")}
              </button>
            )}
          </div>
          {view.movements.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              {filter ? t("noMovementsNamed", { name: filter.name }) : t("noMovements")}
            </p>
          ) : (
            <ul className="mt-2">
              {view.movements.map((movement) => (
                <li key={`${movement.kind}-${movement.id}`} className="border-b border-border">
                  <button
                    type="button"
                    className="flex w-full items-baseline justify-between gap-4 py-4 text-start"
                    onClick={() =>
                      movement.kind === "income" ? onEditIncome(movement.id) : onEditExpense(movement.id)
                    }
                  >
                    <span>
                      <span className="block">{movement.label}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {formatDay(movement.date, locale)} · {movement.detail}
                      </span>
                    </span>
                    <span className="font-heading text-lg tracking-tight">
                      <Money
                        agorot={movement.amount}
                        signed={movement.kind === "expense" ? "minus" : undefined}
                      />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-10 text-xs leading-5 text-muted-foreground">{t("localOnly")}</p>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/80 bg-background/95 backdrop-blur-md">
        <div className="mx-auto grid max-w-md grid-cols-2 gap-2 px-5 pt-3 pb-[max(0.85rem,env(safe-area-inset-bottom))]">
          <Button type="button" className="h-12 rounded-full text-base" onClick={onOpenIncome}>
            {t("income")}
          </Button>
          <Button type="button" variant="outline" className="h-12 rounded-full text-base" onClick={onOpenExpense}>
            {t("expense")}
          </Button>
        </div>
      </div>
    </>
  );
}
