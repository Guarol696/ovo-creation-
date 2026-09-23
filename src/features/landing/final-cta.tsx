import { ArrowRight } from "lucide-react";
import { routes } from "@/config/site";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export function FinalCta() {
  return (
    <section className="bg-sand-50 py-20 sm:py-28">
      <Container>
        <Reveal className="relative isolate overflow-hidden rounded-5xl bg-linear-to-br from-sun-400 via-sun-500 to-sun-600 px-6 py-16 text-center sm:px-12 sm:py-20">
          <div aria-hidden="true" className="absolute inset-0 -z-10">
            <div className="absolute -top-24 -left-24 size-72 rounded-full bg-gold-300/60 blur-3xl" />
            <div className="absolute -right-24 -bottom-24 size-72 rounded-full bg-rose-500/40 blur-3xl" />
          </div>
          <h2 className="mx-auto max-w-3xl font-display text-4xl leading-[1.05] font-extrabold tracking-tight text-balance text-night-950 sm:text-6xl">
            Alors, où on va ?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-night-900/80 sm:text-lg">
            Dis-nous ce dont tu as envie. On s&apos;occupe du reste.
          </p>
          <div className="mt-9 flex justify-center">
            <ButtonLink href={routes.createTrip} size="lg" variant="dark">
              Créer mon voyage
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
