import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  actions,
  card,
  em,
  facts,
  figure,
  grid,
  link,
  list,
  note,
  paragraph,
  rows,
  strong,
  tags,
  timeline,
  todo,
} from "../src/dsl/index.ts";
import { countTodos, renderBlock, renderPage, renderSection, renderText, sectionNumber } from "../src/dsl/render.ts";
import { makePage, makeSection } from "./helpers.ts";

describe("renderText", () => {
  it("escapes plain strings", () => {
    assert.equal(renderText("a < b & c"), "a &lt; b &amp; c");
  });

  it("renders inline nodes in order", () => {
    assert.equal(
      renderText(["Voir ", strong("ceci"), ", ", em("cela"), " et ", link("ici", "#x")]),
      `Voir <strong>ceci</strong>, <em>cela</em> et <a href="#x">ici</a>`,
    );
  });

  it("opens external links in a new tab, safely", () => {
    assert.equal(
      renderText([link("GitHub", "https://github.com")]),
      `<a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>`,
    );
  });

  it("renders a todo as a visible marker", () => {
    assert.equal(renderText([todo("effectif")]), `<mark class="todo">À compléter : effectif</mark>`);
  });

  it("escapes link targets", () => {
    assert.equal(renderText([link("x", `#a"onclick="b`)]), `<a href="#a&quot;onclick=&quot;b">x</a>`);
  });
});

describe("renderBlock", () => {
  it("renders a paragraph", () => {
    assert.equal(renderBlock(paragraph("Bonjour")), "<p>Bonjour</p>");
  });

  it("renders a list", () => {
    assert.equal(renderBlock(list(["un", "deux"])), `<ul class="list"><li>un</li><li>deux</li></ul>`);
  });

  it("renders a timeline, with an optional detail", () => {
    const html = renderBlock(
      timeline([
        { period: "2025", title: "BTS" },
        { period: "2026", title: "Stage", detail: "Mairie" },
      ]),
    );
    assert.equal((html.match(/<li>/g) ?? []).length, 2);
    assert.equal((html.match(/timeline__detail/g) ?? []).length, 1);
    assert.ok(html.startsWith(`<ol class="timeline">`));
  });

  it("renders tags", () => {
    assert.equal(renderBlock(tags(["IA", "C&C"])), `<ul class="tags"><li>IA</li><li>C&amp;C</li></ul>`);
  });

  it("renders facts as a definition list", () => {
    assert.equal(
      renderBlock(facts([{ term: "Rôle", value: "Support" }])),
      `<dl class="facts"><div><dt>Rôle</dt><dd>Support</dd></div></dl>`,
    );
  });

  it("renders a note", () => {
    assert.equal(renderBlock(note("Attention")), `<p class="note">Attention</p>`);
  });

  it("renders actions as buttons", () => {
    assert.equal(
      renderBlock(actions([link("CV", "cv.pdf")])),
      `<p class="actions"><a href="cv.pdf" class="button">CV</a></p>`,
    );
  });

  it("renders a card with and without label", () => {
    assert.equal(
      renderBlock(card({ title: "T", blocks: [] })),
      `<article class="card"><h3 class="card__title">T</h3></article>`,
    );
    assert.match(renderBlock(card({ title: "T", label: "L", blocks: [] })), /<p class="card__label">L<\/p><h3/);
  });

  it("renders the id of a card", () => {
    assert.match(
      renderBlock(card({ id: "projet-ad", title: "T", blocks: [] })),
      /^<article class="card" id="projet-ad">/,
    );
  });

  it("renders the details of a card in a closed disclosure, after its blocks", () => {
    assert.equal(
      renderBlock(card({ title: "T", blocks: [paragraph("résumé")], details: [paragraph("détail")] })),
      `<article class="card"><h3 class="card__title">T</h3><p>résumé</p><details class="card__details"><summary>Voir le détail</summary><div class="card__more"><p>détail</p></div></details></article>`,
    );
  });

  it("renders no disclosure for a card without details", () => {
    assert.doesNotMatch(renderBlock(card({ title: "T", blocks: [], details: [] })), /<details/);
  });

  it("renders the cards of a rows block", () => {
    const html = renderBlock(rows([card({ title: "A", blocks: [] }), card({ title: "B", blocks: [] })]));
    assert.ok(html.startsWith(`<div class="rows">`));
    assert.equal((html.match(/<article/g) ?? []).length, 2);
  });

  it("renders a figure, with an optional caption", () => {
    assert.equal(
      renderBlock(figure({ src: "images/a.png", alt: 'Schéma "réseau"' })),
      `<figure class="figure"><img src="images/a.png" alt="Schéma &quot;réseau&quot;" loading="lazy"></figure>`,
    );
    assert.match(
      renderBlock(figure({ src: "a.png", alt: "A", caption: "Légende" })),
      /<figcaption>Légende<\/figcaption><\/figure>$/,
    );
  });

  it("renders a grid with its column count", () => {
    const html = renderBlock(grid(3, [card({ title: "A", blocks: [] }), card({ title: "B", blocks: [] })]));
    assert.ok(html.startsWith(`<div class="grid grid--3">`));
    assert.equal((html.match(/<article/g) ?? []).length, 2);
  });
});

describe("countTodos", () => {
  it("counts the markers of a rendered page", () => {
    assert.equal(countTodos(renderText(["a", todo("x"), todo("y")])), 2);
    assert.equal(countTodos("<p>rien</p>"), 0);
  });
});

describe("sectionNumber", () => {
  it("pads to two digits starting from 01", () => {
    assert.equal(sectionNumber(0), "01");
    assert.equal(sectionNumber(9), "10");
  });
});

describe("renderSection", () => {
  it("links the section to its title and shows its number", () => {
    const html = renderSection(makeSection({ id: "veille", title: "Veille" }), 2);
    assert.match(html, /<section id="veille" class="section" aria-labelledby="veille-title">/);
    assert.match(html, /<p class="section__number">03<\/p>/);
    assert.match(html, /<h2 class="section__title" id="veille-title">Veille<\/h2>/);
  });

  it("omits the lead when there is none", () => {
    assert.doesNotMatch(renderSection(makeSection(), 0), /section__lead/);
    assert.match(renderSection(makeSection({ lead: "Intro" }), 0), /<p class="section__lead">Intro<\/p>/);
  });
});

describe("renderPage", () => {
  const html = renderPage(
    makePage({
      title: "Portfolio <A>",
      sections: [makeSection({ id: "a", navLabel: "Alpha" }), makeSection({ id: "b", navLabel: "Beta" })],
    }),
    { css: "body{color:red}" },
  );

  it("produces a complete document", () => {
    assert.ok(html.startsWith('<!doctype html>\n<html lang="fr">'));
    assert.match(html, /<title>Portfolio &lt;A&gt;<\/title>/);
    assert.match(html, /<style>body\{color:red\}<\/style>/);
    assert.match(html, /<h1 class="hero__name">Alexandra<\/h1>/);
  });

  it("builds the navigation from the sections, in order", () => {
    assert.match(html, /<a href="#a"><span>01<\/span> Alpha<\/a>.*<a href="#b"><span>02<\/span> Beta<\/a>/s);
  });

  it("contains no script", () => {
    assert.doesNotMatch(html, /<script/i);
  });
});
