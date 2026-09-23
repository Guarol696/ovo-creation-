"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  /** Rôle ARIA : « alertdialog » pour une confirmation destructive. */
  role?: "dialog" | "alertdialog";
  className?: string;
}

/**
 * Fenêtre modale basée sur <dialog> (focus piégé, Échap, fond assombri natifs).
 * Style OVO : carte arrondie bleu nuit, pensée mobile d'abord.
 */
export function Modal({ open, onClose, title, icon, children, role = "dialog", className }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      role={role}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={cn(
        "m-auto w-[calc(100%-2rem)] max-w-md rounded-4xl bg-night-900 p-0 text-white shadow-2xl ring-1 ring-white/15 backdrop:bg-night-950/70 backdrop:backdrop-blur-sm",
        className,
      )}
    >
      {open && (
        <div className="relative animate-pop p-6 sm:p-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="absolute top-4 right-4 grid size-10 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" />
          </button>
          {icon && (
            <span
              aria-hidden="true"
              className="grid size-14 place-items-center rounded-2xl bg-sun-400/15 text-3xl"
            >
              {icon}
            </span>
          )}
          <h2 id={titleId} className={cn("font-display text-2xl font-bold text-balance", icon && "mt-5")}>
            {title}
          </h2>
          {children}
        </div>
      )}
    </dialog>
  );
}
