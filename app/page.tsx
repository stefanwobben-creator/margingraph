import type { Metadata } from "next";

import { Comparison } from "@/components/sections/comparison";
import { FooterCta } from "@/components/sections/footer-cta";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { LatestGuides } from "@/components/sections/latest-guides";
import { PopularReports } from "@/components/sections/popular-reports";

export const metadata: Metadata = {
  description:
    "Upload your spreadsheet, financial report or document. MarginGraph analyzes your data and generates a decision report in minutes.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Hero />
      <PopularReports />
      <HowItWorks />
      <Comparison />
      <LatestGuides />
      <FooterCta />
    </>
  );
}
