"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-provider";

const INTERVAL_MS = 3000;
const MAX_TRIES = 20;

/**
 * Après le paiement, relit l'état de l'abonnement côté serveur toutes les 3 s
 * jusqu'à la confirmation par le webhook Stripe (environ une minute au plus).
 */
export function ConfirmationPoller({ confirmed }: { confirmed: boolean }) {
  const router = useRouter();
  const { refresh } = useAuth();
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (confirmed) {
      void refresh();
      return;
    }
    if (tries >= MAX_TRIES) return;
    const timer = window.setTimeout(() => {
      setTries((n) => n + 1);
      router.refresh();
    }, INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [confirmed, tries, router, refresh]);

  if (confirmed) return null;
  return (
    <p
      role="status"
      aria-live="polite"
      className="mt-6 flex items-center justify-center gap-2 text-sm text-night-100/75"
    >
      {tries < MAX_TRIES ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Confirmation par Stripe en cours…
        </>
      ) : (
        "La confirmation prend plus de temps que prévu. Pas d'inquiétude : ton compte sera mis à jour automatiquement dès que Stripe l'aura confirmée. Reviens dans quelques minutes."
      )}
    </p>
  );
}
