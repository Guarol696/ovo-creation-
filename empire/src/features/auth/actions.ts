"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { routes } from "@/config/site";
import { NEXT_PARAM, safeNextPath } from "@/lib/auth/redirect";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { authErrorMessage } from "./errors";
import { fieldErrors, forgotPasswordSchema, newPasswordSchema, profileSchema, signInSchema, signUpSchema } from "./schema";

export interface FormState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Valeurs réaffichées après une erreur (jamais les mots de passe). */
  values?: Record<string, string>;
}

const UNAVAILABLE: FormState = {
  status: "error",
  message: "Les comptes ne sont pas encore activés sur cette version (mode démonstration). Voir README : configuration Supabase.",
};

const text = (data: FormData, key: string) => {
  const value = data.get(key);
  return typeof value === "string" ? value : "";
};

const failure = (error: unknown, context: string, values?: Record<string, string>): FormState => {
  console.error(`[auth] ${context}`, error);
  return { status: "error", message: authErrorMessage(error), values };
};

/** Origine de la requête (liens des emails), à défaut l'URL publique configurée. */
async function origin() {
  const list = await headers();
  const host = list.get("x-forwarded-host") ?? list.get("host");
  const protocol = list.get("x-forwarded-proto") ?? "https";
  return host ? `${protocol}://${host}` : publicEnv.siteUrl;
}

const callbackUrl = async (next: string) => `${await origin()}${routes.authConfirm}?${new URLSearchParams({ [NEXT_PARAM]: next })}`;

export async function signIn(_: FormState, data: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return UNAVAILABLE;
  const values = { email: text(data, "email") };
  const parsed = signInSchema.safeParse({ email: values.email, password: text(data, "password") });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) return failure(error, "connexion", values);
  } catch (error) {
    return failure(error, "connexion", values);
  }
  redirect(safeNextPath(data.get(NEXT_PARAM)));
}

export async function signUp(_: FormState, data: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return UNAVAILABLE;
  const values = { displayName: text(data, "displayName"), email: text(data, "email") };
  const parsed = signUpSchema.safeParse({ ...values, password: text(data, "password"), confirmPassword: text(data, "confirmPassword") });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };

  const next = safeNextPath(data.get(NEXT_PARAM));
  let hasSession = false;
  try {
    const supabase = await createClient();
    const { data: result, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { data: { display_name: parsed.data.displayName }, emailRedirectTo: await callbackUrl(next) },
    });
    if (error) return failure(error, "inscription", values);
    if (result.user && result.user.identities?.length === 0) {
      return { status: "error", message: "Un compte existe déjà avec cet email. Connecte-toi ou réinitialise ton mot de passe.", values };
    }
    hasSession = Boolean(result.session);
  } catch (error) {
    return failure(error, "inscription", values);
  }
  if (hasSession) redirect(next);
  return {
    status: "success",
    message: `Presque fini : un email de confirmation a été envoyé à ${parsed.data.email}. Clique sur son lien pour activer ton compte.`,
  };
}

export async function signOut(formData?: FormData) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      // « global » : déconnecte toutes les sessions (réglages > sécurité).
      const scope = formData?.get("scope") === "global" ? "global" : "local";
      await supabase.auth.signOut({ scope });
    } catch (error) {
      console.error("[auth] déconnexion", error);
    }
  }
  redirect(routes.home);
}

export async function requestPasswordReset(_: FormState, data: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return UNAVAILABLE;
  const values = { email: text(data, "email") };
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo: await callbackUrl(routes.resetPassword) });
    // On ne révèle jamais si un compte existe : seules les limites de débit sont signalées.
    if (error?.status === 429) return failure(error, "mot de passe oublié", values);
    if (error) console.error("[auth] mot de passe oublié", error);
  } catch (error) {
    return failure(error, "mot de passe oublié", values);
  }
  return { status: "success", message: `Si un compte existe pour ${parsed.data.email}, un lien pour choisir un nouveau mot de passe vient d'être envoyé.` };
}

export async function updatePassword(_: FormState, data: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return UNAVAILABLE;
  const parsed = newPasswordSchema.safeParse({ password: text(data, "password"), confirmPassword: text(data, "confirmPassword") });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { status: "error", message: "Ton lien a expiré. Demande un nouveau lien de réinitialisation." };
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) return failure(error, "nouveau mot de passe");
  } catch (error) {
    return failure(error, "nouveau mot de passe");
  }
  redirect(`${routes.settings}?motdepasse=1`);
}

export async function updateProfile(_: FormState, data: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return UNAVAILABLE;
  const values = { displayName: text(data, "displayName") };
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { status: "error", message: "Ta session a expiré. Reconnecte-toi.", values };
    const { error: profileError } = await supabase.from("profiles").update({ display_name: parsed.data.displayName, updated_at: new Date().toISOString() }).eq("id", user.id);
    if (profileError) return failure(profileError, "profil", values);
    const { error } = await supabase.auth.updateUser({ data: { display_name: parsed.data.displayName } });
    if (error) return failure(error, "profil", values);
  } catch (error) {
    return failure(error, "profil", values);
  }
  refresh();
  return { status: "success", message: "Profil mis à jour.", values };
}
