import { CalendarRange, FileDown, Map, Share2, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { PhoneMockup } from "./phone-mockup";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: CalendarRange,
    title: "Programme jour par jour",
    description: "Chaque journée organisée, avec le bon rythme entre visites, food et temps libre.",
  },
  {
    icon: Map,
    title: "Carte interactive",
    description: "Tous tes spots au même endroit pour te repérer en un coup d'œil.",
  },
  {
    icon: Share2,
    title: "Partage avec ta bande",
    description: "Envoie le voyage à tes potes en un lien et décidez ensemble.",
  },
  {
    icon: FileDown,
    title: "Export PDF",
    description: "Garde ton itinéraire hors-ligne, même sans réseau à l'autre bout du monde.",
  },
];

export function Experience() {
  return (
    <section className="overflow-hidden bg-sand-50 py-24 sm:py-32">
      <Container className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
        <div>
          <Reveal>
            <SectionHeading
              eyebrow="L'expérience OVO"
              title="Ton voyage, dans ta poche."
              description="OVO est pensé d'abord pour ton téléphone : clair, rapide et agréable, du canapé jusqu'à l'aéroport."
            />
          </Reveal>

          <ul className="mt-12 grid gap-4 sm:grid-cols-2">
            {features.map((feature, index) => (
              <li key={feature.title}>
                <Reveal
                  delay={index * 80}
                  className="h-full rounded-3xl bg-white p-5 shadow-sm shadow-night-950/5"
                >
                  <feature.icon className="size-6 text-sun-600" />
                  <h3 className="mt-4 font-display text-lg font-bold text-night-950">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-night-700/80">{feature.description}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        <Reveal delay={150} className="relative">
          <div
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 size-[26rem] max-w-[90vw] -translate-1/2 rounded-full bg-linear-to-br from-gold-300/40 via-sun-400/25 to-transparent blur-2xl"
          />
          <PhoneMockup />
        </Reveal>
      </Container>
    </section>
  );
}
