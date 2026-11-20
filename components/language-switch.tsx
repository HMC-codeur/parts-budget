"use client";

import { useI18n } from "@/components/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitch() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div dir="ltr" className="flex items-center gap-1 text-[0.72rem] text-muted-foreground" role="group" aria-label={t("language")}>
      <button
        type="button"
        aria-pressed={locale === "fr"}
        aria-label={t("french")}
        className={cn("px-1 py-2 tracking-[0.12em]", locale === "fr" ? "text-foreground" : "hover:text-foreground")}
        onClick={() => setLocale("fr")}
      >
        FR
      </button>
      <span aria-hidden="true" className="opacity-40">
        /
      </span>
      <button
        type="button"
        aria-pressed={locale === "he"}
        aria-label={t("hebrew")}
        className={cn(
          "px-1 py-2 font-[family-name:var(--font-hebrew-sans)]",
          locale === "he" ? "text-foreground" : "hover:text-foreground",
        )}
        onClick={() => setLocale("he")}
      >
        עב
      </button>
    </div>
  );
}
