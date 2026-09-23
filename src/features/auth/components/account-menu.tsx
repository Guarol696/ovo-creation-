"use client";

import { ChevronDown, LogOut, Map, Sparkles, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { routes } from "@/config/site";
import { cn } from "@/lib/utils";
import { PremiumBadge } from "@/features/premium/components/premium-badge";
import { signOut } from "../actions";
import type { SessionUser } from "../auth-provider";

export function Avatar({ user, className }: { user: SessionUser; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full bg-linear-to-br from-sun-400 to-gold-400 text-sm font-extrabold text-night-950 uppercase",
        className,
      )}
    >
      {user.displayName.charAt(0)}
    </span>
  );
}

/** Menu du compte (desktop) : Mon profil, Mes voyages, Déconnexion. */
export function AccountMenu({ user, isPremium }: { user: SessionUser; isPremium: boolean }) {
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  // Ferme le menu quand on change de page (sans effet : comparaison au rendu).
  const isOpen = open && openedAt === pathname;

  useEffect(() => {
    if (!isOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const itemClass =
    "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen(!isOpen);
          setOpenedAt(pathname);
        }}
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={`Mon compte (${user.displayName}${isPremium ? ", OVO Premium" : ""})`}
        className="flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/5 py-1 pr-3 pl-1 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/15"
      >
        <Avatar user={user} />
        <span className="max-w-32 truncate">{user.displayName}</span>
        {isPremium && <PremiumBadge size="xs" />}
        <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      <div
        id={menuId}
        hidden={!isOpen}
        className="absolute right-0 mt-2 w-64 animate-pop rounded-2xl bg-night-900 p-2 shadow-2xl ring-1 ring-white/15"
      >
        <p className="truncate px-3 pt-2 pb-3 text-xs text-night-100/60">
          Connecté·e : <span className="font-semibold text-white/85">{user.email}</span>
        </p>
        <Link href={routes.account} className={itemClass}>
          <UserRound className="size-4 text-gold-300" /> Mon profil
        </Link>
        <Link href={routes.myTrips} className={itemClass}>
          <Map className="size-4 text-gold-300" /> Mes voyages
        </Link>
        <Link href={routes.premium} className={itemClass}>
          <Sparkles className="size-4 text-gold-300" />
          {isPremium ? "Mon offre Premium" : "Découvrir Premium"}
        </Link>
        <form action={signOut} className="mt-1 border-t border-white/10 pt-1">
          <button type="submit" className={itemClass}>
            <LogOut className="size-4 text-sun-400" /> Déconnexion
          </button>
        </form>
      </div>
    </div>
  );
}

/** Emplacement du compte pendant la lecture de la session : ni « connecté » ni « déconnecté ». */
export function AccountSkeleton({ className }: { className?: string }) {
  return (
    <span role="status" className={cn("block h-11 w-32 animate-pulse rounded-full bg-white/10", className)}>
      <span className="sr-only">Chargement de ton compte…</span>
    </span>
  );
}
