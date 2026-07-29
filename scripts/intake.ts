/**
 * Run a file the whole way through, on one command.
 *
 *   npm run intake "~/Downloads/Q1 2026.xlsx"
 *
 * Prints, in order: how the reader understood the file, anything it refused to
 * decide, the teaser the sender gets for nothing, and the report they get for
 * nine euros. Nothing here is a new judgement. Every line of output comes from
 * code that ships, so if this looks wrong the product is wrong.
 *
 * It used to be two commands with a temporary file between them, which meant a
 * spreadsheet that could not be found produced an empty file, and the empty
 * file produced a stack trace about JSON. The shell truncates the output file
 * before it knows whether the first command worked, so that failure was
 * guaranteed rather than unlucky. One command, and the error is the real one.
 *
 * Options, for the files that need an answer rather than a guess:
 *
 *   npm run intake accounts.xlsx -- --sheet "Q1" --reference 2 --scale 1000
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { findAll, render, teaser } from "@/lib/reports/findings";
import { readSheet, type Sheet } from "@/lib/reports/intake";

const argv = process.argv.slice(2);
const at = (name: string) => argv.indexOf(`--${name}`);
const text = (name: string) => {
  const i = at(name);
  return i >= 0 ? argv[i + 1] : undefined;
};
const num = (name: string) => {
  const value = text(name);
  return value === undefined ? undefined : Number(value);
};

// Everything that is not a flag and not a flag's value.
const consumed = new Set<number>();
argv.forEach((a, i) => {
  if (a.startsWith("--")) {
    consumed.add(i);
    consumed.add(i + 1);
  }
});
const file = argv.find((a, i) => !consumed.has(i));

if (!file) {
  console.error(
    "usage: npm run intake <file.xlsx|file.csv|rows.json> [-- --sheet NAME --actual N --reference N --scale N]",
  );
  process.exit(1);
}

const CONVERTER = fileURLToPath(new URL("./sheet-to-rows.py", import.meta.url));

function grid(path: string): string {
  if (/\.json$/i.test(path)) return readFileSync(path, "utf8");

  const sheet = text("sheet");
  try {
    return execFileSync(
      "python3",
      [CONVERTER, path, ...(sheet ? ["--sheet", sheet] : [])],
      { encoding: "utf8", maxBuffer: 256 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] },
    );
  } catch (error) {
    const e = error as { stderr?: string; message?: string };
    // The converter's own message is the useful one: "no such file", "no sheet
    // named X, this file has: ...", "openpyxl is not installed".
    console.error(`\n${(e.stderr || e.message || "the converter failed").trim()}\n`);
    process.exit(1);
  }
}

const raw = grid(file);
if (!raw.trim()) {
  console.error(`\n${file} produced nothing to read. Is it empty?\n`);
  process.exit(1);
}

const sheet = JSON.parse(raw) as Sheet;
const intake = readSheet(sheet, {
  actualColumn: num("actual"),
  referenceColumn: num("reference"),
  scale: num("scale"),
});

const pad = (s: string, n: number) => s.padEnd(n);
const width = Math.max(10, ...intake.rows.map((r) => r.label.length));

console.log(`\nHOW WE READ "${sheet.name}"\n`);
if (intake.columns) {
  console.log(
    `  period      ${intake.columns.actual.header} (column ${intake.columns.actual.index + 1})`,
  );
  console.log(
    `  compared to ${intake.columns.reference?.header ?? "nothing"}${
      intake.columns.reference ? ` (column ${intake.columns.reference.index + 1})` : ""
    }\n`,
  );
}
for (const row of intake.rows) {
  const amount = row.actual === null ? "" : Math.round(row.actual).toLocaleString("en-GB");
  console.log(
    `  ${pad(row.label, width)}  ${pad(row.kind, 9)} ${amount.padStart(12)}` +
      (row.because ? `   ${row.because}` : ""),
  );
}

if (intake.notes.length) {
  console.log("\nWHAT WE DECIDED\n");
  for (const note of intake.notes) console.log(`  - ${note}`);
}

if (!intake.readable) {
  console.log("\nWHAT WE WILL NOT GUESS AT\n");
  for (const q of intake.questions) console.log(`  - ${q}`);
  console.log("\nNothing runs until these are answered. Nobody is charged.\n");
  process.exit(2);
}

const findings = findAll(intake.input!);

console.log("\n--- FREE ------------------------------------------------------\n");
console.log(teaser(findings).text);
console.log("--- PAID ------------------------------------------------------\n");
console.log(render(findings).text);
