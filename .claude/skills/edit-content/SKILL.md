---
name: edit-content
description: Edit the text of the portfolio site in src/content/ - change a sentence, fill in a todo, add a project, mission, skill, veille article, section, PDF or image. Use for any change to what the site says rather than how it is built.
---

# Editing the site content

All text lives in `src/content/`. Never write HTML: build it with the DSL imported from `../../dsl/index.ts`.

## Find the place first

1. `portfolio.outline` gives the sections in page order, their file (`#id` → `src/content/sections/<id>.ts`) and card ids.
2. `portfolio.todos` lists every piece of missing information, by section and card.
3. Open the one section file you need. Personal details (e-mail, GitHub, LinkedIn) are in `src/content/profile.ts`; the order of the sections is in `src/content/site.ts`.

## DSL cheat sheet

`RichText` = a string, or an array of strings / `strong(t)` / `em(t)` / `link(label, href)` / `todo(what)`.

| Builder                                           | Renders                                                     |
| ------------------------------------------------- | ----------------------------------------------------------- |
| `paragraph(RichText)` · `note(RichText)`          | a paragraph · a discreet remark                             |
| `list(RichText[])`                                | bulleted list                                               |
| `timeline([{ period, title, detail? }])`          | dated entries                                               |
| `tags(string[])`                                  | small labels (technologies)                                 |
| `facts([{ term, value: RichText }])`              | label / value pairs                                         |
| `actions(Link[])`                                 | links as buttons                                            |
| `card({ id?, title, label?, blocks })`            | framed box; `id` makes it linkable as `#id`                 |
| `grid(1 \| 2 \| 3, cards)`                        | cards side by side                                          |
| `figure({ src, alt, caption? })`                  | image from `public/`; `alt` is required, describe the image |
| `section({ id, navLabel, title, lead?, blocks })` | a numbered section in the navigation                        |

- `link` href: `#section-or-card-id`, `https://…`, `mailto:…`, or a path relative to `public/` (`"docs/projet-ad.pdf"`). Never start with `/`.
- Projects (`projets.ts`) and skills (`competences.ts`) use a local helper (`project({...})`, `skill(...)`): copy an existing entry. `category` must be one of the values of the file's `Category` type.
- Each skill links to the project or mission card where it was used (`#projet-…`, `#mission-…`). When you rename or remove a card id, update those links; the build fails on a dangling one.
- Ids: lowercase letters, digits, dashes, starting with a letter, unique across the page. `accueil` is reserved.
- New section: create `src/content/sections/<id>.ts`, then import it and place it in `sections: [...]` in `site.ts`. The E5 sections tested in `tests/site.test.ts` must stay.
- File in `public/` (CV, PDF, image): file names without spaces or accents. The CV and synthèse links are commented out in `cv.ts` and `synthese.ts` until the PDF exists: add the file, uncomment the line, add `actions`/`link` to the import.

## Content rules (public site, read by the E5 jury)

- **Never invent** facts, numbers, results, dates or articles. If the user did not give the information, keep or add `todo("what is missing")`.
- **Nothing confidential from the employer**: no internal tool or server names, IP addresses, network diagrams of the real company, internal screenshots, colleagues' names. Describe missions in general terms. If the user's text contains such details, point them out instead of publishing them.
- **No personal data** (phone, address) unless the user explicitly asks.
- **French**, first person (« je »), same tone as the surrounding text. Use « » for quotes inside a string.
- E5.md lists what each section must contain. When a change fills in a "Still to do" item there, update that cell.

## Check

The edit hook runs `tests/site.test.ts`. When done, `portfolio.build` must be green and the todo count should have gone down (or stayed the same, if you only reworded text).
