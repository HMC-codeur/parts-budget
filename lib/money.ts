const MAX_AGOROT = 999_999_999;

export function parseShekels(input: string): number | null {
  const cleaned = input.replace(/[\s\u00a0\u202f₪]/g, "").replace(/ils/gi, "").trim();
  if (!cleaned) return null;

  let normalized = cleaned;
  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");
  if (hasComma && hasDot) {
    if (cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")) {
      normalized = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = cleaned.replace(/,/g, "");
    }
  } else if (hasComma) {
    normalized = /^\d{1,3}(,\d{3})+$/.test(cleaned) ? cleaned.replace(/,/g, "") : cleaned.replace(",", ".");
  }

  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) return null;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  const agorot = Math.round(value * 100);
  if (agorot > MAX_AGOROT) return null;
  return agorot;
}

export function formatShekels(agorot: number, locale: "fr" | "he" = "fr"): string {
  const negative = agorot < 0;
  const abs = Math.abs(Math.round(agorot));
  const hasCents = abs % 100 !== 0;
  const formatted = new Intl.NumberFormat(locale === "he" ? "he-IL" : "fr-FR", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(abs / 100);
  return `${negative ? "−" : ""}${formatted}\u00a0₪`;
}

export function formatEditable(agorot: number, locale: "fr" | "he" = "fr"): string {
  const abs = Math.abs(Math.round(agorot));
  const shekels = abs / 100;
  if (abs % 100 === 0) return String(shekels);
  const text = shekels.toFixed(2);
  return locale === "he" ? text : text.replace(".", ",");
}
