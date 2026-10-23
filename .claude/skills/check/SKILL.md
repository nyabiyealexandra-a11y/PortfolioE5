---
name: check
description: Run what CI runs and fix every failure
disable-model-invocation: true
---

Call `portfolio.check`. If every step is ✓, say so in one line and stop.

Otherwise, fix the failures in this order: format (`npm run format`), lint (`npm run lint:fix` first, then by hand), typecheck, test, build. After each fix, call the narrow tool (`portfolio.lint`, `portfolio.test` with the failing file, `portfolio.build`), not the full check. Finish with one `portfolio.check`.

Never loosen a test or silence a lint rule to get green. If a failure needs a decision from the user, stop and ask.
