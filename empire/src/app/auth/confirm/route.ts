import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { routes } from "@/config/site";
import { NEXT_PARAM, safeNextPath } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const OTP_TYPES: EmailOtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];

/** Retour des liens email (confirmation d'inscription, réinitialisation) : ouvre la session puis redirige. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNextPath(searchParams.get(NEXT_PARAM));
  const errorPage = next.startsWith(routes.resetPassword) ? routes.forgotPassword : routes.login;
  const fail = () => NextResponse.redirect(new URL(`${errorPage}?erreur=lien`, origin));

  if (!isSupabaseConfigured() || searchParams.get("error")) return fail();
  try {
    const supabase = await createClient();
    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;
    let error: unknown = null;
    if (code) ({ error } = await supabase.auth.exchangeCodeForSession(code));
    else if (tokenHash && type && OTP_TYPES.includes(type)) ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type }));
    else return fail();
    if (error) {
      console.error("[auth] lien email invalide", error);
      return fail();
    }
  } catch (error) {
    console.error("[auth] lien email", error);
    return fail();
  }
  return NextResponse.redirect(new URL(next, origin));
}
