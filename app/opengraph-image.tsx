import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default social card, applied to every page that does not set its own
 * `image` in frontmatter. Without it, links shared to Slack, LinkedIn or X
 * render as a bare grey box — which is most of a site's social surface area.
 *
 * Rendered once at build time, not per page.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 7 }}>
            <div style={{ width: 11, height: 24, borderRadius: 4, background: "#0b0f14", opacity: 0.35 }} />
            <div style={{ width: 11, height: 36, borderRadius: 4, background: "#0b0f14", opacity: 0.6 }} />
            <div style={{ width: 11, height: 52, borderRadius: 4, background: "#2f5fd0" }} />
          </div>
          <div style={{ display: "flex", fontSize: 34, color: "#0b0f14" }}>
            {site.name}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 68,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "#111111",
            maxWidth: 900,
          }}
        >
          {site.tagline}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#6b6b6b" }}>
          {site.url.replace(/^https?:\/\//, "")}
        </div>
      </div>
    ),
    size,
  );
}
