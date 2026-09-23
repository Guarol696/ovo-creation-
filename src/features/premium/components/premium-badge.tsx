import type { PlanId } from "@/config/premium";
import { cn } from "@/lib/utils";

/** Badge d'offre payante : « ⭐ Medium » ou « ✨ Premium ». Rien pour l'offre gratuite. */
export function PlanBadge({
  plan,
  className,
  size = "sm",
}: {
  plan: PlanId;
  className?: string;
  size?: "xs" | "sm";
}) {
  if (plan === "free") return null;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full font-bold",
        plan === "premium"
          ? "bg-linear-to-r from-gold-300 to-sun-400 text-night-950"
          : "bg-white/10 text-sun-300 ring-1 ring-sun-400/60",
        size === "xs" ? "px-2 py-0.5 text-[0.65rem]" : "px-2.5 py-1 text-xs",
        className,
      )}
    >
      <span aria-hidden="true">{plan === "premium" ? "✨" : "⭐"}</span>{" "}
      {plan === "premium" ? "Premium" : "Medium"}
    </span>
  );
}

/** Raccourci historique (étape 9). */
export function PremiumBadge(props: { className?: string; size?: "xs" | "sm" }) {
  return <PlanBadge plan="premium" {...props} />;
}
