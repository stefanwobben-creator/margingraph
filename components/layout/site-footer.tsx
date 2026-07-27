import { Container } from "@/components/layout/container";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/80 py-10">
      <Container className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
        <p className="text-balance">{site.tagline}</p>
      </Container>
    </footer>
  );
}
