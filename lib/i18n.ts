export type Locale = "fr" | "he";

export const LANG_KEY = "parts.lang.v1";

const copy = {
  fr: {
    previousMonth: "Mois précédent",
    nextMonth: "Mois suivant",
    thisMonth: "Ce mois-ci",
    unallocated: "Non placé",
    emptyMonth: "Rien ce mois-ci",
    emptyMonthHint: "Ajoute un revenu, puis répartis-le entre tes enveloppes.",
    envelopes: "Enveloppes",
    manage: "Gérer",
    balancesCarry: "Les soldes cumulent d’un mois à l’autre.",
    movements: "Mouvements",
    all: "Tout",
    noMovementsNamed: "Aucun mouvement pour {name} ce mois-ci.",
    noMovements: "Aucun mouvement ce mois-ci.",
    localOnly: "Les données restent sur cet appareil.",
    income: "Revenu",
    expense: "Dépense",
    loading: "Chargement",
    inflows: "Entrées",
    detailShare: "part de l’enveloppe",
    detailAllocated: "réparti",
    detailPartial: "à finir",
    envelope: "Enveloppe",
    editIncome: "Modifier le revenu",
    newIncome: "Nouveau revenu",
    incomeHelp: "Indique le montant, puis répartis-le entre les enveloppes.",
    amount: "Montant",
    label: "Libellé",
    optional: "optionnel",
    incomePlaceholder: "Salaire, cachet, virement…",
    date: "Date",
    split: "Répartition",
    percent: "Pourcentage",
    presetEqual: "Équilibré",
    presetPrudent: "Prudent",
    presetFree: "Libre",
    percentOf: "Part de {name} en pourcentage",
    amountFor: "Montant pour {name}",
    overSplit: "Trop réparti",
    leftToSplit: "Reste à répartir",
    needAmount: "Indique un montant.",
    badAmount: "Ce montant n’est pas valide.",
    incompleteShare: "Un montant d’enveloppe est incomplet.",
    allPlaced: "Tout est placé.",
    pourRest: "Verser le reste dans {name}",
    deleteIncomeConfirm: "Supprimer ce revenu et ses parts ?",
    cancel: "Annuler",
    delete: "Supprimer",
    deleteIncome: "Supprimer ce revenu",
    save: "Enregistrer",
    close: "Fermer",
    editExpense: "Modifier la dépense",
    newExpense: "Nouvelle dépense",
    expenseHelp: "La dépense est retirée du solde de l’enveloppe choisie.",
    expensePlaceholder: "Courses, cadeau, essence…",
    chooseEnvelope: "Choisis une enveloppe.",
    balance: "Solde",
    remainsIn: "dans cette enveloppe.",
    leftPrefix: "Il reste",
    wouldRemain: "Il resterait",
    deleteExpenseConfirm: "Supprimer cette dépense ? Le solde sera rendu à l’enveloppe.",
    deleteExpense: "Supprimer cette dépense",
    nameOf: "Nom de {name}",
    nameExists: "Ce nom existe déjà.",
    alreadyUsed: "Déjà utilisée",
    unused: "Sans mouvement",
    remove: "Retirer",
    categoriesHelp: "Renomme les enveloppes ou ajoutes-en une.",
    newEnvelope: "Nouvelle enveloppe",
    categoryPlaceholder: "Voyages, cadeaux…",
    add: "Ajouter",
    language: "Langue",
    french: "Français",
    hebrew: "עברית",
    tooMuchLead: "C’est",
    tooMuchTail: "de trop.",
    remainLead: "Il reste",
    remainTail: "à placer.",
  },
  he: {
    previousMonth: "החודש הקודם",
    nextMonth: "החודש הבא",
    thisMonth: "החודש",
    unallocated: "לא חולק",
    emptyMonth: "אין הכנסות החודש",
    emptyMonthHint: "הוסף הכנסה, ואז חלק אותה בין המעטפות.",
    envelopes: "מעטפות",
    manage: "עריכה",
    balancesCarry: "היתרות מצטברות מחודש לחודש.",
    movements: "תנועות",
    all: "הכל",
    noMovementsNamed: "אין תנועות ב{name} החודש.",
    noMovements: "אין תנועות החודש.",
    localOnly: "הנתונים נשארים במכשיר הזה.",
    income: "הכנסה",
    expense: "הוצאה",
    loading: "טוען",
    inflows: "הכנסות",
    detailShare: "חלק מהמעטפה",
    detailAllocated: "חולק",
    detailPartial: "להשלמה",
    envelope: "מעטפה",
    editIncome: "עריכת הכנסה",
    newIncome: "הכנסה חדשה",
    incomeHelp: "ציין סכום, ואז חלק אותו בין המעטפות.",
    amount: "סכום",
    label: "תיאור",
    optional: "לא חובה",
    incomePlaceholder: "משכורת, תשלום, העברה…",
    date: "תאריך",
    split: "חלוקה",
    percent: "אחוזים",
    presetEqual: "שווה",
    presetPrudent: "זהיר",
    presetFree: "חופשי",
    percentOf: "החלק של {name} באחוזים",
    amountFor: "סכום עבור {name}",
    overSplit: "חולק יותר מדי",
    leftToSplit: "נותר לחלק",
    needAmount: "יש לציין סכום.",
    badAmount: "הסכום לא תקין.",
    incompleteShare: "סכום של מעטפה לא הושלם.",
    allPlaced: "הכול חולק.",
    pourRest: "להעביר את היתרה אל {name}",
    deleteIncomeConfirm: "למחוק את ההכנסה ואת החלקים שלה?",
    cancel: "ביטול",
    delete: "מחיקה",
    deleteIncome: "מחיקת ההכנסה",
    save: "שמירה",
    close: "סגירה",
    editExpense: "עריכת הוצאה",
    newExpense: "הוצאה חדשה",
    expenseHelp: "ההוצאה יורדת מיתרת המעטפה שנבחרה.",
    expensePlaceholder: "קניות, מתנה, דלק…",
    chooseEnvelope: "בחר מעטפה.",
    balance: "יתרה",
    remainsIn: "במעטפה הזו.",
    leftPrefix: "נותרו",
    wouldRemain: "יישארו",
    deleteExpenseConfirm: "למחוק את ההוצאה? היתרה תחזור למעטפה.",
    deleteExpense: "מחיקת ההוצאה",
    nameOf: "השם של {name}",
    nameExists: "השם הזה כבר קיים.",
    alreadyUsed: "כבר בשימוש",
    unused: "בלי תנועות",
    remove: "הסרה",
    categoriesHelp: "אפשר לשנות שמות או להוסיף מעטפה.",
    newEnvelope: "מעטפה חדשה",
    categoryPlaceholder: "טיולים, מתנות…",
    add: "הוספה",
    language: "שפה",
    french: "Français",
    hebrew: "עברית",
    tooMuchLead: "זה",
    tooMuchTail: "יותר מדי.",
    remainLead: "נותרו",
    remainTail: "לחלק.",
  },
} as const;

