---
name: ship
description: Format, check, commit on a branch and push (optional commit message)
argument-hint: "[commit message]"
disable-model-invocation: true
---

1. `git status` and `git diff --stat`. If on `main`, create a branch named after the change (`content/…`, `design/…`, `feat/…`, `fix/…`).
2. `npm run format`, then `portfolio.check`. Stop and report if it is not all ✓.
3. Re-read the diff of `src/content/` and `public/` for anything confidential or invented (see AGENTS.md, Rules). Stop and ask if in doubt.
4. Commit with the message the user gave, or one in the project style (`content: …`, `feat: …`). Stage files by name, never `dist/`.
5. `git push -u origin <branch>`. Give the URL to open the pull request, `https://github.com/nyabiyealexandra-a11y/PortfolioE5/compare/<branch>?expand=1`, with a 2–3 line description to paste.
