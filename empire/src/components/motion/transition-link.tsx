"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { isMotionReduced } from "./motion-provider";
import { usePageTransition, type TransitionKind } from "./transition-provider";

type TransitionLinkProps = ComponentProps<typeof Link> & {
  href: string;
  /** « portal » pour changer d'espace, « zoom » pour entrer dans un élément. */
  transition?: TransitionKind;
  /** Mot affiché pendant le portail. */
  transitionLabel?: string;
};

/**
 * Lien Next.js normal (préchargement, historique, URL partageable) qui
 * déclenche une transition signature. Clic molette, Ctrl/Cmd+clic, nouvel
 * onglet, lien externe ou mouvement réduit : comportement natif inchangé.
 * Pour « zoom », l'élément agrandi est le descendant `[data-zoom-target]`.
 */
export function TransitionLink({ transition = "portal", transitionLabel, onClick, href, ...props }: TransitionLinkProps) {
  const start = usePageTransition();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || !start) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (props.target && props.target !== "_self") return;
    if (isMotionReduced()) return;
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return;
    if (url.pathname + url.search === window.location.pathname + window.location.search) return;

    event.preventDefault();
    const anchor = event.currentTarget;
    const rect = anchor.getBoundingClientRect();
    // Activation clavier : pas de coordonnées de pointeur, on part du centre du lien.
    const fromKeyboard = event.detail === 0;
    start({
      href: url.pathname + url.search + url.hash,
      kind: transition,
      x: fromKeyboard ? rect.left + rect.width / 2 : event.clientX,
      y: fromKeyboard ? rect.top + rect.height / 2 : event.clientY,
      label: transitionLabel,
      node: transition === "zoom" ? (anchor.querySelector("[data-zoom-target]") ?? anchor) : null,
    });
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}
