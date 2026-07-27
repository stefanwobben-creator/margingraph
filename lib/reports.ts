/**
 * The report catalogue.
 *
 * Static for now — this is the data shape that `/content/decisions` will
 * eventually produce, so keep the fields stable.
 */
export type Report = {
  slug: string;
  title: string;
  /** One sentence. What the report answers, not how it works. */
  description: string;
  /** Price in whole euros. */
  price: number;
  /**
   * True once /reports/{slug} exists. Cards for reports without a page fall
   * back to an anchor so the homepage never links to a 404.
   */
  hasPage?: boolean;
};

export const reports: Report[] = [
  {
    slug: "business-valuation",
    title: "Business Valuation",
    description:
      "What your company is worth across three standard methods, with the assumptions behind every number written out.",
    price: 9,
    hasPage: true,
  },
  {
    slug: "cash-runway",
    title: "Cash Runway",
    description:
      "How many months of cash are left, the month it runs out, and the three levers that move that date furthest.",
    price: 9,
  },
  {
    slug: "hidden-profit-leaks",
    title: "Hidden Profit Leaks",
    description:
      "Where margin disappears: dead stock, overdue invoices, discounts that cost more than they win, and costs nobody decided on.",
    price: 9,
  },
  {
    slug: "customer-profitability",
    title: "Customer Profitability",
    description:
      "Which customers still earn their keep once discounts, payment terms and service time are counted — and which ones you subsidise.",
    price: 9,
  },
  {
    slug: "product-profitability",
    title: "Product Profitability",
    description:
      "Margin per product after real cost price, ranked, including the items that tie up working capital without returning it.",
    price: 9,
  },
  {
    slug: "dividend-vs-salary",
    title: "Dividend vs Salary",
    description:
      "The split between salary and dividend for this financial year, calculated line by line so you can check every step.",
    price: 9,
  },
];
