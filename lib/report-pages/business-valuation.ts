import type { ReportPage } from "@/lib/report-page";

export const businessValuation: ReportPage = {
  slug: "business-valuation",
  question: "What is my business worth?",
  intro:
    "Upload your financials and receive an AI-generated valuation report with assumptions, risks and a valuation range.",
  price: 9,
  metaTitle: "Business Valuation Report",
  metaDescription:
    "Upload your P&L and balance sheet and get a valuation range across three standard methods, with every assumption, risk and next step written out. €9.",

  audience: [
    "Founders preparing an exit, who need a number before they start the conversation",
    "Investors sizing an opportunity without waiting on a formal report",
    "Anyone in acquisition talks who wants an independent second view on the asking price",
    "Owners planning succession, where the transfer price has to be defensible",
    "Shareholders settling a buy-out between themselves",
  ],

  inputs: [
    {
      title: "Profit & Loss",
      description:
        "The last full financial year, and the current year to date if you have it. An export from your accounting software is fine.",
      formats: "XLSX · XLS · CSV · PDF",
    },
    {
      title: "Balance Sheet",
      description:
        "Assets, liabilities and equity at the most recent closing date. Needed for the asset-based method and the debt adjustment.",
      formats: "XLSX · XLS · CSV · PDF",
    },
    {
      title: "Revenue history",
      description:
        "Three years if you have them, one if you do not. More history narrows the range; less history widens it.",
      formats: "XLSX · CSV",
    },
    {
      title: "Your own assumptions",
      description:
        "Anything you already know that the figures do not show: a customer leaving, a price increase, an owner salary that is not at market rate.",
      formats: "Plain text",
      optional: true,
    },
  ],

  method: [
    {
      title: "Reads the data",
      body: "Your file is parsed as it is — no template to fill in first. Line items are matched to a standard chart of accounts, and anything that cannot be matched is listed rather than silently dropped.",
    },
    {
      title: "Normalizes the figures",
      body: "One-off costs, owner compensation above or below market rate, non-operating assets and intercompany items are separated out, so the earnings being valued are the ones a buyer would actually inherit.",
    },
    {
      title: "Applies three valuation methods",
      body: "An earnings multiple benchmarked to your sector and size, a discounted cash flow, and an asset-based floor. Each produces its own number.",
    },
    {
      title: "Compares the assumptions",
      body: "Where the three methods disagree, the report says which assumption causes the gap — growth rate, discount rate, working capital — instead of averaging the difference away.",
    },
    {
      title: "Explains the reasoning",
      body: "Every figure traces back to a line in your file or to a stated assumption. If you disagree with an assumption, you can see exactly which number it moves.",
    },
  ],

  faq: [
    {
      question: "Is my data stored?",
      answer:
        "Your file is used to produce your report and then deleted. It is never used to train a model, and it is never shared with other users or third parties beyond the processing needed to generate the report.",
    },
    {
      question: "How accurate is it?",
      answer:
        "It produces a defensible range, not a precise number — and no valuation method produces a precise number. Accuracy depends almost entirely on the quality of what you upload. Every assumption is stated, so you can judge the result rather than trust it.",
    },
    {
      question: "Can I upload Excel?",
      answer:
        "Yes. XLSX, XLS and CSV, including raw exports from Exact, Moneybird, e-Boekhouden, Xero and QuickBooks. You do not need to clean the file or fit it to a template first.",
    },
    {
      question: "Can I upload PDF?",
      answer:
        "Yes, for text-based PDFs such as annual accounts produced by your accountant. Scanned documents and photographs of paper are unreliable — if figures cannot be read with confidence, the report says so instead of guessing.",
    },
    {
      question: "What valuation methods are used?",
      answer:
        "Three: an earnings multiple benchmarked to sector and company size, a discounted cash flow, and an asset-based valuation as a floor. All three are shown separately, with the reason for any difference between them.",
    },
    {
      question: "How long does it take?",
      answer:
        "Minutes, not days. The time is spent reading and normalizing your figures, not waiting in a queue.",
    },
    {
      question: "What if my figures are incomplete?",
      answer:
        "The report states what is missing and what that does to the range, rather than filling the gap with an assumption you did not make. A missing balance sheet widens the range; it does not stop the report.",
    },
    {
      question: "Can I use this in an actual transaction?",
      answer:
        "As a starting point and a sanity check, yes — it tells you whether an asking price is in a reasonable range and which assumptions to argue about. It is not a formal valuation report and does not replace one where a tax authority, a court or a lender requires one.",
    },
  ],

  cta: "Generate my valuation report",
};
