"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { mainNav, routes } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Menu plein écran (mobile et tablette) : grands titres qui montent ligne
 * par ligne. Fermeture : bouton, Échap, changement de page. Le focus est
 * gardé dans le menu tant qu'il est ouvert.
 */
export function MobileMenu({ account, signedIn }: { account: { href: string; label: string }; signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panel = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
      if (event.key === "Tab" && panel.current) {
        const focusables = panel.current.querySelectorAll<HTMLElement>("a, button");
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    panel.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const links = [
    { label: "Accueil", href: routes.home, index: "00" },
    ...mainNav,
    { label: account.label, href: account.href, index: "05" },
  ];

  return (
    <div className="lg:hidden">
      <button
        ref={toggle}
        type="button"
        aria-expanded={open}
        aria-controls="menu-mobile"
        onClick={() => setOpen((value) => !value)}
        className="relative z-[70] flex min-h-11 min-w-11 items-center justify-center gap-3 px-2"
      >
        <span className="meta text-silver">{open ? "Fermer" : "Menu"}</span>
        <span aria-hidden className="relative block h-3 w-6">
          <span
            className={cn(
              "absolute left-0 h-px w-6 bg-paper transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)]",
              open ? "top-1.5 rotate-45" : "top-0",
            )}
          />
          <span
            className={cn(
              "absolute left-0 h-px bg-paper transition-all duration-[var(--dur-base)] ease-[var(--ease-out)]",
              open ? "top-1.5 w-6 -rotate-45" : "top-3 w-4",
            )}
          />
        </span>
      </button>

      <div
        id="menu-mobile"
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
        className="fixed inset-0 z-[60] flex flex-col bg-void pt-[var(--header-h)]"
      >
        <nav aria-label="Menu mobile" className="shell flex flex-1 flex-col justify-center">
          <ul className="grid gap-1">
            {links.map((item, index) => (
              <li key={item.href} className="line-mask">
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="line-inner flex min-h-14 items-baseline gap-4 py-1 aria-[current=page]:text-volt"
                  style={{ animation: open ? `rise-line 700ms var(--ease-out) ${80 + index * 60}ms both` : undefined } as CSSProperties}
                >
                  <span className="meta text-mist">{item.index}</span>
                  <span className="font-expanded text-[clamp(2rem,10vw,3.5rem)]">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {!signedIn && (
          <div className="shell pb-[max(2rem,env(safe-area-inset-bottom))]">
            <Link href={routes.signup} className="meta flex min-h-14 items-center justify-center bg-paper text-void">
              Commencer gratuitement
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
