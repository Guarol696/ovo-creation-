"use client";

import { CalendarCheck, Info, MapPin, Star, UtensilsCrossed } from "lucide-react";
import { useMemo, useState } from "react";
import { Container } from "@/components/ui/container";
import { RESTAURANT_KINDS } from "@/features/trip-engine/services/restaurants";
import type { PlanRestaurant } from "@/types/travel-plan";
import { DemoBadge } from "./demo-badge";
import { FilterChips, type FilterOption } from "./filter-chips";
import { byScheduleThenRelevance, scheduleLabel } from "./schedule-label";
import { SectionTitle } from "./section-title";

type RestaurantFilter = "tous" | "1" | "2" | "3" | "local" | "street-food" | "gastronomique";

const FILTERS: { id: RestaurantFilter; label: string; test: (r: PlanRestaurant) => boolean }[] = [
  { id: "tous", label: "Tous", test: () => true },
  { id: "1", label: "€", test: (r) => r.priceLevel === 1 },
  { id: "2", label: "€€", test: (r) => r.priceLevel === 2 },
  { id: "3", label: "€€€", test: (r) => r.priceLevel === 3 },
  { id: "local", label: "Cuisine locale", test: (r) => r.isLocal },
  { id: "street-food", label: "Street food", test: (r) => r.kind === "street-food" },
  { id: "gastronomique", label: "Gastronomique", test: (r) => r.kind === "gastronomique" },
];

const ratingFormatter = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function mealsLabel(meals: PlanRestaurant["meals"]) {
  if (meals.includes("lunch") && meals.includes("dinner")) return "Midi et soir";
  return meals.includes("lunch") ? "Idéal le midi" : "Idéal le soir";
}

export function RestaurantsSection({ restaurants }: { restaurants: PlanRestaurant[] }) {
  const [filter, setFilter] = useState<RestaurantFilter>("tous");
  const sorted = useMemo(() => [...restaurants].sort(byScheduleThenRelevance), [restaurants]);
  const options: FilterOption<RestaurantFilter>[] = FILTERS.map((f) => ({
    id: f.id,
    label: f.label,
    count: sorted.filter(f.test).length,
  }));
  const filtered = sorted.filter(FILTERS.find((f) => f.id === filter)!.test);

  if (restaurants.length === 0) return null;

  return (
    <section id="restaurants" className="scroll-mt-20 py-14 sm:py-20">
      <Container>
        <SectionTitle eyebrow="Restaurants" title="Où manger ?">
          <p>Des adresses pour tous les budgets, choisies selon ton style de voyage.</p>
        </SectionTitle>

        <FilterChips label="Filtrer les restaurants" options={options} value={filter} onChange={setFilter} />

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {filtered.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </ul>

        {filtered.length === 0 && (
          <p className="mt-6 rounded-3xl bg-white/[0.04] p-6 text-center text-night-100/70 ring-1 ring-white/10">
            Aucun restaurant ne correspond à ce filtre pour ce voyage.
          </p>
        )}

        <p className="mt-6 flex items-start gap-2.5 rounded-3xl bg-amber-400/10 px-4 py-3.5 text-xs leading-relaxed text-amber-50/85 ring-1 ring-amber-300/25">
          <Info className="mt-0.5 size-4 shrink-0 text-amber-200" />
          <span>
            <strong className="font-semibold text-amber-100">Restaurants fictifs de démonstration.</strong>{" "}
            Les noms, notes et prix illustrent le type d&apos;adresse conseillé : ce ne sont pas de vrais
            établissements.
          </span>
        </p>
      </Container>
    </section>
  );
}

function RestaurantCard({ restaurant }: { restaurant: PlanRestaurant }) {
  const scheduled = scheduleLabel(restaurant.schedule);
  const { min, max } = restaurant.priceRange;

  return (
    <li className="flex flex-col overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 transition duration-300 hover:-translate-y-0.5 hover:ring-white/20">
      <div className="relative grid h-24 place-items-center bg-linear-to-br from-sun-400/25 via-gold-400/10 to-night-800/40">
        <span aria-hidden="true" className="text-5xl drop-shadow">
          {restaurant.emoji}
        </span>
        {scheduled && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-sun-400 px-2.5 py-1 text-[0.7rem] font-bold text-night-950">
            <CalendarCheck className="size-3" /> {scheduled}
          </span>
        )}
        <span className="absolute top-3 right-3 rounded-full bg-night-950/60 px-2.5 py-1 text-xs font-bold tracking-widest text-gold-300 backdrop-blur">
          {"€".repeat(restaurant.priceLevel)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-xs font-semibold text-night-100/75">
          {RESTAURANT_KINDS[restaurant.kind]} · {restaurant.cuisine}
        </p>
        <h3 className="mt-1.5 font-display text-lg leading-snug font-bold">{restaurant.name}</h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-night-100/65">
          {restaurant.area && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" /> {restaurant.area}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Star className="size-3 fill-gold-300 text-gold-300" />{" "}
            {ratingFormatter.format(restaurant.rating)}/5
          </span>
          <DemoBadge>Note démo</DemoBadge>
        </p>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-night-100/70">
          {restaurant.description}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-sm">
          <span className="font-semibold tabular-nums">
            ≈ {min}–{max} € / pers.
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-night-100/65">
            <UtensilsCrossed className="size-3" /> {mealsLabel(restaurant.meals)}
          </span>
        </div>
        <p className="mt-2 text-[0.7rem] text-night-100/50">Prix indicatif · restaurant fictif (démo)</p>
      </div>
    </li>
  );
}
