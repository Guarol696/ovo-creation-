"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, Suspense, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { ease, transitions } from "@/config/motion";
import { isMotionReduced } from "./motion-provider";

export type TransitionKind = "portal" | "zoom";

export interface TransitionRequest {
  href: string;
  kind: TransitionKind;
  /** Point d'origine (coordonnées écran). */
  x: number;
  y: number;
  /** Mot affiché pendant la transition (ex. « Academy »). */
  label?: string;
  /** Élément agrandi par la transition « zoom ». */
  node?: Element | null;
}

type Phase = "idle" | "covering" | "waiting" | "revealing";

const TransitionContext = createContext<((request: TransitionRequest) => void) | null>(null);

export const usePageTransition = () => useContext(TransitionContext);

let holeRegistered: boolean | null = null;
/** Variable CSS animable (rayon du « trou » du portail). */
function registerHole() {
  if (holeRegistered !== null) return holeRegistered;
  try {
    CSS.registerProperty({ name: "--hole", syntax: "<length>", inherits: false, initialValue: "0px" });
    holeRegistered = true;
  } catch (error) {
    // Déjà enregistrée (rechargement à chaud) = disponible ; sinon non supportée.
    holeRegistered = error instanceof DOMException && error.name === "InvalidModificationError";
  }
  return holeRegistered;
}

const el = (className: string, style: Partial<CSSStyleDeclaration> = {}) => {
  const node = document.createElement("div");
  node.className = className;
  Object.assign(node.style, style);
  return node;
};

const farthestCorner = (x: number, y: number) =>
  Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

