/**
 * The whole page. The order of `sections` is the order on screen and in the
 * navigation bar; section numbers (01, 02…) follow it automatically.
 * It follows the organisation suggested by the E5 guide (see E5.md).
 */
import { link, page, hero } from "../dsl/index.ts";
import { profile } from "./profile.ts";
import { competences } from "./sections/competences.ts";
import { contact } from "./sections/contact.ts";
import { cv } from "./sections/cv.ts";
import { entreprise } from "./sections/entreprise.ts";
import { missions } from "./sections/missions.ts";
import { parcours } from "./sections/parcours.ts";
import { projets } from "./sections/projets.ts";
import { synthese } from "./sections/synthese.ts";
import { veille } from "./sections/veille.ts";

export const site = page({
  lang: "fr",
  title: `${profile.name} — Portfolio ${profile.diploma}`,
  description: `Portfolio de ${profile.name}, étudiante en ${profile.diploma} : parcours, alternance, projets, compétences et veille technologique.`,
  brand: profile.shortName,
  hero: hero({
    name: profile.name,
    role: `Portfolio — ${profile.diploma} — Épreuve E5`,
    headline: "Je fais tourner vos postes et vos réseaux, sans que vous y pensiez.",
    intro:
      "Étudiante en 2e année de BTS SIO option SISR et apprentie technicienne support informatique. Je construis, dépanne et sécurise des infrastructures systèmes et réseaux.",
    actions: [link("Voir mes projets", "#projets"), link("Me contacter", "#contact")],
  }),
  sections: [parcours, entreprise, missions, projets, competences, synthese, veille, cv, contact],
  footer: `© ${new Date().getFullYear()} ${profile.name} — Portfolio ${profile.diploma} — Épreuve E5. Aucune donnée confidentielle d'entreprise n'est publiée sur ce site.`,
});
