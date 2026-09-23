"use client";

import { MapPin, Search, X } from "lucide-react";
import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import type { DestinationPlace } from "@/types/trip";
import {
  countryFlag,
  createCustomDestination,
  findDestinationById,
  normalizeText,
  searchDestinations,
} from "../../lib/destination-search";
import { ChoiceCard } from "../choice-card";
import { FieldLabel, inputClassName } from "../field";
import type { StepProps } from "../step-props";

const POPULAR_IDS = ["paris", "londres", "lisbonne", "barcelone", "rome", "marrakech", "new-york"];
const popularDestinations = POPULAR_IDS.map(findDestinationById).filter(
  (place): place is DestinationPlace => place !== null,
);

export function DestinationStep({ draft, update }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <ChoiceCard
          emoji="🎯"
          label="Je sais où je veux aller"
          description="J'ai déjà une destination en tête"
          selected={draft.destinationMode === "known"}
          onSelect={() => update({ destinationMode: "known" })}
        />
        <ChoiceCard
          emoji="🎲"
          label="Je ne sais pas encore"
          description="Surprends-moi selon mes envies"
          selected={draft.destinationMode === "open"}
          onSelect={() => update({ destinationMode: "open" })}
        />
      </div>

      {draft.destinationMode === "known" && (
        <div className="animate-fade-up">
          {draft.destination ? (
            <SelectedDestination place={draft.destination} onClear={() => update({ destination: null })} />
          ) : (
            <DestinationSearch onSelect={(place) => update({ destination: place })} />
          )}
        </div>
      )}

      {draft.destinationMode === "open" && (
        <p className="animate-fade-up rounded-3xl bg-linear-to-r from-gold-400/15 to-transparent p-5 text-sm leading-relaxed text-night-50/90 ring-1 ring-gold-400/25">
          ✨ Pas de souci ! OVO utilisera tes envies, ton budget et ton style pour te proposer les
          destinations qui te correspondent le mieux.
        </p>
      )}
    </div>
  );
}

function SelectedDestination({ place, onClear }: { place: DestinationPlace; onClear: () => void }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl bg-sun-400/15 p-4 ring-2 ring-sun-400 sm:p-5">
      <span aria-hidden="true" className="grid size-12 place-items-center rounded-2xl bg-white/10 text-2xl">
        {countryFlag(place.countryCode)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold tracking-[0.18em] text-gold-300 uppercase">Destination choisie</p>
        <p className="truncate font-display text-xl font-bold">{place.name}</p>
        {place.country && <p className="text-sm text-night-100/70">{place.country}</p>}
      </div>
      <button
        type="button"
        onClick={onClear}
        className="min-h-11 rounded-full px-4 text-sm font-semibold text-white/80 ring-1 ring-white/20 transition hover:bg-white/10 hover:text-white"
      >
        Changer
      </button>
    </div>
  );
}

function DestinationSearch({ onSelect }: { onSelect: (place: DestinationPlace) => void }) {
  const inputId = useId();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => searchDestinations(query), [query]);
  const trimmed = query.trim();
  const hasExactMatch = results.some((r) => normalizeText(r.name) === normalizeText(trimmed));
  const options: DestinationPlace[] =
    trimmed.length >= 2 && !hasExactMatch ? [...results, createCustomDestination(trimmed)] : results;
  const showList = trimmed.length > 0;

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showList || options.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % options.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + options.length) % options.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) onSelect(option);
    } else if (event.key === "Escape") {
      setQuery("");
    }
  }

  return (
    <div>
      <FieldLabel htmlFor={inputId}>Rechercher une destination</FieldLabel>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/40"
        />
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && options[activeIndex] ? `${listId}-${activeIndex}` : undefined}
          autoComplete="off"
          autoFocus
          enterKeyHint="search"
          placeholder="Ville ou pays : Lisbonne, Japon…"
          value={query}
          maxLength={80}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={onKeyDown}
          className={cn(inputClassName, "pr-12 pl-12")}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Effacer la recherche"
            className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {showList ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Destinations suggérées"
          className="mt-2 overflow-hidden rounded-3xl bg-night-900/90 p-1.5 ring-1 ring-white/10 backdrop-blur-xl"
        >
          {options.length === 0 && <li className="px-4 py-3 text-sm text-white/60">Continue à taper…</li>}
          {options.map((place, index) => (
            <li
              key={place.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => onSelect(place)}
              className={cn(
                "flex min-h-13 cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 transition-colors",
                index === activeIndex ? "bg-white/10" : "hover:bg-white/5",
              )}
            >
              <span
                aria-hidden="true"
                className="grid size-9 place-items-center rounded-xl bg-white/[0.06] text-lg"
              >
                {place.isCustom ? <MapPin className="size-4 text-sun-400" /> : countryFlag(place.countryCode)}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold">
                  {place.isCustom ? `Utiliser « ${place.name} »` : place.name}
                </span>
                <span className="block truncate text-xs text-white/55">
                  {place.isCustom ? "Destination libre" : place.country}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6">
          <FieldLabel>Destinations populaires</FieldLabel>
          <ul className="flex flex-wrap gap-2">
            {popularDestinations.map((place) => (
              <li key={place.id}>
                <button
                  type="button"
                  onClick={() => onSelect(place)}
                  className="min-h-11 rounded-full bg-white/[0.06] px-4 text-sm font-medium ring-1 ring-white/10 transition hover:bg-white/[0.12] hover:ring-white/25 active:scale-95"
                >
                  <span aria-hidden="true">{countryFlag(place.countryCode)}</span> {place.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