/**
 * Transitions signature entre sections majeures. La navigation reste celle
 * de Next.js (URL, historique, retour/suivant, rechargement) : la surcouche
 * ne fait que masquer l'ancienne page, attendre le rendu de la nouvelle,
 * puis la révéler. Retour/suivant du navigateur : entrée de page simple.
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const layer = useRef<HTMLDivElement>(null);
  const phase = useRef<Phase>("idle");
  const current = useRef<TransitionRequest | null>(null);
  const safety = useRef<number>(0);

  const finish = useCallback(() => {
    phase.current = "idle";
    current.current = null;
    layer.current?.replaceChildren();
    layer.current?.removeAttribute("data-active");
    delete document.documentElement.dataset.arrive;
  }, []);

  const reveal = useCallback(async () => {
    const container = layer.current;
    const request = current.current;
    if (!container || !request || phase.current === "revealing" || phase.current === "idle") return;
    phase.current = "revealing";
    window.clearTimeout(safety.current);
    const cover = container.firstElementChild as HTMLElement | null;
    if (!cover) return finish();

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    try {
      if (request.kind === "portal" && registerHole()) {
        // L'espace s'ouvre depuis le centre : un trou s'agrandit dans le voile.
        const radius = Math.hypot(vw, vh) / 2 + 40;
        cover.style.setProperty(
          "mask-image",
          `radial-gradient(circle at 50% 50%, transparent var(--hole), #000 calc(var(--hole) + 1px))`,
        );
        const ring = el("absolute left-1/2 top-1/2 rounded-full border border-silver/50", {
          width: `${radius * 2}px`,
          height: `${radius * 2}px`,
          transform: "translate(-50%, -50%) scale(0)",
          boxShadow: "0 0 80px 4px rgb(216 255 61 / 0.12), inset 0 0 60px rgb(198 198 204 / 0.12)",
        });
        container.append(ring);
        cover.querySelector("[data-label]")?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" });
        const hole = cover.animate([{ "--hole": "0px" }, { "--hole": `${radius}px` }] as Keyframe[], {
          duration: transitions.portal.reveal,
          easing: ease.out,
          fill: "forwards",
        });
        ring.animate(
          [
            { transform: "translate(-50%, -50%) scale(0)", opacity: 1 },
            { transform: "translate(-50%, -50%) scale(1)", opacity: 0 },
          ],
          { duration: transitions.portal.reveal, easing: ease.out, fill: "forwards" },
        );
        await hole.finished;
      } else {
        await cover.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: request.kind === "zoom" ? transitions.zoom.reveal : transitions.portal.reveal,
          easing: ease.out,
          fill: "forwards",
        }).finished;
      }
    } catch {
      // Animation interrompue : on termine proprement.
    }
    finish();
  }, [finish]);

  const start = useCallback(
    async (request: TransitionRequest) => {
      const container = layer.current;
      if (!container || phase.current !== "idle" || isMotionReduced()) {
        router.push(request.href);
        return;
      }
      phase.current = "covering";
      current.current = request;
      container.setAttribute("data-active", "");
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      try {
        if (request.kind === "zoom" && request.node) {
          await coverZoom(container, request.node, vw, vh);
        } else {
          await coverPortal(container, request, vw);
        }
      } catch {
        // Animation interrompue : on navigue quand même.
      }

      phase.current = "waiting";
      document.documentElement.dataset.arrive = request.kind;
      router.push(request.href);
      safety.current = window.setTimeout(() => void reveal(), transitions.safetyTimeout);
    },
    [router, reveal],
  );

  // Retour/suivant pendant une transition : on lève le voile immédiatement.
  useEffect(() => {
    const onPop = () => {
      if (phase.current !== "idle") {
        window.clearTimeout(safety.current);
        finish();
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [finish]);

  const onRouteChange = useCallback(() => {
    if (phase.current === "waiting") {
      // Laisse une image au nouveau rendu avant de révéler.
      requestAnimationFrame(() => void reveal());
    }
  }, [reveal]);

  return (
    <TransitionContext.Provider value={start}>
      {children}
      <div ref={layer} className="transition-layer" aria-hidden />
      <Suspense fallback={null}>
        <RouteWatcher onChange={onRouteChange} />
      </Suspense>
    </TransitionContext.Provider>
  );
}

function RouteWatcher({ onChange }: { onChange: () => void }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    onChange();
  }, [pathname, search, onChange]);
  return null;
}

/** Portail : un disque noir s'ouvre depuis le point cliqué, cerclé d'un anneau argent. */
async function coverPortal(container: HTMLElement, request: TransitionRequest, vw: number) {
  const { x, y } = request;
  const radius = farthestCorner(x, y) + 20;
  const disk = el("absolute inset-0 bg-void", { clipPath: `circle(0px at ${x}px ${y}px)` });
  if (request.label) {
    const label = el("absolute inset-0 flex items-center justify-center");
    label.dataset.label = "";
    const text = document.createElement("span");
    text.className = "font-expanded text-paper/90";
    text.style.fontSize = `${Math.min(vw * 0.09, 120)}px`;
    text.textContent = request.label;
    label.append(text);
    disk.append(label);
    label.animate(
      [
        { opacity: 0, transform: "scale(1.15)", letterSpacing: "0.1em" },
        { opacity: 1, transform: "scale(1)", letterSpacing: "-0.035em" },
      ],
      { duration: transitions.portal.cover, delay: transitions.portal.cover * 0.35, easing: ease.out, fill: "both" },
    );
  }
  const ring = el("absolute rounded-full border border-silver/60", {
    left: `${x}px`,
    top: `${y}px`,
    width: `${radius * 2}px`,
    height: `${radius * 2}px`,
    transform: "translate(-50%, -50%) scale(0)",
  });
  container.append(disk, ring);
  ring.animate(
    [
      { transform: "translate(-50%, -50%) scale(0)", opacity: 1 },
      { transform: "translate(-50%, -50%) scale(1)", opacity: 0.2 },
    ],
    { duration: transitions.portal.cover, easing: ease.inOut, fill: "forwards" },
  );
  await disk.animate(
    [{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${radius}px at ${x}px ${y}px)` }],
    { duration: transitions.portal.cover, easing: ease.inOut, fill: "forwards" },
  ).finished;
  // Le portail fermé ne garde que le disque (et son libellé).
  ring.remove();
}

/** Zoom infini : l'élément choisi s'agrandit jusqu'à devenir l'écran suivant. */
async function coverZoom(container: HTMLElement, node: Element, vw: number, vh: number) {
  const rect = node.getBoundingClientRect();
  const backdrop = el("absolute inset-0 bg-void", { opacity: "0" });
  const frame = el("absolute overflow-hidden bg-void text-paper", {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    transformOrigin: "50% 50%",
  });
  const clone = node.cloneNode(true) as HTMLElement;
  clone.removeAttribute("id");
  clone.style.width = "100%";
  clone.style.height = "100%";
  clone.style.margin = "0";
  frame.append(clone);
  backdrop.append(frame);
  container.append(backdrop);

  const scale = Math.max(vw / Math.max(rect.width, 1), vh / Math.max(rect.height, 1)) * 1.08;
  const dx = vw / 2 - (rect.left + rect.width / 2);
  const dy = vh / 2 - (rect.top + rect.height / 2);
  const timing = { duration: transitions.zoom.cover, easing: ease.inOut, fill: "forwards" as const };

  backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { ...timing, duration: transitions.zoom.cover * 0.6 });
  // La géométrie continue de se rapprocher à l'intérieur du cadre : on « traverse » la structure.
  clone.animate(
    [
      { transform: "scale(1)", opacity: 1 },
      { transform: "scale(2.4)", opacity: 0.15 },
    ],
    timing,
  );
  await frame.animate(
    [{ transform: "translate(0px, 0px) scale(1)" }, { transform: `translate(${dx}px, ${dy}px) scale(${scale})` }],
    timing,
  ).finished;
}
