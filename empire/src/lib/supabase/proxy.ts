import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { protectedRoutes } from "@/config/site";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";
import { loginUrl } from "@/lib/auth/redirect";

const isProtected = (pathname: string) =>
  protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

const hasAuthCookie = (request: NextRequest) =>
  request.cookies.getAll().some(({ name }) => name.startsWith("sb-") && name.includes("-auth-token"));

/**
 * Rafraîchit la session et redirige les visiteurs anonymes qui ouvrent une
 * page privée. Première barrière seulement : pages et actions revérifient
 * l'utilisateur, et la base applique ses règles RLS.
 */
export async function updateSession(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const redirectToLogin = () => NextResponse.redirect(new URL(loginUrl(`${pathname}${search}`), request.url));

  // Sans Supabase, les pages privées s'affichent en mode démonstration.
  if (!isSupabaseConfigured()) return NextResponse.next({ request });
  if (!hasAuthCookie(request)) return isProtected(pathname) ? redirectToLogin() : NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtected(pathname)) {
    const redirect = redirectToLogin();
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }
  return response;
}
