import { Compass, Luggage, SlidersHorizontal, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tags: string[];
}

const steps: Step[] = [
  {
    number: "01",
    title: "Tu nous dis ce que tu veux",
    description:
      "Tes envies, ton budget, tes dates, le nombre de voyageurs et ton style. Deux minutes, pas plus.",
    icon: SlidersHorizontal,
    tags: ["Budget", "Dates", "Style"],
  },
  {
    number: "02",
    title: "OVO imagine ton voyage",
    description:
      "Destination, transport, hébergement, activités et programme jour par jour : tout est pensé pour toi.",
    icon: Compass,
    tags: ["Destination", "Programme", "Budget estimé"],
  },
  {
    number: "03",
    title: "Tu pars",
    description:
      "Tu ajustes ce que tu veux, tu partages avec ta bande et il ne reste plus qu'à faire ton sac.",
    icon: Luggage,
    tags: ["Partage", "Sauvegarde", "Go !"],
  },
];

export function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="relative bg-sand-50 py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Comment ça marche"
            title={
              <>
                Du « on part où ? » au billet, <span className="text-sun-600">en 3 étapes.</span>
              </>
            }
            description="Fini les 40 onglets ouverts et les heures de comparaison. OVO fait le tri pour toi."
          />
        </Reveal>

        <ol className="relative mt-14 grid gap-5 md:grid-cols-3 lg:mt-20 lg:gap-8">
          {/* Ligne de liaison entre les étapes (desktop) */}
          <div
            aria-hidden="true"
            className="absolute top-12 right-[16%] left-[16%] hidden h-px bg-linear-to-r from-transparent via-sun-500/40 to-transparent md:block"
          />
          {steps.map((step, index) => (
            <li key={step.number} className="relative">
              <Reveal delay={index * 120} className="h-full">
                <article className="group relative h-full overflow-hidden rounded-4xl border border-night-950/5 bg-white p-7 shadow-sm shadow-night-950/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-night-950/10 sm:p-8">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-4 -right-2 font-display text-[7.5rem] leading-none font-extrabold text-night-950/[0.04] transition-colors duration-500 group-hover:text-sun-500/10"
                  >
                    {step.number}
                  </span>

                  <div className="relative flex items-center gap-4">
                    <span className="grid size-14 place-items-center rounded-2xl bg-night-950 text-sun-400 shadow-lg shadow-night-950/20 transition-transform duration-500 group-hover:rotate-6">
                      <step.icon className="size-6" />
                    </span>
                    <span className="font-display text-sm font-bold tracking-widest text-sun-600">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="relative mt-7 font-display text-2xl font-bold tracking-tight text-night-950">
                    {step.title}
                  </h3>
                  <p className="relative mt-3 leading-relaxed text-night-700/80">{step.description}</p>

                  <ul className="relative mt-6 flex flex-wrap gap-2">
                    {step.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full bg-sand-100 px-3 py-1 text-xs font-medium text-night-800"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
