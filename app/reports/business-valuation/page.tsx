import type { Metadata } from "next";

import { ReportAudience } from "@/components/report/report-audience";
import { ReportCta } from "@/components/report/report-cta";
import { ReportFaq } from "@/components/report/report-faq";
import { ReportHero } from "@/components/report/report-hero";
import { ReportInputs } from "@/components/report/report-inputs";
import { ReportMethod } from "@/components/report/report-method";
import { ReportOutput } from "@/components/report/report-output";
import { BusinessValuationPreview } from "@/components/reports/business-valuation-preview";
import { businessValuation as report } from "@/lib/report-pages/business-valuation";
import { site } from "@/lib/site";

const path = `/reports/${report.slug}`;

export const metadata: Metadata = {
  title: report.metaTitle,
  description: report.metaDescription,
  alternates: { canonical: path },
  openGraph: {
    type: "article",
    url: path,
    siteName: site.name,
    title: `${report.metaTitle} — ${site.name}`,
    description: report.metaDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${report.metaTitle} — ${site.name}`,
    description: report.metaDescription,
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: site.url,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: report.metaTitle,
      item: `${site.url}${path}`,
    },
  ],
};

export default function BusinessValuationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <ReportHero report={report} />
      <ReportAudience audience={report.audience} />
      <ReportInputs inputs={report.inputs} />
      <ReportOutput>
        <BusinessValuationPreview />
      </ReportOutput>
      <ReportMethod method={report.method} />
      <ReportFaq faq={report.faq} />
      <ReportCta report={report} />
    </>
  );
}
