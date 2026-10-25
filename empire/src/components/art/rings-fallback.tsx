import { cn } from "@/lib/utils";

/**
 * Version SVG de la structure d'ouverture : affichée immédiatement, pendant
 * le chargement de la scène 3D, et à sa place si WebGL n'est pas disponible.
 */
export function RingsFallback({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 600" className={cn("h-full w-full", className)} aria-hidden fill="none">
      <defs>
        <radialGradient id="rings-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c6c6cc" stopOpacity="0.16" />
          <stop offset="70%" stopColor="#c6c6cc" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="300" cy="300" r="280" fill="url(#rings-glow)" />
      <g stroke="#c6c6cc" strokeOpacity="0.55">
        <ellipse cx="300" cy="300" rx="150" ry="150" strokeWidth="3" />
        <ellipse cx="300" cy="300" rx="190" ry="70" strokeWidth="1.2" transform="rotate(-18 300 300)" />
        <ellipse cx="300" cy="300" rx="80" ry="240" strokeWidth="4" strokeOpacity="0.4" />
        <ellipse cx="300" cy="300" rx="280" ry="110" strokeWidth="0.8" strokeOpacity="0.3" transform="rotate(12 300 300)" />
      </g>
      <path d="M300 170 L355 300 L300 430 L245 300 Z" fill="#0c0c0e" stroke="#c6c6cc" strokeOpacity="0.6" />
      <path d="M300 170 L300 430 M245 300 L355 300" stroke="#c6c6cc" strokeOpacity="0.25" />
      <path d="M150 300 A150 150 0 0 1 220 173" stroke="#d8ff3d" strokeWidth="1.5" />
    </svg>
  );
}
