// Diagnostic de la configuration locale d'OVO : `npm run doctor`.
// Lit .env.local et vérifie Supabase (tables, fonctions) puis Stripe (clés, prix,
// portail, webhook). N'affiche jamais la valeur d'une clé.
import { existsSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let problems = 0;
let warnings = 0;
const good = (m) => console.log(`  ✔ ${m}`);
const warn = (m) => (warnings++, console.log(`  ⚠ ${m}`));
const bad = (m) => (problems++, console.log(`  ✖ ${m}`));
const title = (m) => console.log(`\n${m}`);

if (!existsSync(".env.local")) {
  console.log("✖ .env.local est introuvable : lance d'abord `npm run setup`.");
  process.exit(1);
}
process.loadEnvFile(".env.local");
const env = (name) => process.env[name]?.trim() ?? "";

// --- Site ---------------------------------------------------------------
title("Site");
const siteUrl = env("NEXT_PUBLIC_SITE_URL") || "http://localhost:3000";
good(`NEXT_PUBLIC_SITE_URL = ${siteUrl}`);

// --- Supabase -------------------------------------------------------------
title("Supabase (comptes, voyages enregistrés, abonnements)");
const sbUrl = env("NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "");
const anon = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const service = env("SUPABASE_SERVICE_ROLE_KEY");
let supabaseOk = false;
if (!sbUrl || !anon) {
  warn(
    "Supabase non configuré : OVO fonctionne sans compte (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).",
  );
} else {
  const rest = (path, key, init = {}) =>
    fetch(`${sbUrl}/rest/v1/${path}`, {
      ...init,
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    });
  try {
    const health = await fetch(`${sbUrl}/auth/v1/health`, { headers: { apikey: anon } });
    if (health.ok) {
      good("Projet Supabase joignable, clé anon acceptée");
      supabaseOk = true;
    } else bad(`Supabase répond ${health.status} : vérifie l'URL et la clé anon (Project Settings > API).`);
  } catch (error) {
    bad(`Supabase injoignable (${error.message}) : vérifie NEXT_PUBLIC_SUPABASE_URL.`);
  }
  if (supabaseOk) {
    const key = service || anon;
    const missing = [];
    for (const table of ["profiles", "saved_trips", "subscriptions", "stripe_webhook_events"]) {
      const r = await rest(`${table}?select=*&limit=0`, key);
      const body = r.ok ? null : await r.json().catch(() => ({}));
      if (r.status === 404 || ["PGRST205", "42P01"].includes(body?.code)) missing.push(table);
    }
    // Appel avec la clé anon : doit être REFUSÉ (fonction réservée au serveur).
    const rpc = await rest("rpc/claim_stripe_webhook_event", anon, {
      method: "POST",
      body: JSON.stringify({ p_event_id: "evt_doctor", p_event_type: "doctor", p_stripe_created_at: null }),
    });
    const rpcBody = await rpc.json().catch(() => ({}));
    if (rpc.status === 404 && rpcBody?.code === "PGRST202")
      missing.push("fonction claim_stripe_webhook_event");
    else if (rpc.ok)
      bad(
        "La fonction claim_stripe_webhook_event est accessible publiquement : réapplique la dernière migration.",
      );
    if (missing.length) {
      bad(
        `Éléments absents de la base : ${missing.join(", ")}. Exécute supabase/migrations/*.sql dans l'ordre (voir DEMARRAGE.md).`,
      );
    } else good("Tables et fonctions OVO présentes (migrations appliquées)");

    if (!service) {
      warn("SUPABASE_SERVICE_ROLE_KEY manquante : les abonnements Stripe ne peuvent pas être enregistrés.");
    } else {
      const r = await rest("subscriptions?select=user_id&limit=1", service);
      if (r.ok) good("Clé service_role valide (serveur uniquement)");
      else
        bad(
          `Clé service_role refusée (${r.status}) : recopie la clé « service_role » (Project Settings > API).`,
        );
    }
  }
}

// --- Stripe ---------------------------------------------------------------
title("Stripe (abonnements OVO Medium / OVO Premium)");
const sk = env("STRIPE_SECRET_KEY");
const pk = env("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
const whsec = env("STRIPE_WEBHOOK_SECRET");
const prices = { "OVO Medium": env("STRIPE_MEDIUM_PRICE_ID"), "OVO Premium": env("STRIPE_PREMIUM_PRICE_ID") };
const expected = { "OVO Medium": 599, "OVO Premium": 999 };

if (!sk) {
  warn("Stripe non configuré : les boutons de paiement affichent « paiement pas encore activé ».");
} else if (!/^(sk|rk)_(test|live)_[A-Za-z0-9]+$/.test(sk)) {
  bad("STRIPE_SECRET_KEY invalide : elle doit commencer par sk_test_ (mode test).");
} else {
  const mode = sk.includes("_test_") ? "test" : "live";
  if (mode === "live")
    warn("Clé Stripe LIVE : de vrais paiements seront débités. Utilise sk_test_ pour tester.");
  else good("Clé secrète Stripe en mode test");
  if (pk && !pk.startsWith(`pk_${mode}_`))
    bad(`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY n'est pas une clé pk_${mode}_ (mélange test/live).`);
  else if (pk) good("Clé publiable cohérente avec la clé secrète");
  if (!/^whsec_[A-Za-z0-9]+$/.test(whsec)) {
    bad("STRIPE_WEBHOOK_SECRET manquant ou invalide (whsec_…) : donné par `stripe listen` en local.");
  } else good("Secret de webhook présent");
  if (!service) bad("SUPABASE_SERVICE_ROLE_KEY est obligatoire pour enregistrer les abonnements.");
  if (env("CRON_SECRET").length < 16)
    warn("CRON_SECRET absent ou trop court (réconciliation quotidienne désactivée).");

  const Stripe = require("stripe");
  // STRIPE_API_BASE : simulateur local uniquement, jamais avec une clé live (comme l'application).
  const local = env("STRIPE_API_BASE") && mode === "test" ? new URL(env("STRIPE_API_BASE")) : null;
  const stripe = new Stripe(sk, {
    maxNetworkRetries: 1,
    timeout: 15000,
    ...(local ? { host: local.hostname, port: local.port, protocol: local.protocol.replace(":", "") } : {}),
  });
  try {
    for (const [name, id] of Object.entries(prices)) {
      if (!/^price_[A-Za-z0-9]+$/.test(id)) {
        bad(`Price ID de ${name} manquant ou invalide (price_…).`);
        continue;
      }
      try {
        const p = await stripe.prices.retrieve(id);
        const amount = new Intl.NumberFormat("fr-FR", { style: "currency", currency: p.currency }).format(
          (p.unit_amount ?? 0) / 100,
        );
        const units = { day: "jour", week: "semaine", month: "mois", year: "an" };
        const every = p.recurring
          ? `${p.recurring.interval_count > 1 ? `${p.recurring.interval_count} ` : ""}${units[p.recurring.interval] ?? p.recurring.interval}`
          : "paiement unique";
        const label = `${amount} / ${every}`;
        if (!p.active) bad(`${name} : le Price est archivé.`);
        else if (p.type !== "recurring")
          bad(`${name} : le Price n'est pas récurrent (abonnement impossible).`);
        else if (
          p.unit_amount !== expected[name] ||
          p.currency !== "eur" ||
          p.recurring.interval !== "month" ||
          p.recurring.interval_count !== 1
        ) {
          warn(`${name} : Price Stripe = ${label}, différent de ce qu'affiche OVO (src/config/premium.ts).`);
        } else good(`${name} : ${label}`);
      } catch (error) {
        bad(`${name} : Price introuvable (${error.message}). Vérifie l'ID et le mode test/live.`);
      }
    }
  } catch (error) {
    bad(`Stripe refuse la connexion (${error.message}) : vérifie STRIPE_SECRET_KEY.`);
  }
  try {
    const portals = await stripe.billingPortal.configurations.list({ limit: 10, active: true });
    const portal = portals.data.find((c) => c.is_default) ?? portals.data[0];
    if (!portal) {
      bad("Customer Portal non enregistré : Settings > Billing > Customer portal > Save (en mode test).");
    } else {
      good("Customer Portal configuré");
      if (!portal.features.subscription_update?.enabled) {
        warn(
          "Portail : « changement d'offre » désactivé (Medium ↔ Premium passera par le portail classique).",
        );
      }
      if (!portal.features.subscription_cancel?.enabled) warn("Portail : annulation désactivée.");
    }
  } catch (error) {
    warn(`Impossible de vérifier le Customer Portal (${error.message}).`);
  }
}

console.log(
  `\n${problems ? `✖ ${problems} problème(s)` : "✔ Aucun problème bloquant"}${warnings ? `, ⚠ ${warnings} avertissement(s)` : ""}.`,
);
process.exit(problems ? 1 : 0);
