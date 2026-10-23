/**
 * The DSL: one small function per kind of content.
 *
 * Content files import from `src/dsl/index.ts` and compose these functions:
 *
 *   section({
 *     id: "veille",
 *     navLabel: "Veille",
 *     title: "Veille technologique",
 *     blocks: [paragraph("…"), tags(["IA", "lidar"])],
 *   });
 *
 * Builders only assemble data; checks live in `validate.ts`.
 */
import type {
  Actions,
  Block,
  Card,
  Emphasis,
  Fact,
  Facts,
  Figure,
  Grid,
  GridColumns,
  Hero,
  Link,
  List,
  Note,
  Page,
  Paragraph,
  RichText,
  Rows,
  Section,
  Strong,
  Tags,
  Timeline,
  TimelineEntry,
  Todo,
} from "./types.ts";

// --- Inline ----------------------------------------------------------------

export const strong = (text: string): Strong => ({ kind: "strong", text });

export const em = (text: string): Emphasis => ({ kind: "em", text });

export const link = (label: string, href: string, options: { external?: boolean } = {}): Link => ({
  kind: "link",
  label,
  href,
  external: options.external ?? /^https?:\/\//.test(href),
});

/** Marks information that is still missing: `todo("nombre d'employés")`. */
export const todo = (what: string): Todo => ({ kind: "todo", what });

// --- Blocks ----------------------------------------------------------------

export const paragraph = (text: RichText): Paragraph => ({ kind: "paragraph", text });

export const list = (items: readonly RichText[]): List => ({ kind: "list", items });

export const timeline = (entries: readonly TimelineEntry[]): Timeline => ({ kind: "timeline", entries });

export const tags = (labels: readonly string[]): Tags => ({ kind: "tags", labels });

export const facts = (items: readonly Fact[]): Facts => ({ kind: "facts", items });

export const note = (text: RichText): Note => ({ kind: "note", text });

export const actions = (links: readonly Link[]): Actions => ({ kind: "actions", links });

export const card = (props: {
  id?: string;
  title: string;
  label?: string;
  blocks: readonly Block[];
  details?: readonly Block[];
}): Card => ({ kind: "card", ...props });

export const grid = (columns: GridColumns, cards: readonly Card[]): Grid => ({ kind: "grid", columns, cards });

export const rows = (cards: readonly Card[]): Rows => ({ kind: "rows", cards });

export const figure = (props: { src: string; alt: string; caption?: string }): Figure => ({ kind: "figure", ...props });

// --- Structure -------------------------------------------------------------

export const section = (props: Omit<Section, "kind">): Section => ({ kind: "section", ...props });

export const hero = (props: Omit<Hero, "kind">): Hero => ({ kind: "hero", ...props });

export const page = (props: Omit<Page, "kind">): Page => ({ kind: "page", ...props });
