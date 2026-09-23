import { describe, expect, it } from "vitest";
import {
  checkPlanPrice,
  configPlanPrice,
  formatMoney,
  formatPlanPriceLabel,
  planPriceFrom,
} from "../price-check";

const nbsp = (s: string) => s.replace(/[  ]/g, " ");

const price = (overrides: Partial<Parameters<typeof checkPlanPrice>[1]> = {}) => ({
  id: "price_medium",
  active: true,
  currency: "eur",
  type: "recurring" as const,
  unit_amount: 599,
  recurring: { interval: "month" as const, interval_count: 1 },
  ...overrides,
});

describe("vérification des prix Stripe", () => {
  it("accepte un Price identique à la configuration OVO", () => {
    expect(checkPlanPrice("medium", price())).toEqual([]);
    expect(checkPlanPrice("premium", price({ id: "price_premium", unit_amount: 999 }))).toEqual([]);
  });

  it("signale un montant différent (5,99 € affiché, 6,99 € chez Stripe)", () => {
    const issues = checkPlanPrice("medium", price({ unit_amount: 699 }));
    expect(issues).toHaveLength(1);
    expect(issues[0]!.level).toBe("mismatch");
    expect(nbsp(issues[0]!.message)).toContain("OVO affiche 5,99 €, mais le Price Stripe est à 6,99 €");
  });

  it("signale une devise ou une période différente", () => {
    const usd = checkPlanPrice("medium", price({ currency: "usd" }));
    expect(usd.map((i) => i.message).join()).toMatch(/en EUR, le Price Stripe est en USD/);
    const yearly = checkPlanPrice("medium", price({ recurring: { interval: "year", interval_count: 1 } }));
    expect(yearly[0]!.message).toMatch(/prix mensuel.*1 an/);
  });

  it("bloque un Price archivé, non récurrent ou sans montant fixe", () => {
    expect(checkPlanPrice("medium", price({ active: false }))[0]!.level).toBe("blocking");
    expect(checkPlanPrice("medium", price({ type: "one_time", recurring: null }))[0]!.level).toBe("blocking");
    expect(checkPlanPrice("medium", price({ unit_amount: null }))[0]!.level).toBe("blocking");
  });

  it("affiche le prix Stripe (source de vérité) et retombe sur la configuration sinon", () => {
    expect(planPriceFrom("medium", price({ unit_amount: 699 }))).toMatchObject({
      unitAmount: 699,
      currency: "EUR",
      source: "stripe",
    });
    expect(planPriceFrom("medium", null)).toEqual(configPlanPrice("medium"));
    expect(nbsp(formatPlanPriceLabel(configPlanPrice("premium")))).toBe("9,99 € / mois");
    expect(formatMoney(1200, "JPY")).not.toContain(",");
  });
});
