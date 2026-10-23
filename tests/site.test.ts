/**
 * Checks on the real content. If one of these fails after a content change,
 * read the message: it says what to fix.
 */
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { site } from "../src/content/site.ts";
import { articles } from "../src/content/sections/veille.ts";
import { renderPage } from "../src/dsl/render.ts";
import { validatePage } from "../src/dsl/validate.ts";

const publicDir = join(import.meta.dirname, "..", "public");

describe("site content", () => {
  it("is valid", () => {
    assert.deepEqual(validatePage(site, { fileExists: (path) => existsSync(join(publicDir, path)) }), []);
  });

  it("is in French", () => {
    assert.equal(site.lang, "fr");
  });

  it("renders every section", () => {
    const html = renderPage(site, { css: "" });
    for (const section of site.sections) {
      assert.match(html, new RegExp(`<section id="${section.id}"`), section.id);
    }
  });
});

// The mandatory elements of the "Guide E5" (see E5.md). Removing one of these sections breaks the exam.
describe("E5 requirements", () => {
  const ids = site.sections.map((s) => s.id);

  for (const [id, element] of [
    ["parcours", "01 Présentation personnelle"],
    ["entreprise", "02 Présentation de l'entreprise"],
    ["missions", "02 Missions réalisées"],
    ["cv", "03 CV à jour"],
    ["synthese", "04 Tableau de synthèse"],
    ["projets", "05 Projets et documentations"],
    ["veille", "06 Veille technologique"],
    ["competences", "07 Compétences acquises"],
    ["contact", "Contact / liens utiles"],
  ] as const) {
    it(`has a "${id}" section (${element})`, () => {
      assert.ok(ids.includes(id), `Missing section "${id}" required by the E5 guide: ${element}.`);
    });
  }

  it("lists between 10 and 15 watch articles", () => {
    assert.ok(
      articles.length >= 10 && articles.length <= 15,
      `The guide asks for 10 to 15 articles, found ${articles.length}.`,
    );
  });
});
