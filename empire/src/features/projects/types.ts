import type { ProjectExample } from "@/data/projects";

export type ProjectKind = ProjectExample["slug"];
export type ProjectStatus = "idee" | "en-cours" | "lance";

export interface Project {
  id: string;
  title: string;
  kind: ProjectKind;
  status: ProjectStatus;
  createdAt: string;
}

export const projectKinds: { value: ProjectKind; label: string }[] = [
  { value: "site", label: "Site" },
  { value: "boutique", label: "Boutique" },
  { value: "application", label: "Application" },
  { value: "marque", label: "Marque" },
  { value: "produit", label: "Produit numérique" },
  { value: "entreprise", label: "Entreprise" },
];

export const projectStatuses: { value: ProjectStatus; label: string }[] = [
  { value: "idee", label: "Idée" },
  { value: "en-cours", label: "En cours" },
  { value: "lance", label: "Lancé" },
];
