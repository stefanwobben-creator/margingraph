import type { JsonLd as JsonLdSchema } from "@/lib/content/seo";

/**
 * The single place structured data is written into the document.
 *
 * Content is always author-controlled and serialised through JSON.stringify,
 * so `dangerouslySetInnerHTML` here carries no injection risk — but keeping it
 * in one file means that claim only has to be true in one file.
 */
export function JsonLd({ schemas }: { schemas: (JsonLdSchema | null)[] }) {
  const valid = schemas.filter(Boolean) as JsonLdSchema[];
  if (!valid.length) return null;

  return (
    <>
      {valid.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            // Closing tags inside a string would end the script element early.
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
