import type { Heading } from "@/lib/content/types";

/**
 * Pulls H2 and H3 out of the raw MDX so the table of contents can be rendered
 * on the server without parsing the compiled output.
 *
 * The ids must match what rehype-slug generates, or the anchors break. Both
 * use GitHub's algorithm: lowercase, strip punctuation, spaces to hyphens.
 */
export function slugifyHeading(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
}

/** Strips inline markdown so the TOC shows plain text. */
function stripInline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .trim();
}

export function extractHeadings(body: string): Heading[] {
  // Fenced code blocks can contain lines starting with #.
  const withoutCode = body.replace(/```[\s\S]*?```/g, "");
  const headings: Heading[] = [];

  for (const line of withoutCode.split("\n")) {
    const match = /^(#{2,3})\s+(.*)$/.exec(line);
    if (!match) continue;
    const text = stripInline(match[2]);
    if (!text) continue;
    headings.push({
      id: slugifyHeading(text),
      text,
      depth: match[1].length as 2 | 3,
    });
  }

  return headings;
}
