"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { MINIMUM_WORTH } from "@/lib/reports/findings";
import {
  ACCEPT_ATTRIBUTE,
  MAX_BYTES_TOTAL,
  megabytes,
  validate,
} from "@/lib/upload/limits";

/**
 * The upload.
 *
 * It replaced "email your file to this address", which was honest and cost us
 * everybody who was not already convinced. Writing an email is a decision;
 * choosing a file is a reflex.
 *
 * The same `validate` runs here and in the route handler. Not because the
 * browser check is security, it is not, but because a sender who learns their
 * file is too big after a thirty second upload has learned it too late.
 */

/** The four things a file can be sent for. They need different files. */
const QUESTIONS = [
  { value: "margin", label: "Where is my margin leaking?", needs: "Profit and loss for this period, plus the budget or the same period last year." },
  { value: "runway", label: "How long does the money last?", needs: "The same profit and loss account, plus what is in the bank today." },
  { value: "valuation", label: "What is my business worth?", needs: "Annual accounts for the last three years including balance sheets." },
  { value: "contract", label: "Is this contract reasonable?", needs: "The quote or agreement itself, and roughly what volume you do." },
] as const;

export function UploadForm({ email: address }: { email: string }) {
  const [question, setQuestion] = useState<string>(QUESTIONS[0].value);
  const [files, setFiles] = useState<File[]>([]);
  const [problems, setProblems] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [percent, setPercent] = useState(0);
  const [done, setDone] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const alert = useRef<HTMLDivElement>(null);

  const total = files.reduce((sum, f) => sum + f.size, 0);
  const needs = QUESTIONS.find((q) => q.value === question)?.needs;

  // Errors render above the submit button, so on a phone they appear off the
  // top of the screen, above the thumb that just pressed send. Moving focus is
  // the only thing that reliably brings them into view and announces them.
  useEffect(() => {
    if (problems.length > 0) {
      alert.current?.focus();
      alert.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [problems]);

  // A 3.5 MB upload on mobile data takes long enough that people background
  // the tab, which kills the request and loses the file with no trace at
  // either end.
  useEffect(() => {
    if (!sending) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [sending]);

  function reset() {
    setDone(false);
    setFiles([]);
    setProblems([]);
    setPercent(0);
    if (input.current) input.current.value = "";
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");

    const found = validate({
      email,
      files: files.map((f) => ({ name: f.name, size: f.size })),
    });
    if (found.length > 0) {
      trackEvent("intake_rejected", { reason: found[0].slice(0, 90) });
      setProblems(found);
      return;
    }

    setProblems([]);
    setSending(true);
    setPercent(0);
    form.delete("files");
    for (const file of files) form.append("files", file);

    // XMLHttpRequest rather than fetch, for the one thing fetch cannot do:
    // report upload progress. A static "Sending…" for forty seconds on a phone
    // reads as frozen, and a frozen page gets closed.
    const request = new XMLHttpRequest();
    request.open("POST", "/api/intake");
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) setPercent(Math.round((100 * event.loaded) / event.total));
    };
    request.onload = () => {
      setSending(false);
      let result: { ok?: boolean; problems?: string[] } = {};
      try {
        result = JSON.parse(request.responseText) as typeof result;
      } catch {
        /* an empty or non-JSON body is handled by the status check below */
      }
      if (request.status >= 200 && request.status < 300 && result.ok) {
        trackEvent("intake_submitted", { files: files.length });
        setDone(true);
        return;
      }
      trackEvent("intake_failed", { status: request.status });
      setProblems(result.problems ?? ["Something went wrong. Try again in a minute."]);
    };
    request.onerror = () => {
      setSending(false);
      trackEvent("intake_failed", { status: 0 });
      setProblems([
        `We could not reach our own server. Send the file to ${address} and we will read it the same way.`,
      ]);
    };
    request.send(form);
  }

  if (done) {
    return (
      <div role="status" className="rounded-lg border border-border p-6">
        <h3 className="text-base font-semibold">It arrived.</h3>
        <p className="mt-3 text-sm text-muted-foreground">
          A confirmation is on its way to the address you gave, so you can see
          straight away that we have the right one. The findings follow within a
          few hours and usually much sooner: the total we found, how many
          findings there are, and what each one is about. If we found less than
          €{MINIMUM_WORTH} there is nothing to pay and we say so.
        </p>
        <Button variant="outline" className="mt-5" onClick={reset}>
          Send another file
        </Button>
      </div>
    );
  }

  return (
    // noValidate on purpose. The browser stops at the first invalid field, and
    // `validate` was written to report every problem at once precisely because
    // a form that objects one item at a time gets abandoned on the third try.
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <fieldset>
        <legend className="block text-sm font-medium">What do you want to know?</legend>
        <div className="mt-2 grid gap-2">
          {QUESTIONS.map((q) => (
            <label
              key={q.value}
              className="flex cursor-pointer items-start gap-3 rounded-md border border-border px-3 py-2.5 text-sm has-checked:border-foreground/40 has-checked:bg-muted/50"
            >
              <input
                type="radio"
                name="question"
                value={q.value}
                checked={question === q.value}
                onChange={() => setQuestion(q.value)}
                className="mt-0.5"
              />
              <span>{q.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/*
        The file first, then the address.
        Choosing a file is a reflex and typing an email is a decision, so the
        cheap action goes first: someone who has already picked their P&L is
        answering "where do I send the answer", not "do I want to be on a list".
      */}
      <div>
        <label htmlFor="files" className="block text-sm font-medium">
          Your figures
        </label>
        <input
          ref={input}
          id="files"
          name="files"
          type="file"
          multiple
          accept={ACCEPT_ATTRIBUTE}
          onChange={(event) => {
            setFiles(Array.from(event.target.files ?? []));
            setProblems([]);
            trackEvent("intake_file_chosen", { files: event.target.files?.length ?? 0 });
          }}
          className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-base file:mr-3 file:rounded file:border-0 file:bg-muted file:px-4 file:py-2.5 file:text-sm sm:text-sm"
        />
        <p className="mt-2 text-xs break-words text-muted-foreground">
          {needs} Excel, CSV or a text-based PDF, up to {megabytes(MAX_BYTES_TOTAL)} in one go.
        </p>
        {files.length > 0 ? (
          <p className="mt-1.5 text-xs break-words text-foreground">
            Chosen: {files.map((f) => f.name).join(", ")} ({megabytes(total)})
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Where should the findings go?
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@yourcompany.com"
          className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-base sm:text-sm"
        />
      </div>

      {/*
        One number, a whole extra answer.

        Runway is the question every owner actually loses sleep over and the one
        thing a profit and loss account cannot answer, because it needs cash and
        a P&L has none in it. Optional, because a required field here would cost
        more submissions than the answer is worth.
      */}
      <div>
        <label htmlFor="cash" className="block text-sm font-medium">
          What is in the bank today?{" "}
          <span className="text-muted-foreground">(optional)</span>
        </label>
        <div className="relative mt-2">
          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
            €
          </span>
          <input
            id="cash"
            name="cash"
            type="text"
            inputMode="decimal"
            placeholder="84000"
            className="w-full rounded-md border border-border bg-background py-2 pr-3 pl-7 text-base sm:text-sm"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Add this and we can tell you how long the money lasts at the rate your
          own figures are running. There is no cash in a profit and loss
          account, which is why your accounts can never answer it.
        </p>
      </div>

      <div>
        <label htmlFor="note" className="block text-sm font-medium">
          Anything we should know? <span className="text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          placeholder="Which period this is, what you are worried about, anything odd in the file."
          className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-base sm:text-sm"
        />
      </div>

      {/*
        Not a puzzle. A bot fills this in and a person never sees it.

        Named `fax_confirm` rather than `company`, because a password manager
        will happily fill a field called company, and a real person whose
        browser did that would be told their file arrived and then never hear
        from us again. Positioned off-screen rather than display:none, which is
        itself a signal some bots check for.
      */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label htmlFor="fax_confirm">Fax</label>
        <input id="fax_confirm" name="fax_confirm" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {problems.length > 0 ? (
        <div
          ref={alert}
          role="alert"
          tabIndex={-1}
          className="rounded-md border border-red-300 p-4 text-sm text-red-700"
        >
          <ul className="space-y-1.5">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <a
            href={`mailto:${address}?subject=${encodeURIComponent("My figures")}`}
            className="mt-3 inline-block underline underline-offset-4"
          >
            Or send it straight to {address}
          </a>
        </div>
      ) : null}

      <div className="space-y-3">
        <Button type="submit" size="lg" disabled={sending} className="w-full sm:w-auto">
          {sending ? `Sending… ${percent}%` : "Send my figures"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Free. Nothing is for sale until you have seen what we found. Read by
          Stefan Wobben in person, stored nowhere, deleted within thirty days.{" "}
          <a href="/about" className="underline underline-offset-4">
            Who that is
          </a>
          .
        </p>
        <p className="text-xs text-muted-foreground">
          If there are rows you would rather we did not see, salaries or your own
          pay, delete them first. We only need the cost lines and the totals, and
          a report is no worse without the names.
        </p>
      </div>
    </form>
  );
}
