import { paragraph, section, todo } from "../../dsl/index.ts";

// Guide E5 — élément obligatoire 03 : CV à jour, cohérent avec le parcours présenté à l'oral.
export const cv = section({
  id: "cv",
  navLabel: "CV",
  title: "Mon CV",
  lead: "Mon CV à jour, cohérent avec le parcours présenté ci-dessus.",
  blocks: [
    // TODO: put the CV in public/CV_Alexandra_Nyabiye.pdf, import `actions` and `link`,
    // then replace the line below with:
    // actions([link("Télécharger mon CV (PDF)", "CV_Alexandra_Nyabiye.pdf")]),
    paragraph([todo("CV à jour (PDF)")]),
  ],
});
