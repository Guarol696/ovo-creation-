import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { DemoBadge } from "@/components/ui/badges";
import { Notice } from "@/components/ui/notice";
import { routes } from "@/config/site";
import { AssistantChat } from "@/features/assistant/chat";
import { isAssistantConfigured } from "@/features/assistant/config";
import { getCurrentUser } from "@/lib/auth/session";
import { loginUrl } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Assistant", description: "Un assistant pour apprendre, structurer une idée et préparer un plan de travail." };

const capabilities = [
  "Expliquer un concept (proposition de valeur, landing page, MVP…)",
  "Proposer un parcours d'apprentissage adapté",
  "Structurer une idée de business",
  "Définir les pages et fonctionnalités d'un site",
  "Générer un plan de travail semaine par semaine",
  "Répondre aux questions liées aux formations",
];

export default async function AssistantPage() {
  const enabled = isAssistantConfigured();
  const needsLogin = enabled && isSupabaseConfigured() && !(await getCurrentUser());

  return (
    <>
      <PageHero
        index="AI"
        label="Assistant"
        lang="en"
        title="Personal AI"
        lines={["Personal", <span key="ai" className="text-volt">AI.</span>]}
        intro={<p>Un copilote pour apprendre et construire. Il ne remplace pas ton jugement : il t&apos;aide à le structurer.</p>}
        aside={!enabled ? <DemoBadge>Prévisualisation — IA non connectée</DemoBadge> : undefined}
      />
      <section className="shell grid gap-12 pb-24 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {enabled && !needsLogin && <AssistantChat />}
          {needsLogin && (
            <div className="grid gap-4 border hairline p-8">
              <p className="font-display text-xl font-bold">Connecte-toi pour utiliser l&apos;assistant.</p>
              <p className="text-silver">L&apos;assistant est réservé aux comptes, pour protéger le service des abus.</p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href={loginUrl(routes.assistant)}>Se connecter</ButtonLink>
                <ButtonLink href={routes.signup} variant="outline">Créer un compte</ButtonLink>
              </div>
            </div>
          )}
          {!enabled && (
            <div className="grid gap-6">
              <Notice tone="demo" title="Aucune IA n'est connectée sur ce déploiement">
                Cette page ne simule pas de réponses : l&apos;assistant fonctionne uniquement avec un vrai modèle, appelé depuis le serveur.
                La démonstration animée de la page d&apos;accueil est un scénario écrit.
              </Notice>
              <div className="border hairline p-6">
                <p className="meta text-mist">Activer l&apos;assistant</p>
                <ol className="mt-4 grid gap-3 text-sm text-silver">
                  <li>1. Créer une clé d&apos;API sur la console Anthropic.</li>
                  <li>
                    2. L&apos;ajouter côté serveur : <code className="text-paper">ANTHROPIC_API_KEY</code> (jamais préfixée NEXT_PUBLIC_).
                  </li>
                  <li>
                    3. Optionnel : <code className="text-paper">ASSISTANT_MODEL</code> pour choisir le modèle.
                  </li>
                  <li>4. Redéployer. Si les comptes Supabase sont actifs, l&apos;assistant est réservé aux utilisateurs connectés.</li>
                </ol>
              </div>
            </div>
          )}
        </div>
        <aside className="lg:col-span-4 lg:col-start-9">
          <p className="meta text-mist">Ce qu&apos;il peut faire</p>
          <ul className="mt-4 grid gap-2">
            {capabilities.map((item) => (
              <li key={item} className="border-b hairline pb-2 text-sm text-silver">{item}</li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-mist">Les réponses d&apos;une IA peuvent contenir des erreurs : vérifie toute information importante.</p>
        </aside>
      </section>
    </>
  );
}
