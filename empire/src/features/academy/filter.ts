import { courseMinutes } from "@/data/courses";
import { isCategorySlug, levels } from "@/data/categories";
import type { Access, CategorySlug, Course, Level } from "@/types/academy";

export type SortKey = "recommande" | "recent" | "duree-asc" | "duree-desc" | "niveau";

export const sortOptions: { value: SortKey; label: string }[] = [
  { value: "recommande", label: "Recommandé" },
  { value: "recent", label: "Plus récent" },
  { value: "duree-asc", label: "Plus court" },
  { value: "duree-desc", label: "Plus long" },
  { value: "niveau", label: "Niveau" },
];

export interface CatalogQuery {
  q: string;
  category: CategorySlug | null;
  level: Level | null;
  access: Access | null;
  sort: SortKey;
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

/** Lit les paramètres d'URL du catalogue (valeurs inconnues ignorées). */
export function parseCatalogQuery(params: Record<string, string | string[] | undefined>): CatalogQuery {
  const category = first(params.categorie);
  const level = first(params.niveau);
  const access = first(params.acces);
  const sort = first(params.tri);
  return {
    q: first(params.q).trim().slice(0, 80),
    category: isCategorySlug(category) ? category : null,
    level: levels.some((item) => item.value === level) ? (level as Level) : null,
    access: access === "free" || access === "pro" || access === "premium" ? access : null,
    sort: sortOptions.some((option) => option.value === sort) ? (sort as SortKey) : "recommande",
  };
}

/** Recherche insensible à la casse et aux accents. */
export const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const levelRank: Record<Level, number> = { debutant: 0, intermediaire: 1, avance: 2 };
const accessRank: Record<Access, number> = { free: 0, pro: 1, premium: 2 };

export function filterCourses(list: Course[], query: CatalogQuery): Course[] {
  const terms = normalize(query.q).split(/\s+/).filter(Boolean);
  const filtered = list.filter((course) => {
    if (query.category && course.category !== query.category) return false;
    if (query.level && course.level !== query.level) return false;
    if (query.access && course.access !== query.access) return false;
    if (!terms.length) return true;
    const haystack = normalize(
      [course.title, course.tagline, course.description, ...course.objectives, ...course.modules.map((m) => m.title)].join(" "),
    );
    return terms.every((term) => haystack.includes(term));
  });

  const sorted = [...filtered];
  switch (query.sort) {
    case "recent":
      return sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    case "duree-asc":
      return sorted.sort((a, b) => courseMinutes(a) - courseMinutes(b));
    case "duree-desc":
      return sorted.sort((a, b) => courseMinutes(b) - courseMinutes(a));
    case "niveau":
      return sorted.sort((a, b) => levelRank[a.level] - levelRank[b.level]);
    default:
      // Recommandé : gratuits d'abord (pour découvrir), puis par niveau.
      return sorted.sort(
        (a, b) => accessRank[a.access] - accessRank[b.access] || levelRank[a.level] - levelRank[b.level],
      );
  }
}

/** Sérialise une requête en paramètres d'URL (sans les valeurs par défaut). */
export function catalogSearch(query: Partial<CatalogQuery>) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.category) params.set("categorie", query.category);
  if (query.level) params.set("niveau", query.level);
  if (query.access) params.set("acces", query.access);
  if (query.sort && query.sort !== "recommande") params.set("tri", query.sort);
  const value = params.toString();
  return value ? `?${value}` : "";
}
