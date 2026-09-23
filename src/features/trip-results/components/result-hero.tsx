import { ArrowLeft, CalendarDays, Clock, Pencil, Sparkles, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SmartImage } from "@/components/ui/smart-image";
import { formatDates, formatTravelers } from "@/lib/trip/format";
import { routes } from "@/config/site";
import { DeleteTripButton } from "@/features/saved-trips/components/delete-trip-button";
import { editTripUrl } from "@/lib/trip/links";
import { cn, formatPrice } from "@/lib/utils";
import type { TravelPlan } from "@/types/travel-plan";
import { SaveTripButton } from "./save-trip-button";

const sections = [
  { href: "#pourquoi", label: "Résumé" },
  { href: "#transport", label: "Transport" },
  { href: "#hebergement", label: "Hébergement" },
  { href: "#programme", label: "Programme" },
  { href: "#carte", label: "Carte" },
  { href: "#activites", label: "Que faire" },
  { href: "#restaurants", label: "Où manger" },
  { href: "#budget", label: "Budget" },
];

/** Voyage ouvert depuis « Mes voyages ». */
export interface SavedTripInfo {
  id: string;
  title: string;
  savedAt: string;
  /** Plan recalculé car l'ancien format n'était plus lisible. */
  regenerated: boolean;
}

const savedAtFormatter = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export function ResultHero({ plan, savedTrip }: { plan: TravelPlan; savedTrip?: SavedTripInfo }) {
  const { destination, duration, estimatedBudget, request } = plan;
  const facts = [
    { icon: CalendarDays, label: "Dates", value: formatDates(request) },
    {
      icon: Clock,
      label: "Durée",
      value: `${duration.days} jours · ${duration.nights} nuit${duration.nights > 1 ? "s" : ""}`,
    },
    { icon: Users, label: "Voyageurs", value: formatTravelers(request) },
    {
      icon: Wallet,
      label: "Budget estimé",
      value: `≈ ${formatPrice(estimatedBudget.total)}${
        plan.travelers.total > 1 ? ` · ${formatPrice(estimatedBudget.perPerson)}/pers.` : ""
      }`,
    },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-night-950 pt-28 pb-10 text-white sm:pt-36 sm:pb-14">
      <div
        aria-hidden="true"
        className={cn("absolute inset-0 -z-10 bg-linear-to-br", destination.fallbackGradient)}
      >
        {destination.image && (
          <SmartImage
            src={destination.image.src}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-night-950 via-night-950/75 to-night-950/35" />
      </div>

      <Container>
        {savedTrip && (
          <Link
            href={routes.myTrips}
            className="mb-5 inline-flex min-h-11 animate-fade-up items-center gap-2 text-sm font-semibold text-white/80 hover:text-white"
          >
            <ArrowLeft className="size-4" /> Mes voyages
          </Link>
        )}
        <div className="flex flex-wrap gap-2">
          <Badge tone="light" className="animate-fade-up">
            <Sparkles className="size-3.5 text-gold-300" />
            {destination.recommended ? "Destination recommandée par OVO" : "Ta destination"}
          </Badge>
          {savedTrip && (
            <Badge tone="gold" className="animate-fade-up">
              💾 Enregistré le {savedAtFormatter.format(new Date(savedTrip.savedAt))}
            </Badge>
          )}
        </div>
        <h1 className="mt-5 animate-fade-up font-display text-[clamp(2.6rem,10vw,6rem)] leading-[0.95] font-extrabold tracking-tight text-balance [animation-delay:80ms]">
          Ton voyage à <span className="text-gradient-sun">{destination.name}</span>
        </h1>
        <p className="mt-4 max-w-2xl animate-fade-up text-lg text-night-50/85 [animation-delay:160ms] sm:text-xl">
          {destination.country && <span className="font-semibold text-white">{destination.country} · </span>}
          {destination.tagline}
        </p>

        <dl className="mt-8 grid animate-fade-up grid-cols-1 gap-px overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/15 backdrop-blur-xl [animation-delay:240ms] min-[480px]:grid-cols-2 lg:grid-cols-4">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-night-950/55 px-4 py-3.5">
              <dt className="flex items-center gap-1.5 text-[0.7rem] font-semibold tracking-wider text-gold-300 uppercase">
                <Icon className="size-3.5" />
                {label}
              </dt>
              <dd className="mt-1 text-sm font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex animate-fade-up flex-col gap-3 [animation-delay:320ms] sm:flex-row">
          <SaveTripButton />
          <ButtonLink href={editTripUrl(request)} size="lg" variant="outline-light">
            <Pencil className="size-4" /> Modifier mon voyage
          </ButtonLink>
          {savedTrip && <DeleteTripButton tripId={savedTrip.id} title={savedTrip.title} size="lg" />}
        </div>
        {savedTrip?.regenerated && (
          <p className="mt-4 max-w-2xl text-sm text-night-100/70">
            Ce voyage a été enregistré avec une ancienne version d&apos;OVO : il a été recalculé à partir de
            tes réponses.
          </p>
        )}

        <nav
          aria-label="Sections du voyage"
          className="-mx-5 mt-8 scrollbar-none overflow-x-auto px-5 sm:mx-0 sm:px-0"
        >
          <ul className="flex gap-2">
            {sections.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  className="inline-flex min-h-10 items-center rounded-full bg-white/[0.07] px-4 text-sm font-medium whitespace-nowrap text-white/85 ring-1 ring-white/10 transition hover:bg-white/15 hover:text-white"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </section>
  );
}
