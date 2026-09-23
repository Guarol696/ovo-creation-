"use client";

import { Check, Heart, Link2, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SaveTripButtonProps {
  destinationName: string;
  className?: string;
  variant?: "primary" | "outline-light";
}

/**
 * « Enregistrer mon voyage » : les comptes arrivent à une prochaine étape.
 * En attendant, on explique et on propose de copier le lien du voyage.
 */
export function SaveTripButton({ destinationName, className, variant = "primary" }: SaveTripButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <Button
        size="lg"
        variant={variant}
        className={className}
        onClick={() => dialogRef.current?.showModal()}
        aria-haspopup="dialog"
      >
        <Heart className="size-5" /> Enregistrer mon voyage
      </Button>

      <dialog
        ref={dialogRef}
        aria-labelledby="save-dialog-title"
        onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-4xl bg-night-900 p-0 text-white shadow-2xl ring-1 ring-white/15 backdrop:bg-night-950/70 backdrop:backdrop-blur-sm"
      >
        <div className="relative p-6 sm:p-8">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Fermer"
            className="absolute top-4 right-4 grid size-10 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" />
          </button>
          <span
            aria-hidden="true"
            className="grid size-14 place-items-center rounded-2xl bg-sun-400/15 text-3xl"
          >
            💾
          </span>
          <h2 id="save-dialog-title" className="mt-5 font-display text-2xl font-bold">
            Bientôt dans ton espace OVO
          </h2>
          <p className="mt-3 leading-relaxed text-night-100/80">
            La sauvegarde de tes voyages arrive très vite avec les comptes OVO. Tu pourras retrouver ton
            voyage à {destinationName} sur tous tes appareils.
          </p>
          <p className="mt-3 text-sm text-night-100/65">
            En attendant, garde simplement le lien de cette page : il contient toutes tes réponses.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button onClick={copyLink} className="w-full" size="lg">
              {copied ? <Check className="size-5" /> : <Link2 className="size-5" />}
              {copied ? "Lien copié !" : "Copier le lien du voyage"}
            </Button>
            <Button variant="outline-light" size="lg" className="w-full" disabled>
              Créer mon compte — bientôt
            </Button>
          </div>
          <p aria-live="polite" className={cn("sr-only")}>
            {copied ? "Lien copié dans le presse-papiers" : ""}
          </p>
        </div>
      </dialog>
    </>
  );
}
