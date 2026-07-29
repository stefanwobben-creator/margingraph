/**
 * The words a profit and loss account is written in.
 *
 * Dutch and English, because those are the two languages the files we get are
 * in. This is a vocabulary and not a model on purpose: an owner can read the
 * list, disagree with an entry, and be right, and the fix is one line. A
 * classifier that cannot be argued with cannot be corrected either.
 *
 * Order of application matters and is enforced in `read.ts`, not here.
 */

/** Strip accents, punctuation and case so "Netto-omzet" meets "netto omzet". */
export function normalise(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9%]+/g, " ")
    .trim();
}

/**
 * Does this label use any of these words?
 *
 * Matched on token prefixes rather than substrings, so "vracht" finds
 * "vrachtkosten" and "doorberekend" finds "doorberekende", while "ly" does not
 * find "monthly". A substring match here looks harmless and quietly
 * misclassifies a line every few files.
 */
export const has = (label: string, words: readonly string[]): boolean => {
  const n = normalise(label);
  const tokens = n.split(" ").filter(Boolean);
  return words.some((w) =>
    w.includes(" ") ? ` ${n} `.includes(` ${w} `) : tokens.some((t) => t.startsWith(w)),
  );
};

/** A row that restates rows above it. Counting it as a cost double-counts. */
export const SUBTOTAL = [
  "totaal",
  "total",
  "subtotaal",
  "subtotal",
  "som",
  "saldo",
  "brutomarge",
  "bruto marge",
  "brutowinst",
  "gross margin",
  "gross profit",
  "contributiemarge",
  "contribution margin",
  "bedrijfsresultaat",
  "operating profit",
  "operating result",
  "ebitda",
  "ebit",
  "resultaat",
  "nettowinst",
  "net profit",
  "net result",
  "winst voor belasting",
  "profit before tax",
] as const;

/** The rows whose ratio to turnover we want. Same words, narrower list. */
export const GROSS_MARGIN = [
  "brutomarge",
  "bruto marge",
  "brutowinst",
  "gross margin",
  "gross profit",
  "contributiemarge",
  "contribution margin",
] as const;

export const REVENUE = [
  "omzet",
  "netto omzet",
  "turnover",
  "revenue",
  "sales",
  "opbrengsten",
  "net sales",
] as const;

/**
 * Cost of sales says "omzet" too.
 *
 * "Kostprijs van de omzet" contains the word turnover and is the largest cost
 * line in the file. Read as revenue it would halve every ratio in the report.
 */
export const NOT_REVENUE = [
  "kostprijs",
  "kostprijzen",
  "inkoop",
  "inkoopwaarde",
  "cost of",
  "cogs",
  "cost price",
] as const;

/** Lines that bill a cost back out to customers. Always credits. */
export const RECOVERY = [
  "doorberekend",
  "doorberekende",
  "doorbelast",
  "doorbelaste",
  "recharged",
  "rebilled",
  "billed on",
  "recovered",
  "recovery",
  "vrachtopbrengst",
  "vrachtopbrengsten",
  "freight income",
  "shipping income",
  "delivery income",
] as const;

/**
 * Costs that should move with volume.
 *
 * Only these are tested for ratio drift. The rule that reads them will
 * confidently report that a line is too high whenever turnover falls, so a
 * line that does not actually follow volume has no business on this list.
 */
export const VARIABLE = [
  "kostprijs",
  "inkoop",
  "inkoopwaarde",
  "cogs",
  "cost of sales",
  "cost of goods",
  "vracht",
  "freight",
  "transport",
  "shipping",
  "verzend",
  "koerier",
  "courier",
  "fulfilment",
  "fulfillment",
  "logistiek",
  "logistics",
  "3pl",
  "pick",
  "pack",
  "assemblage",
  "handling",
  "warehousing",
  "opslag",
  "magazijn",
  "commissie",
  "commission",
  "provisie",
  "verpakking",
  "packaging",
  "betaalkosten",
  "payment fees",
  "psp",
  "affiliate",
  "distributie",
  "distribution",
] as const;

/**
 * Never variable, whatever else the label says.
 *
 * "Personeelskosten magazijn" matches the warehouse on the list above. Wages
 * do not follow a bad quarter down, and a rule that says they should is the
 * one mistake in this engine that would cost a customer money rather than
 * merely embarrass us.
 */
export const NEVER_VARIABLE = [
  "personeel",
  "personeels",
  "salaris",
  "salarissen",
  "loon",
  "lonen",
  "payroll",
  "wages",
  "salary",
  "sociale lasten",
  "pensioen",
  "pension",
  "huur",
  "rent",
  "lease",
  "afschrijving",
  "depreciation",
  "amortisation",
  "verzekering",
  "insurance",
  "rente",
  "interest",
  "belasting",
  "tax",
  "accountant",
  "abonnement",
] as const;

/** Column headers naming the period that happened. */
export const ACTUAL_HEADER = [
  "werkelijk",
  "werkelijkheid",
  "actual",
  "actuals",
  "realisatie",
  "gerealiseerd",
  "ytd",
  "trend",
  "prognose totaal",
] as const;

/** Column headers naming the period we compare against. */
export const REFERENCE_HEADER = [
  "budget",
  "begroot",
  "begroting",
  "plan",
  "forecast",
  "prognose",
  "vorig jaar",
  "vorig boekjaar",
  "prior year",
  "last year",
  "ly",
  "py",
] as const;

/** Column headers that are arithmetic on other columns, never a period. */
export const DERIVED_HEADER = [
  "verschil",
  "afwijking",
  "variance",
  "delta",
  "index",
  "%",
  "pct",
  "procent",
  "percentage",
  "cumulatief verschil",
] as const;
