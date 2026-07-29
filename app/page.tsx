import type { Metadata } from "next";

import { JsonLd } from "@/components/content/json-ld";
import { Comparison } from "@/components/sections/comparison";
import { FooterCta } from "@/components/sections/footer-cta";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { LatestDocs } from "@/components/sections/latest-guides";
import { PopularReports } from "@/components/sections/popular-reports";
import { organizationJsonLd, websiteJsonLd } from "@/lib/content/seo";

export const metadata: Metadata = {
  description:
    "Send your spreadsheet, financial report or annual accounts. We read the figures, run the analysis, and show you what we found before anything is for sale.",
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

      {/*
        The call to action comes before the reading list, not after it.
        Two sections of well-written guide and blog headlines used to sit
        between the visitor and the closing CTA, and they are good enough to
        win the click. For a nine euro decision that is an expensive place to
        be interesting.
      */}
      <Hero />
      <HowItWorks />
      <PopularReports />
      <Comparison />
      <FooterCta />
      <LatestDocs collection="guides" title="If you would rather work it out yourself" />
    </>
  );
}
