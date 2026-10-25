export type CategorySlug =
  | "sites-web"
  | "intelligence-artificielle"
  | "entrepreneuriat"
  | "applications"
  | "e-commerce"
  | "marketing"
  | "freelancing";

export type Level = "debutant" | "intermediaire" | "avance";

/** Offre minimale donnant accès à une formation. */
export type Access = "free" | "pro" | "premium";

export interface Category {
  slug: CategorySlug;
  index: string;
  label: string;
  /** Intention visuelle de la catégorie (pilote son glyphe). */
  motif: string;
  description: string;
}

export interface Lesson {
  slug: string;
  title: string;
  /** Durée indicative, en minutes. */
  minutes: number;
  summary: string;
  /** Contenu écrit de la leçon (paragraphes ; une ligne commençant par « — » est une puce). */
  body: string[];
  /** Clé d'une vidéo de `config/media.ts` ; absente = leçon écrite. */
  video?: string;
}

export interface CourseModule {
  slug: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: CategorySlug;
  level: Level;
  access: Access;
  objectives: string[];
  modules: CourseModule[];
  instructor: { name: string; role: string };
  /** Toutes les formations actuelles sont des contenus de démonstration. */
  status: "demo";
  /** Date de mise à jour (ISO). */
  updatedAt: string;
}

export interface PathStep {
  title: string;
  description: string;
  /** Formation associée (slug), facultative. */
  course?: string;
  resources: { label: string; href: string }[];
}

export interface LearningPath {
  slug: string;
  index: string;
  title: string;
  promise: string;
  outcome: string;
  weeks: number;
  steps: PathStep[];
}
