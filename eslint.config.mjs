import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    /**
     * The architectural boundary, enforced rather than agreed.
     *
     * The kernel is domain-independent. One import of a domain module into
     * lib/reports/kernel and that stops being true — quietly, and permanently,
     * because nothing would fail. This rule is what makes the boundary a
     * property of the build instead of a promise in a document.
     */
    files: ["lib/reports/kernel/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "**/reports/domains/**",
                "**/reports/templates/**",
                "**/reports/knowledge/**",
                "@/lib/reports/domains/*",
                "@/lib/reports/templates/*",
                "@/lib/reports/knowledge/*",
              ],
              message:
                "The kernel must not import domain, template or knowledge code. It reasons about claims and knows nothing about the subject matter.",
            },
            {
              group: ["next", "next/*", "react", "react-dom"],
              message:
                "The kernel is framework-independent so it can be tested and, later, extracted. Keep Next and React out of it.",
            },
          ],
        },
      ],
    },
  },
  {
    /** Templates are configuration. Configuration does not import logic. */
    files: ["lib/reports/templates/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/reports/domains/**", "**/reports/kernel/reasoning/**"],
              message:
                "A template is configuration. If it needs behaviour, the behaviour belongs in an analyzer or in the kernel.",
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
