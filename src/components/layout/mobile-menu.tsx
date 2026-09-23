"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, LogOut, X } from "lucide-react";
import { mainNav, routes } from "@/config/site";
import { Button, ButtonLink } from "@/components/ui/button";
import { signOut } from "@/features/auth/actions";
import { useAuth } from "@/features/auth/auth-provider";
import { AccountSkeleton, Avatar } from "@/features/auth/components/account-menu";
import { PremiumBadge } from "@/features/premium/components/premium-badge";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { status, user, isPremium } = useAuth();
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
        {status === "loading" && <AccountSkeleton className="h-13 w-full" />}
        {status === "authenticated" && user && (
          <>
            <p className="flex items-center gap-3 pb-1 text-sm text-night-100/75">
              <Avatar user={user} className="size-10 text-base" />
              <span className="min-w-0">
                Connecté·e en tant que{" "}
                <span className="flex items-center gap-2">
                  <span className="truncate font-semibold text-white">{user.displayName}</span>
                  {isPremium && <PremiumBadge size="xs" />}
                </span>
              </span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <ButtonLink href={routes.account} size="lg" variant="outline-light" onClick={onClose}>
                Mon profil
              </ButtonLink>
              <ButtonLink href={routes.myTrips} size="lg" onClick={onClose}>
                Mes voyages
              </ButtonLink>
            </div>
            <form action={signOut} onSubmit={onClose}>
              <Button type="submit" size="lg" variant="ghost-light" className="w-full">
                <LogOut className="size-4" /> Déconnexion
              </Button>
            </form>
          </>
        )}
        {(status === "anonymous" || status === "unavailable") && (
          <>
            <ButtonLink href={routes.createTrip} size="lg" onClick={onClose} className="w-full">
              Créer mon voyage
            </ButtonLink>
            <div className={cn("grid gap-3", status === "anonymous" && "grid-cols-2")}>
              <ButtonLink href={routes.login} size="lg" variant="outline-light" onClick={onClose}>
                Connexion
              </ButtonLink>
              {status === "anonymous" && (
                <ButtonLink href={routes.signUp} size="lg" variant="outline-light" onClick={onClose}>
                  Inscription
                </ButtonLink>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
