"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { TransitionLink } from "@/components/motion/transition-link";
import { mainNav, routes } from "@/config/site";
import { useAuth } from "@/features/auth/use-auth";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";

export function Header() {
  const pathname = usePathname();
  const auth = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const account =
    auth.status === "signed-in"
      ? { href: routes.dashboard, label: "Mon espace" }
      : { href: routes.login, label: "Connexion" };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-[var(--dur-base)]",
        scrolled ? "border-b hairline bg-void/70 backdrop-blur-xl" : "border-b border-transparent",
      )}
    >
      <a
        href="#contenu"
        className="meta absolute top-2 left-2 z-10 -translate-y-20 bg-paper px-4 py-3 text-void focus:translate-y-0"
      >
        Aller au contenu
      </a>
      <div className="shell flex h-[var(--header-h)] items-center justify-between gap-6">
        <Link href={routes.home} className="flex min-h-11 items-center" aria-label="Accueil">
          <Logo />
        </Link>

        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <TransitionLink
                    href={item.href}
                    transitionLabel={item.label}
                    aria-current={active ? "page" : undefined}
                    className="group meta relative flex min-h-11 items-center gap-2 px-4 text-silver transition-colors hover:text-paper aria-[current=page]:text-paper"
                  >
                    <span className="text-mist transition-colors group-hover:text-volt group-aria-[current=page]:text-volt">
                      {item.index}
                    </span>
                    {item.label}
                    <span
                      aria-hidden
                      className="absolute inset-x-4 bottom-2 h-px origin-left scale-x-0 bg-paper transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:scale-x-100 group-aria-[current=page]:scale-x-100"
                    />
                  </TransitionLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={account.href}
            className="meta hidden min-h-11 items-center px-3 text-silver transition-colors hover:text-paper sm:flex"
          >
            {auth.status === "signed-in" && auth.name ? auth.name : account.label}
          </Link>
          {auth.status !== "signed-in" && (
            <TransitionLink
              href={routes.signup}
              transitionLabel="Start"
              className="meta hidden min-h-11 items-center border hairline px-4 text-paper transition-colors hover:border-paper sm:flex"
            >
              Commencer
            </TransitionLink>
          )}
          <MobileMenu account={account} signedIn={auth.status === "signed-in"} />
        </div>
      </div>
    </header>
  );
}
