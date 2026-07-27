"use client";

/**
 * Catches failures in the root layout itself, which is the one case where the
 * normal error boundary cannot render. It must supply its own html and body,
 * and cannot rely on the design system loading — hence the inline styles.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          background: "#fff",
          color: "#111",
        }}
      >
        <main style={{ maxWidth: 480, padding: 24 }}>
          <h1 style={{ fontSize: 28, letterSpacing: "-0.02em", margin: 0 }}>
            Something broke
          </h1>
          <p style={{ color: "#6b6b6b", lineHeight: 1.7 }}>
            The page could not be loaded.
            {error.digest ? ` Reference: ${error.digest}` : ""}
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 8,
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: "#111",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
