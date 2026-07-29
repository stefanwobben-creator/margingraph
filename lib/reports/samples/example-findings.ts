import {
  findAll,
  portrait,
  render,
  teaser,
  type FindingsInput,
} from "@/lib/reports/findings";

/**
 * The figures behind the demo, and why they are the real ones.
 *
 * This is a Dutch wholesaler's 2026 management accounts against its own budget,
 * with the company anonymised and nothing else changed. Inventing a fixture
 * here would have been easier and would have proved nothing: a demo built on
 * numbers chosen to make the rules fire is an advertisement for the numbers.
 *
 * The line labels are the ones the company used, which is why some of them are
 * in Dutch. The engine reads whatever a file calls its rows; it does not
 * translate an owner's own chart of accounts, and pretending otherwise on a
 * demo page would misrepresent what arrives.
 */
export const DEMO_COMPANY = {
  name: "A wholesaler with €2.4m of revenue",
  note: "Real management accounts, anonymised. Seven staff, imports from Asia, sells to retailers across Europe.",
} as const;

export const demoInput: FindingsInput = {
  actual: {
    label: "2026 trend",
    revenueKey: "revenue",
    values: {
      revenue: 2_389_560,
      "outbound freight": 81_800,
      "recharged freight": -45_400,
      fulfilment: 101_000,
      "IT costs": 82_700,
      payroll: 526_000,
      marketing: 75_400,
    },
  },
  reference: {
    label: "2026 budget",
    revenueKey: "revenue",
    values: {
      revenue: 2_850_000,
      "outbound freight": 111_200,
      "recharged freight": -62_700,
      fulfilment: 256_500,
      "IT costs": 61_500,
      payroll: 600_000,
      marketing: 112_800,
    },
  },
  // What the company keeps on the next euro of revenue. Without it the ladder
  // can price each step but not the volume it may safely cost, which is the
  // half an owner actually needs before touching a price.
  contributionMargin: 0.368,
  recoveries: [
    { cost: "outbound freight", recovery: "recharged freight", label: "outbound freight" },
  ],
  variableLines: [
    { key: "fulfilment", label: "Fulfilment" },
    { key: "outbound freight", label: "Outbound freight" },
  ],
  costLines: [
    { key: "IT costs", label: "IT costs" },
    { key: "marketing", label: "Marketing" },
    { key: "payroll", label: "Payroll" },
    { key: "fulfilment", label: "Fulfilment" },
  ],
  // Which step of the cascade each cost belongs to. On a real file the reader
  // works this out from the labels; here it is declared, because the demo has
  // to be the same shape as a real intake rather than a special case.
  tiers: [
    { key: "outbound freight", label: "Outbound freight", tier: 2 },
    { key: "fulfilment", label: "Fulfilment", tier: 2 },
    { key: "marketing", label: "Marketing", tier: 3 },
    { key: "IT costs", label: "IT costs", tier: 4 },
    { key: "payroll", label: "Payroll", tier: 4 },
  ],
  labourLines: [{ key: "payroll", label: "Payroll" }],
};

/** Where every euro goes, for the hero. Real figures, produced by the engine. */
export function demoPortrait() {
  return portrait(demoInput);
}

/** What a visitor sees for free. */
export function demoTeaser() {
  return teaser(findAll(demoInput), demoInput);
}

/** What €9 unlocks. */
export function demoReport() {
  return render(findAll(demoInput));
}

/** The lines the engine was given, for the "what was in the file" panel. */
export function demoLines(): { label: string; actual: number; budget: number }[] {
  const a = demoInput.actual.values;
  const b = demoInput.reference?.values ?? {};
  return Object.keys(a).map((key) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1),
    actual: a[key],
    budget: b[key] ?? 0,
  }));
}
