"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Attraction magnétique subtile vers le pointeur (déplacement max ~ `strength` px).
 * La zone cliquable ne bouge pas : seul le contenu visuel se déplace, le bouton
 * reste donc facile à atteindre. Désactivé au toucher et en mouvement réduit.
 */
export function Magnetic({ children, strength = 10, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !window.matchMedia("(pointer: fine)").matches) return;
    const inner = element.firstElementChild as HTMLElement | null;
    if (!inner) return;

    const onMove = (event: PointerEvent) => {
      if (document.documentElement.dataset.motion === "reduced") return;
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      inner.style.transition = "transform 160ms var(--ease-out)";
      inner.style.transform = `translate3d(${(x * strength).toFixed(2)}px, ${(y * strength * 0.6).toFixed(2)}px, 0)`;
    };
    const onLeave = () => {
      inner.style.transition = "transform 700ms var(--ease-spring)";
      inner.style.transform = "translate3d(0,0,0)";
    };
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);
    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);

  return (
    <span ref={ref} className={cn("inline-flex", className)}>
      {children}
    </span>
  );
}
