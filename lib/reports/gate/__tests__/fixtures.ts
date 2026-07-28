import type { Cell, Rollup, Statement } from "..";

/**
 * A real profit and loss, not an invented one.
 *
 * These are the figures from a Q1 2026 management report for an actual trading
 * company, in thousands of euros to one decimal, as supplied. Three columns of
 * the same workbook are modelled: the quarter's actuals, the year budget as it
 * appears on the reporting tab, and the same year budget as it appears on the
 * tab where it was agreed.
 *
 * Two of the three reconcile. The third does not, and it is the one every
 * variance column in the report is measured against. That is the case the gate
 * exists for, so it is the case the gate is tested on.
 */

const LABELS: Record<string, string> = {
  "net-turnover": "Net turnover",
  kostprijs: "Kostprijs",
  ontwikkelingskosten: "Ontwikkelingskosten",
  "overige-kostprijs": "Overige kostprijs",
  "kostprijs-totaal": "Kostprijs totaal",
  "marge-voor-vracht": "Marge voor vracht",
  "husa-logistics": "Kosten Husa Logistics",
  dhb: "Kosten Dhb",
  "husa-pick": "Kosten Husa pick",
  "husa-assemblage": "Kosten Husa Assemblage",
  "doorberekende-vracht": "Doorberekende vracht",
  "vrachtkosten-uitgaand": "Vrachtkosten uitgaand",
  "marge-na-vracht": "Marge na vracht",
  personeelskosten: "Personeelskosten",
  afschrijvingen: "Afschrijvingen",
  huisvestingskosten: "Huisvestingskosten",
  reiskosten: "Reiskosten",
  autokosten: "Autokosten",
  marketing: "Marketing kosten",
  it: "Kosten IT",
  juridisch: "Kosten juridisch",
  algemeen: "Kosten Algemeen",
  doorstart: "Kosten doorstart reorganisatie",
  "overige-kosten": "Overige kosten",
  "total-costs": "Total costs",
  "trading-results": "Trading results",
  rente: "Rente kosten",
  profit: "Profit before tax",
  tax: "Tax",
  "net-profit": "Net profit after tax",
};

function cells(values: Record<string, number | null>): Cell[] {
  return Object.entries(values).map(([id, value]) => ({
    id,
    label: LABELS[id] ?? id,
    value,
  }));
}

/**
 * How the statement claims to add up.
 *
 * One definition, shared by all three columns. That is deliberate: if a column
 * only reconciles under its own bespoke rollup, the rollup has been fitted to
 * the answer and the test proves nothing.
 */
export const PROFIT_AND_LOSS: Rollup[] = [
  {
    id: "kostprijs-totaal",
    parts: [
      { cell: "kostprijs", sign: 1 },
      { cell: "ontwikkelingskosten", sign: 1 },
      { cell: "overige-kostprijs", sign: 1 },
    ],
  },
  {
    id: "marge-voor-vracht",
    parts: [
      { cell: "net-turnover", sign: 1 },
      { cell: "kostprijs-totaal", sign: -1 },
    ],
  },
  {
    id: "marge-na-vracht",
    parts: [
      { cell: "marge-voor-vracht", sign: 1 },
      { cell: "husa-logistics", sign: -1 },
      { cell: "dhb", sign: -1 },
      { cell: "husa-pick", sign: -1 },
      { cell: "husa-assemblage", sign: -1 },
      // Carried as a credit in the source, so it is subtracted like any other
      // cost line and its own negative sign does the crediting.
      { cell: "doorberekende-vracht", sign: -1 },
      { cell: "vrachtkosten-uitgaand", sign: -1 },
    ],
  },
  {
    id: "total-costs",
    parts: [
      { cell: "personeelskosten", sign: 1 },
      { cell: "afschrijvingen", sign: 1 },
      { cell: "huisvestingskosten", sign: 1 },
      { cell: "reiskosten", sign: 1 },
      { cell: "autokosten", sign: 1 },
      { cell: "marketing", sign: 1 },
      { cell: "it", sign: 1 },
      { cell: "juridisch", sign: 1 },
      { cell: "algemeen", sign: 1 },
      { cell: "doorstart", sign: 1 },
      { cell: "overige-kosten", sign: 1 },
    ],
  },
  {
    id: "trading-results",
    parts: [
      { cell: "marge-na-vracht", sign: 1 },
      { cell: "total-costs", sign: -1 },
    ],
  },
  {
    id: "profit",
    parts: [
      { cell: "trading-results", sign: 1 },
      { cell: "rente", sign: -1 },
    ],
  },
  {
    id: "net-profit",
    parts: [
      { cell: "profit", sign: 1 },
      { cell: "tax", sign: -1 },
    ],
  },
];

