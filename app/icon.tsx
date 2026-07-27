import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Replaces the Vercel triangle that create-next-app ships. Generated rather
 * than committed as a binary so the mark stays editable in one place.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111111",
          color: "#ffffff",
          fontSize: 21,
          fontWeight: 700,
          letterSpacing: "-0.05em",
          borderRadius: 6,
        }}
      >
        M
      </div>
    ),
    size,
  );
}
