import {
  card,
  em,
  grid,
  link,
  list,
  paragraph,
  section,
  strong,
  tags,
  todo,
  type Inline,
  type RichText,
} from "../../dsl/index.ts";

// Guide E5 — élément obligatoire 06 : sujet, méthode, sources, et 10 à 15 articles.

type Theme = "Technologie" | "IA" | "Marché" | "Réglementation" | "Cybersécurité";

/** One article of the watch. Leave source/date/url out until known: a marker shows instead. */
export type Article = {
  title: string;
  theme: Theme;
  source?: string;
  /** ISO date, e.g. "2026-09-03". */
  date?: string;
  url?: string;
};

// TODO: replace each entry with a real article you read (title, source, date, link).
export const articles: readonly Article[] = [
  { title: "Niveaux d'autonomie SAE de 0 à 5", theme: "Technologie" },
  { title: "Capteurs : caméras, radars et lidar", theme: "Technologie" },
  { title: "Réseaux de neurones et perception de la route", theme: "IA" },
  { title: "Apprentissage par renforcement en conduite", theme: "IA" },
  { title: "Robotaxis : déploiements en ville", theme: "Marché" },
  { title: "Règlement européen sur l'IA et véhicules", theme: "Réglementation" },
  { title: "Responsabilité en cas d'accident", theme: "Réglementation" },
  { title: "Cyberattaques sur véhicules connectés", theme: "Cybersécurité" },
  { title: "Mises à jour à distance (OTA)", theme: "Cybersécurité" },
  { title: "Données collectées et vie privée", theme: "Réglementation" },
  { title: "Cartographie haute définition", theme: "Technologie" },
  { title: "Impact sur la sécurité routière", theme: "Marché" },
];

const articleItem = (a: Article): RichText => {
  const details: Inline[] =
    a.source === undefined || a.date === undefined || a.url === undefined
      ? [todo("source, date et lien")]
      : [`${a.source}, ${a.date} — `, link("lire l'article", a.url)];
  return [strong(a.title), ` (${a.theme}) — `, ...details];
};

export const veille = section({
  id: "veille",
  navLabel: "Veille",
  title: "Veille technologique",
  lead: [
    "Sujet : ",
    em("« L'évolution des voitures autonomes : comment l'intelligence artificielle transforme-t-elle la conduite ? »"),
  ],
  blocks: [
    card({
      title: "Pourquoi ce sujet",
      blocks: [paragraph([todo("pourquoi j'ai choisi ce sujet et son lien avec l'informatique / la cybersécurité")])],
    }),
    grid(3, [
      card({
        label: "Méthode",
        title: "Démarche",
        blocks: [
          paragraph("Définir les mots-clés, collecter, trier, analyser, synthétiser, puis diffuser chaque semaine."),
        ],
      }),
      card({
        label: "Sources",
        title: "Outils",
        blocks: [paragraph(["Agrégateur RSS, alertes Google, newsletters. ", todo("noms des sources suivies")])],
      }),
      card({
        label: "Rythme",
        title: "Fréquence",
        blocks: [paragraph("Une revue hebdomadaire, 10 à 15 articles retenus et datés.")],
      }),
    ]),
    tags(["Véhicule autonome", "IA", "Lidar", "Cybersécurité"]),
    card({
      label: "À retenir",
      title: "Élément marquant",
      blocks: [paragraph([todo("un article, une évolution ou une actualité récente, et pourquoi elle compte")])],
    }),
    paragraph(`Articles sélectionnés (${articles.length}) :`),
    list(articles.map(articleItem)),
  ],
});
