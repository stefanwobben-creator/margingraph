import type { MetadataRoute } from "next";

import { isProduction, site } from "@/lib/site";

/**
 * Crawler policy.
 *
 * Generated rather than served from /public for three reasons:
 *
 * 1. The domain lives in `lib/site.ts` and nowhere else. A hardcoded sitemap
 *    URL in a text file is a second source of truth for the same fact.
 * 2. Non-production deployments must not invite indexing. Vercel adds its own
 *    noindex header to previews, but relying on platform behaviour for
 *    something this consequential is a dependency, not a design.
 * 3. The bot list below is the part that actually changes over time, and
 *    keeping it as a typed array makes adding one a single line.
 */

/**
 * AI crawlers, split by what they actually do. The distinction matters:
 * training crawlers decide whether the content informs a model, search
 * crawlers decide whether MarginGraph gets *cited* — which is the whole point
 * of publishing a reference site.
 *
 * Everything is allowed today. If that changes, it changes here, and the two
 * groups can be treated differently without touching anything else.
 */
const AI_TRAINING_CRAWLERS = [
  "GPTBot", // OpenAI, model training
  "ClaudeBot", // Anthropic, model training
  "Google-Extended", // Gemini training and AI Overviews grounding
  "Applebot-Extended", // Apple Intelligence training
  "CCBot", // Common Crawl, feeds many downstream models
];

const AI_SEARCH_CRAWLERS = [
  "OAI-SearchBot", // powers ChatGPT search results and citations
  "ChatGPT-User", // live fetch when a user asks about a page
  "Claude-SearchBot", // Claude search index
  "Claude-User", // live fetch on user request
  "PerplexityBot", // Perplexity index
  "Perplexity-User", // live fetch on user request
];

export default function robots(): MetadataRoute.Robots {
  // A preview or development deployment must never compete with production
  // for the same content.
  if (!isProduction) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...[...AI_SEARCH_CRAWLERS, ...AI_TRAINING_CRAWLERS].map((userAgent) => ({
        userAgent,
        allow: "/",
      })),
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
