import { cascade } from "@/lib/reports/findings/cascade";
import { findAll } from "@/lib/reports/findings/rules";
import type { FindingsInput } from "@/lib/reports/findings/types";

/** Two decimals: rounding a ratio to whole euros loses the whole point. */
const rate = (n: number) => `€${n.toFixed(2)}`;
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const cents = (n: number) => `${Math.round(n * 100)} cents`;

export type Question = {
  id: string;
  /** The question, with their own figures already in it. */
  ask: string;
  /** Why it is worth asking, in one sentence. */
  why: string;
  /** What a good answer sounds like, so a vague one is recognisable. */
  good: string;
};

/**
 * The questions to take to your accountant, with your own numbers in them.
 *
 * This report exists because of one meeting. Eighteen years old, a suit, an
 * accountant going through the annual accounts, and not a word of it landing.
 * The failure there was not that the information was missing. It was read out
 * loud. The failure was that the owner had no questions, so the meeting became
 * a briefing, and a briefing is something you nod through.
 *
 * An owner walking in with five specific questions about their own figures is
 * a different person in that room. Not because the questions are clever, but
 * because each one names a number the accountant now has to account for.
 *
 * Nothing here is new arithmetic. Every figure comes from the same portrait,
 * cascade and findings the other reports use, which is the point: the value is
 * not more analysis, it is the same analysis pointed at a conversation.
 */
export function questionsForYourAccountant(input: FindingsInput): Question[] {
  const questions: Question[] = [];
  const { actual, reference } = input;
  const revenue = actual.values[actual.revenueKey];
  const steps = cascade(actual, input.tiers ?? []);
  const before = reference ? cascade(reference, input.tiers ?? []) : undefined;

  // 1. The step that moved. Every step has a different owner, so naming the
  //    step decides who the next conversation is with.
  if (before) {
    const moved = steps.steps
      .map((step) => {
        const was = before.steps.find((s) => s.tier === step.tier);
        return was ? { step, was, delta: step.share - was.share } : undefined;
      })
      .filter((m): m is NonNullable<typeof m> => m !== undefined)
      .sort((a, b) => b.delta - a.delta)[0];

    if (moved && moved.delta > 0.005) {
      questions.push({
        id: "step",
        ask:
          `${moved.step.label} took ${cents(moved.step.share)} of every euro of turnover this ` +
          `period, against ${cents(moved.was.share)} in ${reference!.label}. What changed there?`,
        why:
          `Each step of the cascade has a different owner. This one is the step that widened ` +
          `most, so it is the only one worth an hour of the meeting.`,
        good:
          `A cause you can name: a rate change, a contract minimum, a mix shift, a one-off. ` +
          `"Costs went up" is not an answer, it is the question restated.`,
      });
    }
  }

  // 2. Labour against gross profit. The one ratio that says whether the people
  //    are earning more than they cost, and it is almost never in the pack.
  const labour = (input.labourLines ?? []).reduce(
    (sum, line) => sum + Math.abs(actual.values[line.key] ?? 0),
    0,
  );
  const grossCost = steps.steps.find((s) => s.tier === 1)?.cost ?? 0;
  const gross = revenue - grossCost;
  if (labour > 0 && gross > 0) {
    questions.push({
      id: "labour",
      ask:
        `Every euro we spend on people brings in ${rate(gross / labour)} of gross profit. ` +
        `Is that number moving, and in which direction?`,
      why:
        `Wages are usually read against turnover, which flatters them, because turnover ` +
        `includes money that was never ours. Against gross profit is the honest denominator.`,
      good:
        `A trend over several periods and a reason for it. If your accountant has never ` +
        `produced this figure, that is itself worth knowing.`,
    });
  }

  // 3. Anything we found, turned into a question rather than an assertion.
  const found = findAll(input);
  const biggest = found[0];
  if (biggest) {
    questions.push({
      id: "finding",
      ask:
        `${biggest.observation} Was that a decision somebody took, or did it happen to us?`,
      why:
        `The most common reason a figure looks wrong is that it was once right and nobody ` +
        `revisited it. That is a different problem from an error, and it has a different fix.`,
      good:
        `Either "we chose that, and here is why" or "nobody has looked at that since". ` +
        `Both are useful. A shrug is not.`,
    });
  }

  // 4. The budget, if there is one. Not whether it was met, but whether it was
  //    ever meant to flex.
  //
  //    Suppressed when the cost-base finding is already in the list, because
  //    that finding says "turnover fell this far and these lines did not
  //    follow", which is this question with the answer attached. Asking it
  //    anyway would be padding a five-question list to five.
  const alreadyAnswered = found.some((f) => f.id === "ratio-cost-base");
  if (!alreadyAnswered && reference && reference.values[reference.revenueKey]) {
    const drop = 1 - revenue / reference.values[reference.revenueKey];
    if (Math.abs(drop) > 0.02) {
      questions.push({
        id: "budget",
        ask:
          `Turnover came in ${pct(Math.abs(drop))} ${drop > 0 ? "below" : "above"} ` +
          `${reference.label}. Which cost lines did we assume would move with it, and did they?`,
        why:
          `A budget quietly assumes some costs flex and others do not. Nobody writes that ` +
          `assumption down, so nobody checks it, and it is where a plan and a year part company.`,
        good:
          `A list, per line. If the answer is that the budget was built by adding a percentage ` +
          `to last year, you have learned something more useful than any variance.`,
      });
    }
  }

  // 5. Always last, and deliberately not about this period. The point of the
  //    meeting is the next twelve, not the last three.
  questions.push({
    id: "watch",
    ask:
      `If you could put one number from these accounts in front of me every month, which one, ` +
      `and what value would make you pick up the phone?`,
    why:
      `It turns your accountant from a historian into an alarm, and it costs them nothing. ` +
      `Most have an opinion about this and are never asked for it.`,
    good:
      `One number and one threshold. If the answer is a dashboard of twelve, ask again: a ` +
      `signal that fires on twelve things is a signal that never fires.`,
  });

  return questions;
}

/** Plain text, in the order to ask them. */
export function renderQuestions(questions: Question[]): string {
  return questions
    .map((q, i) => {
      const lines = [
        `${i + 1}. ${q.ask}`,
        `   Why:    ${q.why}`,
        `   Good:   ${q.good}`,
      ];
      return lines.join("\n");
    })
    .join("\n\n");
}
