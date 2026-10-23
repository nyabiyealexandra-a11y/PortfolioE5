import { card, facts, grid, note, paragraph, section, todo } from "../../dsl/index.ts";

// Guide E5 — élément obligatoire 02 : présentation de l'entreprise (activité, localisation, effectif,
// service, organigramme, environnement technique si pertinent).
export const entreprise = section({
  id: "entreprise",
  navLabel: "Entreprise",
  title: "Mon entreprise",
  lead: "Alternance au Contrôle général économique et financier (CGEFI).",
  blocks: [
    grid(2, [
      card({
        label: "L'organisation",
        title: "CGEFI — Ministère de l'Économie et des Finances",
        blocks: [
          paragraph(
            "Le Contrôle général économique et financier est un service du Ministère de l'Économie et des Finances. Il contrôle plus de 400 entreprises et organismes publics, répartis en missions sectorielles, pour le compte des ministres chargés de l'économie et du budget.",
          ),
          facts([
            { term: "Localisation", value: [todo("ville / site")] },
            { term: "Effectif", value: [todo("nombre d'agents")] },
          ]),
        ],
      }),
      card({
        label: "Mon service",
        title: "Le support informatique",
        blocks: [
          paragraph("J'assure le support informatique des agents du service."),
          facts([
            { term: "Équipe", value: [todo("taille et organisation de l'équipe informatique")] },
            { term: "Parc", value: [todo("nombre de postes, grands types d'outils (sans nom d'outil interne)")] },
          ]),
        ],
      }),
    ]),
    // TODO: put the chart in public/images/organigramme.png (no names), add `figure` to the
    // import above, then replace the paragraph below with:
    // figure({ src: "images/organigramme.png", alt: "Organigramme du CGEFI, avec ma position dans le service informatique", caption: "Organigramme simplifié et ma position" }),
    paragraph([todo("organigramme simplifié indiquant ma position")]),
    note(
      "Aucune donnée sensible n'est publiée : l'organisation et les missions sont décrites de façon générale, sans nom de personne, nom d'outil interne ni information d'architecture.",
    ),
  ],
});
