import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

/** Pages d'authentification (connexion, inscription, mot de passe oublié…). */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main id="contenu" className="flex flex-1 flex-col">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
