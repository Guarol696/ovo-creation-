import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/legal-page";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Confidentialité" updated="25 octobre 2026">
      <h2>Données collectées</h2>
      <ul>
        <li>Compte : email, nom affiché.</li>
        <li>Apprentissage : progression, notes personnelles, projets.</li>
        <li>Abonnement : statut et identifiants Stripe. Aucun numéro de carte n&apos;est stocké par la plateforme.</li>
        <li>Assistant : les messages sont transmis au fournisseur du modèle d&apos;IA pour produire la réponse ; ils ne sont pas enregistrés par la plateforme.</li>
      </ul>
      <h2>Stockage local</h2>
      <p>Tes préférences d&apos;affichage (animations, curseur, taille du texte) et, en mode démonstration, ta progression sont enregistrées dans ton navigateur uniquement. Aucun cookie publicitaire n&apos;est utilisé.</p>
      <h2>Sous-traitants</h2>
      <p>Hébergement de l&apos;application, base de données et authentification (Supabase), paiement (Stripe), modèle d&apos;IA (si l&apos;assistant est activé).</p>
      <h2>Tes droits</h2>
      <p>Tu peux demander l&apos;accès, la rectification ou la suppression de tes données via la page contact.</p>
    </LegalPage>
  );
}
