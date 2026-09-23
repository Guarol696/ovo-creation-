"use server";

import { redirect } from "next/navigation";
import Stripe from "stripe";
import { PAID_PLANS, PLANS, type PaidPlanId } from "@/config/premium";
import { routes } from "@/config/site";
import { getCurrentUser } from "@/features/auth/server/session";
import { authUrl } from "@/lib/auth/redirect";
import { publicEnv } from "@/lib/env";
import { buildCheckoutParams, ONGOING_STATUSES } from "./stripe-mapping";
import { ensureStripeCustomer } from "./server/customers";
import { getBillingEnv, getBillingStatus, priceIdFor } from "./server/env";
import { getBillingRowByUser } from "./server/store";
import { getStripe } from "./server/stripe";

export interface BillingActionState {
  status: "idle" | "error";
  message?: string;
}

const NOT_CONFIGURED =
  "Le paiement n'est pas encore activé sur OVO. Réessaie un peu plus tard : aucun montant n'a été débité.";
const STRIPE_DOWN =
  "Impossible de joindre le service de paiement pour le moment. Réessaie dans un instant : aucun montant n'a été débité.";

function stripeErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Stripe.errors.StripeConnectionError || error instanceof Stripe.errors.StripeAPIError) {
    return STRIPE_DOWN;
  }
  if (error instanceof Stripe.errors.StripeAuthenticationError) return NOT_CONFIGURED;
  return fallback;
}

/**
 * « Commencer Medium / Premium » : crée une session Stripe Checkout (mode abonnement)
 * pour l'utilisateur connecté, avec le Price ID configuré côté serveur.
 * Le navigateur n'envoie que le nom de l'offre : jamais de prix ni d'identifiant Stripe.
 */
export async function startCheckout(_: BillingActionState, formData: FormData): Promise<BillingActionState> {
  const plan = formData.get("plan");
  if (typeof plan !== "string" || !PAID_PLANS.includes(plan as PaidPlanId)) {
    return { status: "error", message: "Offre inconnue. Recharge la page et réessaie." };
  }
  const paidPlan = plan as PaidPlanId;

  const user = await getCurrentUser();
  if (!user) redirect(authUrl(routes.login, `${routes.premium}?offre=${paidPlan}`));

  if (!getBillingStatus().checkoutReady) {
    console.error("[stripe] Checkout indisponible, configuration manquante", getBillingStatus().missing);
    return { status: "error", message: NOT_CONFIGURED };
  }

  let url: string | null = null;
  try {
    // Un seul abonnement par compte : pour changer d'offre, on passe par le portail Stripe.
    const row = await getBillingRowByUser(user.id);
    if (
      row?.stripe_subscription_id &&
      row.subscription_status &&
      ONGOING_STATUSES.includes(row.subscription_status)
    ) {
      return {
        status: "error",
        message: `Tu as déjà un abonnement ${PLANS[row.plan].name}. Pour changer d'offre, utilise « Gérer mon abonnement » dans ton compte.`,
      };
    }
    const customerId = await ensureStripeCustomer(user);
    const session = await getStripe().checkout.sessions.create(
      buildCheckoutParams({
        plan: paidPlan,
        priceId: priceIdFor(paidPlan),
        customerId,
        userId: user.id,
        siteUrl: publicEnv.siteUrl,
      }),
    );
    url = session.url;
  } catch (error) {
    console.error("[stripe] création du Checkout impossible", error);
    return {
      status: "error",
      message: stripeErrorMessage(
        error,
        "Impossible d'ouvrir la page de paiement. Réessaie dans un instant.",
      ),
    };
  }
  if (!url)
    return { status: "error", message: "Impossible d'ouvrir la page de paiement. Réessaie dans un instant." };
  redirect(url);
}

/**
 * « Gérer mon abonnement » : session du portail client Stripe (moyen de paiement,
 * factures, changement d'offre, annulation).
 */
export async function openBillingPortal(): Promise<BillingActionState> {
  const user = await getCurrentUser();
  if (!user) redirect(authUrl(routes.login, routes.account));
  if (!getBillingStatus().checkoutReady) return { status: "error", message: NOT_CONFIGURED };

  let url: string | null = null;
  try {
    const row = await getBillingRowByUser(user.id);
    if (!row?.stripe_customer_id) {
      return {
        status: "error",
        message:
          "Aucun abonnement n'est associé à ton compte pour l'instant. Découvre les offres sur la page Premium.",
      };
    }
    const { portalConfigurationId } = getBillingEnv();
    const portal = await getStripe().billingPortal.sessions.create({
      customer: row.stripe_customer_id,
      return_url: `${publicEnv.siteUrl}${routes.account}`,
      locale: "fr",
      ...(portalConfigurationId ? { configuration: portalConfigurationId } : {}),
    });
    url = portal.url;
  } catch (error) {
    console.error("[stripe] ouverture du portail impossible", error);
    if (error instanceof Stripe.errors.StripeInvalidRequestError && /configuration/i.test(error.message)) {
      return {
        status: "error",
        message:
          "La gestion de l'abonnement n'est pas encore activée. En attendant, écris-nous via la page Contact pour toute modification.",
      };
    }
    return {
      status: "error",
      message: stripeErrorMessage(
        error,
        "Impossible d'ouvrir la gestion de l'abonnement. Réessaie dans un instant.",
      ),
    };
  }
  if (!url) return { status: "error", message: "Impossible d'ouvrir la gestion de l'abonnement." };
  redirect(url);
}
