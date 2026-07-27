import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

type SectionProps = React.ComponentProps<"section"> & {
  /** Renders a hairline above the section. */
  bordered?: boolean;
};

/** Vertical rhythm primitive. Every homepage section uses this. */
export function Section({
  className,
  bordered = false,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        "scroll-mt-16 py-20 sm:py-28",
        bordered && "border-t border-border",
        className,
      )}
      {...props}
    >
      <Container>{children}</Container>
    </section>
  );
}

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <header className={cn("max-w-prose-page", className)}>
      {eyebrow ? (
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className={cn("text-title", eyebrow && "mt-3")}>{title}</h2>
      {description ? (
        <p className="mt-4 text-lead text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}
