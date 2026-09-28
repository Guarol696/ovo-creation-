"use client";

import { Cookie } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { buttonStyles } from "@/components/ui/button";
import { affiliate } from "@/config/affiliate";
import { routes } from "@/config/site";
import { cn } from "@/lib/utils";
import { readConsent, saveConsent, subscribeConsent } from "./consent-store";

const DRIVE_SCRIPT_ID = "travelpayouts-drive";

/** Pages où le script partenaire ne se charge jamais (compte, connexion, paiement). */
const PRIVATE_PREFIXES = [
  routes.account,
  routes.myTrips,
  routes.login,
  routes.signUp,
  routes.forgotPassword,
  routes.resetPassword,
  routes.authConfirm,
  "/payment",
];

function isPrivatePage(pathname: string) {
  return PRIVATE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/** Rendu serveur : aucun choix connu, rien n'est affiché ni chargé. */
const serverSnapshot = () => "unknown" as const;

/**
 * Bandeau cookies + chargement du script Travelpayouts « Drive », uniquement
 * après accord explicite et jamais sur les pages de compte ou de paiement.
 * Refuser est aussi simple qu'accepter (recommandations CNIL).
 */
export function CookieConsent() {
  const pathname = usePathname();
  const choice = useSyncExternalStore(subscribeConsent, readConsent, serverSnapshot);
  const loadDrive = choice === "accepted" && !isPrivatePage(pathname);

  useEffect(() => {
    const loaded = document.getElementById(DRIVE_SCRIPT_ID);
    // Arrivée sur une page privée avec le script déjà chargé : on recharge la page sans lui.
    if (loaded && isPrivatePage(pathname)) {
      window.location.reload();
      return;
    }
    if (!loadDrive || loaded) return;
    const script = document.createElement("script");
    script.id = DRIVE_SCRIPT_ID;
    script.async = true;
    script.setAttribute("data-cmp-ab", "2");
    script.src = affiliate.driveScriptSrc;
    document.head.appendChild(script);
  }, [loadDrive, pathname]);

  if (choice !== null) return null;

  return (
    <section
      role="dialog"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-text"
      className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-xl rounded-3xl bg-night-900/95 p-5 text-white shadow-2xl ring-1 ring-white/15 backdrop-blur-xl lg:bottom-6"
    >
      <p id="cookie-title" className="flex items-center gap-2 font-display text-lg font-bold">
        <Cookie aria-hidden="true" className="size-5 text-gold-300" /> Cookies partenaires
      </p>
      <p id="cookie-text" className="mt-2 text-sm leading-relaxed text-night-100/80">
        OVO fonctionne sans. Avec ton accord, un outil de notre partenaire Travelpayouts suit les liens vers
        les sites de réservation, ce qui peut nous rapporter une commission (sans surcoût pour toi). Jamais
        sur ton compte ni pendant un paiement.{" "}
        <Link href={routes.privacy} className="font-semibold text-sun-400 underline underline-offset-2">
          En savoir plus
        </Link>
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => saveConsent("refused")}
          className={cn(buttonStyles({ variant: "outline-light" }), "w-full")}
        >
          Refuser
        </button>
        <button
          type="button"
          onClick={() => saveConsent("accepted")}
          className={cn(buttonStyles({ variant: "outline-light" }), "w-full")}
        >
          Accepter
        </button>
      </div>
    </section>
  );
}

/** Bouton « Gérer les cookies » : efface le choix pour réafficher le bandeau. */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => saveConsent(null)}
      className={cn(
        "inline-flex min-h-11 items-center underline-offset-2 hover:text-white hover:underline",
        className,
      )}
    >
      Gérer les cookies
    </button>
  );
}
