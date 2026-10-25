import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "./types";

export async function getProjects(userId: string): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, title, kind, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []).map((row) => ({ id: row.id, title: row.title, kind: row.kind, status: row.status, createdAt: row.created_at }));
}
