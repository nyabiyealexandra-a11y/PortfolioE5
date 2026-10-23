# Contributing

This guide assumes no prior knowledge of the project. It covers:

1. [Setting up your computer](#1-setting-up-your-computer)
2. [Understanding the project](#2-understanding-the-project)
3. [The everyday workflow](#3-the-everyday-workflow)
4. [Editing content](#4-editing-content)
5. [DSL reference](#5-dsl-reference)
6. [Adding files (CV, PDFs, images)](#6-adding-files-cv-pdfs-images)
7. [Changing the design](#7-changing-the-design)
8. [Extending the DSL with a new block](#8-extending-the-dsl-with-a-new-block)
9. [Tests](#9-tests)
10. [Git, pull requests and deployment](#10-git-pull-requests-and-deployment)
11. [Rules for the content](#11-rules-for-the-content)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Setting up your computer

You need **Git** and **Node.js 26** (any version from 22.18 works). Node runs the TypeScript files directly, which older versions cannot do.

### Install Node with nvm (recommended)

[nvm](https://github.com/nvm-sh/nvm) lets you switch Node versions per project.

```sh
# Once, if nvm is not installed yet (see the nvm README for the latest command)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# In the project folder: installs and selects the version written in .nvmrc
nvm install
nvm use
node --version   # must print v26.x (or ≥ v22.18)
```

### Get the code and install

```sh
git clone git@github.com:nyabiyealexandra-a11y/PortfolioE5.git
cd PortfolioE5
npm install
```

`npm install` only installs development tools: `typescript` (type checking), `@types/node` (Node's type definitions), `eslint` + `typescript-eslint` (linting) and `prettier` (formatting). The site itself has **no dependency**.

### Check everything works

```sh
npm run check
```

It runs, in order: the format check, the linter, the type check, the tests (`# fail 0`) and the build (`✓ Built dist/index.html`). The build may also print `! N "À compléter" marker(s) left`: that is a reminder, not an error (see [Marking missing information](#marking-missing-information)).

### Editor

Any editor works. [VS Code](https://code.visualstudio.com/) is recommended: it understands TypeScript out of the box, underlines mistakes in red as you type, and autocompletes the DSL functions and their fields. When you open the project, accept the suggested extensions (ESLint, Prettier, EditorConfig): the settings in `.vscode/` then format your code and fix lint problems on every save.

---

## 2. Understanding the project

### Why it is built this way

The site is a single static page with no interactive part. The simplest setup that is still **typed**, **tested** and **checked by CI** is:

- **TypeScript** to describe the content, so a typo in a field name or a missing title is caught immediately;
- a tiny **DSL** (a set of functions such as `section`, `card`, `paragraph`) so that content files read like an outline of the page, not like HTML;
- a **renderer** that turns that description into HTML;
- **Node's built-in tools** to run it (`node file.ts`) and test it (`node --test`).

No framework, no bundler, no client-side JavaScript. The output is one `index.html` that you could open from a USB stick.

### The files

```
.
├── .github/workflows/static.yml   CI: checks every PR, deploys main to GitHub Pages
├── .vscode/                       editor settings: format and lint on save
├── .editorconfig                  indentation, line endings, final newline
├── .nvmrc                         Node version used by nvm and by the CI
├── .prettierrc.json               formatting rules (Prettier)
├── eslint.config.js               lint rules (ESLint + typescript-eslint)
├── E5.md                          the E5 guide's requirements → where they are on the site
├── package.json                   scripts (build, dev, test, lint, format, typecheck, check)
├── tsconfig.json                  TypeScript settings (strict)
├── public/                        copied as-is into dist/ (CV, PDFs, images)
├── src/
│   ├── build.ts                   validate → render → write dist/
│   ├── content/
│   │   ├── profile.ts             name, e-mail, GitHub, LinkedIn (used everywhere)
│   │   ├── site.ts                the page: hero, list and order of sections, footer
│   │   └── sections/              one file per section
│   │       ├── parcours.ts        01 présentation personnelle et parcours
│   │       ├── entreprise.ts      02 l'entreprise d'alternance
│   │       ├── missions.ts        02 missions et compétences mobilisées
│   │       ├── projets.ts         05 projets et documentations
│   │       ├── competences.ts     07 compétences, reliées aux projets
│   │       ├── synthese.ts        04 tableau de synthèse
│   │       ├── veille.ts          06 veille technologique et articles
│   │       ├── cv.ts              03 CV
│   │       └── contact.ts         contact et liens
│   ├── dsl/
│   │   ├── types.ts               the shape of every kind of content
│   │   ├── builders.ts            the DSL functions
│   │   ├── index.ts               what content files import
│   │   ├── validate.ts            checks types can't express (ids, links, files)
│   │   ├── render.ts              content → HTML
│   │   └── escape.ts              HTML escaping
│   └── styles/site.css            the whole design
└── tests/                         one test file per DSL module, plus site.test.ts
```

### What happens when you build

```
src/content/site.ts ──► validatePage ──► renderPage ──► dist/index.html
                            │                               ▲
                            └─ errors? print them, stop     │
src/styles/site.css ────────────────────────────────────────┘ (inlined)
public/* ───────────────────────────────────────────────────► dist/*
```

`dist/` is generated: never edit it, never commit it (it is in `.gitignore`).

---

## 3. The everyday workflow

```sh
git switch main && git pull           # start from the latest version
git switch -c content/veille-articles # create a branch for your change
npm run dev                           # leave this running in a terminal
```

`npm run dev` rebuilds `dist/index.html` every time you save a file in `src/` or `public/`. Open `dist/index.html` in your browser and refresh after each save.

When you are happy:

```sh
npm run format                        # format every file
npm run check                         # what the CI will run
git add -A
git commit -m "content: add veille articles"
git push -u origin content/veille-articles
```

Then open a pull request on GitHub (see [section 10](#10-git-pull-requests-and-deployment)).

---

## 4. Editing content

All text lives in `src/content/`. You never need to write HTML.

### Change a sentence

Open the file of the section (e.g. `src/content/sections/parcours.ts`), change the text between quotes, save. That's it.

Text is written between double quotes `"…"`. Apostrophes are fine inside: `"l'administration"`. If your text contains a double quote, use French guillemets `« »` instead, or escape it as `\"`.

Characters like `<`, `>` and `&` are escaped automatically: write them as they are.

### Change a personal detail (e-mail, links)

Edit `src/content/profile.ts`. Every section that uses `profile.email`, `profile.github`… picks it up.

### Reorder, remove or rename a section

Open `src/content/site.ts`:

```ts
sections: [parcours, entreprise, missions, projets, competences, synthese, veille, cv, contact],
```

- **Reorder**: move the names around. The numbers (`01`, `02`…) and the navigation follow automatically.
- **Remove**: think twice — most sections are required by the E5 guide, and `tests/site.test.ts` fails if one of them disappears. Otherwise, delete the name from the list (and its `import` line at the top, or the type check will complain about an unused import).
- **Rename in the menu**: change `navLabel` in the section file. `title` is the big heading; `navLabel` is the short text in the navigation bar.

### Add a new section

1. Create `src/content/sections/certifications.ts`:

   ```ts
   import { list, section } from "../../dsl/index.ts";

   export const certifications = section({
     id: "certifications",
     navLabel: "Certifications",
     title: "Certifications",
     lead: "Les certifications obtenues pendant le BTS.",
     blocks: [list(["Cisco CCNA 1", "PIX"])],
   });
   ```

2. In `src/content/site.ts`, import it and add it to the list:

   ```ts
   import { certifications } from "./sections/certifications.ts";
   // …
   sections: [parcours, entreprise, missions, projets, competences, certifications, synthese, veille, cv, contact],
   ```

3. Save and check the result. The section appears in the menu with its number.

Rules for `id`: lowercase letters, digits and dashes, starting with a letter (`veille`, `projets-e5`). It must be unique. `accueil` is reserved for the top of the page. The build tells you if a rule is broken.

### Add a project or a skill

Projects and skills use a small local helper (`project(...)`, `skill(...)`) defined at the top of their file, so every card has the same shape. Copy an existing entry and change the values:

```ts
project({
  title: "Supervision avec Zabbix",
  category: "Réseaux",
  context: "Surveiller l'état des serveurs du laboratoire.",
  goal: "Être alerté avant qu'un service ne tombe.",
  role: "Installation, configuration des hôtes et des alertes.",
  technologies: ["Zabbix", "Linux Debian", "SNMP"],
}),
```

`category` only accepts the values listed in the `Category` type at the top of the file. To add a new category, add it to that type first; the editor will then propose it.

### Mix bold, italics and links inside a sentence

A text can be a plain string, or a list of pieces:

```ts
paragraph([strong("Mon rôle : "), "assurer le support des agents. Voir aussi ", link("mes projets", "#projets"), "."]);
```

---

## 5. DSL reference

Import everything from `src/dsl/index.ts`. Your editor shows the fields of each function as you type.

`RichText` below means: a string, or a list of strings / `strong` / `em` / `link`.

### Inline

| Function                   | Result                                                                                                                                                                                                      |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `strong(text)`             | **bold** text                                                                                                                                                                                               |
| `em(text)`                 | _italic_ text                                                                                                                                                                                               |
| `link(label, href, opts?)` | a link. `href` can be `#section-id`, `https://…`, `mailto:…`, `tel:…`, or a file in `public/` (`"cv.pdf"`). `http(s)` links open in a new tab; force it with `{ external: true }` or `{ external: false }`. |
| `todo(what)`               | a visible “À compléter : …” marker for missing information; the build counts them                                                                                                                           |

### Blocks

| Function                                         | Result                                                                                                                                           |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `paragraph(text: RichText)`                      | a paragraph                                                                                                                                      |
| `list(items: RichText[])`                        | a bulleted list                                                                                                                                  |
| `timeline([{ period, title, detail? }])`         | dated entries, one per line, with a rule between them                                                                                            |
| `tags(labels: string[])`                         | small outlined labels (technologies, keywords)                                                                                                   |
| `facts([{ term, value: RichText }])`             | label / value pairs (“Objectif — …”)                                                                                                             |
| `note(text: RichText)`                           | a discreet remark with a rule on its left                                                                                                        |
| `actions(links: Link[])`                         | links displayed as outlined buttons                                                                                                              |
| `card({ id?, title, label?, blocks, details? })` | a framed box; `label` is the small uppercase line above the title; `details` is folded under « Voir le détail »                                  |
| `grid(columns: 1 \| 2 \| 3, cards)`              | cards side by side; collapses on small screens                                                                                                   |
| `rows(cards)`                                    | cards as full-width rows separated by thin lines (the project list)                                                                              |
| `figure({ src, alt, caption? })`                 | an image from `public/` (diagram, screenshot, organisation chart); `alt` describes it for screen readers; the build fails if the file is missing |

### Structure

| Function                                                            | Result                                       |
| ------------------------------------------------------------------- | -------------------------------------------- |
| `section({ id, navLabel, title, lead?, blocks })`                   | a numbered section, listed in the navigation |
| `hero({ name, role, headline, intro, actions })`                    | the top of the page                          |
| `page({ lang, title, description, brand, hero, sections, footer })` | the whole document                           |

### Linking to a card

Give a card an `id` and link to it from anywhere with `#id`, exactly like a section. The skills section uses this to point each skill to the project or mission where it was used:

```ts
card({ id: "projet-ad", title: "Active Directory & GPO", blocks: [...] });
// elsewhere
link("Active Directory & GPO", "#projet-ad");
```

Card ids follow the same rules as section ids and must be unique across the whole page.

### Marking missing information

When something is not known yet (number of employees, results of a project…), do not invent it and do not leave a blank: write `todo("…")` inside a `RichText`.

```ts
facts([{ term: "Effectif", value: [todo("nombre d'agents")] }]);
```

It shows on the page as a dashed “À compléter : nombre d'agents” box, and `npm run build` prints how many are left. To find them all, search for `todo(` in `src/content/`. Replace each one with the real information before the exam.

### Writing your own helpers

Because content is plain TypeScript, you can write functions that return DSL nodes. That is how `project()` in `projets.ts` and `skill()` in `competences.ts` work:

```ts
const skill = (name: string, category: Category, usedFor: string): Card =>
  card({ label: category, title: name, blocks: [paragraph(usedFor)] });
```

Keep such helpers in the section file that uses them. Move one to `src/dsl/` only if several sections need it.

---

## 6. Adding files (CV, PDFs, images)

Everything in `public/` is copied next to `index.html`. Link to it with a path **relative to `public/`**:

1. Put the file in `public/`, e.g. `public/CV_Alexandra_Nyabiye.pdf`.
2. Link to it: `link("Télécharger mon CV (PDF)", "CV_Alexandra_Nyabiye.pdf")`.

Subfolders work too: `public/docs/projet-ad.pdf` → `"docs/projet-ad.pdf"`.

The build **fails if a linked file does not exist**, so a typo in a file name never reaches the live site. That is why the CV and E5 table links are commented out in `contact.ts` and `synthese.ts` for now: add the PDF, then uncomment the line (and add `actions` and `link` to the `import` at the top of the file).

Images work the same way, with the `figure` block:

```ts
figure({
  src: "images/schema-reseau.png",
  alt: "Schéma réseau du contexte HSP : deux VLAN reliés par un routeur",
  caption: "Schéma réseau du projet de 2e année",
});
```

Tips:

- Use file names without spaces or accents: `tableau-synthese-E5.pdf`, not `Tableau synthèse E5.pdf`.
- Keep PDFs under a few MB; compress images before adding them.
- Before publishing a document, re-read [section 11](#11-rules-for-the-content).

---

## 7. Changing the design

The whole design is `src/styles/site.css`. It is inlined into the page at build time.

### The principles

- **Quiet editorial.** Near-black ink (`--ink`) on warm paper (`--paper`), a grey (`--muted`) for secondary text, light rules (`--rule`, `--hairline`) and one muted accent (`--accent`, burgundy) kept for small marks: section numbers, labels, hover, focus.
- **Calm structure**: a two-column grid (heading on the left, content on the right), thin rules rather than heavy boxes, soft cards, small uppercase sans-serif labels. Long, secondary content is folded under « Voir le détail » (only where the jury does not need it at first glance).
- **System fonts**: a classic serif for titles (Iowan Old Style / Palatino / Georgia) and the system sans-serif for reading. Nothing to download, fast everywhere.
- **No JavaScript.** If an idea needs JavaScript, it probably does not belong on this site.

### Where to change what

- Colours, fonts, widths and spacing: the variables at the top (`:root { … }`). Changing `--gutter` or `--space` there updates the whole page.
- Each block has its own clearly marked part of the file (`/* ---- Blocks ---- */`). The CSS class names match the renderer: `card__title` is the title of a `card`, `timeline__period` the period of a `timeline` entry, etc. (naming style: `block__element`, `block--variant`).

### Check your change

- Look at the page at full width **and** narrow your browser window to phone width (about 400px). Nothing should overflow horizontally.
- Use your browser's developer tools (right-click → Inspect) to try values live before writing them in the file.

---

## 8. Extending the DSL with a new block

Say you want a `quote` block (a citation with its author). It takes five small steps, and TypeScript guides you through them: after step 1, the type check lists every place that must handle the new block.

**1. Describe it** in `src/dsl/types.ts`, and add it to the `Block` union:

```ts
export type Quote = { readonly kind: "quote"; readonly text: string; readonly author: string };

export type Block = Paragraph | List | … | Grid | Quote;
```

**2. Add its builder** in `src/dsl/builders.ts` (and import the `Quote` type there):

```ts
export const quote = (text: string, author: string): Quote => ({ kind: "quote", text, author });
```

**3. Render it** in `src/dsl/render.ts`, inside the `switch` of `renderBlock`. Always pass content through `escapeHtml` (or `renderText` for `RichText`):

```ts
case "quote":
  return `<figure class="quote"><blockquote>${escapeHtml(block.text)}</blockquote><figcaption>${escapeHtml(block.author)}</figcaption></figure>`;
```

**4. Handle it in validation** in `src/dsl/validate.ts`, in the `switch` of `linksInBlock`. A quote has no link, so add it next to `timeline` and `tags`, which return `[]`.

Run `npm run typecheck` now: if you forgot step 3 or 4, TypeScript says so (each `switch` must cover every kind of block).

**5. Style and test it**: add a `.quote` rule to `site.css`, and a test to `tests/render.test.ts`:

```ts
it("renders a quote", () => {
  assert.equal(
    renderBlock(quote("Rien ne se perd", "Lavoisier")),
    `<figure class="quote"><blockquote>Rien ne se perd</blockquote><figcaption>Lavoisier</figcaption></figure>`,
  );
});
```

Finally, add a line for it in the [DSL reference](#5-dsl-reference) of this file.

### TypeScript rules to know

Node runs `.ts` files by **removing the types**, without compiling. This works only with TypeScript syntax that can simply be erased, so the project forbids (and `tsc` reports):

- `enum` → use a union of strings: `type Category = "Systèmes" | "Réseaux"`;
- `namespace` → use modules;
- constructor parameter properties (`constructor(private x: string)`).

Also:

- Import local files **with their `.ts` extension**: `import { card } from "../../dsl/index.ts"`.
- Import types with `import type` (or `type` inside the braces: `import { card, type Card } …`).
- The settings are strict: no implicit `any`, no unused variables, optional fields can't be set to `undefined` explicitly (leave them out instead).

---

## 9. Tests

```sh
npm test
```

Tests use Node's built-in runner (`node:test`) and assertions (`node:assert/strict`). They live in `tests/`:

| File               | What it checks                                                          |
| ------------------ | ----------------------------------------------------------------------- |
| `escape.test.ts`   | HTML escaping                                                           |
| `builders.test.ts` | the DSL functions build the right objects                               |
| `validate.test.ts` | each validation rule: accepts what is valid, rejects what is not        |
| `render.test.ts`   | the HTML produced by each block, section and the page                   |
| `site.test.ts`     | the **real content** is valid and every section is rendered             |
| `helpers.ts`       | `makePage()` / `makeSection()`: minimal valid objects to build tests on |

### When to write a test

- You change something in `src/dsl/` → add or update a test in the matching file. Every new block, rule or option gets at least one test.
- You only change content → no new test needed; `site.test.ts` and the build already check it.

### Writing one

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { paragraph } from "../src/dsl/index.ts";
import { renderBlock } from "../src/dsl/render.ts";

describe("renderBlock", () => {
  it("renders a paragraph", () => {
    assert.equal(renderBlock(paragraph("Bonjour")), "<p>Bonjour</p>");
  });
});
```

Name tests by the behaviour they check (“rejects duplicated section ids”), so a failure reads like a sentence.

To run a single file: `node --test tests/render.test.ts`.

---

### Linting and formatting

Two tools keep the code consistent. Both run in the CI, so a pull request with problems shows a red cross.

- **Prettier** formats the code (indentation, quotes, lines of at most 120 characters). Never format by hand: run `npm run format`, or let VS Code do it on save. `npm run format:check` only reports badly formatted files.
- **ESLint** with `typescript-eslint` (strict, type-aware rules) catches mistakes the type check alone does not, e.g. a `switch` on `kind` that forgets a case, or a type imported without `import type`. Run `npm run lint`; `npm run lint:fix` fixes what can be fixed automatically. The rules live in `eslint.config.js`; each project-specific one has a comment explaining why.

If you really must silence a rule on one line, say why on the line above:

```ts
// <reason why the rule does not apply here>
// eslint-disable-next-line @typescript-eslint/<rule-name>
```

## 10. Git, pull requests and deployment

### Branches

Never work directly on `main`. Create one branch per change, named after what it does:

- `content/…` for text and files (`content/add-cv`)
- `design/…` for CSS (`design/larger-titles`)
- `feat/…` for DSL or build changes (`feat/quote-block`)
- `fix/…` for bug fixes

### Commits

Small commits with a message saying what changed and where:

```
content: add the Zabbix project
design: increase spacing between sections
feat: add a quote block to the DSL
fix: escape quotes in link targets
```

### Pull requests

1. Push your branch and open a pull request towards `main` on GitHub.
2. Describe what changed and, for visual changes, add a screenshot.
3. The CI runs automatically (`.github/workflows/static.yml`, job **check**): format check, lint, type check, tests, build. A red cross means something fails: open the details, read the error, fix it, push again.
4. Merge once the check is green (and reviewed, if someone else is involved).

Checklist before asking for a review:

- [ ] `npm run check` passes locally (format, lint, types, tests, build)
- [ ] the page looks right at desktop and phone width
- [ ] no confidential information (see [section 11](#11-rules-for-the-content))
- [ ] new DSL features have tests and are documented in section 5

### Deployment

Merging into `main` deploys automatically: the **check** job builds `dist/`, then the **deploy** job publishes it to GitHub Pages at <https://nyabiyealexandra-a11y.github.io/PortfolioE5/>. Nothing to do by hand.

All links in the site are relative (`cv.pdf`, `#projets`), which is why it works under the `/PortfolioE5/` sub-path. Never write a link starting with `/`: the build rejects it. Follow the progress in the **Actions** tab of the repository; the site URL appears on the deploy job.

If the deploy fails on the very first run, check in the repository **Settings → Pages** that **Source** is set to **GitHub Actions**.

---

## 11. Rules for the content

This site is public and is read by the E5 jury.

- **Nothing confidential from the employer**: no internal tool names, no network diagrams, IP addresses, server names, screenshots of internal applications, or colleagues' names. Describe missions in general terms.
- **Personal data**: only what Alexandra chooses to publish. No phone number or address unless she decides to.
- **Documents**: open every PDF before adding it and check it contains nothing from the list above (including in headers, footers and metadata).
- **Language**: the site is in French. Keep a consistent tone (first person, “je”).
- **Missing information**: use `todo("…")` (see [Marking missing information](#marking-missing-information)), never fake data presented as real. Search for `todo(` and `TODO` in `src/content/` to find what is left, and check [E5.md](E5.md).
- **Before the exam**: the guide requires the site to be online and every link, document and image to work. Open the live site from another computer or from a phone on mobile data, click every link and download every PDF.

---

## 12. Troubleshooting

| Problem                                                               | Solution                                                                                                  |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `[warn] Code style issues found` in CI                                | Run `npm run format` and commit the result.                                                               |
| ESLint error in CI                                                    | Run `npm run lint` locally; `npm run lint:fix` fixes most of them.                                        |
| `SyntaxError: Unexpected token ':'` or `Unknown file extension ".ts"` | Your Node is too old. Run `nvm use` and check `node --version` (needs ≥ 22.18).                           |
| `✗ The content has N problem(s)`                                      | The build found a mistake; each line says what and where. Fix them and save again.                        |
| `public/xxx.pdf does not exist`                                       | The file name in `link(…)` does not match the file in `public/` (check case, accents, extension).         |
| `"x" is not a section id`                                             | An internal link `#x` points to no section. Check the `id` of the target section.                         |
| Red underline / `tsc` error `Property 'titel' does not exist`         | A typo in a field name. The editor's autocomplete lists the valid fields.                                 |
| `'actions' is declared but its value is never read`                   | An import is not used: remove it from the `import { … }` line, or use it.                                 |
| `This syntax is not allowed when 'erasableSyntaxOnly' is enabled`     | You used an `enum`, `namespace` or parameter property. See [section 8](#typescript-rules-to-know).        |
| The page in the browser doesn't change                                | Is `npm run dev` still running? Did the terminal print an error? Refresh the page (Cmd/Ctrl + Shift + R). |
| CI fails but it works on my machine                                   | Run `npm ci` (clean install from the lockfile) then `npm run check`, with the Node version from `.nvmrc`. |
