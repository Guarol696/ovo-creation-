"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { routes } from "@/config/site";
import { getCurrentUser } from "@/lib/auth/session";
import { loginUrl } from "@/lib/auth/redirect";
import { publicEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { billingConfig, billingStatus } from "./env";
import { getStripe } from "./stripe";

async function origin() {
  const list = await headers();
  const host = list.get("x-forwarded-host") ?? list.get("host");
  return host ? `${list.get("x-forwarded-proto") ?? "https"}://${host}` : publicEnv.siteUrl;
}

/**
 * Crée une session Stripe Checkout (abonnement) pour l'utilisateur connecté.
 * Aucun droit n'est accordé ici : l'offre ne change qu'à réception du
 * webhook signé, après relecture de l'abonnement chez Stripe.
 */
export async function startCheckout(formData: FormData) {
  const plan = formData.get("plan");
  if (plan !== "pro" && plan !== "premium") redirect(`${routes.pricing}?erreur=offre`);
  if (!billingStatus().ready) redirect(`${routes.pricing}?erreur=configuration`);

  const user = await getCurrentUser();
  if (!user) redirect(loginUrl(`${routes.pricing}?offre=${plan}`));

  let url: string | null = null;
  try {
    const stripe = getStripe();
    const admin = createAdminClient();
    const { data: existing } = await admin.from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
    const base = await origin();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: billingConfig().prices[plan], quantity: 1 }],
      customer: existing?.stripe_customer_id ?? undefined,
      customer_email: existing?.stripe_customer_id ? undefined : user.email,
      client_reference_id: user.id,
      metadata: { user_id: user.id, plan },
      subscription_data: { metadata: { user_id: user.id, plan } },
      allow_promotion_codes: true,
      success_url: `${base}${routes.billingSuccess}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}${routes.pricing}?annule=1`,
    });
    url = session.url;
  } catch (error) {
    console.error("[stripe] création de session impossible", error);
  }
  redirect(url ?? `${routes.pricing}?erreur=stripe`);
}

/** Portail client Stripe : changer d'offre, mettre à jour la carte, résilier. */
export async function openBillingPortal() {
  const user = await getCurrentUser();
  if (!user) redirect(loginUrl(routes.settings));
  let url: string | null = null;
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
    if (data?.stripe_customer_id) {
      const session = await getStripe().billingPortal.sessions.create({ customer: data.stripe_customer_id, return_url: `${await origin()}${routes.settings}` });
      url = session.url;
    }
  } catch (error) {
    console.error("[stripe] portail client impossible", error);
  }
  redirect(url ?? `${routes.settings}?erreur=portail`);
}
