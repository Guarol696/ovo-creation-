import Link from "next/link";
import { ArrowRight, CalendarDays, Heart, Sparkles, Users, Wallet } from "lucide-react";
import { heroImage } from "@/config/images";
import { routes } from "@/config/site";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SmartImage } from "@/components/ui/smart-image";
import { TripPreviewCard } from "./trip-preview-card";

const criteria = [
  { icon: Heart, label: "Envies", value: "Soleil & food" },
  { icon: Wallet, label: "Budget", value: "500 € / pers." },
  { icon: CalendarDays, label: "Dates", value: "12 → 16 mai" },
  { icon: Users, label: "Voyageurs", value: "3 amis" },
];

export function Hero() {
  return (
    <section className="relative isolate flex min-h-svh items-center overflow-hidden bg-night-950 pt-24 pb-14 text-white sm:pt-28 lg:pb-20">
      {/* Arrière-plan : image + voiles pour la lisibilité */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-linear-to-br from-night-800 via-night-950 to-night-950" />
        <SmartImage
          src={heroImage.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="scale-105 object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-night-950 via-night-950/70 to-night-950/30" />
        <div className="absolute inset-0 bg-linear-to-r from-night-950/80 via-night-950/30 to-transparent" />
        <div className="absolute -top-32 right-[-10%] size-[36rem] rounded-full bg-sun-500/20 blur-[120px]" />
      </div>

      <Container className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="max-w-2xl">
          <div className="animate-fade-up">
            <Badge tone="light">
              <Sparkles className="size-3.5 text-gold-300" />
              Voyages sur mesure pour les 18–30 ans
            </Badge>
          </div>

          <h1 className="mt-6 animate-fade-up font-display text-[clamp(3.5rem,17vw,8.5rem)] leading-[0.9] font-extrabold tracking-tighter [animation-delay:100ms]">
            Où On Va<span className="text-gradient-sun">&nbsp;?</span>
          </h1>

          <p className="mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-pretty text-night-100/85 [animation-delay:200ms] sm:text-xl">
            Ton prochain voyage, imaginé selon tes envies et ton budget.
          </p>

          <div className="mt-9 flex animate-fade-up flex-col gap-3 [animation-delay:300ms] sm:flex-row">
            <ButtonLink href={routes.createTrip} size="lg">
              Créer mon voyage
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </ButtonLink>
            <ButtonLink href={routes.howItWorks} size="lg" variant="outline-light">
              Découvrir OVO
            </ButtonLink>
          </div>

          {/* Aperçu des critères : fait comprendre le concept en un coup d'œil */}
          <Link
            href={routes.createTrip}
            aria-label="Renseigner mes critères de voyage"
            className="group mt-10 grid animate-fade-up grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl transition-colors [animation-delay:400ms] hover:border-white/30 sm:grid-cols-4"
          >
            {criteria.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="bg-night-950/40 px-4 py-3.5 transition-colors group-hover:bg-night-950/30"
              >
                <p className="flex items-center gap-1.5 text-[0.7rem] font-semibold tracking-wider text-gold-300 uppercase">
                  <Icon className="size-3.5" />
                  {label}
                </p>
                <p className="mt-1 truncate text-sm font-medium text-white">{value}</p>
              </div>
            ))}
          </Link>
        </div>

        <div className="hidden animate-fade-up justify-end [animation-delay:500ms] lg:flex">
          <TripPreviewCard className="animate-float" />
        </div>
      </Container>
    </section>
  );
}
