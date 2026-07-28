import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * The mark on a dark field, because iOS renders this against the home screen
 * wallpaper and a white tile disappears on a light background.
 */
export default function AppleIcon() {
  const bars = [
    { height: 62, opacity: 0.4, colour: "#ffffff" },
    { height: 94, opacity: 0.65, colour: "#ffffff" },
    { height: 136, opacity: 1, colour: "#6f97ea" },
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
          gap: 16,
          background: "#0b0f14",
          paddingBottom: 22,
        }}
      >
        {bars.map((bar) => (
          <div
            key={bar.height}
            style={{
              width: 26,
              height: bar.height,
              borderRadius: 9,
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
