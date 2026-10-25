"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[page]", error);
  }, [error]);

  return (
    <section className="shell flex min-h-[70dvh] flex-col justify-center gap-6 pt-[var(--header-h)]">
      <p className="meta text-danger">[ Erreur ] Chargement interrompu</p>
      <h1 className="font-expanded display-md">Quelque chose a cédé.</h1>
      <p className="max-w-md text-silver">
        La page n&apos;a pas pu s&apos;afficher. Réessaie ; si le problème persiste, reviens un peu plus tard.
      </p>
      <div>
        <Button onClick={reset} arrow>
          Réessayer
        </Button>
      </div>
    </section>
  );
}
