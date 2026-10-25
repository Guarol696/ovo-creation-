import { describe, expect, it } from "vitest";
import { allowRequest } from "@/features/assistant/rate-limit";
import { safeNextPath } from "@/lib/auth/redirect";

describe("redirections après connexion", () => {
  it("n'accepte que les chemins internes", () => {
    expect(safeNextPath("/dashboard")).toBe("/dashboard");
    expect(safeNextPath("https://evil.example")).toBe("/dashboard");
    expect(safeNextPath("//evil.example")).toBe("/dashboard");
    expect(safeNextPath("/\\evil.example")).toBe("/dashboard");
    expect(safeNextPath(undefined, "/")).toBe("/");
  });
});

describe("limiteur de l'assistant", () => {
  it("bloque au-delà de la limite puis libère après la fenêtre", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 3; i++) expect(allowRequest(key, 3, 1000, 0)).toBe(true);
    expect(allowRequest(key, 3, 1000, 10)).toBe(false);
    expect(allowRequest(key, 3, 1000, 2000)).toBe(true);
  });
});
