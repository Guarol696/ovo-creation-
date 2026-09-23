"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { routes } from "@/config/site";
import { FormMessage } from "@/features/auth/components/form-controls";
import { cn } from "@/lib/utils";
import { deleteTrip } from "../actions";

interface DeleteTripButtonProps {
  tripId: string;
  title: string;
  /** Appelé après suppression (liste) ; sinon, retour à « Mes voyages ». */
  onDeleted?: (id: string) => void;
  size?: "md" | "lg";
  className?: string;
}

/** 🗑️ « Supprimer » avec confirmation : « Supprimer ce voyage ? Cette action est définitive. » */
export function DeleteTripButton({
  tripId,
  title,
  onDeleted,
  size = "md",
  className,
}: DeleteTripButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function confirm() {
    startTransition(async () => {
      const result = await deleteTrip(tripId);
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      setOpen(false);
      if (onDeleted) onDeleted(tripId);
      else router.push(`${routes.myTrips}?supprime=1`);
    });
  }

  return (
    <>
      <Button
        variant="ghost-light"
        size={size}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        aria-label={`Supprimer « ${title} »`}
        className={cn("text-red-200 hover:bg-red-500/15 hover:text-red-100", className)}
      >
        <Trash2 className="size-4" /> Supprimer
      </Button>

      <Modal
        open={open}
        onClose={() => !pending && setOpen(false)}
        role="alertdialog"
        icon="🗑️"
        title="Supprimer ce voyage ?"
      >
        <p className="mt-3 leading-relaxed text-night-100/80">
          « {title} » sera retiré de tes voyages.{" "}
          <strong className="text-white">Cette action est définitive.</strong>
        </p>
        {error && (
          <div className="mt-4">
            <FormMessage tone="error">{error}</FormMessage>
          </div>
        )}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline-light"
            size="lg"
            onClick={() => setOpen(false)}
            disabled={pending}
            autoFocus
          >
            Annuler
          </Button>
          <Button
            size="lg"
            onClick={confirm}
            disabled={pending}
            className="bg-red-500 bg-none text-white shadow-red-500/25 hover:bg-red-600 hover:shadow-red-500/35"
          >
            {pending ? <Loader2 className="size-5 animate-spin" /> : <Trash2 className="size-5" />}
            {pending ? "Suppression…" : "Supprimer"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
