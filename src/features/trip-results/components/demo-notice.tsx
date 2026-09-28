import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/** Rappel honnête : estimations indicatives, pas de prix en temps réel. */
export function DemoNotice({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex items-start gap-2.5 rounded-2xl bg-white/[0.04] px-4 py-3 text-xs leading-relaxed text-night-100/70 ring-1 ring-white/10",
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-gold-300" />
      <span>
        Proposition imaginée par OVO. Les prix sont des{" "}
        <strong className="font-semibold text-white/85">estimations indicatives</strong>, pas des tarifs
        garantis : les boutons « Voir les prix » ouvrent les offres réelles de nos partenaires. Les
        hébergements affichés sont des exemples ; vérifie les horaires des lieux avant d&apos;y aller.
      </span>
    </p>
  );
}
