"use client";

import { Loader2, Settings2, Sparkles } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { PLANS, type PaidPlanId } from "@/config/premium";
import { FormMessage } from "@/features/auth/components/form-controls";
import { cn } from "@/lib/utils";
import { openBillingPortal, startCheckout, type BillingActionState } from "../actions";

const idle: BillingActionState = { status: "idle" };

function PendingButton({
  children,
  pendingLabel,
  variant,
  className,
}: {
  children: React.ReactNode;
  pendingLabel: string;
  variant?: "primary" | "outline-light";
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      variant={variant}
      className={className}
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <Loader2 className="size-5 animate-spin" aria-hidden="true" /> {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

/** « Commencer Medium / Premium » → session Stripe Checkout créée par le serveur. */
export function CheckoutButton({
  plan,
  className,
  variant = "primary",
}: {
  plan: PaidPlanId;
  className?: string;
  variant?: "primary" | "outline-light";
}) {
  const [state, action] = useActionState(startCheckout, idle);
  return (
    <form action={action} className={cn("space-y-3", className)}>
      <input type="hidden" name="plan" value={plan} />
      <PendingButton pendingLabel="Redirection vers le paiement…" variant={variant} className="w-full">
        <Sparkles className="size-5" aria-hidden="true" /> Commencer {PLANS[plan].shortName}
      </PendingButton>
      {state.status === "error" && <FormMessage tone="error">{state.message}</FormMessage>}
    </form>
  );
}

/**
 * « Gérer mon abonnement » → portail client Stripe (paiement, factures, offre, annulation).
 * `intent` ouvre directement la confirmation d'un changement d'offre ou l'annulation.
 */
export function ManageBillingButton({
  className,
  label = "Gérer mon abonnement",
  variant = "outline-light",
  intent,
}: {
  className?: string;
  label?: string;
  variant?: "primary" | "outline-light";
  intent?: PaidPlanId | "cancel";
}) {
  const [state, action] = useActionState(openBillingPortal, idle);
  return (
    <form action={action} className={cn("space-y-3", className)}>
      {intent && <input type="hidden" name="intent" value={intent} />}
      <PendingButton pendingLabel="Ouverture…" variant={variant} className="w-full">
        <Settings2 className="size-4" aria-hidden="true" /> {label}
      </PendingButton>
      {state.status === "error" && <FormMessage tone="error">{state.message}</FormMessage>}
    </form>
  );
}
