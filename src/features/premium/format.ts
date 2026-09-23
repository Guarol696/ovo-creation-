import { CURRENCY } from "@/config/premium";

const planPrice = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** « 5,99 € » (prix des offres, depuis config/premium.ts). */
export const formatPlanPrice = (amount: number) => planPrice.format(amount);

const longDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

/** « 23 octobre 2026 » */
export const formatBillingDate = (iso: string) => longDate.format(new Date(iso));
