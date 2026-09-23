import { Lock, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { FEATURES, PLANS, plansIncluding, type FeatureId } from "@/config/premium";
import { routes } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Fonctionnalité payante vue par un utilisateur qui n'y a pas accès :
 * 🔒 Fonctionnalité Medium/Premium · « Cette fonctionnalité est disponible avec OVO … »
 */
export function PremiumLockedCard({ feature, className }: { feature: FeatureId; className?: string }) {
  const f = FEATURES[feature];
  const offers = plansIncluding(feature).join(" et ");
  return (
    <div
      role="group"
      aria-label={`${f.label} — fonctionnalité ${PLANS[f.plan].shortName}`}
      className={cn(
        "relative overflow-hidden rounded-4xl bg-linear-to-br from-gold-400/10 via-white/[0.03] to-transparent p-5 ring-1 ring-gold-400/30 sm:p-7",
        className,
      )}
    >
      <p className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.15em] text-gold-300 uppercase">
        <Lock className="size-3.5" aria-hidden="true" /> Fonctionnalité {PLANS[f.plan].shortName}
      </p>
      <h3 className="mt-3 flex items-center gap-2 font-display text-xl font-bold sm:text-2xl">
        <span aria-hidden="true">{f.emoji}</span> {f.label}
      </h3>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-night-100/80">{f.description}</p>
      <p className="mt-3 text-sm font-medium text-white/90">
        Cette fonctionnalité est disponible avec {offers}.
      </p>
      <ButtonLink href={routes.premium} variant="outline-light" className="mt-5 border-gold-400/50">
        <Sparkles className="size-4 text-gold-300" /> Découvrir les offres
      </ButtonLink>
    </div>
  );
}
