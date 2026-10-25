"use server";

import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "./types";

const kinds = ["site", "boutique", "application", "marque", "produit", "entreprise"] as const;
const statuses = ["idee", "en-cours", "lance"] as const;

type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

const fail = (context: string, error: unknown): Result<never> => {
  console.error(`[projets] ${context}`, error);
  return { ok: false, error: "Action impossible pour le moment. Réessaie." };
};

export async function createProject(input: { title: string; kind: string }): Promise<Result<Project>> {
  const parsed = z.object({ title: z.string().trim().min(1, "Donne un nom au projet.").max(80), kind: z.enum(kinds) }).safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Projet invalide." };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Ta session a expiré. Reconnecte-toi." };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .insert({ user_id: user.id, title: parsed.data.title, kind: parsed.data.kind })
      .select("id, title, kind, status, created_at")
      .single();
    if (error) throw error;
    return { ok: true, data: { id: data.id, title: data.title, kind: data.kind, status: data.status, createdAt: data.created_at } };
  } catch (error) {
    return fail("création", error);
  }
}

export async function updateProjectStatus(input: { id: string; status: string }): Promise<Result> {
  const parsed = z.object({ id: z.string().uuid(), status: z.enum(statuses) }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Requête invalide." };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Ta session a expiré. Reconnecte-toi." };
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("projects")
      .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
      .eq("id", parsed.data.id)
      .eq("user_id", user.id);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return fail("statut", error);
  }
}

export async function deleteProject(input: { id: string }): Promise<Result> {
  const parsed = z.object({ id: z.string().uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Requête invalide." };
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Ta session a expiré. Reconnecte-toi." };
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("projects").delete().eq("id", parsed.data.id).eq("user_id", user.id);
    if (error) throw error;
    return { ok: true };
  } catch (error) {
    return fail("suppression", error);
  }
}
