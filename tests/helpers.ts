import { hero, page, paragraph, section, type Page, type Section } from "../src/dsl/index.ts";

/** A minimal valid section; override any field. */
export const makeSection = (overrides: Partial<Omit<Section, "kind">> = {}): Section =>
  section({ id: "demo", navLabel: "Démo", title: "Démo", blocks: [paragraph("Bonjour")], ...overrides });

/** A minimal valid page; override any field. */
export const makePage = (overrides: Partial<Omit<Page, "kind">> = {}): Page =>
  page({
    lang: "fr",
    title: "Titre",
    description: "Description",
    brand: "A. N.",
    hero: hero({ name: "Alexandra", role: "BTS SIO", headline: "Accroche", intro: "Intro", actions: [] }),
    sections: [makeSection()],
    footer: "Pied de page",
    ...overrides,
  });
