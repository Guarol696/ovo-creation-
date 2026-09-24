"use client";

import { CirclePlus, House, LogIn, Luggage, Sparkles, UserRound, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/config/site";
import { useAuth } from "@/features/auth/auth-provider";
import { cn } from "@/lib/utils";

interface Tab {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Pages rattachées à l'onglet (ex. un voyage enregistré → « Mes voyages »). */
  match: (pathname: string) => boolean;
  primary?: boolean;
}

/**
 * Barre d'onglets mobile (< lg), fixée en bas de l'écran : les destinations
 * principales restent à portée de pouce. Le menu ☰ du header garde les liens
 * secondaires. Absente du questionnaire (qui a sa propre barre d'actions).
 */
export function MobileTabBar() {
  const pathname = usePathname();
  const { status } = useAuth();
  const signedIn = status === "authenticated";

  const tabs: Tab[] = [
    { href: routes.home, label: "Accueil", icon: House, match: (p) => p === routes.home },
    {
      href: routes.createTrip,
      label: "Créer",
      icon: CirclePlus,
      match: (p) => p === routes.createTrip,
      primary: true,
    },
    {
      href: routes.myTrips,
      label: "Voyages",
      icon: Luggage,
      match: (p) => p.startsWith(routes.myTrips),
    },
    { href: routes.premium, label: "Premium", icon: Sparkles, match: (p) => p === routes.premium },
    signedIn || status === "loading"
      ? { href: routes.account, label: "Compte", icon: UserRound, match: (p) => p === routes.account }
      : {
          href: routes.login,
          label: "Connexion",
          icon: LogIn,
          match: (p) => p === routes.login || p === routes.signUp,
        },
  ];

  return (
    <nav
      aria-label="Navigation rapide"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-night-950/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {tabs.map(({ href, label, icon: Icon, match, primary }) => {
          const active = match(pathname);
          return (
            <li key={href} className="flex">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                  active ? "text-sun-400" : "text-night-100/75 hover:text-white",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid place-items-center rounded-full transition",
                    primary
                      ? "-mt-1 size-8 bg-linear-to-br from-sun-400 to-sun-600 text-night-950 shadow-lg shadow-sun-500/30"
                      : "size-6",
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
                </span>
                <span className="leading-none">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
