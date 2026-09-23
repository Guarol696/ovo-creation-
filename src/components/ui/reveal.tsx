"use client";

import { useEffect, useRef, type ComponentProps, type CSSProperties } from "react";

type RevealProps = ComponentProps<"div"> & {
  /** Délai d'apparition en millisecondes. */
  delay?: number;
};

/** Fait apparaître son contenu en douceur lorsqu'il entre dans l'écran. */
export function Reveal({ delay = 0, style, children, ...props }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          node.dataset.reveal = "visible";
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal=""
      style={{ "--reveal-delay": `${delay}ms`, ...style } as CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
}
