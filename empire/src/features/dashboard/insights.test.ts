import { describe, expect, it } from "vitest";
import { recommend, summarize } from "./insights";

describe("tableau de bord", () => {
  it("distingue en cours / terminées et choisit la leçon à reprendre", () => {
    const { inProgress, completed, lessonsDone, last } = summarize({
      "site-professionnel": { completed: ["objectif-unique"], lastLesson: "objectif-unique", positions: {}, notes: {}, updatedAt: "2026-10-20" },
      "landing-page": { completed: ["anatomie", "titres", "mesure-conversion"], positions: {}, notes: {}, updatedAt: "2026-10-21" },
    });
    expect(inProgress.map((status) => status.course.slug)).toEqual(["site-professionnel"]);
    expect(completed.map((status) => status.course.slug)).toEqual(["landing-page"]);
    expect(lessonsDone).toBe(4);
    // La dernière leçon ouverte est terminée : on reprend à la première non terminée.
    expect(last?.resume).toBe("questions-visiteur");
  });

  it("ignore les formations jamais ouvertes", () => {
    expect(summarize({ "ia-copilote": { completed: [], positions: {}, notes: {} } }).inProgress).toHaveLength(0);
  });

  it("recommande d'abord le même domaine, jamais une formation commencée", () => {
    const result = recommend({ "site-professionnel": { completed: [], lastLesson: "objectif-unique", positions: {}, notes: {} } });
    expect(result[0].slug).toBe("landing-page");
    expect(result.some((course) => course.slug === "site-professionnel")).toBe(false);
  });
});
