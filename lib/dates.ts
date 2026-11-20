export function currentMonth(now: Date): string {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

export function todayISO(now: Date): string {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function monthKey(date: string): string {
  return date.slice(0, 7);
}

export function monthOffsetFrom(base: string, target: string): number {
  if (!base || !target) return 0;
  const [baseYear, baseMonth] = base.split("-").map(Number);
  const [targetYear, targetMonth] = target.split("-").map(Number);
  return targetYear * 12 + (targetMonth - 1) - (baseYear * 12 + (baseMonth - 1));
}

export function shiftMonth(month: string, delta: number): string {
  const [yearText, monthText] = month.split("-");
  const index = Number(yearText) * 12 + (Number(monthText) - 1) + delta;
  const year = Math.floor(index / 12);
  const monthIndex = index - year * 12;
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

export function formatMonth(month: string, locale: "fr" | "he" = "fr"): string {
  const [yearText, monthText] = month.split("-");
  const date = new Date(Date.UTC(Number(yearText), Number(monthText) - 1, 1));
  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatDay(date: string, locale: "fr" | "he" = "fr"): string {
  const [yearText, monthText, dayText] = date.split("-");
  const value = new Date(Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText)));
  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "fr-FR", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(value);
}

export function isISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
