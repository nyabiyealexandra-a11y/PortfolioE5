import { paragraph, section, todo } from "../../dsl/index.ts";

// Guide E5 — élément obligatoire 04 : tableau de synthèse à jour.
export const synthese = section({
  id: "synthese",
  navLabel: "Synthèse E5",
  title: "Tableau de synthèse",
  lead: "Les situations professionnelles présentées à l'épreuve E5 et les compétences correspondantes.",
  blocks: [
    paragraph(
      "Le tableau recense, pour chaque réalisation, le contexte, les compétences du référentiel mobilisées et les documents associés.",
    ),
    // TODO: put the PDF in public/tableau-synthese-E5.pdf, import `actions` and `link`,
    // then replace the line below with:
    // actions([link("Télécharger le tableau (PDF)", "tableau-synthese-E5.pdf")]),
    paragraph([todo("tableau de synthèse à jour (PDF)")]),
  ],
});
