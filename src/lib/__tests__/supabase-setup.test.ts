import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { bundleMigrations } from "../../../scripts/bundle-sql.mjs";

describe("supabase/setup.sql", () => {
  it("est à jour avec supabase/migrations (sinon : npm run db:bundle)", () => {
    expect(readFileSync("supabase/setup.sql", "utf8")).toBe(bundleMigrations());
  });
});
