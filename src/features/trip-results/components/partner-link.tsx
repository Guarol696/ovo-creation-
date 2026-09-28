import { ExternalLink } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PartnerLink } from "../partner-links";

/** Rappel obligatoire : lien d'affiliation, sans surcoût pour l'utilisateur. */
export const PARTNER_DISCLOSURE =
  "Lien partenaire : réserver par ce lien ne te coûte rien de plus et peut rapporter une petite commission à OVO.";

/** Bouton « Voir les prix » vers un partenaire (nouvel onglet, lien sponsorisé). */
export function PartnerButton({ link, className }: { link: PartnerLink; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <a
        href={link.href}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className={cn(buttonStyles({ variant: "primary" }), "w-full whitespace-normal sm:w-auto")}
      >
        {link.label}
        <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
        <span className="sr-only"> (sur {link.partner}, nouvel onglet)</span>
      </a>
      <p className="text-xs text-night-100/60">
        Prix réels sur {link.partner}. {PARTNER_DISCLOSURE}
      </p>
    </div>
  );
}

/** Lien discret vers un partenaire (dans une carte). */
export function PartnerInlineLink({ link }: { link: PartnerLink }) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className="inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-xs font-semibold text-sun-400 ring-1 ring-sun-400/40 transition hover:bg-sun-400/10"
    >
      {link.label}
      <ExternalLink aria-hidden="true" className="size-3" />
      <span className="sr-only"> (sur {link.partner}, lien partenaire, nouvel onglet)</span>
    </a>
  );
}
