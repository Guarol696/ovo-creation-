import { describe, expect, it } from "vitest";
import { authUrl, safeNextPath, withSaveIntent } from "@/lib/auth/redirect";
import { authErrorMessage, GENERIC_ERROR, NETWORK_ERROR } from "../errors";
import { fieldErrors, newPasswordSchema, signInSchema, signUpSchema } from "../schema";

describe("retour après connexion (next)", () => {
  it("accepte uniquement les pages internes", () => {
    expect(safeNextPath("/mes-voyages")).toBe("/mes-voyages");
    expect(safeNextPath("/voyage/resultat?v=abc&enregistrer=1")).toBe("/voyage/resultat?v=abc&enregistrer=1");
    for (const evil of [
      "https://evil.com",
      "//evil.com",
      "/\\evil.com",
      "javascript:alert(1)",
      "",
      undefined,
      42,
    ]) {
      expect(safeNextPath(evil)).toBe("/mes-voyages");
    }
  });

  it("construit les liens de connexion et l'intention d'enregistrer", () => {
    expect(authUrl("/connexion", "/mes-voyages")).toBe("/connexion?next=%2Fmes-voyages");
    expect(authUrl("/connexion", "https://evil.com")).toBe("/connexion?next=%2Fmes-voyages");
    expect(withSaveIntent("/voyage/resultat?v=abc")).toBe("/voyage/resultat?v=abc&enregistrer=1");
  });
});

describe("messages d'erreur compréhensibles", () => {
  it("traduit les erreurs Supabase Auth", () => {
    expect(authErrorMessage({ code: "invalid_credentials", status: 400 })).toBe(
      "Email ou mot de passe incorrect.",
    );
    expect(authErrorMessage({ code: "user_already_exists", status: 422 })).toMatch(/existe déjà/);
    expect(authErrorMessage({ code: "weak_password", status: 422 })).toMatch(/trop faible/);
    expect(authErrorMessage({ code: "over_request_rate_limit", status: 429 })).toMatch(/Trop de tentatives/);
    expect(authErrorMessage({ name: "AuthRetryableFetchError", status: 0, message: "fetch failed" })).toBe(
      NETWORK_ERROR,
    );
  });

  it("ne montre jamais le détail technique", () => {
    const message = authErrorMessage({ status: 500, message: 'relation "auth.users" does not exist' });
    expect(message).toBe(GENERIC_ERROR);
    expect(authErrorMessage(undefined)).toBe(GENERIC_ERROR);
  });
});

describe("validation des formulaires", () => {
  const valid = {
    displayName: "Léa",
    email: " Lea@Example.com ",
    password: "voyage2026",
    confirmPassword: "voyage2026",
  };

  it("inscription valide (email normalisé)", () => {
    const parsed = signUpSchema.parse(valid);
    expect(parsed.email).toBe("lea@example.com");
  });

  it("refuse mot de passe faible, confirmation différente, email invalide", () => {
    const errors = (input: object) => {
      const result = signUpSchema.safeParse({ ...valid, ...input });
      return result.success ? {} : fieldErrors(result.error);
    };
    expect(errors({ password: "court1", confirmPassword: "court1" }).password).toMatch(/au moins 8/);
    expect(errors({ password: "motdepasse", confirmPassword: "motdepasse" }).password).toMatch(/chiffre/);
    expect(errors({ password: "12345678", confirmPassword: "12345678" }).password).toMatch(/lettre/);
    expect(errors({ confirmPassword: "autre2026" }).confirmPassword).toMatch(/ne correspondent pas/);
    expect(errors({ email: "pas-un-email" }).email).toMatch(/pas valide/);
    expect(errors({ displayName: "A" }).displayName).toMatch(/au moins 2/);
    expect(errors({ displayName: "<script>" }).displayName).toBeDefined();
  });

  it("connexion et nouveau mot de passe", () => {
    expect(signInSchema.safeParse({ email: "a@b.fr", password: "" }).success).toBe(false);
    expect(signInSchema.safeParse({ email: "a@b.fr", password: "x" }).success).toBe(true);
    expect(
      newPasswordSchema.safeParse({ password: "nouveau2026", confirmPassword: "nouveau2026" }).success,
    ).toBe(true);
  });
});
