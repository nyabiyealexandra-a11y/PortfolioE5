/**
 * Checks that catch content mistakes the type system cannot see:
 * duplicated anchors, broken internal links, missing files, unsafe URLs…
 *
 * `validatePage` never throws; it returns the list of problems so that the
 * build can print all of them at once and the tests can assert on them.
 */
import type { Block, Link, Page, RichText } from "./types.ts";

export const HERO_ID = "accueil";

const ID_PATTERN = /^[a-z][a-z0-9-]*$/;
const ALLOWED_SCHEMES = ["https:", "http:", "mailto:", "tel:"];

export type ValidateOptions = {
  /**
   * Tells whether a site-relative file (e.g. `cv.pdf`) exists in `public/`.
   * When omitted, links and images to files are not checked.
   */
  readonly fileExists?: (path: string) => boolean;
};

/** Every block of the page, including the ones nested in cards and grids. */
export const collectBlocks = (page: Page): Block[] => {
  const walk = (block: Block): Block[] => {
    if (block.kind === "card") return [block, ...block.blocks.flatMap(walk)];
    if (block.kind === "grid") return [block, ...block.cards.flatMap(walk)];
    return [block];
  };
  return page.sections.flatMap((section) => section.blocks.flatMap(walk));
};

const linksInText = (text: RichText): Link[] =>
  typeof text === "string"
    ? []
    : text.flatMap((node) => (typeof node === "object" && node.kind === "link" ? [node] : []));

/** Links held directly by a block (nested blocks are reached by `collectBlocks`). */
const linksInBlock = (block: Block): Link[] => {
  switch (block.kind) {
    case "paragraph":
    case "note":
      return linksInText(block.text);
    case "list":
      return block.items.flatMap(linksInText);
    case "facts":
      return block.items.flatMap((item) => linksInText(item.value));
    case "actions":
      return [...block.links];
    case "card":
    case "grid":
    case "timeline":
    case "tags":
    case "figure":
      return [];
  }
};

/** Every link of the page, wherever it is nested. */
export const collectLinks = (page: Page): Link[] => [
  ...linksInText(page.hero.intro),
  ...page.hero.actions,
  ...page.sections.flatMap((s) => (s.lead === undefined ? [] : linksInText(s.lead))),
  ...collectBlocks(page).flatMap(linksInBlock),
  ...linksInText(page.footer),
];

/** Checks a path to a file of `public/`; returns an error or undefined. */
const checkFile = (path: string, what: string, options: ValidateOptions): string | undefined => {
  if (path.startsWith("/") || path.startsWith("..")) {
    return `${what} must be relative to public/ (write "cv.pdf", not "${path}").`;
  }
  if (options.fileExists !== undefined && !options.fileExists(path)) {
    return `${what} points to "${path}", but public/${path} does not exist.`;
  }
  return undefined;
};

const checkLink = (link: Link, anchors: ReadonlySet<string>, options: ValidateOptions): string | undefined => {
  const { href, label } = link;
  if (label.trim() === "") return `Link to "${href}" has an empty label.`;
  if (href.trim() === "") return `Link "${label}" has an empty href.`;

  if (href.startsWith("#")) {
    return anchors.has(href.slice(1))
      ? undefined
      : `Link "${label}" points to "${href}", which is not a section or card id.`;
  }

  const scheme = /^([a-z][a-z0-9+.-]*:)/i.exec(href)?.[1]?.toLowerCase();
  if (scheme !== undefined) {
    return ALLOWED_SCHEMES.includes(scheme) ? undefined : `Link "${label}" uses the forbidden scheme "${scheme}".`;
  }

  return checkFile(href, `Link "${label}"`, options);
};

export const validatePage = (page: Page, options: ValidateOptions = {}): string[] => {
  const errors: string[] = [];
  const anchors = new Set<string>([HERO_ID]);

  const addAnchor = (id: string, owner: string): void => {
    if (!ID_PATTERN.test(id)) {
      errors.push(`${owner} id "${id}" is invalid: use lowercase letters, digits and dashes, starting with a letter.`);
    }
    if (anchors.has(id)) errors.push(`${owner} id "${id}" is used more than once (or is reserved).`);
    anchors.add(id);
  };

  if (page.title.trim() === "") errors.push("The page title is empty.");
  if (page.description.trim() === "") errors.push("The page description is empty.");
  if (page.sections.length === 0) errors.push("The page has no section.");

  for (const section of page.sections) {
    addAnchor(section.id, "Section");
    if (section.title.trim() === "") errors.push(`Section "${section.id}" has an empty title.`);
    if (section.navLabel.trim() === "") errors.push(`Section "${section.id}" has an empty navLabel.`);
    if (section.blocks.length === 0) errors.push(`Section "${section.id}" has no block.`);
  }

  const blocks = collectBlocks(page);
  for (const block of blocks) {
    if (block.kind === "card" && block.id !== undefined) addAnchor(block.id, "Card");
    if (block.kind === "figure") {
      if (block.alt.trim() === "") errors.push(`Image "${block.src}" has an empty alt text.`);
      const error = checkFile(block.src, "Image", options);
      if (error !== undefined) errors.push(error);
    }
  }

  // Links are checked once every anchor is known, so a link may point further down the page.
  for (const link of collectLinks(page)) {
    const error = checkLink(link, anchors, options);
    if (error !== undefined) errors.push(error);
  }

  return errors;
};
