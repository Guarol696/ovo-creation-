import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { routes } from "@/config/site";
import { SmartImage } from "@/components/ui/smart-image";
import { cn, formatPrice } from "@/lib/utils";
import { TRAVEL_STYLE_LABELS } from "@/types/trip";
import type { Destination } from "@/types/destination";

interface DestinationCardProps {
  destination: Destination;
  className?: string;
}

export function DestinationCard({ destination, className }: DestinationCardProps) {
  const { city, country, tagline, image, fallbackGradient, styles, budgetFrom, idealDays } = destination;

  return (
    <Link
      href={routes.createTrip}
      aria-label={`${city}, ${country} — créer un voyage`}
      className={cn(
        "group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-4xl p-6 text-white shadow-lg shadow-night-950/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-night-950/25",
        className,
      )}
    >
      <div aria-hidden="true" className={cn("absolute inset-0 -z-10 bg-linear-to-br", fallbackGradient)}>
        <SmartImage
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 85vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-night-950/90 via-night-950/25 to-transparent" />
      </div>

      <div className="absolute top-5 right-5 left-5 flex items-start justify-between gap-3">
        <ul className="flex flex-wrap gap-1.5">
          {styles.map((style) => (
            <li
              key={style}
              className="rounded-full border border-white/20 bg-night-950/30 px-2.5 py-1 text-xs font-medium backdrop-blur-md"
            >
              {TRAVEL_STYLE_LABELS[style]}
            </li>
          ))}
        </ul>
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur-md transition-all duration-500 group-hover:rotate-45 group-hover:bg-sun-500 group-hover:text-night-950">
          <ArrowUpRight className="size-5" />
        </span>
      </div>

      <p className="text-xs font-semibold tracking-[0.2em] text-gold-300 uppercase">{country}</p>
      <h3 className="mt-1 font-display text-4xl font-bold tracking-tight">{city}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/80">{tagline}</p>

      <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4 text-sm">
        <span className="flex items-center gap-1.5 text-white/75">
          <Clock className="size-4" /> {idealDays} jours
        </span>
        <span>
          <span className="text-white/60">dès </span>
          <span className="font-bold">{formatPrice(budgetFrom)}</span>
        </span>
      </div>
    </Link>
  );
}