/** Q1 2026 actuals. Adds up, including the blank line for overige kosten. */
export const q1Actual: Statement = {
  id: "am-q1-2026-actual",
  label: "Q1 2026 actual",
  precision: 0.1,
  rollups: PROFIT_AND_LOSS,
  cells: cells({
    "net-turnover": 414.4,
    kostprijs: 165.4,
    ontwikkelingskosten: 0,
    "overige-kostprijs": -2.4,
    "kostprijs-totaal": 163.0,
    "marge-voor-vracht": 251.4,
    "husa-logistics": 27.4,
    dhb: 22.4,
    "husa-pick": 23.5,
    "husa-assemblage": 26.0,
    "doorberekende-vracht": -25.4,
    "vrachtkosten-uitgaand": 40.3,
    "marge-na-vracht": 137.2,
    personeelskosten: 149.5,
    afschrijvingen: 2.3,
    huisvestingskosten: 10.2,
    reiskosten: 8.5,
    autokosten: 0,
    marketing: 13.2,
    it: 10.8,
    juridisch: 0,
    algemeen: 6.5,
    doorstart: 6.3,
    "overige-kosten": null,
    "total-costs": 207.4,
    "trading-results": -70.2,
    rente: 3.6,
    profit: -73.8,
    tax: -14.0,
    "net-profit": -59.8,
  }),
};

/**
 * The year budget as printed on the reporting tab.
 *
 * Marge na vracht is stated as 1414.4. Its own parts give 1133.0, and no single
 * sign reading of them produces the stated figure. Everything below it is
 * internally consistent with the wrong number, which is exactly why nobody
 * noticed: the column looks finished.
 */
export const yearBudgetAsReported: Statement = {
  id: "am-2026-budget-reporting-tab",
  label: "Budget 2026 (reporting tab)",
  precision: 0.1,
  rollups: PROFIT_AND_LOSS,
  cells: cells({
    "net-turnover": 2855,
    kostprijs: 1056.3,
    ontwikkelingskosten: 51.5,
    "overige-kostprijs": null,
    "kostprijs-totaal": 1107.8,
    "marge-voor-vracht": 1747.2,
    "husa-logistics": 93.0,
    dhb: 82.7,
    "husa-pick": 101.6,
    "husa-assemblage": 97.2,
    "doorberekende-vracht": 82.7,
    "vrachtkosten-uitgaand": 157.0,
    "marge-na-vracht": 1414.4,
    personeelskosten: 671.8,
    afschrijvingen: 10.8,
    huisvestingskosten: 36.4,
    reiskosten: 61.8,
    autokosten: 0,
    marketing: 51.5,
    it: 21.7,
    juridisch: 5.2,
    algemeen: 44.4,
    doorstart: 15.5,
    "overige-kosten": 0,
    "total-costs": 918.9,
    "trading-results": 495.5,
    rente: 25,
    profit: 470.5,
    tax: 80.8,
    "net-profit": 389.7,
  }),
};

/** The same year budget on the tab where it was agreed. This one closes. */
export const yearBudgetAsAgreed: Statement = {
  id: "am-2026-budget-agreed-tab",
  label: "Budget 2026 (agreed tab)",
  precision: 0.1,
  rollups: PROFIT_AND_LOSS,
  cells: cells({
    "net-turnover": 2855,
    kostprijs: 1056.3,
    ontwikkelingskosten: 51.5,
    "overige-kostprijs": null,
    "kostprijs-totaal": 1107.8,
    "marge-voor-vracht": 1747.2,
    "husa-logistics": 93.0,
    dhb: 82.7,
    "husa-pick": 101.6,
    "husa-assemblage": 97.2,
    "doorberekende-vracht": -51.5,
    "vrachtkosten-uitgaand": 157.0,
    "marge-na-vracht": 1267.2,
    personeelskosten: 671.8,
    afschrijvingen: 10.8,
    huisvestingskosten: 36.4,
    reiskosten: 61.8,
    autokosten: 0,
    marketing: 51.5,
    it: 21.7,
    juridisch: 5.2,
    algemeen: 44.4,
    doorstart: 15.5,
    "overige-kosten": 0,
    "total-costs": 918.9,
    "trading-results": 348.3,
    rente: 25,
    profit: 323.3,
    tax: 80.8,
    "net-profit": 242.5,
  }),
};
