import "server-only";
import { headers } from "next/headers";
import { publicEnv } from "@/lib/env";

/**
 * Adresse du site telle que le visiteur l'utilise (ex. https://ovo-creation.vercel.app),
 * pour les retours de Stripe (paiement, portail). Ne dépend pas d'une variable
 * d'environnement mal renseignée ; repli sur NEXT_PUBLIC_SITE_URL si l'en-tête manque.
 */
export async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").split(",")[0]!.trim();
  if (!host || !/^[a-z0-9.-]+(:\d+)?$/i.test(host)) return publicEnv.siteUrl;
  const local = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
  const proto = (h.get("x-forwarded-proto") ?? (local ? "http" : "https")).split(",")[0]!.trim();
  return `${proto === "http" ? "http" : "https"}://${host}`;
}
