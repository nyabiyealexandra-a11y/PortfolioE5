import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { card, grid, link, paragraph, section } from "../src/dsl/index.ts";

describe("link", () => {
  it("is external by default for http(s) URLs", () => {
    assert.equal(link("GitHub", "https://github.com").external, true);
    assert.equal(link("Site", "http://example.com").external, true);
  });

  it("is internal by default for anchors, files and mailto", () => {
    assert.equal(link("Projets", "#projets").external, false);
    assert.equal(link("CV", "cv.pdf").external, false);
    assert.equal(link("Mail", "mailto:a@b.c").external, false);
  });

  it("lets the author force the behaviour", () => {
    assert.equal(link("CV", "cv.pdf", { external: true }).external, true);
  });
});

describe("structure builders", () => {
  it("tag every node with its kind", () => {
    const s = section({
      id: "demo",
      navLabel: "Démo",
      title: "Démo",
      blocks: [grid(2, [card({ title: "A", blocks: [paragraph("texte")] })])],
    });
    assert.equal(s.kind, "section");
    assert.deepEqual(s.blocks[0], {
      kind: "grid",
      columns: 2,
      cards: [{ kind: "card", title: "A", blocks: [{ kind: "paragraph", text: "texte" }] }],
    });
  });
});
