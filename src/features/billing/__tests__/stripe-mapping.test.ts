import type Stripe from "stripe";
import { describe, expect, it } from "vitest";
import type { PaidPlanId } from "@/config/premium";
import { buildCheckoutParams, invoiceSubscriptionId, subscriptionToFields } from "../stripe-mapping";

const planFor = (priceId: string | null): PaidPlanId | null =>
  priceId === "price_medium" ? "medium" : priceId === "price_premium" ? "premium" : null;

const subscription = (overrides: Record<string, unknown> = {}, item: Record<string, unknown> = {}) =>
  ({
    id: "sub_123",
    object: "subscription",
    customer: "cus_123",
    status: "active",
    cancel_at_period_end: false,
    cancel_at: null,
    items: {
      data: [
        {
          price: { id: "price_medium" },
          current_period_start: 1_790_000_000,
          current_period_end: 1_792_600_000,
          ...item,
        },
      ],
    },
    ...overrides,
  }) as unknown as Stripe.Subscription;

describe("abonnement Stripe → ligne OVO", () => {
  it("offre, statut, période (sur l'élément d'abonnement) et identifiants", () => {
    expect(subscriptionToFields(subscription(), planFor)).toEqual({
      plan: "medium",
      subscription_status: "active",
      current_period_start: new Date(1_790_000_000 * 1000).toISOString(),
      current_period_end: new Date(1_792_600_000 * 1000).toISOString(),
      cancel_at_period_end: false,
      stripe_customer_id: "cus_123",
      stripe_subscription_id: "sub_123",
      stripe_price_id: "price_medium",
    });
  });

  it("changement d'offre : le Price ID détermine le plan", () => {
    expect(subscriptionToFields(subscription({}, { price: { id: "price_premium" } }), planFor).plan).toBe(
      "premium",
    );
  });

  it("Price ID inconnu : aucun droit", () => {
    expect(subscriptionToFields(subscription({}, { price: { id: "price_pirate" } }), planFor).plan).toBe(
      "free",
    );
  });

  it("annulation programmée (cancel_at_period_end ou cancel_at) et statut inconnu", () => {
    expect(
      subscriptionToFields(subscription({ cancel_at_period_end: true }), planFor).cancel_at_period_end,
    ).toBe(true);
    expect(
      subscriptionToFields(subscription({ cancel_at: 1_792_600_000 }), planFor).cancel_at_period_end,
    ).toBe(true);
    expect(subscriptionToFields(subscription({ status: "weird" }), planFor).subscription_status).toBe(
      "incomplete",
    );
  });

  it("ancien format (période sur l'abonnement) et client développé", () => {
    const legacy = subscription(
      { customer: { id: "cus_obj" }, current_period_start: 1_700_000_000, current_period_end: 1_702_600_000 },
      { current_period_start: undefined, current_period_end: undefined },
    );
    const fields = subscriptionToFields(legacy, planFor);
    expect(fields.stripe_customer_id).toBe("cus_obj");
    expect(fields.current_period_end).toBe(new Date(1_702_600_000 * 1000).toISOString());
  });
});

describe("facture → abonnement", () => {
  it("API récente (parent.subscription_details) et ancienne (subscription)", () => {
    const recent = {
      parent: { subscription_details: { subscription: "sub_new" } },
    } as unknown as Stripe.Invoice;
    const legacy = { parent: null, subscription: "sub_old" } as unknown as Stripe.Invoice;
    const none = { parent: null } as unknown as Stripe.Invoice;
    expect(invoiceSubscriptionId(recent)).toBe("sub_new");
    expect(invoiceSubscriptionId(legacy)).toBe("sub_old");
    expect(invoiceSubscriptionId(none)).toBeNull();
  });
});

describe("session Checkout", () => {
  it("mode abonnement, bon Price ID, compte OVO et client Stripe liés", () => {
    const params = buildCheckoutParams({
      plan: "premium",
      priceId: "price_premium",
      customerId: "cus_123",
      userId: "7b1f0c9e-2d7a-4f55-9d8e-1a2b3c4d5e6f",
      siteUrl: "https://ovo.example",
    });
    expect(params).toMatchObject({
      mode: "subscription",
      customer: "cus_123",
      client_reference_id: "7b1f0c9e-2d7a-4f55-9d8e-1a2b3c4d5e6f",
      line_items: [{ price: "price_premium", quantity: 1 }],
      success_url: "https://ovo.example/payment/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://ovo.example/payment/cancel?offre=premium",
      subscription_data: {
        metadata: { ovo_user_id: "7b1f0c9e-2d7a-4f55-9d8e-1a2b3c4d5e6f", ovo_plan: "premium" },
      },
    });
  });
});
