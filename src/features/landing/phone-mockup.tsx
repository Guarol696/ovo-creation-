import { Bus, Coffee, MapPin, Utensils, Waves } from "lucide-react";

const schedule = [
  { time: "09:30", title: "Petit-déj à la Barceloneta", icon: Coffee, tone: "bg-gold-300" },
  { time: "11:00", title: "Paddle sur la plage", icon: Waves, tone: "bg-sky-300" },
  { time: "14:00", title: "Park Güell", icon: MapPin, tone: "bg-sun-400" },
  { time: "18:30", title: "Bus 24 → Gràcia", icon: Bus, tone: "bg-night-200" },
  { time: "21:00", title: "Tapas au Bar Bodega", icon: Utensils, tone: "bg-rose-300" },
];

/** Maquette de téléphone illustrant l'expérience mobile (contenu fictif). */
export function PhoneMockup() {
  return (
    <div
      role="img"
      aria-label="Aperçu d'OVO sur téléphone : programme du jour 2 d'un voyage à Barcelone"
      className="relative mx-auto w-[17.5rem] sm:w-[19rem]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-6 -bottom-8 h-24 rounded-full bg-sun-500/30 blur-3xl"
      />
      <div className="relative rounded-[3rem] bg-night-950 p-2.5 shadow-2xl ring-1 shadow-night-950/40 ring-white/10">
        <div className="overflow-hidden rounded-[2.4rem] bg-sand-50">
          {/* Écran : en-tête */}
          <div className="relative bg-linear-to-br from-night-700 via-night-900 to-night-950 px-5 pt-10 pb-6 text-white">
            <div className="absolute top-3 left-1/2 h-5 w-20 -translate-x-1/2 rounded-full bg-night-950" />
            <p className="text-[0.65rem] font-semibold tracking-widest text-gold-300 uppercase">
              Jour 2 sur 4
            </p>
            <p className="mt-1 font-display text-2xl font-bold">Barcelone</p>
            <div className="mt-4 flex gap-1.5">
              {[1, 2, 3, 4].map((d) => (
                <span
                  key={d}
                  className={`h-1.5 flex-1 rounded-full ${d <= 2 ? "bg-sun-400" : "bg-white/20"}`}
                />
              ))}
            </div>
          </div>

          {/* Écran : programme */}
          <ol className="space-y-2.5 px-4 py-5">
            {schedule.map(({ time, title, icon: Icon, tone }) => (
              <li
                key={time}
                className="flex items-center gap-3 rounded-2xl bg-white p-2.5 shadow-sm shadow-night-950/5"
              >
                <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${tone} text-night-950`}>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[0.65rem] font-semibold text-night-400">{time}</p>
                  <p className="truncate text-xs font-semibold text-night-950">{title}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
