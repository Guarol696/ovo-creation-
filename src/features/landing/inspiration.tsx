import { featuredDestinations } from "@/data/destinations";
import { routes } from "@/config/site";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { DestinationCard } from "./destination-card";

export function Inspiration() {
  return (
    <section id="decouvrir" className="bg-white py-24 sm:py-32">
      <Container>
        <Reveal className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Inspiration"
            title="Besoin d'idées ? Commence par là."
            description="Quelques destinations que les voyageurs OVO adorent. Budgets indicatifs par personne, hors vols."
          />
          <ButtonLink href={routes.createTrip} variant="outline-dark" className="self-start md:self-auto">
            Trouver ma destination
          </ButtonLink>
        </Reveal>
      </Container>

      {/* Mobile : carrousel horizontal ; tablette/desktop : grille */}
      <Container className="mt-12 px-0 sm:px-8">
        <ul className="scrollbar-none flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-4 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
          {featuredDestinations.map((destination, index) => (
            <li key={destination.slug} className="w-[82%] shrink-0 snap-start sm:w-auto">
              <Reveal delay={(index % 3) * 100} className="h-full">
                <DestinationCard destination={destination} />
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
