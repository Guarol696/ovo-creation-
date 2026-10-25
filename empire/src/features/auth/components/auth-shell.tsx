import type { ReactNode } from "react";
import { RingsFallback } from "@/components/art/rings-fallback";
import { RevealLines } from "@/components/motion/reveal-text";
import { Notice } from "@/components/ui/notice";
import { isSupabaseConfigured } from "@/lib/env";

/** Gabarit des pages de compte : composition à gauche, formulaire sobre à droite. */
export function AuthShell({ index, lines, title, intro, children, footer }: { index: string; lines: string[]; title: string; intro: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <section className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r hairline lg:block">
        <RingsFallback className="absolute inset-0 m-auto size-[90%] opacity-50 animate-[spin-slow_120s_linear_infinite]" />
        <div className="absolute inset-x-0 bottom-0 p-[var(--gutter)] pb-14">
          <p className="meta text-mist">[ {index} ]</p>
          <RevealLines as="p" lang="en" className="font-expanded display-md mt-6" lines={lines} label={lines.join(" ")} />
        </div>
      </div>
      <div className="flex items-center">
        <div className="mx-auto w-full max-w-md px-[var(--gutter)] pt-[calc(var(--header-h)+2rem)] pb-16 lg:px-0">
          <h1 className="font-expanded text-4xl">{title}</h1>
          <p className="mt-3 text-silver">{intro}</p>
          {!isSupabaseConfigured() && (
            <Notice tone="demo" title="Comptes non configurés" className="mt-6">
              Ce déploiement fonctionne en mode démonstration : la création de compte s&apos;active en renseignant les variables Supabase
              (voir README). Les formations gratuites restent accessibles sans compte.
            </Notice>
          )}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 border-t hairline pt-6 text-sm text-silver">{footer}</div>}
        </div>
      </div>
    </section>
  );
}
