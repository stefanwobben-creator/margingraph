import { AlertTriangle, CheckCircle2, Info as InfoIcon, Lightbulb } from "lucide-react";

import { cn } from "@/lib/utils";

const variants = {
  note: {
    icon: Lightbulb,
    className: "border-border bg-muted/40",
    iconClass: "text-muted-foreground",
  },
  info: {
    icon: InfoIcon,
    className: "border-accent-brand/25 bg-accent-brand-subtle",
    iconClass: "text-accent-brand",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-amber-300/60 bg-amber-50",
    iconClass: "text-amber-700",
  },
  success: {
    icon: CheckCircle2,
    className: "border-emerald-300/60 bg-emerald-50",
    iconClass: "text-emerald-700",
  },
} as const;

export type CalloutVariant = keyof typeof variants;

export function Callout({
  variant = "note",
  title,
  children,
}: {
  variant?: CalloutVariant;
  title?: string;
  children: React.ReactNode;
}) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <aside
      className={cn(
        "my-8 flex gap-4 rounded-lg border p-5 text-[0.95rem]",
        config.className,
      )}
    >
      <Icon aria-hidden className={cn("mt-0.5 size-5 shrink-0", config.iconClass)} />
      <div className="min-w-0 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        {title ? <p className="mb-1.5 font-medium">{title}</p> : null}
        {children}
      </div>
    </aside>
  );
}

/** Convenience wrappers so content reads as `<Info>` rather than `<Callout variant="info">`. */
export function Info(props: { title?: string; children: React.ReactNode }) {
  return <Callout variant="info" {...props} />;
}

export function Warning(props: { title?: string; children: React.ReactNode }) {
  return <Callout variant="warning" {...props} />;
}

export function Success(props: { title?: string; children: React.ReactNode }) {
  return <Callout variant="success" {...props} />;
}
