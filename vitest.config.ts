import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Tests run under Vitest rather than node:test.
 *
 * Node can execute TypeScript natively now, but its ESM resolver requires
 * explicit file extensions and does not resolve directory imports. Satisfying
 * it would mean writing `./types/claim.ts` in every import in the kernel —
 * unusual for a Next codebase, and a rule every future file has to remember.
 * One well-maintained dev dependency is the cheaper trade.
 */
export default defineConfig({
  test: {
    include: ["lib/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, ".") },
  },
});
