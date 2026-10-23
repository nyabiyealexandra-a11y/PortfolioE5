const ENTITIES: Readonly<Record<string, string>> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escapes a string so it is safe both as HTML text and inside a quoted attribute. */
export const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, (char) => ENTITIES[char] ?? char);
