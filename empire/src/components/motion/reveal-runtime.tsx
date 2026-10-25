"use client";

import { useEffect } from "react";

/**
 * Un seul IntersectionObserver pour tout le site : chaque élément
 * [data-reveal] reçoit [data-inview] la première fois qu'il entre dans
 * l'écran. Les éléments ajoutés plus tard (navigation) sont détectés par
 * un MutationObserver. Le CSS décrit les états (globals.css).
 */
export function RevealRuntime() {
  useEffect(() => {
    const seen = new WeakSet<Element>();
    const intersection = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-inview", "");
          intersection.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    const scan = (root: ParentNode) => {
      root.querySelectorAll("[data-reveal]:not([data-inview])").forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        intersection.observe(element);
      });
    };

    scan(document);
    const mutation = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches("[data-reveal]")) scan(node.parentElement ?? document);
          else scan(node);
        });
      }
    });
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      intersection.disconnect();
      mutation.disconnect();
    };
  }, []);

  return null;
}
