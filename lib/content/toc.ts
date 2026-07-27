import GithubSlugger from "github-slugger";

import type { Heading } from "@/lib/content/types";

/**
 * Pulls H2 and H3 out of the raw MDX so the table of contents can be rendered
 * on the server without parsing the compiled output.
 *
 * The ids must match rehype-slug exactly or every anchor silently breaks. So
 * this uses github-slugger — the same implementation rehype-slug uses
 * internally — rather than a second regex that has to be kept in sync by hand.
 * A fresh slugger per document also reproduces its duplicate handling
 * ("overview", "overview-1", …).
 */

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
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];

  for (const line of withoutCode.split("\n")) {
    const match = /^(#{2,3})\s+(.*)$/.exec(line);
    if (!match) continue;
    const text = stripInline(match[2]);
    if (!text) continue;
    headings.push({
      id: slugger.slug(text),
      text,
      depth: match[1].length as 2 | 3,
    });
  }

  return headings;
}
