import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { getBillingStatus } from "@/features/billing/server/env";
import { purgeOldEvents } from "@/features/billing/server/events";
import { listBillingCustomers } from "@/features/billing/server/store";
import { reconcileCustomer } from "@/features/billing/server/sync";

/** Nombre maximum de comptes resynchronisés par appel. */
const BATCH = 200;

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim() ?? "";
  if (secret.length < 16) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/**
 * Réconciliation Stripe → Supabase (filet de sécurité des webhooks), appelée
 * par Vercel Cron avec `Authorization: Bearer CRON_SECRET`. Relit chez Stripe
 * l'abonnement de chaque compte lié à un client Stripe : un paiement dont le
 * webhook aurait été perdu, ou un abonnement supprimé, finit toujours reflété.
 */
export async function GET(request: NextRequest) {
  if (!authorized(request)) return new Response("Non autorisé.", { status: 401 });
  if (!getBillingStatus().checkoutReady) return new Response("Stripe non configuré.", { status: 503 });

  const summary = { checked: 0, synced: 0, ignored: 0, errors: 0, purgedEvents: 0 };
  for (const row of await listBillingCustomers(BATCH)) {
    summary.checked++;
    try {
      const result = await reconcileCustomer(row.stripe_customer_id, row.user_id);
      summary[result.status === "synced" ? "synced" : "ignored"]++;
    } catch (error) {
      summary.errors++;
      console.error("[stripe] réconciliation impossible", row.stripe_customer_id, (error as Error).message);
    }
  }
  try {
    summary.purgedEvents = await purgeOldEvents();
  } catch (error) {
    console.error("[stripe] purge des événements impossible", error);
  }
  console.info("[stripe] réconciliation", summary);
  return Response.json(summary);
}
