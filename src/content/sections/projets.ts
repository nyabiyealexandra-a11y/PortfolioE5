import {
  actions,
  card,
  facts,
  paragraph,
  rows,
  section,
  tags,
  todo,
  type Block,
  type Card,
  type Link,
  type RichText,
} from "../../dsl/index.ts";

// Guide E5 — élément obligatoire 05 : projets des deux années et leur documentation
// (cahier des charges, procédures, schémas, captures). Focus sur le projet de 2e année (HSP ou LPRS).

type Category = "Systèmes" | "Réseaux" | "Virtualisation" | "Sécurité";

type Project = {
  /** Anchor used by the skills section to link here: `#projet-…`. */
  id: string;
  title: string;
  category: Category;
  context: RichText;
  goal: RichText;
  role: RichText;
  results: RichText;
  technologies: readonly string[];
  /** Links to files in public/docs/ (procedures, diagrams…). */
  documents: readonly Link[];
};

const documentsBlock = (documents: readonly Link[]): Block =>
  documents.length > 0 ? actions(documents) : paragraph([todo("documentation : procédure, schéma ou captures (PDF)")]);

/**
 * A local helper built on top of the DSL: every project row has the same shape.
 * Visible: what the jury scans (context, tools). Folded: the detail of the work.
 */
const project = (p: Project): Card =>
  card({
    id: p.id,
    label: p.category,
    title: p.title,
    blocks: [paragraph(p.context), tags(p.technologies)],
    details: [
      facts([
        { term: "Objectif", value: p.goal },
        { term: "Mon rôle", value: p.role },
        { term: "Résultats", value: p.results },
      ]),
      documentsBlock(p.documents),
    ],
  });

// The most important project of the exam: context, needs, technical environment, personal missions.
const mainProject = card({
  id: "projet-2e-annee",
  label: "Projet de 2e année",
  title: "Contexte HSP / LPRS",
  blocks: [paragraph([todo("le projet en une phrase")])],
  details: [
    facts([
      { term: "Contexte", value: [todo("organisation fictive et situation de départ")] },
      { term: "Besoins", value: [todo("ce que le client attend")] },
      { term: "Environnement", value: [todo("serveurs, réseau, services, outils")] },
      { term: "Mes missions", value: [todo("ce que j'ai réalisé personnellement")] },
      { term: "Résultats", value: [todo("ce qui fonctionne à la fin, tests réalisés")] },
    ]),
    // TODO: add the network diagram: figure({ src: "images/schema-reseau.png", alt: "…", caption: "…" })
    paragraph([todo("schéma réseau")]),
    documentsBlock([]),
  ],
});

export const projets = section({
  id: "projets",
  navLabel: "Projets",
  title: "Projets & documentations",
  lead: "Pour chaque projet : contexte, objectif, rôle, résultats et documents de la démarche.",
  blocks: [
    rows([
      mainProject,
      project({
        id: "projet-ad",
        title: "Active Directory & GPO",
        category: "Systèmes",
        context: "Mettre en place un domaine pour gérer utilisateurs et droits.",
        goal: "Centraliser l'authentification et appliquer des stratégies.",
        role: "Installation, configuration, tests.",
        results: [todo("résultat obtenu")],
        technologies: ["Windows Server 2022", "Active Directory", "GPO"],
        documents: [],
      }),
      project({
        id: "projet-proxmox",
        title: "Hyperviseur Proxmox",
        category: "Virtualisation",
        context: "Héberger plusieurs serveurs sur une même machine.",
        goal: "Créer un laboratoire de test reproductible.",
        role: "Installation, création de VM, sauvegardes.",
        results: [todo("résultat obtenu")],
        technologies: ["Proxmox", "Linux Debian"],
        documents: [],
      }),
      project({
        id: "projet-vlan",
        title: "VLAN & routage Cisco",
        category: "Réseaux",
        context: "Segmenter un réseau d'entreprise fictif.",
        goal: "Isoler les flux par service.",
        role: "Plan d'adressage, configuration des équipements.",
        results: [todo("résultat obtenu")],
        technologies: ["Cisco", "VLAN", "IP"],
        documents: [],
      }),
      project({
        id: "projet-docker",
        title: "Conteneurs Docker",
        category: "Virtualisation",
        context: "Déployer des services applicatifs légers.",
        goal: "Faciliter le déploiement et la maintenance.",
        role: "Écriture des fichiers de composition, tests.",
        results: [todo("résultat obtenu")],
        technologies: ["Docker", "Linux"],
        documents: [],
      }),
      project({
        id: "projet-securite",
        title: "Durcissement d'un serveur",
        category: "Sécurité",
        context: "Réduire la surface d'attaque d'un serveur Linux.",
        goal: "Appliquer les bonnes pratiques de sécurité.",
        role: "Configuration, scripts Bash de vérification.",
        results: [todo("résultat obtenu")],
        technologies: ["Linux Debian", "Bash", "SSH"],
        documents: [],
      }),
    ]),
  ],
});
