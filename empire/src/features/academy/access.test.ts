import { describe, expect, it } from "vitest";
import { canAccess } from "@/config/plans";
import { getCourse } from "@/data/courses";
import { canViewLesson, isPreviewLesson } from "./access";

describe("règles d'accès", () => {
  const free = getCourse("site-professionnel")!;
  const pro = getCourse("landing-page")!;
  const premium = getCourse("produit-numerique")!;

  it("hiérarchise les offres", () => {
    expect(canAccess("free", "free")).toBe(true);
    expect(canAccess("free", "pro")).toBe(false);
    expect(canAccess("pro", "pro")).toBe(true);
    expect(canAccess("pro", "premium")).toBe(false);
    expect(canAccess("premium", "pro")).toBe(true);
  });

  it("ouvre toute formation gratuite", () => {
    expect(canViewLesson(free, "domaine-et-local", "free")).toBe(true);
  });

  it("offre la première leçon des formations payantes, verrouille la suite", () => {
    expect(canViewLesson(pro, "anatomie", "free")).toBe(true);
    expect(isPreviewLesson(pro, "anatomie")).toBe(true);
    expect(canViewLesson(pro, "titres", "free")).toBe(false);
    expect(canViewLesson(pro, "titres", "pro")).toBe(true);
    expect(canViewLesson(premium, "trois-temps", "pro")).toBe(false);
    expect(canViewLesson(premium, "trois-temps", "premium")).toBe(true);
  });
});
