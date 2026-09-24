"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "pourquoi", label: "Résumé" },
  { id: "transport", label: "Transport" },
  { id: "hebergement", label: "Hébergement" },
  { id: "programme", label: "Programme" },
  { id: "carte", label: "Carte" },
  { id: "activites", label: "Que faire" },
  { id: "restaurants", label: "Où manger" },
  { id: "budget", label: "Budget" },
] as const;

/**
 * Sommaire du voyage, collé sous l'en-tête : on saute d'une section à l'autre
 * sans remonter la page, et la section en cours de lecture est mise en évidence.
 */
export function ResultSectionNav() {
  const [active, setActive] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const elements = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    const onScroll = () => {
      // Section active : la dernière dont le haut a dépassé le tiers supérieur de l'écran.
      const line = window.innerHeight / 3;
      let current: string | null = null;
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= line && rect.height > 0) current = el.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    // Changement de mise en page sans défilement (ex. bascule Itinéraire / Carte sur mobile).
    const resizeObserver = new ResizeObserver(onScroll);
    resizeObserver.observe(document.body);
    return () => {
      window.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
    };
  }, []);

  // Garde l'onglet actif visible dans la barre défilante (sans faire défiler la page).
  useEffect(() => {
    const list = listRef.current;
    const link = active ? list?.querySelector<HTMLElement>(`[data-section="${active}"]`) : null;
    if (!list || !link) return;
    const left = link.offsetLeft - list.clientWidth / 2 + link.clientWidth / 2;
    list.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  return (
    <nav
      aria-label="Sections du voyage"
      className="sticky top-16 z-30 border-y border-white/10 bg-night-950/85 backdrop-blur-xl sm:top-20"
    >
      <ul
        ref={listRef}
        className="mx-auto scrollbar-none flex max-w-7xl gap-2 overflow-x-auto px-5 py-2 sm:px-8"
      >
        {SECTIONS.map((s) => (
          <li key={s.id} className="shrink-0">
            <a
              href={`#${s.id}`}
              data-section={s.id}
              aria-current={active === s.id ? "location" : undefined}
              className={cn(
                "inline-flex min-h-10 items-center rounded-full px-4 text-sm font-medium whitespace-nowrap ring-1 transition",
                active === s.id
                  ? "bg-white text-night-950 ring-white"
                  : "bg-white/[0.07] text-white/85 ring-white/10 hover:bg-white/15 hover:text-white",
              )}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
