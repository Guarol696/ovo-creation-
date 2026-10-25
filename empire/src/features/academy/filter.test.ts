import { describe, expect, it } from "vitest";
import { courses } from "@/data/courses";
import { catalogSearch, filterCourses, normalize, parseCatalogQuery } from "./filter";

describe("filtres du catalogue", () => {
  it("ignore les valeurs inconnues de l'URL", () => {
    const query = parseCatalogQuery({ categorie: "astrologie", niveau: "expert", acces: "gold", tri: "random", q: "  site  " });
    expect(query).toEqual({ q: "site", category: null, level: null, access: null, sort: "recommande" });
  });

  it("filtre par catégorie, niveau et accès", () => {
    const query = parseCatalogQuery({ categorie: "sites-web", niveau: "debutant" });
    const result = filterCourses(courses, query);
    expect(result.map((course) => course.slug)).toEqual(["site-professionnel"]);
    expect(filterCourses(courses, parseCatalogQuery({ acces: "premium" })).every((course) => course.access === "premium")).toBe(true);
  });

  it("cherche sans tenir compte des accents ni de la casse", () => {
    expect(normalize("Éléphant")).toBe("elephant");
    const result = filterCourses(courses, parseCatalogQuery({ q: "PROPOSITION valeur" }));
    expect(result.some((course) => course.slug === "proposition-de-valeur")).toBe(true);
  });

  it("trie par durée", () => {
    const asc = filterCourses(courses, parseCatalogQuery({ tri: "duree-asc" }));
    const desc = filterCourses(courses, parseCatalogQuery({ tri: "duree-desc" }));
    expect(asc[0].slug).toBe(desc[desc.length - 1].slug);
  });

  it("recommande d'abord les formations gratuites", () => {
    const result = filterCourses(courses, parseCatalogQuery({}));
    const firstPaid = result.findIndex((course) => course.access !== "free");
    expect(result.slice(firstPaid).every((course) => course.access !== "free")).toBe(true);
  });

  it("sérialise l'URL sans les valeurs par défaut", () => {
    expect(catalogSearch({ q: "ia", category: null, sort: "recommande" })).toBe("?q=ia");
    expect(catalogSearch({})).toBe("");
  });
});
