"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Profondeur pilotée par le pointeur : écrit `--mx` / `--my` (-1 → 1, lissés)
 * sur le conteneur. Les couches enfants s'en servent en CSS, par exemple
 * `translate: calc(var(--mx) * 12px) calc(var(--my) * 8px)`.
 * Pointeur fin uniquement ; inactif en mouvement réduit ; boucle arrêtée au repos.
 */
export function PointerDepth({ className, children, style }: { className?: string; children: ReactNode; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !window.matchMedia("(pointer: fine)").matches) return;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;

    const tick = () => {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      element.style.setProperty("--mx", current.x.toFixed(4));
      element.style.setProperty("--my", current.y.toFixed(4));
      frame = Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (event: PointerEvent) => {
      if (document.documentElement.dataset.motion === "reduced") return;
      const rect = element.getBoundingClientRect();
      target.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      target.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);
    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={className} style={{ "--mx": 0, "--my": 0, ...style } as CSSProperties}>
      {children}
    </div>
  );
}
