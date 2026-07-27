import { Section, SectionHeader } from "@/components/layout/section";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const rows = [
  {
    dimension: "Scope",
    chatgpt: "General purpose",
    margingraph: "Purpose-built for one decision",
  },
  {
    dimension: "Getting started",
    chatgpt: "You write the prompt",
    margingraph: "The prompt is already written and tested",
  },
  {
    dimension: "Method",
    chatgpt: "Depends on how you ask",
    margingraph: "The same methodology every time",
  },
  {
    dimension: "Output",
    chatgpt: "Prose, different on each run",
    margingraph: "A structured report, ready to decide on",
  },
];

export function Comparison() {
  return (
    <Section bordered>
      <SectionHeader
        eyebrow="Comparison"
        title="Why not ChatGPT?"
        description="You can do a lot of this in a general-purpose assistant. The difference is not intelligence — it is repeatability."
      />

      <div className="mt-12 overflow-x-auto">
        <Table className="min-w-[36rem]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[9rem]">
                <span className="sr-only">Dimension</span>
              </TableHead>
              <TableHead className="text-foreground">ChatGPT</TableHead>
              <TableHead className="text-foreground">MarginGraph</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.dimension} className="hover:bg-transparent">
                <TableCell className="align-top text-muted-foreground">
                  {row.dimension}
                </TableCell>
                <TableCell className="align-top text-muted-foreground">
                  {row.chatgpt}
                </TableCell>
                <TableCell className="align-top font-medium">
                  {row.margingraph}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Section>
  );
}
