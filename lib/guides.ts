/**
 * Decision guides — the written layer that sits alongside the reports.
 *
 * Static for now. This is the shape `/content/articles` will produce, so the
 * fields match the frontmatter contract in content/README.md.
 */
export type Guide = {
  slug: string;
  title: string;
  summary: string;
  /** ISO date. Rendered with a fixed locale so server and client agree. */
  published: string;
  readingMinutes: number;
};

export const guides: Guide[] = [
  {
    slug: "reading-your-own-runway",
    title: "Reading your own runway",
    summary:
      "Cash in the bank divided by last month's burn is the number most founders use, and it is usually wrong. What to subtract before you divide.",
    published: "2026-07-14",
    readingMinutes: 6,
  },
  {
    slug: "gross-margin-per-product-is-usually-wrong",
    title: "Why margin per product is usually wrong",
    summary:
      "Freight, returns, storage and payment terms rarely reach the product level. Four costs that change the ranking once you allocate them.",
    published: "2026-07-02",
    readingMinutes: 8,
  },
  {
    slug: "dividend-or-salary-the-actual-calculation",
    title: "Dividend or salary: the actual calculation",
    summary:
      "The rule of thumb is a range, not an answer. The full calculation, the thresholds that move it, and where the advice stops applying.",
    published: "2026-06-19",
    readingMinutes: 7,
  },
];
