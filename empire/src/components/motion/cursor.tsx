"use client";

import { useEffect, useRef, useState } from "react";
import { useMotion } from "./motion-provider";

/**
 * Curseur personnalisé : point central + anneau lissé. Sur un élément
 * interactif, l'anneau s'agrandit ; un attribut `data-cursor-label="Explore"`
 * affiche une indication contextuelle. Pointeur fin uniquement ; désactivable
 * dans les réglages ; absent en mouvement réduit (curseur natif conservé).
 */
export function Cursor() {
  const { preferences, reduced } = useMotion();
  const [enabled, setEnabled] = useState(false);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const sync = () => setEnabled(fine.matches && preferences.cursor === "on" && !reduced);
    sync();
    fine.addEventListener("change", sync);
    return () => fine.removeEventListener("change", sync);
  }, [preferences.cursor, reduced]);

  useEffect(() => {
    if (!enabled) return;
    const target = { x: -100, y: -100 };
    const current = { x: -100, y: -100 };
    let frame = 0;
    let visible = false;

    const tick = () => {
      current.x += (target.x - current.x) * 0.2;
      current.y += (target.y - current.y) * 0.2;
      if (ring.current) ring.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
      frame = Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > 0.1 ? requestAnimationFrame(tick) : 0;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      target.x = event.clientX;
      target.y = event.clientY;
      if (dot.current) dot.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      if (!visible) {
        visible = true;
        current.x = target.x;
        current.y = target.y;
        ring.current?.setAttribute("data-visible", "");
        dot.current?.setAttribute("data-visible", "");
      }
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onOver = (event: PointerEvent) => {
      const element = (event.target as Element | null)?.closest<HTMLElement>("a, button, [data-cursor-label], label, summary, [role='button']");
      const hint = element?.dataset.cursorLabel ?? "";
      ring.current?.toggleAttribute("data-hover", Boolean(element));
      ring.current?.toggleAttribute("data-label", Boolean(hint));
      if (label.current) label.current.textContent = hint;
    };
    const onLeaveWindow = () => {
      visible = false;
      ring.current?.removeAttribute("data-visible");
      dot.current?.removeAttribute("data-visible");
    };
    const onDown = () => ring.current?.setAttribute("data-press", "");
    const onUp = () => ring.current?.removeAttribute("data-press");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.documentElement.addEventListener("pointerleave", onLeaveWindow);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] hidden [@media(pointer:fine)]:block">
      <div
        ref={dot}
        className="absolute top-0 left-0 -mt-[3px] -ml-[3px] size-1.5 rounded-full bg-paper opacity-0 mix-blend-difference transition-opacity duration-200 data-[visible]:opacity-100"
      />
      <div
        ref={ring}
        className="group absolute top-0 left-0 opacity-0 transition-opacity duration-300 data-[visible]:opacity-100"
      >
        <div className="flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-paper/40 transition-[width,height,background-color,border-color,scale] duration-300 ease-[var(--ease-out)] group-data-[hover]:size-14 group-data-[hover]:border-paper/70 group-data-[label]:size-20 group-data-[label]:border-transparent group-data-[label]:bg-paper group-data-[press]:scale-90">
          <span ref={label} className="meta font-medium text-void opacity-0 transition-opacity duration-200 group-data-[label]:opacity-100" />
        </div>
      </div>
    </div>
  );
}
