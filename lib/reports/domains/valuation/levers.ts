/**
 * What one unit of improvement is worth, in euros of value.
 *
 * This is the product, expressed in three lines. An owner cannot price a
 * decision in EBITDA, because EBITDA is not a currency they think in. They can
 * price it in what the business is worth, because that is the number they
 * already carry around.
 *
 * The three levers below are chosen so that the comparison between them is the
 * finding. Earning a euro is leveraged by the multiple; paying off a euro of
 * debt is not. Seeing those two side by side tells an owner where to put the
 * next euro, and no accounting package will ever tell them.
 */

export type Lever = {
  id: string;
  /** What the owner would do. */
  action: string;
  /** Euro effect on equity value. */
  worth: number;
  /** Why it is worth that, in one clause. */
  because: string;
  /** Which claim it moves, so the report can link them. */
  affects: string;
};

const STEP = 10_000;

export function valuationLevers(input: {
  revenue: number;
  multiple: number;
  /** Total discount rate at the mid of the range, as a fraction. */
  discountRate: number;
  taxRate: number;
}): Lever[] {
  const { revenue, multiple, discountRate, taxRate } = input;

  // A point of margin is a point of revenue that stops being a cost, so it
  // lands in EBITDA whole and is then multiplied like any other euro of it.
  const marginPoint = revenue / 100;

  return [
    {
      id: "lv-margin",
      action: "Raise gross margin by one percentage point",
      worth: marginPoint * multiple,
      because: `one point of margin on ${Math.round(revenue).toLocaleString("en-GB")} of turnover is €${Math.round(marginPoint).toLocaleString("en-GB")} of earnings, multiplied by ${multiple}`,
      affects: "cl-market-multiple",
    },
    {
      id: "lv-earnings",
      action: `Add €${STEP.toLocaleString("en-GB")} of adjusted earnings, however you get there`,
      worth: STEP * multiple,
      because: `every euro of earnings is worth ${multiple} euros of value at your size band`,
      affects: "cl-market-multiple",
    },
    {
      id: "lv-earnings-income",
      action: `The same €${STEP.toLocaleString("en-GB")}, valued the other way`,
      worth: (STEP * (1 - taxRate)) / discountRate,
      because: `capitalised after tax at ${(discountRate * 100).toFixed(1)}%, which is why the two methods disagree`,
      affects: "cl-capitalised",
    },
    {
      id: "lv-debt",
      action: `Pay off €${STEP.toLocaleString("en-GB")} of debt`,
      worth: STEP,
      because: "debt comes off the value euro for euro, with no multiple on it",
      affects: "cl-market-multiple",
    },
  ];
}

/**
 * The sentence that makes the comparison land.
 *
 * Deliberately blunt: a reader who takes one thing from the report should take
 * this. It is also falsifiable, which is why it names the ratio rather than
 * asserting that trading is "better".
 */
export function leverageSentence(levers: Lever[]): string | undefined {
  const earning = levers.find((l) => l.id === "lv-earnings");
  const debt = levers.find((l) => l.id === "lv-debt");
  if (!earning || !debt || debt.worth <= 0) return undefined;
  const ratio = earning.worth / debt.worth;
  return (
    `A euro earned is worth ${ratio.toFixed(1)} times a euro of debt repaid. ` +
    `Both are worth doing; only one of them is multiplied.`
  );
}
