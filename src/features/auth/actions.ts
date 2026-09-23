"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { routes } from "@/config/site";
import { NEXT_PARAM, safeNextPath } from "@/lib/auth/redirect";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { authErrorMessage } from "./errors";
import {
  fieldErrors,
  forgotPasswordSchema,
  newPasswordSchema,
  profileSchema,
  signInSchema,
  signUpSchema,
} from "./schema";

export interface AuthFormState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Valeurs à réafficher après une erreur (jamais les mots de passe). */
  values?: Record<string, string>;
}

const UNAVAILABLE: AuthFormState = {
  status: "error",
  message: "Les comptes OVO ne sont pas encore activés sur cette version du site.",
};

const text = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

function failure(error: unknown, context: string, values?: Record<string, string>): AuthFormState {
  console.error(`[auth] ${context}`, error);
  return { status: "error", message: authErrorMessage(error), values };
}

/** Lien de retour vers le site (email de confirmation / réinitialisation). */
const callbackUrl = (next: string) =>
  `${publicEnv.siteUrl}${routes.authConfirm}?${new URLSearchParams({ [NEXT_PARAM]: next })}`;

export async function signIn(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) return UNAVAILABLE;
  const values = { email: text(formData, "email") };
  const parsed = signInSchema.safeParse({ email: values.email, password: text(formData, "password") });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) return failure(error, "connexion", values);
  } catch (error) {
    return failure(error, "connexion", values);
  }
  redirect(safeNextPath(formData.get(NEXT_PARAM)));
}

export async function signUp(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) return UNAVAILABLE;
  const values = { displayName: text(formData, "displayName"), email: text(formData, "email") };
  const parsed = signUpSchema.safeParse({
    ...values,
    password: text(formData, "password"),
    confirmPassword: text(formData, "confirmPassword"),
  });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };

  const next = safeNextPath(formData.get(NEXT_PARAM));
  let hasSession = false;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { display_name: parsed.data.displayName },
        emailRedirectTo: callbackUrl(next),
      },
    });
    if (error) return failure(error, "inscription", values);
    // Confirmation par email activée : Supabase renvoie un compte sans identité si l'email est déjà pris.
    if (data.user && data.user.identities?.length === 0) {
      return {
        status: "error",
        message: "Un compte existe déjà avec cet email. Connecte-toi ou réinitialise ton mot de passe.",
        values,
      };
    }
    hasSession = Boolean(data.session);
  } catch (error) {
    return failure(error, "inscription", values);
  }

  if (hasSession) redirect(next);
  return {
    status: "success",
    message: `Presque fini ! On t'a envoyé un email à ${parsed.data.email}. Clique sur le lien qu'il contient pour activer ton compte.`,
  };
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut({ scope: "local" });
    } catch (error) {
      console.error("[auth] déconnexion", error);
    }
  }
  redirect(`${routes.home}?deconnexion=1`);
}

export async function requestPasswordReset(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) return UNAVAILABLE;
  const values = { email: text(formData, "email") };
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: callbackUrl(routes.resetPassword),
    });
    // On ne révèle jamais si un compte existe : seules les erreurs techniques sont signalées.
    if (error && (error.status === 429 || error.status === 0 || error.name === "AuthRetryableFetchError")) {
      return failure(error, "mot de passe oublié", values);
    }
    if (error) console.error("[auth] mot de passe oublié", error);
  } catch (error) {
    return failure(error, "mot de passe oublié", values);
  }
  return {
    status: "success",
    message: `Si un compte OVO existe pour ${parsed.data.email}, tu vas recevoir un email avec un lien pour choisir un nouveau mot de passe.`,
  };
}

export async function updatePassword(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) return UNAVAILABLE;
  const parsed = newPasswordSchema.safeParse({
    password: text(formData, "password"),
    confirmPassword: text(formData, "confirmPassword"),
  });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error) };

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        status: "error",
        message: "Ton lien a expiré. Demande un nouveau lien de réinitialisation.",
      };
    }
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) return failure(error, "nouveau mot de passe");
  } catch (error) {
    return failure(error, "nouveau mot de passe");
  }
  redirect(`${routes.account}?motdepasse=modifie`);
}

export async function updateProfile(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) return UNAVAILABLE;
  const values = { displayName: text(formData, "displayName") };
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { status: "error", message: "Ta session a expiré. Reconnecte-toi.", values };

    // Profil (table protégée par RLS) + métadonnées de session (affichées dans l'en-tête).
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ display_name: parsed.data.displayName })
      .eq("id", user.id);
    if (profileError) return failure(profileError, "profil", values);
    const { error } = await supabase.auth.updateUser({ data: { display_name: parsed.data.displayName } });
    if (error) return failure(error, "profil", values);
  } catch (error) {
    return failure(error, "profil", values);
  }
  refresh();
  return {
    status: "success",
    message: "Profil mis à jour ✓",
    values: { displayName: parsed.data.displayName },
  };
}
