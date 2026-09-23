import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { protectedRoutes, routes } from "@/config/site";
import { authUrl } from "@/lib/auth/redirect";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";

const isProtected = (pathname: string) =>
  protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

/** Présence d'un cookie de session Supabase (sb-<projet>-auth-token, éventuellement découpé). */
const hasAuthCookie = (request: NextRequest) =>
  request.cookies.getAll().some(({ name }) => name.startsWith("sb-") && name.includes("-auth-token"));

/**
 * Rafraîchit la session Supabase (cookies) avant le rendu, et redirige vers
 * la connexion les visiteurs non connectés qui ouvrent une page protégée.
 *
 * Ce n'est qu'une première barrière : chaque page et chaque Server Action
 * revérifie l'utilisateur, et la base applique ses règles RLS.
 */
export async function updateSession(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const redirectToLogin = () => {
    const url = request.nextUrl.clone();
    const target = new URL(authUrl(routes.login, `${pathname}${search}`), url);
    url.pathname = target.pathname;
    url.search = target.search;
    return NextResponse.redirect(url);
  };

  // Comptes non configurés : les pages protégées affichent elles-mêmes un message.
  if (!isSupabaseConfigured()) return NextResponse.next({ request });
  // Aucun cookie de session : visiteur anonyme, inutile d'interroger Supabase.
  if (!hasAuthCookie(request))
    return isProtected(pathname) ? redirectToLogin() : NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Valide la session auprès de Supabase Auth (et la rafraîchit si besoin).
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
