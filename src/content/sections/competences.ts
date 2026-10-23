import { card, grid, link, paragraph, section, type Card } from "../../dsl/index.ts";

// Guide E5 — élément obligatoire 07 : compétences des deux années, chacune reliée
// au projet ou à la situation qui a permis de l'acquérir.

type Category = "Systèmes" | "Réseaux" | "Virtualisation" | "Scripts" | "Support" | "Sécurité";

/** Where the skill was used: a label and the id of a project or mission card. */
type Proof = { label: string; anchor: `projet-${string}` | `mission-${string}` };

const skill = (name: string, category: Category, usedFor: string, proofs: readonly Proof[]): Card =>
  card({
    label: category,
    title: name,
    blocks: [
      paragraph(usedFor),
      paragraph(["→ ", ...proofs.flatMap((p, i) => [...(i === 0 ? [] : [", "]), link(p.label, `#${p.anchor}`)])]),
    ],
  });

export const competences = section({
  id: "competences",
  navLabel: "Compétences",
  title: "Compétences acquises",
  lead: "Chaque compétence renvoie au projet ou à la mission où je l'ai mise en œuvre.",
  blocks: [
    grid(3, [
      skill("Windows Server 2022", "Systèmes", "Création d'un domaine et gestion des comptes utilisateurs.", [
        { label: "Active Directory & GPO", anchor: "projet-ad" },
      ]),
      skill("Active Directory", "Systèmes", "Gestion des utilisateurs et des droits d'accès.", [
        { label: "Active Directory & GPO", anchor: "projet-ad" },
        { label: "Dépannage en alternance", anchor: "mission-depannage" },
      ]),
      skill("Linux Debian", "Systèmes", "Installation et administration de serveurs en laboratoire.", [
        { label: "Proxmox", anchor: "projet-proxmox" },
        { label: "Durcissement", anchor: "projet-securite" },
      ]),
      skill("Cisco / VLAN / IP", "Réseaux", "Segmentation d'un réseau et plan d'adressage.", [
        { label: "VLAN & routage", anchor: "projet-vlan" },
      ]),
      skill("Proxmox, Hyper-V, VirtualBox", "Virtualisation", "Laboratoire de machines virtuelles pour les tests.", [
        { label: "Proxmox", anchor: "projet-proxmox" },
      ]),
      skill("Docker", "Virtualisation", "Déploiement de services en conteneurs.", [
        { label: "Conteneurs Docker", anchor: "projet-docker" },
      ]),
      skill("PowerShell / Bash", "Scripts", "Automatisation de tâches d'administration.", [
        { label: "Durcissement", anchor: "projet-securite" },
      ]),
      skill("Support utilisateur", "Support", "Diagnostic, dépannage, installation de postes.", [
        { label: "Assistance", anchor: "mission-assistance" },
        { label: "Postes de travail", anchor: "mission-postes" },
      ]),
      skill("Ticketing & documentation", "Support", "Suivi des demandes et rédaction de procédures.", [
        { label: "Assistance", anchor: "mission-assistance" },
      ]),
      skill("Sécurité", "Sécurité", "Gestion des droits d'accès et durcissement de serveurs.", [
        { label: "Durcissement", anchor: "projet-securite" },
        { label: "Active Directory & GPO", anchor: "projet-ad" },
      ]),
    ]),
  ],
});
