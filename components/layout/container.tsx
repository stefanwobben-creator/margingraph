import { cn } from "@/lib/utils";

type ContainerProps = React.ComponentProps<"div"> & {
  /** `page` = 1200px shell, `prose` = ~700px reading measure. */
  width?: "page" | "prose";
};

/**
 * The only horizontal-rhythm primitive in the app.
 * Every full-width section should wrap its content in one of these.
 */
export function Container({
  className,
  width = "page",
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-6 sm:px-8",
        width === "page" ? "max-w-page" : "max-w-prose-page",
        className,
      )}
      {...props}
    />
  );
}
