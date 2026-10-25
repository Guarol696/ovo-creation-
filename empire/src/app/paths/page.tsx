import type { Metadata } from "next";
import { TransitionLink } from "@/components/motion/transition-link";
import { PageHero } from "@/components/sections/page-hero";
import { routes } from "@/config/site";
import { paths } from "@/data/paths";

export const metadata: Metadata = { title: "Parcours", description: "Parcours entrepreneuriaux étape par étape : site, boutique, application, clients, produit numérique." };

export default function PathsPage() {
  return (
    <>
      <PageHero
        index="D"
        label="Découverte — parcours"
        lang="en"
        title="Choose a trajectory"
        lines={["Choose a", <span key="t" className="text-outline">trajectory.</span>]}
        intro={<p>Cinq parcours concrets, du premier pas au premier résultat. Chaque étape renvoie vers une formation et des ressources publiques.</p>}
      />
      <section aria-label="Parcours" className="shell pb-24 md:pb-32">
        <ol className="border-t hairline">
          {paths.map((path, index) => (
            <li key={path.slug} data-reveal="up" style={{ "--d": `${index * 60}ms` } as React.CSSProperties}>
              <TransitionLink
                href={routes.path(path.slug)}
                transitionLabel={path.index}
                data-cursor-label="Open"
                className="group grid gap-4 border-b hairline py-8 transition-colors hover:bg-abyss md:grid-cols-[6rem_1fr_18rem_auto] md:items-center md:px-4"
              >
                <span className="font-expanded text-3xl text-outline transition-colors group-hover:text-volt group-hover:[-webkit-text-stroke:0]">{path.index}</span>
                <span>
                  <span className="font-display block text-[clamp(1.5rem,3.2vw,2.5rem)] leading-tight font-bold [font-stretch:115%]">{path.title}</span>
                  <span className="mt-2 block max-w-xl text-silver">{path.promise}</span>
                </span>
                <span className="meta text-mist">
                  {path.steps.length} étapes · ~{path.weeks} semaines
                </span>
                <span aria-hidden className="meta text-mist transition-transform group-hover:translate-x-1 group-hover:text-volt">→</span>
              </TransitionLink>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
