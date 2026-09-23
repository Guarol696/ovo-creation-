"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { mainNav, routes } from "@/config/site";
import { ButtonLink } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { AccountMenu, AccountSkeleton } from "@/features/auth/components/account-menu";
import { LogoutFlash } from "@/features/auth/components/logout-flash";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const pathname = usePathname();
  const isCreatingTrip = pathname === routes.createTrip;
  const { status, user, isPremium } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-white/10 bg-night-950/80 shadow-lg shadow-night-950/20 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:h-20 sm:px-8">
          <Logo />

          <nav aria-label="Navigation principale" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className="rounded-full px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white aria-[current=page]:bg-white/10 aria-[current=page]:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              {status === "loading" && <AccountSkeleton />}
              {status === "authenticated" && user && <AccountMenu user={user} isPremium={isPremium} />}
              {(status === "anonymous" || status === "unavailable") && (
                <>
                  <ButtonLink href={routes.login} variant="ghost-light">
                    Connexion
                  </ButtonLink>
                  {status === "anonymous" && (
                    <ButtonLink href={routes.signUp} variant="outline-light">
                      Inscription
                    </ButtonLink>
                  )}
                </>
              )}
            </div>
            {!isCreatingTrip && (
              <ButtonLink href={routes.createTrip} className="hidden sm:inline-flex lg:hidden">
                Créer mon voyage
              </ButtonLink>
            )}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="grid size-11 place-items-center rounded-full border border-white/15 bg-white/5 text-white backdrop-blur-md transition-colors hover:bg-white/15 lg:hidden"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hors du <header> : son backdrop-filter piégerait un enfant en position fixed. */}
      <MobileMenu open={menuOpen} onClose={closeMenu} />
      <LogoutFlash />
    </>
  );
}
