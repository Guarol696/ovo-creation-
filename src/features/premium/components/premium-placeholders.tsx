"use client";

import { Settings2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { routes } from "@/config/site";

/**
 * Boutons Premium SANS paiement : aucun moyen de paiement n'est branché
 * pour l'instant, ils ouvrent un message clair.
 */

export function UpgradeButton({ className, size = "lg" }: { className?: string; size?: "md" | "lg" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size={size} className={className} onClick={() => setOpen(true)} aria-haspopup="dialog">
        <Sparkles className="size-5" /> Passer à Premium
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} icon="✨" title="Bientôt disponible">
        <p className="mt-3 leading-relaxed text-night-100/80">
          Le paiement sera disponible prochainement. Aucun paiement n&apos;est demandé pour le moment et
          aucune carte bancaire n&apos;est enregistrée.
        </p>
        <p className="mt-3 leading-relaxed text-night-100/80">
          En attendant, profite de toutes les fonctionnalités gratuites d&apos;OVO.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button size="lg" className="w-full" onClick={() => setOpen(false)} autoFocus>
            D&apos;accord
          </Button>
          <ButtonLink href={routes.createTrip} size="lg" variant="ghost-light" className="w-full">
            Continuer avec OVO Gratuit
          </ButtonLink>
        </div>
      </Modal>
    </>
  );
}

export function ManageSubscriptionButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="outline-light"
        className={className}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <Settings2 className="size-4" /> Gérer mon abonnement
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} icon="⚙️" title="Gérer mon abonnement">
        <p className="mt-3 leading-relaxed text-night-100/80">
          Gestion de l&apos;abonnement bientôt disponible. Tu pourras y retrouver ton offre, ta date de
          renouvellement et tes options.
        </p>
        <Button size="lg" className="mt-6 w-full" onClick={() => setOpen(false)} autoFocus>
          Compris
        </Button>
      </Modal>
    </>
  );
}
