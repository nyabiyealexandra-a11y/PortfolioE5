import { card, paragraph, section, timeline } from "../../dsl/index.ts";

// Guide E5 — élément obligatoire 01 : présentation personnelle (parcours, profil, formation, projet professionnel).
export const parcours = section({
  id: "parcours",
  navLabel: "Parcours",
  title: "Présentation & parcours",
  lead: "D'une formation scientifique à l'administration des systèmes et réseaux.",
  blocks: [
    paragraph(
      "Étudiante en 2e année de BTS SIO option SISR (Solutions d'infrastructure, systèmes et réseaux) au lycée Robert Schuman, en alternance au Ministère de l'Économie et des Finances.",
    ),
    timeline([
      { period: "2023 – 2024", title: "Baccalauréat général", detail: "Lycée Colbert" },
      {
        period: "2024 – 2025",
        title: "Licence PCSTI",
        detail: "Maths, physique, chimie, anglais — Université Paris Cergy",
      },
      { period: "2025 – en cours", title: "BTS SIO option SISR", detail: "Lycée Robert Schuman, Dugny" },
      {
        period: "2026 – 2027",
        title: "Alternance en support informatique",
        detail: "Ministère de l'Économie et des Finances",
      },
    ]),
    card({
      title: "Projet professionnel",
      blocks: [
        paragraph(
          "Poursuivre en bachelor systèmes et réseaux, en alternance, pour évoluer vers l'administration d'infrastructures et la cybersécurité. Mon parcours scientifique m'apporte de la rigueur ; l'engagement associatif, le sens du service et de la pédagogie.",
        ),
      ],
    }),
  ],
});
