import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Section, SectionHeader } from "@/components/layout/section";
import { seller } from "@/lib/site";

export const metadata: Metadata = {
  title: "Data processing agreement",
  description:
    "The GDPR processing agreement for files sent to MarginGraph: what we do with personal data in your figures, who else touches it, how long it stays, and what you can require of us.",
  alternates: { canonical: "/dpa" },
};

const VERSION = "1.0";
const EFFECTIVE = "29 July 2026";

/**
 * The processing agreement, published rather than emailed on request.
 *
 * Article 28 GDPR requires the terms to be in writing and binding. Nothing
 * requires them to be a PDF exchanged over three days, and a page that is
 * already public and already applies removes the last procedural reason for a
 * cautious buyer to put the decision off until next week.
 *
 * Deliberately short. Every clause here is one we can actually honour with the
 * architecture as it is: no store, one mailbox, four named suppliers. A
 * processing agreement promising controls that do not exist is worse than
 * none, because it is the document someone will hold us to.
 */
export default function DpaPage() {
  return (
    <Section>
      <SectionHeader
        as="h1"
        eyebrow="Legal"
        title="Data processing agreement"
        description="If your figures contain personal data, this is the agreement that governs it. It applies automatically from the moment you send a file, so there is nothing to sign before you can start."
      />

      <Container className="mt-10 max-w-2xl space-y-8 text-sm leading-relaxed">
        <p className="text-muted-foreground">
          Version {VERSION}, in force from {EFFECTIVE}. This agreement forms part
          of the{" "}
          <Link href="/terms" className="underline underline-offset-4">
            terms
          </Link>{" "}
          and is the processing agreement referred to in Article 28(3) of the
          GDPR. If you need it signed on paper for your own file, email{" "}
          <a href={`mailto:${seller.email}`} className="underline underline-offset-4">
            {seller.email}
          </a>{" "}
          and you get a signed copy of this text.
        </p>

        <div>
          <h2 className="text-base font-semibold">1. Parties and roles</h2>
          <p className="mt-2 text-muted-foreground">
            You, the person or company sending the file, are the controller. We,{" "}
            {seller.legalName}, Chamber of Commerce {seller.kvk}, are the
            processor. We process personal data only on your instruction, and
            sending us a file is that instruction.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">2. What we process, and why</h2>
          <p className="mt-2 text-muted-foreground">
            <span className="text-foreground">Purpose:</span> to read your
            figures and produce your report. Nothing else.
          </p>
          <p className="mt-2 text-muted-foreground">
            <span className="text-foreground">Categories of data:</span> whatever
            is in the file you send. In a profit and loss account that is
            usually no personal data at all. It can include names, salaries or
            customer details where a payroll line or a customer list is present.
            Plus the email address you give us, so we can reply.
          </p>
          <p className="mt-2 text-muted-foreground">
            <span className="text-foreground">Data subjects:</span> your
            employees, your customers or your suppliers, depending on what your
            file contains.
          </p>
          <p className="mt-2 text-muted-foreground">
            <span className="text-foreground">Duration:</span> for as long as it
            takes to produce and deliver your report, and no longer than thirty
            days after that.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">3. Our obligations</h2>
          <ul className="mt-2 space-y-2 text-muted-foreground">
            <li>
              We process only on your documented instruction, including for any
              transfer outside the EEA, unless the law requires otherwise, in
              which case we tell you first unless that law forbids it.
            </li>
            <li>
              Everyone with access is bound to confidentiality. In practice that
              is one person.
            </li>
            <li>
              We do not use your data for our own purposes, we do not sell it,
              and we do not use it to train models.
            </li>
            <li>
              We help you, as far as we reasonably can, to answer requests from
              data subjects and to meet your own obligations under Articles 32
              to 36 of the GDPR.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold">4. Security</h2>
          <p className="mt-2 text-muted-foreground">
            Uploads are encrypted in transit over HTTPS. We operate no database
            and no file store: your file is held in memory only long enough to
            be attached to one email to our own mailbox, which is protected by
            a strong unique password and two-factor authentication, and it is
            deleted from there within the period above. Access is limited to
            the person who writes your report.
          </p>
          <p className="mt-2 text-muted-foreground">
            The design is the control. A store nobody built is a store nobody
            can leave open.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">5. Sub-processors</h2>
          <p className="mt-2 text-muted-foreground">
            You give general authorisation for the following, each bound by
            terms no less protective than these:
          </p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>
              <span className="text-foreground">Vercel</span> — hosting, and the
              function that receives your upload.
            </li>
            <li>
              <span className="text-foreground">Resend</span> — delivery of the
              single email carrying your file to us.
            </li>
            <li>
              <span className="text-foreground">Our email provider</span> — the
              mailbox that holds it.
            </li>
            <li>
              <span className="text-foreground">Mollie</span> — payment, if you
              buy the report. Your file never reaches them.
            </li>
          </ul>
          <p className="mt-3 text-muted-foreground">
            We tell you before adding or replacing a sub-processor, and you may
            object; if you do and we cannot resolve it, you may stop using the
            service and we delete what we hold.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">6. Breaches</h2>
          <p className="mt-2 text-muted-foreground">
            If personal data we hold for you is breached, we tell you without
            undue delay and in any case within 24 hours of becoming aware, with
            what we know and what we are doing about it, so that you can meet
            your own 72-hour deadline.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">7. Deletion and return</h2>
          <p className="mt-2 text-muted-foreground">
            Ask and we delete, at any time, without waiting for the thirty days.
            There is one place to delete it from, so this takes minutes rather
            than a project. On request we confirm in writing that it is done.
            Invoice records are kept for seven years because Dutch tax law
            requires it; they contain your email address and what you paid, not
            your file.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">8. Audit</h2>
          <p className="mt-2 text-muted-foreground">
            You may ask us to demonstrate compliance with this agreement, and we
            answer in writing. If that is not enough for your own regulator, an
            audit can be arranged once a year at your cost, at a reasonable time
            and without disrupting the service.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">9. Transfers</h2>
          <p className="mt-2 text-muted-foreground">
            Our suppliers are established in or operate under the EU framework,
            and where a transfer outside the EEA occurs it is covered by the
            European Commission&apos;s Standard Contractual Clauses through our
            agreements with them.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold">10. Law</h2>
          <p className="mt-2 text-muted-foreground">
            Dutch law applies, and disputes go to the competent court in the
            Netherlands. Where this agreement and the{" "}
            <Link href="/terms" className="underline underline-offset-4">
              terms
            </Link>{" "}
            disagree about personal data, this agreement wins.
          </p>
        </div>
      </Container>
    </Section>
  );
}
