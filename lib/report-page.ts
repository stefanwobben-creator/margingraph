/**
 * The shape of a report detail page.
 *
 * This is the template contract: every report page is this data plus one
 * bespoke "what you receive" preview component. Adding a report should mean
 * writing one data file and one preview — never a new page layout.
 */
export type ReportPage = {
  slug: string;
  /** H1. Phrased as the question the buyer is actually asking. */
  question: string;
  /** One paragraph under the H1. */
  intro: string;
  price: number;
  /** Metadata <title>; keep under ~60 characters. */
  metaTitle: string;
  metaDescription: string;

  audience: string[];

  inputs: {
    title: string;
    description: string;
    /** File formats accepted for this input. */
    formats: string;
    optional?: boolean;
  }[];

  method: {
    title: string;
    body: string;
  }[];

  faq: {
    question: string;
    answer: string;
  }[];

  cta: string;
};
