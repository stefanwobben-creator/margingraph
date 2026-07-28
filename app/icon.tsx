import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * The mark, as the browser-tab icon.
 *
 * Drawn with divs rather than the SVG component: ImageResponse renders a
 * subset of CSS and does not support external components or CSS variables.
 * The proportions match components/brand/logo-mark.tsx — if one changes, so
 * must the other.
 */
export default function Icon() {
  const bars = [
    { height: 13, opacity: 0.35, colour: "#0b0f14" },
    { height: 20, opacity: 0.6, colour: "#0b0f14" },
    { height: 29, opacity: 1, colour: "#2f5fd0" },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 4,
          background: "#ffffff",
          paddingBottom: 1,
        }}
      >
        {bars.map((bar) => (
          <div
            key={bar.height}
            style={{
              width: 6,
              height: bar.height,
              borderRadius: 2,
              background: bar.colour,
              opacity: bar.opacity,
            }}
          />
        ))}
      </div>
    ),
    size,
  );
}
