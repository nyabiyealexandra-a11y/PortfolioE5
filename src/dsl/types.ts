/**
 * The content model of the site.
 *
 * Every piece of content is a plain, immutable object tagged with a `kind`.
 * Content authors never build these objects by hand: they use the builder
 * functions in `builders.ts`, which are the actual "words" of the DSL.
 * The renderer (`render.ts`) turns this tree into HTML.
 */

// ---------------------------------------------------------------------------
// Inline content — what can appear inside a sentence.
// ---------------------------------------------------------------------------

export type Strong = { readonly kind: "strong"; readonly text: string };
export type Emphasis = { readonly kind: "em"; readonly text: string };
export type Link = {
  readonly kind: "link";
  readonly label: string;
  readonly href: string;
  /** Opens in a new tab. Defaults to true for absolute http(s) URLs. */
  readonly external: boolean;
};

/**
 * Information still missing. Rendered as a visible "À compléter" marker,
 * and counted by the build so nothing is forgotten before the exam.
 */
export type Todo = { readonly kind: "todo"; readonly what: string };

export type Inline = string | Strong | Emphasis | Link | Todo;

/** A run of text: either a plain string or a sequence of inline nodes. */
export type RichText = string | readonly Inline[];

// ---------------------------------------------------------------------------
// Blocks — the building bricks of a section.
// ---------------------------------------------------------------------------

export type Paragraph = { readonly kind: "paragraph"; readonly text: RichText };

export type List = { readonly kind: "list"; readonly items: readonly RichText[] };

export type TimelineEntry = {
  readonly period: string;
  readonly title: string;
  readonly detail?: string;
};
export type Timeline = { readonly kind: "timeline"; readonly entries: readonly TimelineEntry[] };

export type Tags = { readonly kind: "tags"; readonly labels: readonly string[] };

export type Fact = { readonly term: string; readonly value: RichText };
export type Facts = { readonly kind: "facts"; readonly items: readonly Fact[] };

export type Note = { readonly kind: "note"; readonly text: RichText };

export type Actions = { readonly kind: "actions"; readonly links: readonly Link[] };

export type Card = {
  readonly kind: "card";
  /** Optional HTML id, so other parts of the page can link to this card (`#id`). */
  readonly id?: string;
  readonly title: string;
  /** Small uppercase label above the title (category, date…). */
  readonly label?: string;
  readonly blocks: readonly Block[];
};

export type GridColumns = 1 | 2 | 3;
export type Grid = {
  readonly kind: "grid";
  readonly columns: GridColumns;
  readonly cards: readonly Card[];
};

export type Figure = {
  readonly kind: "figure";
  /** Image path relative to `public/`, e.g. `images/organigramme.png`. */
  readonly src: string;
  /** Description of the image for screen readers and when it fails to load. */
  readonly alt: string;
  readonly caption?: string;
};

export type Block = Paragraph | List | Timeline | Tags | Facts | Note | Actions | Card | Grid | Figure;

// ---------------------------------------------------------------------------
// Page structure.
// ---------------------------------------------------------------------------

export type Section = {
  readonly kind: "section";
  /** HTML id, used as the anchor (`#id`). Lowercase letters, digits and dashes. */
  readonly id: string;
  /** Short label shown in the navigation bar. */
  readonly navLabel: string;
  readonly title: string;
  readonly lead?: RichText;
  readonly blocks: readonly Block[];
};

export type Hero = {
  readonly kind: "hero";
  readonly name: string;
  /** Small line above the name, e.g. the diploma. */
  readonly role: string;
  /** The big statement. */
  readonly headline: string;
  readonly intro: RichText;
  readonly actions: readonly Link[];
};

export type Page = {
  readonly kind: "page";
  readonly lang: string;
  /** `<title>` of the document. */
  readonly title: string;
  /** `<meta name="description">`. */
  readonly description: string;
  /** Text of the home link in the navigation bar. */
  readonly brand: string;
  readonly hero: Hero;
  readonly sections: readonly Section[];
  readonly footer: RichText;
};
