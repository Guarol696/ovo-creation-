import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { duration, ease } from "@/config/motion";

describe("système de mouvement", () => {
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

  it("garde les durées CSS synchronisées avec config/motion.ts", () => {
    for (const [name, value] of Object.entries(duration)) expect(css).toContain(`--dur-${name}: ${value}ms;`);
  });

  it("garde les courbes CSS synchronisées", () => {
    for (const [name, value] of Object.entries(ease)) {
      const cssName = name === "inOut" ? "in-out" : name;
      expect(css).toContain(`--ease-${cssName}: ${value};`);
    }
  });

  it("prévoit le mouvement réduit (système et réglage)", () => {
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).toContain(':root[data-motion="reduced"]');
  });
});
