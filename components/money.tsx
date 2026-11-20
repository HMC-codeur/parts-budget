"use client";

import { useI18n } from "@/components/i18n";
import { cn } from "@/lib/utils";

export function Money({
  agorot,
  signed,
  className,
}: {
  agorot: number;
  signed?: "plus" | "minus";
  className?: string;
}) {
  const { locale } = useI18n();
  const negative = agorot < 0;
  const abs = Math.abs(Math.round(agorot));
  const hasCents = abs % 100 !== 0;
  const number = new Intl.NumberFormat(locale === "he" ? "he-IL" : "fr-FR", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(abs / 100);
  const prefix = signed === "plus" ? "+" : signed === "minus" || negative ? "−" : "";

  return (
    <span dir="ltr" className={cn("inline-block tabular-nums", className)}>
      {prefix}
      {number}
      {"\u00a0"}
      <span className="shekel-mark" style={{ fontFamily: "shekel, sans-serif" }}>
        ₪
      </span>
    </span>
  );
}
