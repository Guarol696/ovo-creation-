"use client";

import { useEffect, useRef, useState } from "react";
import { RingsFallback } from "@/components/art/rings-fallback";
import { useMotion } from "@/components/motion/motion-provider";
import { cn } from "@/lib/utils";
import type { SceneHandle } from "./monolith-scene";

/**
 * Conteneur de la scène d'ouverture. Le texte du hero s'affiche sans attendre :
 * la scène (three.js, ~150 ko) est importée après le premier rendu, pendant
 * un temps mort du navigateur, puis apparaît en fondu par-dessus le repli SVG.
 * Rendu suspendu hors écran et onglet masqué ; progression du défilement
 * lue sur `progressTarget` (section hero).
 */
export function HeroScene({ className, progressTarget }: { className?: string; progressTarget?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { reduced } = useMotion();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let handle: SceneHandle | null = null;
    let cancelled = false;
    const cleanups: (() => void)[] = [];

    const boot = async () => {
      const scene = await import("./monolith-scene");
      if (cancelled) return;
      if (!scene.supportsWebGL()) {
        setFailed(true);
        return;
      }
      try {
        handle = scene.createMonolithScene(canvas, {
          quality: scene.detectQuality(),
          reduced,
          onFirstFrame: () => setReady(true),
        });
      } catch (error) {
        console.warn("[scene] WebGL indisponible, repli SVG", error);
        setFailed(true);
        return;
      }
      const current = handle;

      const section = progressTarget ? document.getElementById(progressTarget) : canvas.parentElement;
      let visible = true;
      const sync = () => current.setActive(visible && document.visibilityState === "visible");
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        sync();
      });
      if (section) observer.observe(section);
      document.addEventListener("visibilitychange", sync);

      let frame = 0;
      const onScroll = () => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          if (!section) return;
          const rect = section.getBoundingClientRect();
          current.setScroll(Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height * 0.9))));
        });
      };
      const onPointer = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        current.setPointer((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1);
      };
      const onResize = () => current.resize();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("resize", onResize);
      onScroll();

      cleanups.push(() => {
        observer.disconnect();
        document.removeEventListener("visibilitychange", sync);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("pointermove", onPointer);
        window.removeEventListener("resize", onResize);
        if (frame) cancelAnimationFrame(frame);
      });
    };

    // Ne concurrence pas le premier affichage : démarrage au premier temps mort.
    const idle = window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 120));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(() => void boot().catch(() => setFailed(true)), { timeout: 900 });

    return () => {
      cancelled = true;
      cancelIdle(id);
      cleanups.forEach((cleanup) => cleanup());
      handle?.dispose();
      setReady(false);
    };
  }, [reduced, progressTarget]);

  return (
    <div className={cn("relative", className)} aria-hidden>
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-[var(--dur-cinematic)] ease-[var(--ease-out)] md:left-[38%]",
          ready && !failed ? "opacity-0" : "opacity-60",
        )}
      >
        <RingsFallback className="hero-fade [--d:300ms]" />
      </div>
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 h-full w-full transition-opacity duration-[var(--dur-cinematic)] ease-[var(--ease-out)]",
          ready && !failed ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
