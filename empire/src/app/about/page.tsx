import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { routes, siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "À propos" };

const principles = [
  ["Apprendre en produisant", "Chaque leçon se termine par un exercice appliqué à ton projet. On mesure l'avancement en livrables, pas en heures de vidéo."],
  ["Honnêteté", "Aucun faux avis, aucun faux chiffre, aucune fausse urgence. Les contenus de démonstration sont signalés comme tels."],
  ["Exigence visuelle", "Une plateforme qui apprend à construire doit être elle-même bien construite : rapide, accessible, soignée."],
  ["Sobriété quand il faut", "L'expérience immersive s'efface dès qu'il s'agit d'apprendre ou d'accomplir une tâche."],
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        index="i"
        label="À propos"
        lang="en"
        title="Built to build"
        lines={["Built", <span key="b" className="text-outline">to build.</span>]}
        intro={
          <p>
            {siteConfig.name} (nom de travail) est une académie entrepreneuriale en construction : formations, parcours, outils et assistant pour passer de
            l&apos;idée au projet lancé.
          </p>
        }
      />
      <section className="shell pb-24">
        <ol className="grid gap-px border hairline bg-steel/40 md:grid-cols-2">
          {principles.map(([title, text], index) => (
            <li key={title} data-reveal="up" className="bg-void p-8">
              <p className="meta text-mist">0{index + 1}</p>
              <h2 className="font-display mt-4 text-2xl font-bold [font-stretch:112%]">{title}</h2>
              <p className="mt-3 text-silver">{text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-10 max-w-2xl text-silver">
          État actuel : la plateforme, ses outils et ses premiers contenus de démonstration sont en place. Les formations complètes, l&apos;équipe
          pédagogique et la communauté arriveront progressivement.
        </p>
        <div className="mt-8">
          <ButtonLink href={routes.academy}>Voir les formations</ButtonLink>
        </div>
      </section>
    </>
  );
}
