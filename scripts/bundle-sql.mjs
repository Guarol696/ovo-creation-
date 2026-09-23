// Regroupe les migrations Supabase en un seul fichier à coller dans l'éditeur SQL :
// `npm run db:bundle` → supabase/setup.sql (à régénérer après chaque nouvelle migration).
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

export function bundleMigrations(dir = "supabase/migrations") {
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  const header = `-- OVO : installation complète de la base (généré par \`npm run db:bundle\`, ne pas modifier).
-- À exécuter UNE SEULE FOIS sur un projet Supabase neuf : SQL Editor > New query > coller > Run.
-- Contient, dans l'ordre : ${files.join(", ")}.
`;
  return (
    header +
    files
      .map(
        (f) =>
          `\n-- =====================================================================\n-- ${f}\n-- =====================================================================\n\n${readFileSync(`${dir}/${f}`, "utf8").trim()}\n`,
      )
      .join("")
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync("supabase/setup.sql", bundleMigrations());
  console.log("✔ supabase/setup.sql régénéré");
}
