/**
 * Turns the content tree into HTML.
 *
 * Every string coming from content goes through `escapeHtml`, so authors can
 * write `<`, `&` or quotes freely. The output contains no JavaScript.
 */
import { escapeHtml } from "./escape.ts";
import { HERO_ID } from "./validate.ts";
import type { Block, Card, Hero, Inline, Link, Page, RichText, Section } from "./types.ts";

/** Formats a section position as a two-digit label: 0 → "01". */
export const sectionNumber = (index: number): string => String(index + 1).padStart(2, "0");

export const renderLink = (link: Link, className?: string): string => {
  const attrs = [
    `href="${escapeHtml(link.href)}"`,
    className === undefined ? "" : `class="${className}"`,
    link.external ? `target="_blank" rel="noopener noreferrer"` : "",
  ].filter((attr) => attr !== "");
  return `<a ${attrs.join(" ")}>${escapeHtml(link.label)}</a>`;
};

const renderInline = (node: Inline): string => {
  if (typeof node === "string") return escapeHtml(node);
  switch (node.kind) {
    case "strong":
      return `<strong>${escapeHtml(node.text)}</strong>`;
    case "em":
      return `<em>${escapeHtml(node.text)}</em>`;
    case "link":
      return renderLink(node);
    case "todo":
      return `<mark class="todo">À compléter : ${escapeHtml(node.what)}</mark>`;
  }
};

/** Number of "À compléter" markers in a rendered page. */
export const countTodos = (html: string): number => html.split(`<mark class="todo">`).length - 1;

export const renderText = (text: RichText): string =>
  typeof text === "string" ? escapeHtml(text) : text.map(renderInline).join("");

const renderCard = (card: Card): string => {
  const label = card.label === undefined ? "" : `<p class="card__label">${escapeHtml(card.label)}</p>`;
  const id = card.id === undefined ? "" : ` id="${escapeHtml(card.id)}"`;
  const details =
    card.details === undefined || card.details.length === 0
      ? ""
      : `<details class="card__details"><summary>Voir le détail</summary><div class="card__more">${card.details.map(renderBlock).join("")}</div></details>`;
  return `<article class="card"${id}>${label}<h3 class="card__title">${escapeHtml(card.title)}</h3>${card.blocks.map(renderBlock).join("")}${details}</article>`;
};

export const renderBlock = (block: Block): string => {
  switch (block.kind) {
    case "paragraph":
      return `<p>${renderText(block.text)}</p>`;
    case "list":
      return `<ul class="list">${block.items.map((item) => `<li>${renderText(item)}</li>`).join("")}</ul>`;
    case "timeline":
      return `<ol class="timeline">${block.entries
        .map(
          (entry) =>
            `<li><span class="timeline__period">${escapeHtml(entry.period)}</span><span class="timeline__title">${escapeHtml(entry.title)}</span>${
              entry.detail === undefined ? "" : `<span class="timeline__detail">${escapeHtml(entry.detail)}</span>`
            }</li>`,
        )
        .join("")}</ol>`;
    case "tags":
      return `<ul class="tags">${block.labels.map((label) => `<li>${escapeHtml(label)}</li>`).join("")}</ul>`;
    case "facts":
      return `<dl class="facts">${block.items
        .map((item) => `<div><dt>${escapeHtml(item.term)}</dt><dd>${renderText(item.value)}</dd></div>`)
        .join("")}</dl>`;
    case "note":
      return `<p class="note">${renderText(block.text)}</p>`;
    case "actions":
      return `<p class="actions">${block.links.map((l) => renderLink(l, "button")).join("")}</p>`;
    case "card":
      return renderCard(block);
    case "grid":
      return `<div class="grid grid--${block.columns}">${block.cards.map(renderCard).join("")}</div>`;
    case "rows":
      return `<div class="rows">${block.cards.map(renderCard).join("")}</div>`;
    case "figure":
      return `<figure class="figure"><img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}" loading="lazy">${
        block.caption === undefined ? "" : `<figcaption>${escapeHtml(block.caption)}</figcaption>`
      }</figure>`;
  }
};

export const renderSection = (section: Section, index: number): string => {
  const lead = section.lead === undefined ? "" : `<p class="section__lead">${renderText(section.lead)}</p>`;
  return [
    `<section id="${escapeHtml(section.id)}" class="section" aria-labelledby="${escapeHtml(section.id)}-title">`,
    `<header class="section__header">`,
    `<p class="section__number">${sectionNumber(index)}</p>`,
    `<h2 class="section__title" id="${escapeHtml(section.id)}-title">${escapeHtml(section.title)}</h2>`,
    lead,
    `</header>`,
    `<div class="section__body">${section.blocks.map(renderBlock).join("")}</div>`,
    `</section>`,
  ].join("");
};

export const renderHero = (hero: Hero): string =>
  [
    `<section id="${HERO_ID}" class="hero" aria-label="${escapeHtml(hero.name)}">`,
    `<p class="hero__role">${escapeHtml(hero.role)}</p>`,
    `<h1 class="hero__name">${escapeHtml(hero.name)}</h1>`,
    `<p class="hero__headline">${escapeHtml(hero.headline)}</p>`,
    `<p class="hero__intro">${renderText(hero.intro)}</p>`,
    hero.actions.length === 0
      ? ""
      : `<p class="actions">${hero.actions.map((l) => renderLink(l, "button")).join("")}</p>`,
    `</section>`,
  ].join("");

const renderNav = (page: Page): string =>
  [
    `<header class="topbar"><nav class="nav" aria-label="Navigation principale">`,
    `<a class="nav__brand" href="#${HERO_ID}">${escapeHtml(page.brand)}</a>`,
    `<ul class="nav__links">`,
    page.sections
      .map(
        (s, i) =>
          `<li><a href="#${escapeHtml(s.id)}"><span>${sectionNumber(i)}</span> ${escapeHtml(s.navLabel)}</a></li>`,
      )
      .join(""),
    `</ul></nav></header>`,
  ].join("");

export type RenderOptions = {
  /** Stylesheet inlined in a `<style>` tag. */
  readonly css: string;
};

export const renderPage = (page: Page, options: RenderOptions): string =>
  [
    `<!doctype html>`,
    `<html lang="${escapeHtml(page.lang)}">`,
    `<head>`,
    `<meta charset="utf-8">`,
    `<meta name="viewport" content="width=device-width, initial-scale=1">`,
    `<title>${escapeHtml(page.title)}</title>`,
    `<meta name="description" content="${escapeHtml(page.description)}">`,
    `<style>${options.css}</style>`,
    `</head>`,
    `<body>`,
    renderNav(page),
    `<main class="main">`,
    renderHero(page.hero),
    page.sections.map(renderSection).join("\n"),
    `</main>`,
    `<footer class="footer"><p>${renderText(page.footer)}</p></footer>`,
    `</body>`,
    `</html>`,
    ``,
  ].join("\n");
