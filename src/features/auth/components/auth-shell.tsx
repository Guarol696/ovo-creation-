import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

interface AuthShellProps {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

/** Mise en page des écrans de compte : carte centrée, rassurante, pensée mobile d'abord. */
export function AuthShell({ eyebrow, title, description, children, footer }: AuthShellProps) {
  return (
    <div className="relative isolate flex flex-1 items-start justify-center overflow-hidden bg-night-950 px-4 pt-24 pb-16 text-white sm:items-center sm:px-6 sm:pt-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-sun-500/15 blur-3xl" />
        <div className="absolute bottom-0 -left-40 size-[28rem] rounded-full bg-night-500/30 blur-3xl" />
      </div>
      <div className="w-full max-w-md animate-fade-up">
        <div className="rounded-4xl bg-white/[0.05] p-6 shadow-2xl ring-1 shadow-night-950/40 ring-white/10 backdrop-blur-xl sm:p-8">
          <p className="text-xs font-bold tracking-[0.18em] text-gold-300 uppercase">{eyebrow}</p>
          <h1 className="mt-2 font-display text-3xl leading-tight font-extrabold tracking-tight text-balance sm:text-4xl">
            {title}
          </h1>
          {description && <p className="mt-3 leading-relaxed text-night-100/75">{description}</p>}
          <div className="mt-7">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-sm text-night-100/75">{footer}</div>}
        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-night-100/50">
          <ShieldCheck className="size-3.5" /> Tes données restent privées : toi seul·e vois tes voyages.
        </p>
      </div>
    </div>
  );
}
