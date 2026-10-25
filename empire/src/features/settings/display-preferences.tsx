"use client";

import { useMotion } from "@/components/motion/motion-provider";
import type { DisplayPreferences } from "@/components/motion/preferences";
import { cn } from "@/lib/utils";

type Option<K extends keyof DisplayPreferences> = { value: DisplayPreferences[K]; label: string; hint?: string };

function Choice<K extends keyof DisplayPreferences>({ name, legend, description, options }: { name: K; legend: string; description: string; options: Option<K>[] }) {
  const { preferences, update } = useMotion();
  return (
    <fieldset className="grid gap-3 border-b hairline pb-6 last:border-b-0">
      <legend className="font-medium">{legend}</legend>
      <p className="-mt-1 text-sm text-mist">{description}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const checked = preferences[name] === option.value;
          return (
            <label
              key={String(option.value)}
              className={cn(
                "meta flex min-h-11 cursor-pointer items-center gap-2 border px-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-volt",
                checked ? "border-paper bg-paper text-void" : "hairline text-silver hover:text-paper",
              )}
            >
              <input
                type="radio"
                name={name}
                value={String(option.value)}
                checked={checked}
                onChange={() => update({ [name]: option.value } as Partial<DisplayPreferences>)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Préférences propres à cet appareil, appliquées immédiatement. */
export function DisplayPreferencesForm() {
  return (
    <div className="grid gap-6">
      <Choice
        name="motion"
        legend="Animations"
        description="« Système » suit le réglage « réduire les animations » de ton appareil. « Réduites » remplace les transitions par des changements simples."
        options={[
          { value: "auto", label: "Système" },
          { value: "full", label: "Complètes" },
          { value: "reduced", label: "Réduites" },
        ]}
      />
      <Choice
        name="cursor"
        legend="Curseur personnalisé"
        description="Sur ordinateur uniquement. Désactivé, le curseur natif est utilisé."
        options={[
          { value: "on", label: "Activé" },
          { value: "off", label: "Désactivé" },
        ]}
      />
      <Choice
        name="text"
        legend="Taille du texte"
        description="Agrandit l'ensemble du texte de l'interface."
        options={[
          { value: "normal", label: "Normale" },
          { value: "large", label: "Grande" },
        ]}
      />
      <Choice
        name="contrast"
        legend="Contraste"
        description="Renforce les textes secondaires et les filets."
        options={[
          { value: "normal", label: "Standard" },
          { value: "high", label: "Renforcé" },
        ]}
      />
    </div>
  );
}
