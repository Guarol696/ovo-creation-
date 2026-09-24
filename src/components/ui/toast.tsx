"use client";

import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string | null;
  tone?: "success" | "error";
  onClose: () => void;
  /** Durée d'affichage (ms). */
  duration?: number;
}

/** Petite notification en bas d'écran, annoncée aux lecteurs d'écran. */
export function Toast({ message, tone = "success", onClose, duration = 4500 }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [message, onClose, duration]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[60] flex justify-center px-4 lg:bottom-[max(1rem,env(safe-area-inset-bottom))]"
    >
      {message && (
        <div
          className={cn(
            "pointer-events-auto flex max-w-md animate-pop items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold shadow-2xl ring-1",
            tone === "success"
              ? "bg-night-800 text-white ring-emerald-400/40"
              : "bg-night-800 text-red-100 ring-red-400/50",
          )}
        >
          {tone === "success" ? (
            <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="size-5 shrink-0 text-red-400" />
          )}
          <span>{message}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la notification"
            className="-mr-1 grid size-8 shrink-0 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
