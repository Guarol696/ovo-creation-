import { Clock, MapPin, Plane, Star } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

const days = [
  { day: "J1", title: "Alfama & coucher de soleil", time: "Miradouro da Graça" },
  { day: "J2", title: "Belém et pastéis de nata", time: "Tour de Belém" },
  { day: "J3", title: "Plage à Costa da Caparica", time: "Surf débutant" },
];

/** Carte d'exemple illustrant un voyage généré par OVO (données fictives). */
export function TripPreviewCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-full max-w-sm rounded-4xl border border-white/15 bg-white/10 p-5 shadow-2xl shadow-night-950/50 backdrop-blur-2xl",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-gold-300 uppercase">Ton voyage OVO</p>
          <p className="mt-1 font-display text-3xl font-bold">Lisbonne</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-night-100/75">
            <MapPin className="size-3.5" /> Portugal · 4 jours
          </p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-sun-500 px-2.5 py-1 text-xs font-bold text-night-950">
          <Star className="size-3 fill-current" /> 96 % match
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-2xl bg-night-950/40 p-3">
          <p className="text-xs text-night-100/60">Budget estimé</p>
          <p className="mt-0.5 font-semibold">{formatPrice(470)} / pers.</p>
        </div>
        <div className="rounded-2xl bg-night-950/40 p-3">
          <p className="text-xs text-night-100/60">Vol aller</p>
          <p className="mt-0.5 flex items-center gap-1.5 font-semibold">
            <Plane className="size-3.5 text-sun-400" /> 2 h 35
          </p>
        </div>
      </div>

      <ol className="mt-4 space-y-2">
        {days.map((item) => (
          <li key={item.day} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-gold-300 to-sun-500 text-sm font-bold text-night-950">
              {item.day}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{item.title}</p>
              <p className="flex items-center gap-1 text-xs text-night-100/60">
                <Clock className="size-3" /> {item.time}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
