# Portfolio E5 — Alexandra Nyabiye

Portfolio of Alexandra Nyabiye, BTS SIO option SISR student (épreuve E5).
A one-page static site, black and white and inspired by architectural drawings, deployed to GitHub Pages.

## In one minute

```sh
nvm use          # Node 26 (see .nvmrc)
npm install
npm run dev      # rebuilds dist/index.html on every change
open dist/index.html
```

| Command             | What it does                                            |
| ------------------- | ------------------------------------------------------- |
| `npm run build`     | Validates the content and writes `dist/`                |
| `npm run dev`       | Same, and rebuilds whenever `src/` or `public/` changes |
| `npm test`          | Runs the tests                                          |
| `npm run typecheck` | Checks the types with TypeScript                        |
| `npm run lint`      | Checks the code with ESLint (`lint:fix` to auto-fix)    |
| `npm run format`    | Formats every file with Prettier                        |
| `npm run check`     | Format check, lint, types, tests, build: what CI runs   |

## How it works

The content is written in TypeScript with a small **DSL**: `section(…)`, `paragraph(…)`, `card(…)`, `timeline(…)`…
A renderer turns it into a single `dist/index.html` with the CSS inlined and **no JavaScript**.
Node runs the TypeScript files directly, so there is no compilation step and no runtime dependency.

```
src/
  dsl/          the DSL: types, builders, validation, HTML renderer
  content/      the actual text of the site, one file per section
  styles/       site.css
  build.ts      build script
public/         files copied as-is next to index.html (CV, PDFs, images)
tests/          tests (node:test)
```

The structure follows the school's E5 guide: [E5.md](E5.md) maps each mandatory element to its section and lists what is still to fill in.

**To change the site, read [CONTRIBUTING.md](CONTRIBUTING.md).** It explains every step, from editing a sentence to adding a new kind of block.
