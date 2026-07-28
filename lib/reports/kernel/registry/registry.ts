/**
 * A versioned registry.
 *
 * Used for reasoners, analyzers, extractors, renderers and templates. One
 * implementation rather than five, because the only thing they need is
 * "register by id, look up by id, and tell me every version in play so the
 * manifest can record it".
 *
 * Registration is static and happens at module load. There is no dynamic
 * plugin loading, on purpose — it solves a problem nobody has yet and makes
 * the version manifest harder to guarantee.
 */
export type Versioned = { id: string; version: string };

export type Registry<T extends Versioned> = {
  register(entry: T): void;
  get(id: string): T | undefined;
  require(id: string): T;
  all(): T[];
  /** id → version, for the audit manifest. */
  versions(): Record<string, string>;
};

export function createRegistry<T extends Versioned>(kind: string): Registry<T> {
  const entries = new Map<string, T>();

  return {
    register(entry) {
      const existing = entries.get(entry.id);
      if (existing && existing.version !== entry.version) {
        // Two versions of the same module in one process would make the
        // manifest ambiguous, which defeats the point of having one.
        throw new Error(
          `${kind} "${entry.id}" is already registered at version ${existing.version}; ` +
            `refusing to replace it with ${entry.version}.`,
        );
      }
      entries.set(entry.id, entry);
    },
    get: (id) => entries.get(id),
    require(id) {
      const entry = entries.get(id);
      if (!entry) {
        throw new Error(
          `No ${kind} registered with id "${id}". Registered: ${[...entries.keys()].join(", ") || "none"}.`,
        );
      }
      return entry;
    },
    all: () => [...entries.values()],
    versions() {
      return Object.fromEntries(
        [...entries.values()].map((entry) => [entry.id, entry.version]),
      );
    },
  };
}
