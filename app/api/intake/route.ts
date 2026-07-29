import { NextResponse } from "next/server";

import { MAX_FILES, validate } from "@/lib/upload/limits";
import { seller } from "@/lib/site";

/**
 * Where a file arrives.
 *
 * The design decision worth stating: nothing is stored. The file is read into
 * memory, attached to one email addressed to us, and dropped. There is no
 * bucket, no database and no disk write, which means there is no store to
 * secure, no retention policy to forget, and nothing to leak in a year when
 * everyone has stopped thinking about it. Deleting a submission is deleting an
 * email.
 *
 * That choice costs us the ability to reprocess a file we did not keep, and
 * caps a submission at what fits in one request. Both are the right way round
 * for a service whose input is a spreadsheet of a few dozen kilobytes.
 */
export const runtime = "nodejs";

/** Set in Vercel. Absent in a preview build, and the route says so. */
const RESEND_KEY = (process.env.RESEND_API_KEY ?? "").trim();
/** Must be a domain verified with the mail provider. */
const FROM = (process.env.INTAKE_FROM ?? "intake@margingraph.com").trim();

const problem = (status: number, problems: string[]) =>
  NextResponse.json({ ok: false, problems }, { status });

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    // The platform refuses a body over its own limit before this code runs, so
    // this is usually a truncated upload rather than a malformed one.
    return problem(413, [
      `That did not arrive in one piece. Try one file at a time, or email it to ${seller.email}.`,
    ]);
  }

  // An input no human fills in. Bots fill in everything they can see, and this
  // costs a real sender nothing, unlike a puzzle.
  //
  // Logged rather than silently dropped. When a honeypot misfires on a real
  // person, that person is told their file arrived and then never hears from
  // us again, and it is the one failure in this system with no signal at
  // either end. A line in the log is the difference between a bug we find and
  // a customer we lose without knowing.
  if ((form.get("fax_confirm") ?? "") !== "") {
    console.warn("intake: honeypot filled", {
      email: String(form.get("email") ?? ""),
      files: form.getAll("files").length,
    });
    return NextResponse.json({ ok: true });
  }

  const email = String(form.get("email") ?? "").trim();
  const note = String(form.get("note") ?? "").trim();
  const cash = String(form.get("cash") ?? "").trim();
  const question = String(form.get("question") ?? "margin").trim();
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

  const problems = validate({
    email,
    files: files.map((f) => ({ name: f.name, size: f.size })),
  });
  if (problems.length > 0) return problem(422, problems);

  if (!RESEND_KEY) {
    return problem(503, [
      `Our intake is not connected on this deployment. Email your file to ${seller.email} and it will be read the same way.`,
    ]);
  }

  const attachments = await Promise.all(
    files.slice(0, MAX_FILES).map(async (file) => ({
      filename: file.name,
      content: Buffer.from(await file.arrayBuffer()).toString("base64"),
    })),
  );

  const body = {
    from: `MarginGraph intake <${FROM}>`,
    to: [seller.email],
    reply_to: email,
    subject: `Intake (${question}): ${files.map((f) => f.name).join(", ")}`,
    text: [
      `Question: ${question}`,
      `From: ${email}`,
      `Files: ${files.map((f) => `${f.name} (${f.size} bytes)`).join(", ")}`,
      cash ? `Bank balance today: ${cash}` : "No bank balance given, so no runway.",
      note ? `\nWhat they said:\n${note}` : "\nNo note.",
      `\nRun: npm run intake "<the attached file>"`,
    ].join("\n"),
    attachments,
  };

  const sent = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!sent.ok) {
    // Never surface the provider's error to the sender. It says nothing they
    // can act on, and it names infrastructure that is none of their business.
    console.error("intake: resend rejected the send", sent.status, await sent.text());
    return problem(502, [
      `We could not take that upload, and it is our fault rather than your file. ` +
        `Send it to ${seller.email} and it gets read exactly the same way, usually the same day.`,
    ]);
  }

  // A receipt to the sender, which is also the only test of the address they
  // typed. Without it a single typo is a total silent loss: they saw "it
  // arrived", they wait a day, they conclude we ignored them, and the reply-to
  // on our copy is dead so we never find out either.
  //
  // Deliberately not awaited into the response path beyond its own failure:
  // the file is already safely in our mailbox, so a confirmation that does not
  // send is a smaller problem than telling somebody their upload failed when
  // it did not.
  const receipt = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: `MarginGraph <${FROM}>`,
      to: [email],
      reply_to: seller.email,
      subject: "We have your figures",
      text: [
        `We received ${files.map((f) => f.name).join(", ")}.`,
        ``,
        `You get the findings back at this address within a few hours and usually much sooner:`,
        `the total we found, how many findings there are, and what each one is about. That part`,
        `is free. If it comes to less than €90 there is nothing to pay and we say so.`,
        ``,
        `Your file is not stored anywhere. It sits in one mailbox and is deleted within thirty`,
        `days, sooner if you ask. https://margingraph.com/privacy`,
        ``,
        `If this was not you, ignore this message and nothing happens.`,
        ``,
        `Stefan Wobben`,
        seller.email,
      ].join("\n"),
    }),
  }).catch(() => undefined);

  if (!receipt || !receipt.ok) {
    console.error("intake: could not send the receipt to", email, receipt?.status);
    return NextResponse.json({ ok: true, receipt: false });
  }

  return NextResponse.json({ ok: true, receipt: true });
}
