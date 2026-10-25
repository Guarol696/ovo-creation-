import { routes } from "@/config/site";

export const NEXT_PARAM = "next";

/** N'accepte qu'un chemin interne (évite les redirections ouvertes). */
export function safeNextPath(value: unknown, fallback: string = routes.dashboard) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}

export const loginUrl = (next?: string) =>
  next ? `${routes.login}?${new URLSearchParams({ [NEXT_PARAM]: next })}` : routes.login;
