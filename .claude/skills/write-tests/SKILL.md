---
name: write-tests
description: Write or fix tests for this project (node:test). Use when changing src/dsl/, src/build.ts or the agent tooling, when a hook reports failing tests, or when asked about test coverage.
---

# Writing tests

Runner: Node's built-in `node:test` with `node:assert/strict`. No framework, no mocks library, no snapshots.

## Where

| Change in             | Test in                                                                           |
| --------------------- | --------------------------------------------------------------------------------- |
| `src/dsl/escape.ts`   | `tests/escape.test.ts`                                                            |
| `src/dsl/builders.ts` | `tests/builders.test.ts`: the builder returns the right object                    |
| `src/dsl/validate.ts` | `tests/validate.test.ts`: one test that accepts the valid case, one per rejection |
| `src/dsl/render.ts`   | `tests/render.test.ts`: exact HTML string                                         |
| `src/content/**`      | nothing new: `tests/site.test.ts` checks the real content                         |
| an E5 requirement     | `tests/site.test.ts`, "E5 requirements" (and the matching row of E5.md)           |

The edit hook runs the matching file automatically (see `testsFor` in `.claude/lib/checks.ts`). Run others with `portfolio.test` and `files: ["tests/x.test.ts"]`.

## How

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { paragraph } from "../src/dsl/index.ts";
import { renderBlock } from "../src/dsl/render.ts";
import { makePage, makeSection } from "./helpers.ts";

describe("renderBlock", () => {
  it("escapes HTML in a paragraph", () => {
    assert.equal(renderBlock(paragraph("a < b")), "<p>a &lt; b</p>");
  });
});
```

- Build fixtures with `makePage({...})` / `makeSection({...})` from `tests/helpers.ts`, overriding only the field under test.
- Name tests by behaviour, so a failure reads as a sentence: `it("rejects duplicated section ids")`.
- Compare whole values (`assert.equal` on the exact HTML, `assert.deepEqual` on the objects a builder returns) rather than `includes`/`match`, unless the output is too large (whole page): then `assert.match` the part under test.
- Validation errors: `assert.match` the part of the message that names the problem (`/"demo" is used more than once/`). The message is what the user reads in the build output, so it must say what to fix.
- Test the edge that matters: escaping (`<`, `&`, `"`), empty lists, optional fields absent, relative vs absolute links.
- Keep tests pure and fast: no file system or network, except `site.test.ts` which checks `public/`.

## When a test fails

1. Read the failure the hook returned. It is already trimmed to the assertion and the diff.
2. Decide which side is wrong. If the code is wrong, fix the code. If the expectation is outdated because the behaviour changed on purpose, update it and say so.
3. Never delete, skip (`it.skip`) or loosen an assertion only to get green.
