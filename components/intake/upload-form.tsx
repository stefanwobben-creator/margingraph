"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
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
export function UploadForm({ email: address }: { email: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [problems, setProblems] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const total = files.reduce((sum, f) => sum + f.size, 0);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");

    const found = validate({
      email,
      files: files.map((f) => ({ name: f.name, size: f.size })),
    });
    if (found.length > 0) {
      setProblems(found);
      return;
    }

    setProblems([]);
    setSending(true);
    form.delete("files");
    for (const file of files) form.append("files", file);

    try {
      const response = await fetch("/api/intake", { method: "POST", body: form });
      const result = (await response.json()) as { ok: boolean; problems?: string[] };
      if (!response.ok || !result.ok) {
        setProblems(result.problems ?? ["Something went wrong. Try again in a minute."]);
        return;
      }
      trackEvent("intake_submitted", { files: files.length });
      setDone(true);
    } catch {
      setProblems([
        `We could not reach our own server. Email the file to ${address} and we will read it the same way.`,
      ]);
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div role="status" className="rounded-lg border border-border p-6">
        <h3 className="text-base font-semibold">It arrived.</h3>
        <p className="mt-3 text-sm text-muted-foreground">
          You get a reply at the address you gave, within a few hours and
          usually much sooner: the total we found, how many findings there are,
          and what each one is about. If we found less than €90 there is nothing
          to pay and we say so.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Where should the findings go?
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@yourcompany.com"
          className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

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
          }}
          className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Excel, CSV or a text-based PDF. Up to {megabytes(MAX_BYTES_TOTAL)} in
          one go.
          {files.length > 0 ? ` Selected: ${files.length}, ${megabytes(total)}.` : ""}
        </p>
      </div>

      {/*
        One number, a whole extra answer.

        Runway is the question every owner actually loses sleep over and the
        one thing a profit and loss account cannot answer, because it needs
        cash and a P&L has none in it. Rather than send them away for a balance
        sheet, we ask for the single figure they can read off their banking app
        in four seconds. Optional, because a required field here would cost us
        more submissions than the answer is worth.
      */}
      <div>
        <label htmlFor="cash" className="block text-sm font-medium">
          What is in the bank today?{" "}
          <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          id="cash"
          name="cash"
          type="text"
          inputMode="numeric"
          placeholder="e.g. 84000"
          className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Add this and we can also tell you how long the money lasts at the rate
          your own figures are running. Your accounts cannot answer that, because
          there is no cash in a profit and loss account.
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
          className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      {/* Not a puzzle. A bot fills this in and a person never sees it. */}
      <div aria-hidden className="hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {problems.length > 0 ? (
        <ul role="alert" className="space-y-1.5 rounded-md border border-red-300 p-4 text-sm text-red-700">
          {problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={sending}>
          {sending ? "Sending…" : "Send my figures"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Free. Nothing is for sale until you have seen what we found.
        </p>
      </div>
    </form>
  );
}
