import { SiteHeader } from "@/components/layout/site-header";

/**
 * Parcours « plein écran » (questionnaire) : pas de pied de page ni de barre
 * d'onglets, pour que la barre d'actions reste collée en bas de l'écran.
 */
export default function FocusLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main id="contenu" className="flex flex-1 flex-col">
        {children}
      </main>
    </>
  );
}
