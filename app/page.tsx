import type { Metadata } from "next";

import { JsonLd } from "@/components/content/json-ld";
import { Comparison } from "@/components/sections/comparison";
import { FooterCta } from "@/components/sections/footer-cta";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { LatestGuides } from "@/components/sections/latest-guides";
import { PopularReports } from "@/components/sections/popular-reports";
import { organizationJsonLd, websiteJsonLd } from "@/lib/content/seo";

export const metadata: Metadata = {
  description:
    "Upload your spreadsheet, financial report or document. MarginGraph analyzes your data and generates a decision report in minutes.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      {/*
        Site-wide identity, emitted here only. Google's guidance places
        Organization and the site-name WebSite markup on the most
        representative page; every other page references these by @id.
      */}
      <JsonLd schemas={[organizationJsonLd(), websiteJsonLd()]} />

      <Hero />
      <PopularReports />
      <HowItWorks />
      <Comparison />
      <LatestGuides />
      <FooterCta />
    </>
  );
}
