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
  "resultaten",
  "result",
  "results",
  "nettowinst",
  "net profit",
  "net result",
  "winst voor belasting",
  "profit before tax",
  "profit",
  "winst",
  // A bare "marge" is a subtotal of everything above it, and it arrives with a
  // cost word attached often enough to be dangerous: "Marge voor vracht" reads
  // as a freight line to anything matching on the word freight, and would then
  // be counted as a cost as well as being the sum of the costs above it.
  "marge",
  "margin",
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

/**
 * The names a turnover *total* goes by.
 *
 * A profit and loss usually carries two: what was invoiced, and what is left
 * after discounts and credit notes. Both are called turnover and only the
 * second belongs in a ratio. "Net" is the word that separates them, and it is
 * the same word in both languages.
 */
export const NET_REVENUE = [
  "netto",
  "net turnover",
  "net sales",
  "net revenue",
  "netto omzet",
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

/**
 * Deductions that are already inside net turnover.
 *
 * Discounts, bonuses and credit notes sit between invoiced and net turnover.
 * Counted again as a cost they appear twice, once inside the revenue line we
 * divide by and once as a line of its own.
 */
export const REVENUE_DEDUCTION = [
  "korting",
  "kortingen",
  "discount",
  "discounts",
  "bonus",
  "bonussen",
  "rebate",
  "creditnota",
  "credit notes",
  "retouren",
  "returns",
] as const;

/**
 * Below the operating line.
 *
 * Interest and tax are not costs an owner steers with a supplier
 * conversation, and a budget overrun on corporation tax is not a finding. They
 * are read and then left alone.
 */
export const NOT_OPERATING = [
  "rente",
  "interest",
  "belasting",
  "belastingen",
  "tax",
  "vennootschapsbelasting",
  "dividend",
] as const;

/**
 * Income that is not turnover and not a recovery.
 *
 * "Overige bedrijfsopbrengsten" can be positive one year and negative the
 * next (a subsidy repaid, a book gain reversed). Read as a cost its sign is
 * flattened and a €431,547 windfall becomes a €431,547 expense, which is the
 * largest single misreading this vocabulary has produced. It is income, it is
 * not the trading the ratios are about, and it is left out and said so.
 */
export const OTHER_INCOME = [
  "bedrijfsopbrengsten",
  "overige opbrengsten",
  "other operating income",
  "other income",
  "boekwinst",
  "subsidie",
  "subsidies",
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
  "voorgaand",
  "voorgaande",
  "prior year",
  "last year",
  "ly",
  "py",
] as const;

/**
 * How much time a column covers.
 *
 * Checked in this order, because a header like "Budget U/t period" carries
 * both words and the cumulative one wins. Comparing a single month against a
 * year-to-date budget makes every ratio in the report wrong by a factor of
 * three, produces a confident page of nonsense, and nothing downstream can
 * tell. It is the one mismatch the gate cannot catch, because both columns
 * add up perfectly.
 */
export const SPAN: readonly { id: string; label: string; words: readonly string[] }[] = [
  {
    id: "cumulative",
    label: "year to date",
    words: ["u t", "ytd", "cumulatief", "cumulative", "year to date", "t m", "tm"],
  },
  {
    id: "period",
    label: "a single period",
    words: ["period", "periode", "maand", "month", "kwartaal", "quarter"],
  },
  // Weakest, and last on purpose. "Dit jaar" and "Voorgaand jaar" are group
  // headings that say which year, not how much of it, and nearly every column
  // in a Dutch export sits under one of them.
  { id: "year", label: "a full year", words: ["year", "jaar", "annual", "fy"] },
];

export function spanOf(header: string): { id: string; label: string } | undefined {
  const found = SPAN.find((span) => has(header, span.words));
  return found ? { id: found.id, label: found.label } : undefined;
}

/**
 * Rows that are forecasts or scenarios, not amounts that happened.
 *
 * The file that forced this was a revenue-forecast workbook: fifteen rows of
 * "NC prognose op basis van...", a best case and a worst case. The reader
 * classified the scenarios as costs and one forecast as turnover, because it
 * contained the word "sales". A scenario is not a figure, and reading it as
 * one produces a report about a company that does not exist.
 */
export const SCENARIO = [
  "prognose",
  "forecast",
  "scenario",
  "best case",
  "worst case",
  "normale case",
  "educated guess",
] as const;

/** Column headers that are arithmetic on other columns, never a period. */
export const DERIVED_HEADER = [
  "verschil",
  "var",
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

/**
 * Where a cost sits in the margin cascade.
 *
 * Net sales, then four steps down to EBITDA. It is the structure every
 * competent operator keeps in their head and almost no small company has in
 * its accounting package, because a package orders costs by ledger code and
 * this orders them by how close they are to the sale.
 *
 * It matters because "costs went up" is not actionable and "you lose four
 * points more between gross profit and trading profit than you did last year"
 * is: it names the step, and each step has a different owner and a different
 * conversation. Step 1 is your buyer, step 2 is your logistics partner, step 3
 * is your marketing budget, step 4 is your organisation.
 *
 * The tiers are the same for a goods business and a services business, but the
 * shape is not. A goods business loses half of turnover at step 1 and a
 * services business loses almost nothing there and nearly everything at step
 * 4, because in services the people are the product. Reading one against the
 * other is how you conclude that a consultancy has a purchasing problem.
 */
export type Tier = 1 | 2 | 3 | 4;

export const TIERS: readonly { tier: Tier; label: string; step: string; words: readonly string[] }[] = [
  {
    tier: 1,
    label: "Cost of sales",
    step: "Net sales to gross profit",
    words: [
      "kostprijs",
      "inkoop",
      "inkoopwaarde",
      "cogs",
      "cost of sales",
      "cost of goods",
      "purchased",
      "goederen",
      "materiaal",
      "materials",
      "grondstof",
      "grondstoffen",
      "inbound",
      "invoerrechten",
      "duty",
      "verpakking",
      "packaging",
    ],
  },
  {
    tier: 2,
    label: "Fulfilling the order",
    step: "Gross profit to trading profit",
    words: [
      "vracht",
      "freight",
      "transport",
      "shipping",
      "verzend",
      "koerier",
      "courier",
      "outbound",
      "pick",
      "pack",
      "fulfilment",
      "fulfillment",
      "logistiek",
      "logistics",
      "3pl",
      "assemblage",
      "handling",
      "warehousing",
      "opslag",
      "magazijn",
      "distributie",
      "distribution",
    ],
  },
  {
    tier: 3,
    label: "Winning the order",
    step: "Trading profit to contribution margin",
    words: [
      "marketing",
      "brand",
      "performance",
      "advertentie",
      "advertising",
      "reclame",
      "adwords",
      "affiliate",
      "commissie",
      "commission",
      "provisie",
      "selling",
      "verkoop",
      "sales expenses",
      "betaalkosten",
      "payment fees",
      "psp",
    ],
  },
  {
    tier: 4,
    label: "Running the company",
    step: "Contribution margin to EBITDA",
    words: [
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
      "huisvesting",
      "housing",
      "huur",
      "rent",
      "kantoor",
      "office",
      "algemene",
      "general",
      "overige",
      "other costs",
      "it",
      "ict",
      "software",
      "abonnement",
      "verzekering",
      "insurance",
      "accountant",
      "juridisch",
      "legal",
      "reiskosten",
      "travel",
      "auto",
      // The cost of existing includes the cost of things bought earlier.
      // Left off this list, depreciation silently vanished from the cascade
      // and a company burning cash showed 80 cents lost where 124 were.
      "afschrijving",
      "afschrijvingen",
      "depreciation",
      "amortisation",
      "amortization",
    ],
  },
];

/** Which step of the cascade this cost belongs to, if we can tell. */
export function tierOf(label: string): Tier | undefined {
  return TIERS.find((t) => has(label, t.words))?.tier;
}

/**
 * Labour, wherever it sits in the accounts.
 *
 * Kept separate from the tiers because labour is the one cost that has to be
 * read against gross profit rather than against turnover. Turnover is not
 * money you have. What you bought and resold was never yours; gross profit is
 * the first figure that is, and it is what has to pay for everybody.
 *
 * A trading company at fifty percent gross margin spending ten percent of
 * turnover on people is spending twenty percent of what it actually earns.
 * Stated against turnover that reads as a small number. It is not a small
 * number.
 */
export const LABOUR = [
  "personeel",
  "personeels",
  "salaris",
  "salarissen",
  "loon",
  "lonen",
  "payroll",
  "wages",
  "salary",
  "staff cost",
  "staff costs",
  "sociale lasten",
  "pensioen",
  "pension",
  "inhuur",
  "freelance",
  "zzp",
  "uitzend",
  "contractors",
] as const;

export const isLabour = (label: string) => has(label, LABOUR);
