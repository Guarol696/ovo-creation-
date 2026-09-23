import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { routes } from "@/config/site";
import { NEXT_PARAM, safeNextPath } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const OTP_TYPES: EmailOtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];

/**
 * Retour des liens envoyés par email (confirmation d'inscription, mot de passe oublié).
 * Accepte les deux formats de Supabase :
 *  - `?code=…` (flux PKCE, modèles d'email par défaut) ;
 *  - `?token_hash=…&type=…` (modèles d'email personnalisés).
 * Ouvre la session puis redirige vers `next` (page interne uniquement).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = safeNextPath(searchParams.get(NEXT_PARAM));
  // Lien de réinitialisation invalide : on propose directement d'en demander un nouveau.
  const errorPage = next.startsWith(routes.resetPassword) ? routes.forgotPassword : routes.login;
  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`${errorPage}?erreur=${reason}`, request.nextUrl.origin));

  if (!isSupabaseConfigured()) return fail("indisponible");
  // Erreur transmise par Supabase (lien expiré, déjà utilisé…).
  if (searchParams.get("error")) return fail("lien");

  try {
    const supabase = await createClient();
    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;

    let error: unknown = null;
    if (code) {
      ({ error } = await supabase.auth.exchangeCodeForSession(code));
    } else if (tokenHash && type && OTP_TYPES.includes(type)) {
      ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type }));
    } else {
      return fail("lien");
    }
    if (error) {
      console.error("[auth] lien email invalide", error);
      return fail("lien");
    }
  } catch (error) {
    console.error("[auth] lien email", error);
    return fail("lien");
  }
  return NextResponse.redirect(new URL(next, request.nextUrl.origin));
}
