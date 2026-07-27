import { Section, SectionHeader } from "@/components/layout/section";
import { ReportCard } from "@/components/report-card";
import { reports } from "@/lib/reports";

export function PopularReports() {
  return (
    <Section id="reports" bordered>
      <SectionHeader
        eyebrow="Reports"
        title="Popular reports"
        description="One question, one report, one price. Upload the file you already have and get an answer you can act on."
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <ReportCard key={report.slug} report={report} />
        ))}
      </div>
    </Section>
  );
}
