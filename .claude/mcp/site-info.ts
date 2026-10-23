/**
 * Prints a compact view of the real content, so an agent can find what to edit
 * without reading every file in src/content/.
 *
 *   node site-info.ts outline   sections, their cards and anchors, todo count
 *   node site-info.ts todos     every todo("…") still on the page, by section and card
 *
 * The MCP server runs it in a fresh process on each call so it always sees the latest content.
 */
import { site } from "../../src/content/site.ts";
import type { Block, Inline, RichText, Section } from "../../src/dsl/index.ts";

const inlines = (text: RichText | undefined): readonly Inline[] =>
  text === undefined ? [] : typeof text === "string" ? [text] : text;

const textsOf = (block: Block): readonly RichText[] => {
  switch (block.kind) {
    case "paragraph":
    case "note":
      return [block.text];
    case "list":
      return block.items;
    case "facts":
      return block.items.map((item) => item.value);
    case "card":
      return block.blocks.flatMap(textsOf);
    case "grid":
      return block.cards.flatMap(textsOf);
    case "timeline":
    case "tags":
    case "actions":
    case "figure":
      return [];
  }
};

const todosIn = (texts: readonly RichText[]): readonly string[] =>
  texts
    .flatMap(inlines)
    .flatMap((inline) => (typeof inline !== "string" && inline.kind === "todo" ? [inline.what] : []));

/** The section's own blocks first (card: undefined), then each card, wherever it is nested. */
const parts = (section: Section): readonly { card?: string; texts: readonly RichText[] }[] => {
  const own: RichText[] = [section.lead ?? ""];
  const cards: { card: string; texts: readonly RichText[] }[] = [];
  const visit = (block: Block): void => {
    if (block.kind === "card") cards.push({ card: block.id ?? block.title, texts: block.blocks.flatMap(textsOf) });
    else if (block.kind === "grid") block.cards.forEach(visit);
    else own.push(...textsOf(block));
  };
  section.blocks.forEach(visit);
  return [{ texts: own }, ...cards];
};

const outline = (): string =>
  site.sections
    .map((section, index) => {
      const number = String(index + 1).padStart(2, "0");
      const count = parts(section).reduce((sum, part) => sum + todosIn(part.texts).length, 0);
      const cards = parts(section).flatMap((part) => (part.card === undefined ? [] : [`   - ${part.card}`]));
      return [`${number} #${section.id}  ${section.title}${count > 0 ? `  (${count} todo)` : ""}`, ...cards].join("\n");
    })
    .join("\n");

const todos = (): string => {
  const lines = site.sections.flatMap((section) =>
    parts(section).flatMap((part) =>
      todosIn(part.texts).map((what) => `#${section.id}${part.card === undefined ? "" : ` › ${part.card}`}: ${what}`),
    ),
  );
  return lines.length > 0 ? `${lines.length} todo left\n${lines.join("\n")}` : "No todo left.";
};

console.log(process.argv[2] === "todos" ? todos() : outline());
