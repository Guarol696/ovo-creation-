"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-provider";

const INTERVAL_MS = 3000;
const MAX_TRIES = 5;

/**
 * Retour du portail Stripe : un changement (offre, annulation, carte) n'est
 * affiché qu'une fois confirmé par Stripe via le webhook. On relit donc l'état
 * côté serveur quelques fois, sans jamais supposer ce qui a changé.
 */
export function PortalReturnNotice() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [tries, setTries] = useState(0);
  const done = tries >= MAX_TRIES;

  useEffect(() => {
    if (done) {
      void refresh();
      return;
    }
    const timer = window.setTimeout(() => {
      setTries((n) => n + 1);
      router.refresh();
    }, INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [done, router, refresh]);

  return (
    <p
      role="status"
      aria-live="polite"
      data-testid="portal-return"
      className="flex items-start gap-2 rounded-3xl bg-sky-500/10 px-4 py-3 text-sm text-sky-100 ring-1 ring-sky-400/30"
    >
      {done ? (
        <>
          <RefreshCw className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Ton abonnement est à jour avec Stripe. Si un changement récent n&apos;apparaît pas encore, recharge
          la page dans un instant.
        </>
      ) : (
        <>
          <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin" aria-hidden="true" />
          Synchronisation avec Stripe… Les changements s&apos;affichent ici dès que Stripe les a confirmés.
        </>
      )}
    </p>
  );
}
