import { describe, expect, it } from "vitest";
import { demoVideos } from "@/config/media";
import { categories } from "@/data/categories";
import { courseLessons, courses, findLesson, getCourse } from "@/data/courses";
import { paths } from "@/data/paths";
import { pillars } from "@/data/pillars";
import { projectExamples } from "@/data/projects";

describe("catalogue de démonstration", () => {
  it("a des slugs de formation uniques", () => {
    expect(new Set(courses.map((course) => course.slug)).size).toBe(courses.length);
  });

  it("a des leçons aux slugs uniques par formation, avec contenu et durée", () => {
    for (const course of courses) {
      const lessons = courseLessons(course);
      expect(lessons.length).toBeGreaterThan(0);
      expect(new Set(lessons.map((lesson) => lesson.slug)).size).toBe(lessons.length);
      for (const lesson of lessons) {
        expect(lesson.body.length).toBeGreaterThan(0);
        expect(lesson.minutes).toBeGreaterThan(0);
        if (lesson.video) expect(demoVideos[lesson.video]).toBeDefined();
      }
    }
  });

  it("couvre chaque catégorie et signale toutes les formations comme démo", () => {
    for (const category of categories) expect(courses.some((course) => course.category === category.slug)).toBe(true);
    expect(courses.every((course) => course.status === "demo")).toBe(true);
  });

  it("ne référence que des formations et parcours existants", () => {
    for (const path of paths) for (const step of path.steps) if (step.course) expect(getCourse(step.course)).toBeDefined();
    for (const pillar of pillars) {
      for (const slug of pillar.courses) expect(getCourse(slug)).toBeDefined();
      for (const slug of pillar.paths) expect(paths.some((path) => path.slug === slug)).toBe(true);
    }
    for (const project of projectExamples) expect(paths.some((path) => path.slug === project.path)).toBe(true);
  });

  it("trouve une leçon avec ses voisines", () => {
    const course = getCourse("site-professionnel")!;
    const found = findLesson(course, "questions-visiteur")!;
    expect(found.previous?.slug).toBe("objectif-unique");
    expect(found.next?.slug).toBe("page-accueil");
    expect(found.module.slug).toBe("cadrer");
    expect(findLesson(course, "inconnue")).toBeNull();
  });
});
