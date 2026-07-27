import { compileMDX } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { mdxComponents } from "@/components/mdx";

/**
 * MDX compilation, in one place.
 *
 * Compiled on the server at build time — no MDX runtime reaches the browser.
 * Plugin order matters: rehype-slug must add ids before autolink can wrap them.
 */
export async function renderMdx(source: string) {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: false, // gray-matter already stripped it
      // next-mdx-remote defaults to stripping every JS expression, because it
      // is built for untrusted remote MDX. Ours lives in this repository and
      // goes through review, and without this every `items={[...]}` prop
      // silently arrives as undefined. `blockDangerousJS` stays on.
      blockJS: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "prepend",
              properties: { "aria-hidden": "true", tabIndex: -1 },
              content: { type: "text", value: "#" },
            },
          ],
        ],
      },
    },
  });

  return content;
}

/** Renders a document body with the prose styles applied. */
export async function Mdx({ source }: { source: string }) {
  const content = await renderMdx(source);
  return <div className="prose">{content}</div>;
}
