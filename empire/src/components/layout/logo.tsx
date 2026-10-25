import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Monogramme : un anneau traversé par un axe — la structure de la scène d'ouverture. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden fill="none">
      <circle cx="16" cy="16" r="12.5" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="16" cy="16" rx="5" ry="12.5" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <path d="M16 1.5v29" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-expanded text-[1.05rem] leading-none tracking-[-0.02em]">{siteConfig.name}</span>
    </span>
  );
}
