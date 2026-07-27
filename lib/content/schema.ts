import type { Frontmatter } from "@/lib/content/types";

/**
 * Frontmatter validation, hand-rolled to avoid a runtime dependency.
 *
 * The rule: a bad content file fails the build loudly rather than shipping a
 * broken page. At 500 articles you will not notice a silently missing
 * description; you will notice a red build.
 */
export class ContentError extends Error {
  constructor(file: string, message: string) {
    super(`Invalid frontmatter in ${file}: ${message}`);
    this.name = "ContentError";
  }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function requireString(
  value: unknown,
  field: string,
  file: string,
  { maxLength }: { maxLength?: number } = {},
): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ContentError(file, `"${field}" is required and must be a string`);
  }
  if (maxLength && value.length > maxLength) {
    throw new ContentError(
      file,
      `"${field}" is ${value.length} characters; keep it under ${maxLength}`,
    );
  }
  return value.trim();
}

function optionalStringArray(
  value: unknown,
  field: string,
  file: string,
): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new ContentError(file, `"${field}" must be an array of strings`);
  }
  return value as string[];
}

function requireDate(value: unknown, field: string, file: string): string {
  // YAML parses an unquoted `2026-07-20` into a Date, so accept both forms and
  // normalise to an ISO day string. Times are discarded: content is dated by
  // day, and keeping a timezone here would make output non-deterministic.
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new ContentError(file, `"${field}" is not a real date`);
    }
    return value.toISOString().slice(0, 10);
  }

  const date = requireString(value, field, file);
  if (!ISO_DATE.test(date)) {
    throw new ContentError(file, `"${field}" must be YYYY-MM-DD, got "${date}"`);
  }
  if (Number.isNaN(Date.parse(date))) {
    throw new ContentError(file, `"${field}" is not a real date: "${date}"`);
  }
  return date;
}

function requireOptionalPrice(value: unknown, file: string): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new ContentError(file, `"price" must be a non-negative number`);
  }
  return value;
}

export function parseFrontmatter(raw: unknown, file: string): Frontmatter {
  if (typeof raw !== "object" || raw === null) {
    throw new ContentError(file, "frontmatter block is missing");
  }
  const data = raw as Record<string, unknown>;

  const faq = data.faq;
  if (faq !== undefined) {
    if (!Array.isArray(faq)) {
      throw new ContentError(file, `"faq" must be a list`);
    }
    faq.forEach((entry, index) => {
      const item = entry as Record<string, unknown>;
      if (
        typeof item?.question !== "string" ||
        typeof item?.answer !== "string"
      ) {
        throw new ContentError(
          file,
          `faq[${index}] needs both "question" and "answer"`,
        );
      }
    });
  }

  return {
    title: requireString(data.title, "title", file, { maxLength: 120 }),
    seoTitle:
      data.seoTitle === undefined
        ? undefined
        // Google truncates around 60 characters; fail rather than ship a
        // title that ends in an ellipsis.
        : requireString(data.seoTitle, "seoTitle", file, { maxLength: 65 }),
    // Long descriptions get truncated in search results — fail early instead.
    description: requireString(data.description, "description", file, {
      maxLength: 200,
    }),
    slug: data.slug === undefined ? undefined : requireString(data.slug, "slug", file),
    date: requireDate(data.date, "date", file),
    updated:
      data.updated === undefined
        ? undefined
        : requireDate(data.updated, "updated", file),
    author: data.author === undefined ? undefined : requireString(data.author, "author", file),
    category:
      data.category === undefined
        ? undefined
        : requireString(data.category, "category", file),
    tags: optionalStringArray(data.tags, "tags", file),
    image: data.image === undefined ? undefined : requireString(data.image, "image", file),
    canonical:
      data.canonical === undefined
        ? undefined
        : requireString(data.canonical, "canonical", file),
    draft: data.draft === undefined ? undefined : Boolean(data.draft),
    featured: data.featured === undefined ? undefined : Boolean(data.featured),
    price: requireOptionalPrice(data.price, file),
    faq: faq as Frontmatter["faq"],
    related: optionalStringArray(data.related, "related", file),
  };
}
