import type { FindingsInput } from "./types";

/**
 * What your figures look like, before anything is wrong with them.
 *
 * This exists because of the meeting the founder describes on the about page:
 * eighteen years old, a suit, an accountant going through the annual accounts,
 * and not one word of it landing. The failure there was not analysis. It was
 * that nobody had ever said, in ordinary language, what the numbers were.
 *
 * So the free half of every report now opens with four facts about the
 * business rather than a sales line about findings. It costs us nothing to
 * give away, it cannot be wrong because it is arithmetic on their own file,
 * and somebody who reads it knows something about their company they did not
 * know a minute earlier. That is the moment worth engineering for. A reader
 * who feels informed will pay nine euros; a reader who feels sold to will not.
 *
 * Every line is a fact with its workings visible in the file. No judgements
 * live here: whether 37 cents in the euro is good is not something this can
 * know, and pretending otherwise is how a portrait becomes a horoscope.
 */
export type PortraitLine = { label: string; value: string };

const euro = (n: number) => `€${Math.round(Math.abs(n)).toLocaleString("en-GB")}`;
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export type Portrait = { lines: PortraitLine[]; text: string };

export function portrait(input: FindingsInput): Portrait {
  const { actual, reference, contributionMargin, variableLines = [], costLines = [] } = input;
  const revenue = actual.values[actual.revenueKey];
  const lines: PortraitLine[] = [];

  if (!revenue) return { lines, text: "" };

  lines.push({ label: `Turnover, ${actual.label}`, value: euro(revenue) });

  const was = reference?.values[reference.revenueKey];
  if (was) {
    const move = revenue / was - 1;
    lines.push({
      label: `Against ${reference!.label}`,
      value:
        Math.abs(move) < 0.005
          ? "level"
          : `${pct(Math.abs(move))} ${move < 0 ? "below" : "above"}`,
    });
  }

  if (contributionMargin !== undefined && contributionMargin > 0) {
    lines.push({
      label: "Left after direct costs",
      value: `${Math.round(contributionMargin * 100)} cents in every euro`,
    });
  }

  // The largest line in each of the two families the rules care about. Naming
  // them is not a finding, it is orientation: most owners can tell you their
  // turnover and very few can tell you which single cost line is eating the
  // largest share of it.
  const largest = (of: { key: string; label: string }[]) =>
    of
      .map((line) => ({ ...line, value: Math.abs(actual.values[line.key] ?? 0) }))
      .filter((line) => line.value > 0)
      .sort((a, b) => b.value - a.value)[0];

  const variable = largest(variableLines);
  if (variable) {
    lines.push({
      label: "Biggest cost that moves with volume",
      value: `${variable.label}, ${pct(variable.value / revenue)} of turnover`,
    });
  }

  const variableKeys = new Set(variableLines.map((l) => l.key));
  const fixed = largest(costLines.filter((line) => !variableKeys.has(line.key)));
  if (fixed) {
    lines.push({
      label: "Biggest cost that does not",
      value: `${fixed.label}, ${pct(fixed.value / revenue)} of turnover`,
    });
  }

  const width = Math.max(...lines.map((l) => l.label.length));
  return {
    lines,
    text: lines.map((l) => `  ${l.label.padEnd(width)}   ${l.value}`).join("\n"),
  };
}
