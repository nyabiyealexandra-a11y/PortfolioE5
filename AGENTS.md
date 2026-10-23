# AGENTS.md

Instructions for coding agents. Humans: read [README.md](README.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

Alexandra Nyabiye's E5 portfolio (BTS SIO SISR), a one-page static site in **French**. Content is written in TypeScript with a small DSL (`section`, `card`, `paragraph`…). The build renders it to a single `dist/index.html` with the CSS inlined, no client-side JS and no runtime dependency. Every push to `main` deploys to GitHub Pages.

## Commands

Node version: `.nvmrc` (≥ 22.18 runs `.ts` directly). In Claude Code the SessionStart hook puts it on `PATH`; elsewhere run `nvm use` first.

| Command                       | Does                                                                  |
| ----------------------------- | --------------------------------------------------------------------- |
| `npm run check`               | format check → lint → typecheck → test → build (exactly what CI runs) |
| `npm test`                    | all tests (`node:test`)                                               |
| `node --test tests/x.test.ts` | one test file                                                         |
| `npm run build`               | validate content, write `dist/`, print the number of `todo` left      |
| `npm run format` / `lint:fix` | auto-fix formatting / lint                                            |

## Map

```
src/content/site.ts          page: hero, order of sections, footer
src/content/profile.ts       name, e-mail, GitHub, LinkedIn
src/content/sections/*.ts    one file per section (the text of the site)
src/dsl/                     types.ts → builders.ts → validate.ts → render.ts (escape.ts); index.ts re-exports
src/styles/site.css          the whole design
src/build.ts                 validate → render → dist/
public/                      copied as-is to dist/ (PDFs, images)
tests/                       <dsl module>.test.ts + site.test.ts (real content, E5 requirements); helpers.ts
E5.md                        E5 guide requirement → section → what is still missing
.claude/ .cursor/           agent tooling for Claude Code and Cursor (see "Agent tooling")
```

## Save tokens

`portfolio.check` means the `check` tool of the `portfolio` MCP server (`mcp__portfolio__check` in Claude Code).

- **Find before you read.** `portfolio.outline` maps sections, card `#id`s and todo counts; `portfolio.todos` lists missing information. Open a content file only once you know it is the right one.
- **Read only what you need.** The DSL files are short (≤ 150 lines): grep for the function or type, then read that file, not the whole folder. Use `grep -rn` to find where a symbol is used before renaming it.
- **Run checks through the MCP.** `portfolio.check`, `test`, `lint` and `build` return `✓` per step and only the errors. Do not run `npm run check` in the shell and read its full output.
- **CONTRIBUTING.md is 30 kB.** Never read it whole: grep for the heading you need (`grep -n '^##' CONTRIBUTING.md`) and read that range. The skills below already sum up the parts agents need.
- Never read `dist/`, `node_modules/` or `package-lock.json` (reads are denied in `.claude/settings.json` and `.cursorignore`).

## Testing strategy

Hooks enforce it in Claude Code and Cursor, so you don't have to remember it:

1. **After every edit** (`PostToolUse`): the file is formatted with Prettier, then only the tests covering it run: `src/dsl/x.ts` → `tests/x.test.ts` + `tests/site.test.ts`, `src/content/**` → `tests/site.test.ts`, a test file → itself, `tests/helpers.ts` → all tests. Silent when green; failing tests come back to you as the hook's error. Fix them before moving on.
2. **Before you finish** (`Stop`): if files changed, the full check runs (format, lint, types, tests, build). If anything is red you cannot stop: fix it, or explain why it can't be fixed.
3. **Generated files are protected** (`PreToolUse`): edits to `dist/`, `node_modules/` and `package-lock.json` are refused.

What you write:

- **DSL change** (`src/dsl/`): test first. Add the failing test to the matching `tests/<module>.test.ts`, then make it pass. Every new block, rule or option gets at least one test. See the `write-tests` skill.
- **Content change** (`src/content/`): no new test. `site.test.ts` and the build validation already cover ids, internal links, files in `public/` and the E5 sections.
- **Never** weaken or delete an assertion to get green. If a test is wrong, say so and why.

## Rules

- **TypeScript is erased, not compiled**: no `enum`, `namespace` or constructor parameter properties. Import local files with `.ts` and types with `import type`. `exactOptionalPropertyTypes`: leave optional fields out, never set them to `undefined`.
- **Every `switch` on `kind` is exhaustive** (lint error otherwise). A new block touches `types.ts`, `builders.ts`, `render.ts`, `validate.ts`, `site.css` and a test: see the `extend-dsl` skill.
- **Content never contains HTML.** Use the DSL. Rendered text goes through `escapeHtml` / `renderText`.
- **Links are relative**: `#id`, `cv.pdf`, `docs/x.pdf`, never `/…` (the site lives under `/PortfolioE5/`). The build fails on a broken internal link or a missing file in `public/`.
- **Missing information uses `todo("…")`.** Never invent facts, numbers or results about Alexandra or her employer.
- **Public site, read by the jury:** nothing confidential from the employer (internal tool or server names, IPs, network diagrams, internal screenshots, colleagues' names); no personal data she has not chosen to publish. Site text is in French, first person (« je »).
- Don't add dependencies without being asked. Keep the zero-runtime-dependency, no-client-JS design.

## Git

- Never commit to `main`. Branches: `content/…`, `design/…`, `feat/…` (DSL, build, tooling), `fix/…`.
- Commits: `content: add the Zabbix project`, `feat: add a quote block to the DSL`, `fix: …`.
- **Done** = `portfolio.check` all green; for visual changes, say what to look at in `dist/index.html` (desktop and phone width).

## Agent tooling

Claude Code and Cursor share the same scripts, skills and instructions. Only the wiring differs.

| Path                                                      | What                                                                                                                                       |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `AGENTS.md` (`CLAUDE.md` imports it)                      | these instructions, read by both tools                                                                                                     |
| `.claude/hooks/`                                          | `guard.ts` (before an edit), `after-edit.ts` (after an edit), `before-stop.ts` (before handing back)                                       |
| `.claude/lib/`                                            | `checks.ts` runs format/lint/types/tests/build with compact output and maps a file to its tests; `hook.ts` speaks both tools' hook formats |
| `.claude/mcp/server.ts`                                   | `portfolio` MCP server (zero dependencies): `check`, `test`, `lint`, `build`, `outline`, `todos`                                           |
| `.claude/node.sh`                                         | runs Node at the `.nvmrc` version; every hook and the MCP server start through it                                                          |
| `.claude/skills/`                                         | read by both tools. On demand: `edit-content`, `extend-dsl`, `write-tests`. Explicit only: `/check`, `/e5-status`, `/new-block`, `/ship`   |
| `.claude/settings.json`, `.mcp.json`                      | Claude Code: hooks, permissions, denied reads; MCP server `portfolio`                                                                      |
| `.cursor/hooks.json`, `.cursor/mcp.json`, `.cursorignore` | Cursor: the same hooks, MCP servers and ignored files                                                                                      |

In Cursor, leave the "third-party hooks" setting (loading Claude Code hooks) off: `.cursor/hooks.json` already runs them, and they would run twice.

The tooling is TypeScript checked by the same `tsc` and ESLint config as `src/`. Change it like the rest of the code, and keep both wirings in sync.
