import { ButtonLink } from "@/components/ui/button";
import { routes } from "@/config/site";

export default function NotFound() {
  return (
    <section className="shell flex min-h-[80dvh] flex-col justify-center gap-8 pt-[var(--header-h)]">
      <p className="meta text-mist">[ 404 ] Signal perdu</p>
      <h1 className="font-expanded display-lg">
        Cette page
        <br />
        <span className="text-outline">n&apos;existe pas.</span>
      </h1>
      <p className="max-w-md text-silver">Le lien est peut-être ancien, ou l&apos;adresse a été mal recopiée.</p>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href={routes.home}>Retour à l&apos;accueil</ButtonLink>
        <ButtonLink href={routes.academy} variant="outline">
          Voir les formations
        </ButtonLink>
      </div>
    </section>
  );
}
