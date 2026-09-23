import type Stripe from "stripe";
import { CURRENCY, PLANS, type PaidPlanId } from "@/config/premium";

/**
 * Prix des offres payantes (fonctions pures, testées unitairement).
 *
 * Stripe est la source de vérité du prix réellement facturé : montant,
 * devise, période et Price ID. `config/premium.ts` ne sert que de valeur
 * affichée par défaut (si Stripe est injoignable ou pas encore configuré).
 * Toute différence entre les deux est signalée, jamais ignorée en silence.
 */

export type BillingInterval = "day" | "week" | "month" | "year";

export interface PlanPrice {
  /** Montant en unités mineures (centimes pour l'euro). */
  unitAmount: number;
  currency: string;
  interval: BillingInterval;
  intervalCount: number;
  /** `stripe` : lu sur le Price Stripe ; `config` : valeur de config/premium.ts. */
  source: "stripe" | "config";
}

export interface PriceIssue {
  /** `blocking` : paiement impossible avec ce Price ; `mismatch` : différent de ce qu'OVO annonce. */
  level: "blocking" | "mismatch";
  message: string;
}

/** Devises sans décimales chez Stripe (le montant est déjà en unités). */
const ZERO_DECIMAL = new Set([
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "JPY",
  "KMF",
  "KRW",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF",
]);

export const toMinorUnits = (amount: number, currency = CURRENCY) =>
  ZERO_DECIMAL.has(currency.toUpperCase()) ? Math.round(amount) : Math.round(amount * 100);

export const fromMinorUnits = (unitAmount: number, currency: string) =>
  ZERO_DECIMAL.has(currency.toUpperCase()) ? unitAmount : unitAmount / 100;

/** « 5,99 € », « 6,99 $US »… */
export function formatMoney(unitAmount: number, currency: string) {
  const code = currency.toUpperCase();
  const digits = ZERO_DECIMAL.has(code) ? 0 : 2;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: code,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(fromMinorUnits(unitAmount, code));
}

const INTERVAL_LABELS: Record<BillingInterval, [one: string, many: string]> = {
  day: ["jour", "jours"],
  week: ["semaine", "semaines"],
  month: ["mois", "mois"],
  year: ["an", "ans"],
};

const isKnownInterval = (value: string): value is BillingInterval => value in INTERVAL_LABELS;

/** « mois », « an », « 3 mois »… (pour « 5,99 € / mois »). */
export function formatInterval(interval: BillingInterval, count = 1) {
  const [one, many] = INTERVAL_LABELS[interval];
  return count === 1 ? one : `${count} ${many}`;
}

/** « 5,99 € / mois » */
export const formatPlanPriceLabel = (price: PlanPrice) =>
  `${formatMoney(price.unitAmount, price.currency)} / ${formatInterval(price.interval, price.intervalCount)}`;

/** Prix annoncé par OVO (config/premium.ts) : mensuel, en euros. */
export function configPlanPrice(plan: PaidPlanId): PlanPrice {
  return {
    unitAmount: toMinorUnits(PLANS[plan].monthlyPrice),
    currency: CURRENCY,
    interval: "month",
    intervalCount: 1,
    source: "config",
  };
}

type StripePriceLike = Pick<Stripe.Price, "id" | "active" | "currency" | "type" | "unit_amount"> & {
  recurring: Pick<Stripe.Price.Recurring, "interval" | "interval_count"> | null;
};

/**
 * Compare le Price Stripe d'une offre à ce qu'OVO affiche.
 * Les écarts de montant, de devise ou de période sont des `mismatch` : Stripe
 * reste la vérité (c'est son prix qui est affiché et facturé), mais la
 * configuration doit être corrigée.
 */
export function checkPlanPrice(plan: PaidPlanId, price: StripePriceLike): PriceIssue[] {
  const name = PLANS[plan].name;
  const issues: PriceIssue[] = [];
  if (!price.active) {
    issues.push({ level: "blocking", message: `Le Price Stripe de ${name} (${price.id}) est archivé.` });
  }
  if (price.type !== "recurring" || !price.recurring) {
    issues.push({
      level: "blocking",
      message: `Le Price Stripe de ${name} (${price.id}) n'est pas un prix récurrent : impossible de créer un abonnement.`,
    });
  }
  if (price.recurring && !isKnownInterval(price.recurring.interval)) {
    issues.push({
      level: "blocking",
      message: `Le Price Stripe de ${name} (${price.id}) a une période de facturation non prise en charge.`,
    });
  }
  if (price.unit_amount === null) {
    issues.push({
      level: "blocking",
      message: `Le Price Stripe de ${name} (${price.id}) n'a pas de montant fixe (tarification par paliers non prise en charge).`,
    });
  }
  if (issues.length) return issues;

  const expected = configPlanPrice(plan);
  const currency = price.currency.toUpperCase();
  if (currency !== expected.currency) {
    issues.push({
      level: "mismatch",
      message: `${name} : OVO affiche des prix en ${expected.currency}, le Price Stripe est en ${currency}.`,
    });
  }
  const recurring = price.recurring!;
  const interval = recurring.interval as BillingInterval;
  if (interval !== "month" || recurring.interval_count !== 1) {
    issues.push({
      level: "mismatch",
      message: `${name} : OVO affiche un prix mensuel, mais la période de facturation du Price Stripe est de ${recurring.interval_count} ${INTERVAL_LABELS[interval][recurring.interval_count === 1 ? 0 : 1]}.`,
    });
  }
  if (currency === expected.currency && price.unit_amount !== expected.unitAmount) {
    issues.push({
      level: "mismatch",
      message: `${name} : OVO affiche ${formatMoney(expected.unitAmount, expected.currency)}, mais le Price Stripe est à ${formatMoney(price.unit_amount!, currency)}. Corrige config/premium.ts ou le prix dans Stripe.`,
    });
  }
  return issues;
}

/** Prix à afficher : celui de Stripe s'il est utilisable, sinon celui de la configuration. */
export function planPriceFrom(plan: PaidPlanId, price: StripePriceLike | null): PlanPrice {
  if (
    !price ||
    !price.recurring ||
    price.unit_amount === null ||
    !isKnownInterval(price.recurring.interval)
  ) {
    return configPlanPrice(plan);
  }
  return {
    unitAmount: price.unit_amount,
    currency: price.currency.toUpperCase(),
    interval: price.recurring.interval,
    intervalCount: price.recurring.interval_count,
    source: "stripe",
  };
}
