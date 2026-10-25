"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { clamp } from "@/lib/utils";

interface ScrollSceneProps {
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  /**
   * « sticky » : 0 quand le haut de la section touche le haut de l'écran,
   *  1 quand son bas touche le bas (section haute + enfant `position: sticky`).
   * « through » : 0 quand la section entre par le bas, 1 quand elle sort par le haut.
   */
  mode?: "sticky" | "through";
  id?: string;
  "aria-labelledby"?: string;
}

/**
 * Expose la progression de défilement d'une section dans la variable CSS
 * `--p` (0 → 1). Les transformations sont décrites en CSS (calc), ce qui
 * garde le défilement natif et ne touche que transform/opacity.
 * Écoute uniquement quand la section est visible ; en mouvement réduit,
 * `--p` vaut 1 (état final, lisible).
 */
export function ScrollScene({ as: Tag = "section", className, style, children, mode = "through", ...rest }: ScrollSceneProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const root = document.documentElement;

    let frame = 0;
    let last = -1;
    const measure = () => {
      frame = 0;
      if (root.dataset.motion === "reduced") {
        element.style.setProperty("--p", "1");
        return;
      }
      const rect = element.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress =
        mode === "sticky"
          ? clamp(-rect.top / Math.max(1, rect.height - vh), 0, 1)
          : clamp((vh - rect.top) / (rect.height + vh), 0, 1);
      const rounded = Math.round(progress * 1000) / 1000;
      if (rounded === last) return;
      last = rounded;
      element.style.setProperty("--p", String(rounded));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        schedule();
      } else {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        schedule();
      }
    });
    visibility.observe(element);
    measure();

    return () => {
      visibility.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [mode]);

  return (
    <Tag ref={ref} className={className} style={{ "--p": 0, ...style } as CSSProperties} {...rest}>
      {children}
    </Tag>
  );
}
