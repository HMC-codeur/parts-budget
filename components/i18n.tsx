"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  type CopyKey,
  type Locale,
  applyLocale,
  readLocaleSnapshot,
  serverLocale,
  subscribeLocale,
  translate,
  writeLocale,
} from "@/lib/i18n";

export function useI18n() {
  const locale = useSyncExternalStore(subscribeLocale, readLocaleSnapshot, serverLocale);

  useEffect(() => {
    applyLocale(locale);
  }, [locale]);

  return {
    locale,
    dir: locale === "he" ? ("rtl" as const) : ("ltr" as const),
    setLocale: (next: Locale) => writeLocale(next),
    t: (key: CopyKey, vars?: Record<string, string>) => translate(locale, key, vars),
  };
}
