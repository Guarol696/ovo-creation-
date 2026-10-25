import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Compositions des trois piliers. Chacune s'anime à sa façon quand elle
 * entre dans l'écran ([data-inview] posé par RevealRuntime) :
 *  LEARN  — des strates de savoir s'empilent et convergent vers un foyer ;
 *  CREATE — des modules épars s'assemblent en une grille ;
 *  LAUNCH — une trajectoire se trace, un point la parcourt jusqu'à l'horizon.
 */
export function PillarArt({ kind, className }: { kind: "learn" | "create" | "launch"; className?: string }) {
  return (
    <div data-reveal="fade" className={cn("pillar-art relative aspect-square w-full", className)} aria-hidden>
      {kind === "learn" && <Learn />}
      {kind === "create" && <Create />}
      {kind === "launch" && <Launch />}
    </div>
  );
}

function Learn() {
  const layers = Array.from({ length: 11 }, (_, index) => index);
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" fill="none">
      {layers.map((index) => {
        const y = 60 + index * 28;
        const half = 40 + Math.sin((index / 10) * Math.PI) * 130;
        return (
          <line
            key={index}
            x1={200 - half}
            x2={200 + half}
            y1={y}
            y2={y}
            stroke={index === 5 ? "var(--color-volt)" : "var(--color-silver)"}
            strokeOpacity={index === 5 ? 1 : 0.25 + (index % 3) * 0.2}
            strokeWidth={index === 5 ? 2 : 1}
            className="pillar-learn-layer"
            style={{ "--i": index } as CSSProperties}
          />
        );
      })}
      {layers.map((index) => (
        <line
          key={`ray-${index}`}
          x1={200}
          y1={200}
          x2={200 + Math.cos((index / 11) * Math.PI * 2) * 190}
          y2={200 + Math.sin((index / 11) * Math.PI * 2) * 190}
          stroke="var(--color-silver)"
          strokeOpacity="0.08"
          className="pillar-learn-ray"
        />
      ))}
      <circle cx="200" cy="200" r="5" fill="var(--color-volt)" className="pillar-learn-focus" />
    </svg>
  );
}

function Create() {
  const cells = Array.from({ length: 16 }, (_, index) => index);
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" fill="none">
      <rect x="60" y="60" width="280" height="280" stroke="var(--color-silver)" strokeOpacity="0.12" />
      {cells.map((index) => {
        const col = index % 4;
        const row = Math.floor(index / 4);
        // Positions de départ éparses, déterministes.
        const sx = Math.round(Math.sin(index * 2.3) * 140);
        const sy = Math.round(Math.cos(index * 1.7) * 140);
        const rot = Math.round(Math.sin(index * 3.1) * 90);
        const accent = index === 6;
        return (
          <rect
            key={index}
            x={72 + col * 66}
            y={72 + row * 66}
            width="58"
            height="58"
            stroke={accent ? "var(--color-volt)" : "var(--color-silver)"}
            strokeOpacity={accent ? 1 : 0.6}
            fill={index % 5 === 0 ? "var(--color-graphite)" : "none"}
            className="pillar-create-cell"
            style={{ "--sx": `${sx}px`, "--sy": `${sy}px`, "--r": `${rot}deg`, "--i": index } as CSSProperties}
          />
        );
      })}
    </svg>
  );
}

function Launch() {
  const path = "M40 340 C 140 330, 190 260, 230 190 S 310 70, 370 50";
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" fill="none">
      {[0, 1, 2, 3, 4].map((index) => (
        <line
          key={index}
          x1="20"
          x2="380"
          y1={340 - index * 70}
          y2={340 - index * 70}
          stroke="var(--color-silver)"
          strokeOpacity={0.06 + index * 0.03}
        />
      ))}
      <path d={path} stroke="var(--color-silver)" strokeOpacity="0.2" strokeDasharray="2 8" />
      <path d={path} stroke="var(--color-paper)" strokeWidth="1.5" pathLength={1} className="pillar-launch-path" />
      <circle r="6" fill="var(--color-volt)" className="pillar-launch-dot" style={{ offsetPath: `path("${path}")` } as CSSProperties} />
      <circle cx="370" cy="50" r="22" stroke="var(--color-volt)" strokeOpacity="0.5" className="pillar-launch-target" />
    </svg>
  );
}
