import type { FindingsInput } from "..";

/**
 * Two real companies, in euros.
 *
 * Both sets came off actual management reports, and every rule in this module
 * was first found by hand on one of them. The tests below are therefore not
 * checking that the code runs. They are checking that the code reproduces a
 * conclusion a person already reached and could defend.
 */

/** A Dutch trading company, full-year 2026 trend against its own budget. */
export const allc: FindingsInput = {
  actual: {
    label: "trend 2026",
    revenueKey: "omzet",
    values: {
      omzet: 2_389_560,
      "vracht-uitgaand": 81_800,
      "doorberekende-vracht": -45_400,
      fulfilment: 101_000,
      it: 82_700,
      personeel: 526_000,
      marketing: 75_400,
    },
  },
  reference: {
    label: "budget 2026",
    revenueKey: "omzet",
    values: {
      omzet: 2_850_000,
      "vracht-uitgaand": 111_200,
      "doorberekende-vracht": -62_700,
      fulfilment: 256_500,
      it: 61_500,
      personeel: 600_000,
      marketing: 112_800,
    },
  },
  recoveries: [
    {
      cost: "vracht-uitgaand",
      recovery: "doorberekende-vracht",
      label: "uitgaande vracht",
    },
  ],
  variableLines: [
    { key: "fulfilment", label: "Fulfilment" },
    { key: "vracht-uitgaand", label: "Uitgaande vracht" },
  ],
  costLines: [
    { key: "it", label: "Kosten IT" },
    { key: "marketing", label: "Marketing" },
    { key: "personeel", label: "Personeelskosten" },
    { key: "fulfilment", label: "Fulfilment" },
  ],
};

/**
 * A second trading company, Q1 2026 actual against the budget for the same
 * period. Turnover came in 46% under plan and the outsourced logistics did
 * not follow. Five separate contract lines, one underlying problem.
 */
export const am: FindingsInput = {
  actual: {
    label: "Q1 2026",
    revenueKey: "omzet",
    values: {
      omzet: 414_400,
      "husa-logistics": 27_400,
      dhb: 22_400,
      "husa-pick": 23_500,
      "husa-assemblage": 26_000,
      "vracht-uitgaand": 40_300,
      "doorberekende-vracht": -25_400,
      personeel: 149_500,
      it: 10_800,
    },
  },
  reference: {
    label: "budget Q1",
    revenueKey: "omzet",
    values: {
      omzet: 765_400,
      "husa-logistics": 23_300,
      dhb: 20_700,
      "husa-pick": 25_400,
      "husa-assemblage": 24_300,
      "vracht-uitgaand": 42_100,
      "doorberekende-vracht": -9_800,
      personeel: 167_900,
      it: 5_400,
    },
  },
  recoveries: [
    {
      cost: "vracht-uitgaand",
      recovery: "doorberekende-vracht",
      label: "uitgaande vracht",
    },
  ],
  variableLines: [
    { key: "husa-logistics", label: "Husa Logistics" },
    { key: "dhb", label: "Dhb" },
    { key: "husa-pick", label: "Husa pick" },
    { key: "husa-assemblage", label: "Husa assemblage" },
    { key: "vracht-uitgaand", label: "Uitgaande vracht" },
  ],
  costLines: [
    { key: "it", label: "Kosten IT" },
    { key: "personeel", label: "Personeelskosten" },
  ],
};

/** A company where nothing is wrong. The rules must stay quiet. */
export const clean: FindingsInput = {
  actual: {
    label: "2026",
    revenueKey: "omzet",
    values: {
      omzet: 1_000_000,
      "vracht-uitgaand": 20_000,
      "doorberekende-vracht": -20_000,
      it: 10_000,
    },
  },
  reference: {
    label: "budget 2026",
    revenueKey: "omzet",
    values: {
      omzet: 1_000_000,
      "vracht-uitgaand": 20_000,
      "doorberekende-vracht": -20_000,
      it: 10_000,
    },
  },
  recoveries: [
    {
      cost: "vracht-uitgaand",
      recovery: "doorberekende-vracht",
      label: "uitgaande vracht",
    },
  ],
  variableLines: [{ key: "vracht-uitgaand", label: "Uitgaande vracht" }],
  costLines: [{ key: "it", label: "Kosten IT" }],
};
