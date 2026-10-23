import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { escapeHtml } from "../src/dsl/escape.ts";

describe("escapeHtml", () => {
  it("escapes the five HTML special characters", () => {
    assert.equal(
      escapeHtml(`<a href="x">Tom & Jerry's</a>`),
      "&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;",
    );
  });

  it("leaves accents and other text untouched", () => {
    assert.equal(escapeHtml("Économie — « IA »"), "Économie — « IA »");
  });
});
