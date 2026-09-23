// Préparation locale d'OVO : `npm run setup`.
// - vérifie la version de Node.js ;
// - crée `.env.local` à partir de `.env.example` (sans jamais écraser un fichier existant) ;
// - génère un CRON_SECRET aléatoire s'il est vide.
import { randomBytes } from "node:crypto";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";

const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 20 || (major === 20 && minor < 9)) {
  console.error(
    `✖ Node.js ${process.versions.node} est trop ancien : installe Node.js 22 (LTS) depuis https://nodejs.org`,
  );
  process.exit(1);
}
console.log(`✔ Node.js ${process.versions.node}`);

if (existsSync(".env.local")) {
  console.log("✔ .env.local existe déjà (non modifié, sauf CRON_SECRET s'il est vide)");
} else {
  copyFileSync(".env.example", ".env.local");
  console.log("✔ .env.local créé à partir de .env.example");
}

const env = readFileSync(".env.local", "utf8");
if (/^CRON_SECRET=\s*$/m.test(env)) {
  writeFileSync(
    ".env.local",
    env.replace(/^CRON_SECRET=\s*$/m, `CRON_SECRET=${randomBytes(24).toString("hex")}`),
  );
  console.log("✔ CRON_SECRET généré");
}

console.log(`
Étapes suivantes :
  1. npm run dev        → ouvre http://localhost:3000 (OVO fonctionne déjà sans compte ni paiement)
  2. Renseigne Supabase puis Stripe dans .env.local (voir DEMARRAGE.md)
  3. npm run doctor     → vérifie ta configuration
`);
