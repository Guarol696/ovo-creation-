import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { Notice } from "@/components/ui/notice";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  const email = siteConfig.contactEmail;
  return (
    <>
      <PageHero index="@" label="Contact" lang="en" title="Talk to us" lines={["Talk", "to us."]} intro={<p>Une question sur une formation, un abonnement ou ton compte ? Écris-nous.</p>} />
      <section className="shell pb-24">
        {email ? (
          <a href={`mailto:${email}`} className="font-expanded inline-block border-b border-paper/30 pb-2 text-[clamp(1.4rem,4vw,3rem)] break-all hover:border-volt hover:text-volt">
            {email}
          </a>
        ) : (
          <Notice tone="demo" title="Adresse de contact à configurer">
            Renseigne <code className="text-paper">NEXT_PUBLIC_CONTACT_EMAIL</code> pour afficher l&apos;adresse de contact ici.
          </Notice>
        )}
        <p className="mt-8 max-w-md text-sm text-mist">Pour une demande de suppression de compte, écris depuis l&apos;adresse associée au compte.</p>
      </section>
    </>
  );
}
