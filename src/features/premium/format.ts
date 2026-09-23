import { PREMIUM_PRICING } from "@/config/premium";

const planPrice = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: PREMIUM_PRICING.currency,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** « 4,99 € » */
export const formatPlanPrice = (amount: number) => planPrice.format(amount);

/** Économie de la formule annuelle par rapport à 12 mois, en %. */
export const yearlySavingPercent = () =>
  Math.round((1 - PREMIUM_PRICING.yearly / (PREMIUM_PRICING.monthly * 12)) * 100);
