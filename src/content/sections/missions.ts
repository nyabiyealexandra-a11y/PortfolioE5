import { card, facts, paragraph, rows, section, tags, todo, type Card, type RichText } from "../../dsl/index.ts";

// Guide E5 — missions en entreprise (rôle, objectifs, outils, résultats) et compétences mobilisées.

type Mission = {
  id: string;
  title: string;
  role: RichText;
  goal: RichText;
  tools: readonly string[];
  results: RichText;
};

/** One row per mission, all visible: the role reads as the lead sentence, then objective and results. */
const mission = (m: Mission, index: number): Card =>
  card({
    id: m.id,
    label: String(index + 1).padStart(2, "0"),
    title: m.title,
    blocks: [
      paragraph(m.role),
      facts([
        { term: "Objectif", value: m.goal },
        { term: "Résultats", value: m.results },
      ]),
      tags(m.tools),
    ],
  });

const missionList: readonly Mission[] = [
  {
    id: "mission-assistance",
    title: "Assistance aux utilisateurs",
    role: "Prendre en charge les demandes des agents, les qualifier et les suivre jusqu'à leur résolution.",
    goal: "Permettre aux agents de travailler sans interruption.",
    tools: ["Outil de ticketing", "Prise en main à distance"],
    results: [todo("volume de demandes traitées, délai moyen, retours des agents")],
  },
  {
    id: "mission-depannage",
    title: "Diagnostic et dépannage",
    role: "Identifier l'origine des incidents matériels et logiciels et les corriger.",
    goal: "Rétablir rapidement le service et éviter que l'incident se reproduise.",
    tools: ["Windows", "Active Directory"],
    results: [todo("exemple d'incident résolu et ce qu'il a permis")],
  },
  {
    id: "mission-postes",
    title: "Installation de postes de travail",
    role: "Préparer, installer et configurer les postes des agents.",
    goal: "Fournir des postes prêts à l'emploi et conformes.",
    tools: ["Windows", "Masterisation"],
    results: [todo("nombre de postes déployés, gain de temps")],
  },
];

export const missions = section({
  id: "missions",
  navLabel: "Missions",
  title: "Mes missions",
  lead: "Ce que je fais au quotidien en alternance, et ce que cela m'apporte.",
  blocks: [
    rows([
      ...missionList.map(mission),
      card({
        label: "En résumé",
        title: "Compétences mobilisées",
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
      card({
        label: "Avant l'alternance",
        title: "Stage — Mairie du 12e arrondissement de Paris",
        blocks: [paragraph("Mai – juin 2026."), paragraph([todo("ce que j'ai fait pendant ce stage")])],
      }),
    ]),
  ],
});
