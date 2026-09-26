"use server";

import { redirect } from "next/navigation";
import Stripe from "stripe";
import { PAID_PLANS, PLANS, type PaidPlanId } from "@/config/premium";
import { routes } from "@/config/site";
import { getCurrentUser } from "@/features/auth/server/session";
import { authUrl } from "@/lib/auth/redirect";
import { requestOrigin } from "@/lib/request-origin";
import { buildCheckoutParams, ONGOING_STATUSES } from "./stripe-mapping";
import { ensureStripeCustomer } from "./server/customers";
import { getBillingEnv, getBillingStatus, priceIdFor } from "./server/env";
import { getPlanPrices } from "./server/prices";
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

  // Price Stripe inutilisable (archivé, non récurrent…) : on refuse proprement plutôt que d'échouer chez Stripe.
  const { issues } = await getPlanPrices();
  if (issues[paidPlan].some((issue) => issue.level === "blocking")) {
    return {
      status: "error",
      message: `${PLANS[paidPlan].name} n'est pas disponible pour le moment. Réessaie un peu plus tard : aucun montant n'a été débité.`,
    };
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
        siteUrl: await requestOrigin(),
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

const PORTAL_INTENTS = ["medium", "premium", "cancel"] as const;
type PortalIntent = (typeof PORTAL_INTENTS)[number];

const PORTAL_NOT_CONFIGURED =
  "La gestion de l'abonnement n'est pas encore activée. En attendant, écris-nous via la page Contact pour toute modification.";
const isMissingPortalConfiguration = (error: unknown) =>
  error instanceof Stripe.errors.StripeInvalidRequestError &&
  /default configuration|no configuration/i.test(error.message);

/**
 * Parcours ciblé du portail : confirmation du changement d'offre (le Price est
 * choisi ici, côté serveur) ou annulation. Le changement n'est pris en compte
 * par OVO qu'une fois confirmé par Stripe (webhook).
 */
async function portalFlow(
  intent: PortalIntent | null,
  subscriptionId: string | null,
  returnUrl: string,
): Promise<Stripe.BillingPortal.SessionCreateParams.FlowData | undefined> {
  if (!intent || !subscriptionId) return undefined;
  const after_completion = { type: "redirect" as const, redirect: { return_url: returnUrl } };
  if (intent === "cancel") {
    return {
      type: "subscription_cancel",
      subscription_cancel: { subscription: subscriptionId },
      after_completion,
    };
  }
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  const item = subscription.items.data[0];
  const targetPrice = priceIdFor(intent);
  if (!item || item.price.id === targetPrice) return undefined;
  return {
    type: "subscription_update_confirm",
    subscription_update_confirm: {
      subscription: subscriptionId,
      items: [{ id: item.id, price: targetPrice, quantity: 1 }],
    },
    after_completion,
  };
}

/**
 * « Gérer mon abonnement » : session du portail client Stripe (moyen de paiement,
 * factures, changement d'offre, annulation). Le formulaire peut préciser une
 * intention (`medium`, `premium`, `cancel`) : jamais de prix ni d'identifiant Stripe.
 */
export async function openBillingPortal(
  _: BillingActionState,
  formData?: FormData,
): Promise<BillingActionState> {
  const user = await getCurrentUser();
  if (!user) redirect(authUrl(routes.login, routes.account));
  if (!getBillingStatus().checkoutReady) return { status: "error", message: NOT_CONFIGURED };

  const rawIntent = formData?.get("intent");
  const intent = PORTAL_INTENTS.includes(rawIntent as PortalIntent) ? (rawIntent as PortalIntent) : null;

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
    const hasOngoing = Boolean(
      row.stripe_subscription_id &&
      row.subscription_status &&
      ONGOING_STATUSES.includes(row.subscription_status),
    );
    const { portalConfigurationId } = getBillingEnv();
    const returnUrl = `${await requestOrigin()}${routes.account}?retour=portail`;
    const base: Stripe.BillingPortal.SessionCreateParams = {
      customer: row.stripe_customer_id,
      return_url: returnUrl,
      locale: "fr",
      ...(portalConfigurationId ? { configuration: portalConfigurationId } : {}),
    };
    const flow_data = hasOngoing
      ? await portalFlow(intent, row.stripe_subscription_id, returnUrl)
      : undefined;
    try {
      url = (await getStripe().billingPortal.sessions.create(flow_data ? { ...base, flow_data } : base)).url;
    } catch (error) {
      // Parcours ciblé refusé (ex. changement d'offre non activé dans le portail) : portail classique.
      if (!flow_data || isMissingPortalConfiguration(error)) throw error;
      if (!(error instanceof Stripe.errors.StripeInvalidRequestError)) throw error;
      console.warn(
        "[stripe] parcours ciblé du portail refusé, ouverture du portail classique",
        error.message,
      );
      url = (await getStripe().billingPortal.sessions.create(base)).url;
    }
  } catch (error) {
    console.error("[stripe] ouverture du portail impossible", error);
    if (isMissingPortalConfiguration(error)) return { status: "error", message: PORTAL_NOT_CONFIGURED };
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
