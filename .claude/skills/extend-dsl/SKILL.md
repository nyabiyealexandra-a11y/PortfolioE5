---
name: extend-dsl
description: Add or change a block, inline, option or validation rule in the TypeScript DSL (src/dsl/), or change the renderer or build. Use when content needs something the existing builders cannot express.
---

# Extending the DSL

First check that the existing blocks really can't do it (`grid` of `card`s, `facts`, `note`… cover most needs) and that it fits the design: static HTML, no client JS, black and white.

Read only what you need, through Serena: the `Block` union in `src/dsl/types.ts`, then the `renderBlock` and `linksInBlock` switch bodies.

## Steps (test first)

Example: a `quote` block.

1. **Test (red).** In `tests/render.test.ts` (and `tests/builders.test.ts`, plus `tests/validate.test.ts` if it has links or files), write the expected HTML exactly:
   ```ts
   it("renders a quote", () => {
     assert.equal(
       renderBlock(quote("Rien ne se perd", "Lavoisier")),
       `<figure class="quote"><blockquote>Rien ne se perd</blockquote><figcaption>Lavoisier</figcaption></figure>`,
     );
   });
   ```
2. **Type** in `src/dsl/types.ts`: `export type Quote = { readonly kind: "quote"; readonly text: string; readonly author: string };` and add it to the `Block` union. `portfolio.lint` now lists every `switch` that must handle it.
3. **Builder** in `src/dsl/builders.ts` (import the type): `export const quote = (text: string, author: string): Quote => ({ kind: "quote", text, author });`
4. **Render** in the `renderBlock` switch of `src/dsl/render.ts`. Every piece of text goes through `escapeHtml`, or `renderText` for `RichText`.
5. **Validate** in the `linksInBlock` switch of `src/dsl/validate.ts`. No links: return `[]` next to `timeline` and `tags`. With links or files, return them so the build checks them, and test that rule.
6. **Style**: a `.quote` rule in `src/styles/site.css`, in the existing visual language (borders, monospace labels, no colour). Check phone width too.
7. **Document**: a row in the DSL reference of CONTRIBUTING.md (`grep -n '^### Blocks' CONTRIBUTING.md`) and in the cheat sheet of `.claude/skills/edit-content/SKILL.md`.

Also update `.claude/mcp/site-info.ts` if the new block holds `RichText`, so `todos` and `outline` still see inside it (its `switch` is exhaustive, so `tsc` will tell you).

## Constraints

- Erasable TypeScript only: no `enum`, `namespace`, parameter properties. `.ts` extensions on imports, `import type` for types.
- Everything `readonly`; optional fields are left out, never set to `undefined`.
- No new dependency.

Done = `portfolio.check` green, with the new tests failing before step 4 and passing after.
