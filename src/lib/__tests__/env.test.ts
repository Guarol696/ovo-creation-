import { describe, expect, it } from "vitest";
import { normalizeSupabaseUrl } from "../env";

describe("normalizeSupabaseUrl", () => {
  it("garde seulement l'origine du projet Supabase", () => {
    expect(normalizeSupabaseUrl("https://abcd.supabase.co")).toBe("https://abcd.supabase.co");
    expect(normalizeSupabaseUrl("https://abcd.supabase.co/")).toBe("https://abcd.supabase.co");
    expect(normalizeSupabaseUrl(" https://abcd.supabase.co/rest/v1/ ")).toBe("https://abcd.supabase.co");
    expect(normalizeSupabaseUrl("http://localhost:54321")).toBe("http://localhost:54321");
  });

  it("vide ou invalide : inchangé (le site signale alors Supabase non configuré)", () => {
    expect(normalizeSupabaseUrl(undefined)).toBe("");
    expect(normalizeSupabaseUrl("   ")).toBe("");
    expect(normalizeSupabaseUrl("pas-une-url")).toBe("pas-une-url");
  });
});
