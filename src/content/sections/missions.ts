import {
  card,
  facts,
  grid,
  paragraph,
  section,
  strong,
  tags,
  todo,
  type Card,
  type RichText,
} from "../../dsl/index.ts";

// Guide E5 — missions en entreprise (rôle, objectifs, outils, résultats) et compétences mobilisées.

type Mission = {
  id: string;
  title: string;
  role: RichText;
  goal: RichText;
  tools: readonly string[];
  results: RichText;
};

const mission = (m: Mission): Card =>
  card({
    id: m.id,
    label: "Mission",
    title: m.title,
    blocks: [
      facts([
        { term: "Mon rôle", value: m.role },
        { term: "Objectif", value: m.goal },
        { term: "Résultats", value: m.results },
      ]),
      tags(m.tools),
    ],
  });

export const missions = section({
  id: "missions",
  navLabel: "Missions",
  title: "Mes missions",
  lead: "Ce que je fais au quotidien en alternance, et ce que cela m'apporte.",
  blocks: [
    grid(3, [
      mission({
        id: "mission-assistance",
        title: "Assistance aux utilisateurs",
        role: "Prendre en charge les demandes des agents, les qualifier et les suivre jusqu'à leur résolution.",
        goal: "Permettre aux agents de travailler sans interruption.",
        tools: ["Outil de ticketing", "Prise en main à distance"],
        results: [todo("volume de demandes traitées, délai moyen, retours des agents")],
      }),
      mission({
        id: "mission-depannage",
        title: "Diagnostic et dépannage",
        role: "Identifier l'origine des incidents matériels et logiciels et les corriger.",
        goal: "Rétablir rapidement le service et éviter que l'incident se reproduise.",
        tools: ["Windows", "Active Directory"],
        results: [todo("exemple d'incident résolu et ce qu'il a permis")],
      }),
      mission({
        id: "mission-postes",
        title: "Installation de postes de travail",
        role: "Préparer, installer et configurer les postes des agents.",
        goal: "Fournir des postes prêts à l'emploi et conformes.",
        tools: ["Windows", "Masterisation"],
        results: [todo("nombre de postes déployés, gain de temps")],
      }),
    ]),
    card({
      title: "Compétences mobilisées en entreprise",
      blocks: [
        tags([
          "Support de proximité",
          "Gestion d'incidents",
          "Active Directory",
          "Maintenance du parc",
          "Documentation",
        ]),
        paragraph([
          todo("une compétence professionnelle (communication, autonomie…) illustrée par une situation réelle"),
        ]),
      ],
    }),
    paragraph([strong("Stage antérieur : "), "Mairie du 12e arrondissement de Paris (mai – juin 2026)."]),
  ],
});
