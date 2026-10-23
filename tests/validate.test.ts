import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { actions, card, figure, grid, hero, link, paragraph } from "../src/dsl/index.ts";
import { collectLinks, validatePage } from "../src/dsl/validate.ts";
import { makePage, makeSection } from "./helpers.ts";

const withLink = (href: string) => makePage({ sections: [makeSection({ blocks: [actions([link("Lien", href)])] })] });

describe("validatePage", () => {
  it("accepts a valid page", () => {
    assert.deepEqual(validatePage(makePage()), []);
  });

  it("rejects a page without sections", () => {
    assert.match(validatePage(makePage({ sections: [] })).join(), /no section/);
  });

  it("rejects duplicated section ids", () => {
    const errors = validatePage(makePage({ sections: [makeSection(), makeSection()] }));
    assert.match(errors.join(), /"demo" is used more than once/);
  });

  it("rejects the id reserved for the hero", () => {
    assert.match(validatePage(makePage({ sections: [makeSection({ id: "accueil" })] })).join(), /reserved/);
  });

  for (const id of ["Projets", "2-projets", "mes projets", "projets_e5", ""]) {
    it(`rejects the malformed id "${id}"`, () => {
      assert.match(validatePage(makePage({ sections: [makeSection({ id })] })).join(), /is invalid/);
    });
  }

  it("rejects empty titles, nav labels and sections", () => {
    const errors = validatePage(makePage({ sections: [makeSection({ title: " ", navLabel: "", blocks: [] })] }));
    assert.equal(errors.length, 3);
  });

  it("accepts anchors to sections and to the hero", () => {
    assert.deepEqual(validatePage(withLink("#demo")), []);
    assert.deepEqual(validatePage(withLink("#accueil")), []);
  });

  it("rejects anchors to unknown sections", () => {
    assert.match(validatePage(withLink("#nowhere")).join(), /not a section or card id/);
  });

  it("accepts http, https, mailto and tel URLs", () => {
    for (const href of ["https://a.fr", "http://a.fr", "mailto:a@b.fr", "tel:+33100000000"]) {
      assert.deepEqual(validatePage(withLink(href)), [], href);
    }
  });

  it("rejects javascript: and other schemes", () => {
    assert.match(validatePage(withLink("javascript:alert(1)")).join(), /forbidden scheme "javascript:"/);
    assert.match(validatePage(withLink("JavaScript:alert(1)")).join(), /forbidden scheme/);
    assert.match(validatePage(withLink("ftp://a.fr")).join(), /forbidden scheme/);
  });

  it("rejects absolute and parent paths", () => {
    assert.match(validatePage(withLink("/cv.pdf")).join(), /relative to public/);
    assert.match(validatePage(withLink("../cv.pdf")).join(), /relative to public/);
  });

  it("checks that linked files exist when asked to", () => {
    const fileExists = (path: string) => path === "cv.pdf";
    assert.deepEqual(validatePage(withLink("cv.pdf"), { fileExists }), []);
    assert.match(validatePage(withLink("absent.pdf"), { fileExists }).join(), /public\/absent.pdf does not exist/);
  });

  it("rejects empty labels and hrefs", () => {
    const page = makePage({ sections: [makeSection({ blocks: [actions([link("", "#demo"), link("Vide", "")])] })] });
    assert.equal(validatePage(page).length, 2);
  });
});

describe("validatePage — cards and images", () => {
  it("accepts links to the id of a nested card, even further down the page", () => {
    const page = makePage({
      sections: [
        makeSection({ id: "a", blocks: [actions([link("Voir", "#projet-ad")])] }),
        makeSection({ id: "b", blocks: [grid(2, [card({ id: "projet-ad", title: "AD", blocks: [] })])] }),
      ],
    });
    assert.deepEqual(validatePage(page), []);
  });

  it("rejects card ids that collide with a section id or are malformed", () => {
    const page = makePage({
      sections: [
        makeSection({
          blocks: [card({ id: "demo", title: "A", blocks: [] }), card({ id: "Bad id", title: "B", blocks: [] })],
        }),
      ],
    });
    const errors = validatePage(page).join();
    assert.match(errors, /Card id "demo" is used more than once/);
    assert.match(errors, /Card id "Bad id" is invalid/);
  });

  it("checks that images exist and have an alt text", () => {
    const fileExists = (path: string) => path === "images/ok.png";
    const withFigure = (src: string, alt: string) =>
      makePage({ sections: [makeSection({ blocks: [card({ title: "A", blocks: [figure({ src, alt })] })] })] });
    assert.deepEqual(validatePage(withFigure("images/ok.png", "Schéma"), { fileExists }), []);
    assert.match(
      validatePage(withFigure("images/absent.png", "Schéma"), { fileExists }).join(),
      /public\/images\/absent.png does not exist/,
    );
    assert.match(validatePage(withFigure("images/ok.png", " "), { fileExists }).join(), /empty alt text/);
    assert.match(validatePage(withFigure("/images/ok.png", "Schéma"), { fileExists }).join(), /relative to public/);
  });
});

describe("collectLinks", () => {
  it("finds links in the hero, sections, nested cards and footer", () => {
    const page = makePage({
      hero: hero({
        name: "A",
        role: "R",
        headline: "H",
        intro: [link("intro", "#a")],
        actions: [link("action", "#b")],
      }),
      sections: [makeSection({ lead: [link("lead", "#c")], blocks: [paragraph([link("body", "#d")])] })],
      footer: [link("footer", "#e")],
    });
    assert.deepEqual(
      collectLinks(page).map((l) => l.label),
      ["intro", "action", "lead", "body", "footer"],
    );
  });
});
