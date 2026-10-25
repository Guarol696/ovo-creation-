"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { categories, levels } from "@/data/categories";
import { catalogSearch, sortOptions, type CatalogQuery } from "@/features/academy/filter";
import { cn } from "@/lib/utils";

/**
 * Recherche, filtres et tri : l'état vit dans l'URL (partageable, retour
 * navigateur). La page serveur filtre ; ce composant ne fait que réécrire
 * les paramètres. Saisie temporisée pour ne pas recharger à chaque touche.
 */
export function CatalogControls({ query, total }: { query: CatalogQuery; total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState(query.q);
  const timer = useRef<number>(0);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setText(query.q), [query.q]);

  const apply = (patch: Partial<CatalogQuery>) => {
    startTransition(() => {
      router.replace(`${pathname}${catalogSearch({ ...query, ...patch })}`, { scroll: false });
    });
  };

  const onText = (value: string) => {
    setText(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => apply({ q: value.trim() }), 280);
  };

  const chip = (active: boolean) =>
    cn(
      "meta min-h-11 shrink-0 border px-3 transition-colors duration-[var(--dur-quick)]",
      active ? "border-paper bg-paper text-void" : "hairline text-silver hover:border-iron hover:text-paper",
    );

  const hasFilters = Boolean(query.q || query.category || query.level || query.access);

  return (
    <div className="grid gap-5" aria-busy={pending}>
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="relative block">
          <span className="sr-only">Rechercher une formation</span>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-mist" />
          <input
            type="search"
            value={text}
            onChange={(event) => onText(event.target.value)}
            placeholder="Rechercher : landing page, clients, IA…"
            className="min-h-14 w-full border hairline bg-abyss pr-12 pl-11 text-base text-paper placeholder:text-mist/70 focus:border-silver focus:outline-none"
          />
          {text && (
            <button
              type="button"
              onClick={() => onText("")}
              className="absolute top-1/2 right-1 flex size-11 -translate-y-1/2 items-center justify-center text-mist hover:text-paper"
              aria-label="Effacer la recherche"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </label>
        <label className="flex items-center gap-3">
          <span className="meta text-mist">Trier</span>
          <select
            value={query.sort}
            onChange={(event) => apply({ sort: event.target.value as CatalogQuery["sort"] })}
            className="min-h-14 border hairline bg-abyss px-4 text-paper focus:border-silver focus:outline-none"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="grid gap-2">
        <legend className="meta mb-2 text-mist">Domaine</legend>
        <div className="-mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)] pb-1 md:mx-0 md:flex-wrap md:px-0">
          <button type="button" aria-pressed={!query.category} className={chip(!query.category)} onClick={() => apply({ category: null })}>
            Tous
          </button>
          {categories.map((category) => (
            <button
              key={category.slug}
              type="button"
              aria-pressed={query.category === category.slug}
              className={chip(query.category === category.slug)}
              onClick={() => apply({ category: query.category === category.slug ? null : category.slug })}
            >
              {category.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
        <fieldset>
          <legend className="meta mb-2 text-mist">Niveau</legend>
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => (
              <button
                key={level.value}
                type="button"
                aria-pressed={query.level === level.value}
                className={chip(query.level === level.value)}
                onClick={() => apply({ level: query.level === level.value ? null : level.value })}
              >
                {level.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="meta mb-2 text-mist">Accès</legend>
          <div className="flex flex-wrap gap-2">
            {(["free", "pro", "premium"] as const).map((access) => (
              <button
                key={access}
                type="button"
                aria-pressed={query.access === access}
                className={chip(query.access === access)}
                onClick={() => apply({ access: query.access === access ? null : access })}
              >
                {access === "free" ? "Gratuit" : access === "pro" ? "Pro" : "Premium"}
              </button>
            ))}
          </div>
        </fieldset>
        <p className="meta ml-auto text-mist" role="status">
          {pending ? "Filtrage…" : `${total} ${total > 1 ? "formations" : "formation"}`}
          {hasFilters && !pending && (
            <button type="button" onClick={() => apply({ q: "", category: null, level: null, access: null })} className="ml-4 min-h-11 text-paper underline underline-offset-4">
              Réinitialiser
            </button>
          )}
        </p>
      </div>
    </div>
  );
}