export type CopyKey = keyof typeof copy.fr;

const DEFAULT_NAMES: Record<string, Record<Locale, string>> = {
  loisirs: { fr: "Loisirs", he: "פנאי" },
  imprevus: { fr: "Imprévus", he: "בלתי צפוי" },
  epargne: { fr: "Épargne", he: "חיסכון" },
};

export function isLocale(value: unknown): value is Locale {
  return value === "fr" || value === "he";
}

export function translate(locale: Locale, key: CopyKey, vars?: Record<string, string>): string {
  let text: string = copy[locale][key];
  if (!vars) return text;
  for (const [name, value] of Object.entries(vars)) {
    text = text.replaceAll(`{${name}}`, value);
  }
  return text;
}

export function displayCategoryName(category: { id: string; name: string }, locale: Locale): string {
  const defaults = DEFAULT_NAMES[category.id];
  if (!defaults) return category.name;
  const stored = category.name.trim();
  const stillDefault = Object.values(defaults).some(
    (name) => name.localeCompare(stored, locale === "he" ? "he" : "fr", { sensitivity: "base" }) === 0,
  );
  return stillDefault ? defaults[locale] : category.name;
}

let cachedLocale: Locale | null = null;

export function readLocaleSnapshot(): Locale {
  try {
    const raw = localStorage.getItem(LANG_KEY);
    const next: Locale = raw === "he" ? "he" : "fr";
    cachedLocale = next;
    return next;
  } catch {
    return cachedLocale ?? "fr";
  }
}

export function serverLocale(): Locale {
  return "fr";
}

export function subscribeLocale(callback: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== LANG_KEY && event.key !== null) return;
    callback();
  };
  const onLocal = () => callback();
  window.addEventListener("storage", onStorage);
  window.addEventListener("parts-lang-change", onLocal);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("parts-lang-change", onLocal);
  };
}

export function writeLocale(locale: Locale): void {
  cachedLocale = locale;
  try {
    localStorage.setItem(LANG_KEY, locale);
  } catch {
    // The choice still applies for this visit.
  }
  applyLocale(locale);
  window.dispatchEvent(new Event("parts-lang-change"));
}

export function applyLocale(locale: Locale): void {
  const root = document.documentElement;
  root.lang = locale === "he" ? "he" : "fr";
  root.dir = locale === "he" ? "rtl" : "ltr";
  root.classList.toggle("locale-he", locale === "he");
}
