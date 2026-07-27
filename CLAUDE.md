# MarginGraph — instructions for AI agents and developers

## Current phase

**Design and documentation. No production code.**
Do not scaffold applications, choose frameworks, or write implementation code unless
explicitly asked.

## Source of truth

`docs/` is authoritative. Read [`docs/README.md`](docs/README.md) first, then the layer you
are working in and everything it lists under `depends-on`.

If code and documentation disagree, stop and raise it. Do not "fix" one to match the other
on your own initiative.

## Rules

1. **Do not invent facts about the business.** Anything marked `_TBD_` is genuinely undecided.
   Ask or propose explicitly — never fill a gap with a plausible assumption and move on.
2. **Decisions live in documents.** A decision made in conversation and not written down did
   not happen.
3. **Non-obvious or expensive decisions get an ADR** in `docs/decisions/`.
4. **Use the vocabulary in [`docs/00-foundation/glossary.md`](docs/00-foundation/glossary.md)**
   exactly, in prose, code, schemas and UI copy.
5. **Keep documents modular.** One concern per file. Link rather than duplicate; duplicated
   content drifts.
6. **Say what is uncertain.** A document that hides open questions is worse than no document.
