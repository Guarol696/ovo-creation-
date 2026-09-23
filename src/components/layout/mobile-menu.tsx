"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, X } from "lucide-react";
import { mainNav, routes } from "@/config/site";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  // Bloque le scroll de la page et ferme avec Échap.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  // Referme le menu si l'écran repasse en format desktop.
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const onChange = () => media.matches && onClose();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [onClose]);

  return (
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={!open}
      inert={!open}
      className={cn(
        "fixed inset-0 z-50 flex h-dvh flex-col overflow-hidden bg-night-950 transition-all duration-500 lg:hidden",
        open ? "visible opacity-100" : "invisible opacity-0",
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 size-96 rounded-full bg-sun-500/20 blur-3xl"
      />

      <div className="relative flex h-16 items-center justify-between px-5 sm:h-20 sm:px-8">
        <Logo onClick={onClose} />
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le menu"
          className="grid size-11 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/15"
        >
          <X className="size-5" />
        </button>
      </div>

      <nav aria-label="Navigation mobile" className="relative flex-1 overflow-y-auto px-5 pt-8 sm:px-8">
        <ul className="space-y-2">
          {mainNav.map((link, index) => (
            <li
              key={link.href}
              className={cn(
                "transition-all duration-500",
                open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              )}
              style={{ transitionDelay: open ? `${100 + index * 60}ms` : "0ms" }}
            >
              <Link
                href={link.href}
                onClick={onClose}
                className="flex items-center justify-between border-b border-white/10 py-5 font-display text-3xl font-bold text-white"
              >
                {link.label}
                <ArrowRight className="size-6 text-sun-400" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="relative space-y-3 px-5 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8">
        <ButtonLink href={routes.createTrip} size="lg" onClick={onClose} className="w-full">
          Créer mon voyage
        </ButtonLink>
        <ButtonLink
          href={routes.login}
          size="lg"
          variant="outline-light"
          onClick={onClose}
          className="w-full"
        >
          Connexion
        </ButtonLink>
      </div>
    </div>
  );
}
