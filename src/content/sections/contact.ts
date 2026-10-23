import { facts, link, section } from "../../dsl/index.ts";
import { profile } from "../profile.ts";

export const contact = section({
  id: "contact",
  navLabel: "Contact",
  title: "Contact & liens",
  lead: "Une question, une opportunité d'alternance ? Écrivez-moi.",
  blocks: [
    facts([
      { term: "E-mail", value: [link(profile.email, `mailto:${profile.email}`)] },
      { term: "LinkedIn", value: [link("Voir le profil", profile.linkedin)] },
      { term: "GitHub", value: [link("Voir les dépôts", profile.github)] },
    ]),
  ],
});
