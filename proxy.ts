import { auth } from "@/auth";
import { ROUTES } from "@/lib/routes";
import { NextResponse } from "next/server";

/**
 * Proxy NextAuth pour protéger les routes
 * Utilise la fonction auth() de NextAuth pour vérifier l'authentification
 */
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const hasExpiredToken = req.auth?.error === "AccessTokenExpired";
  const isAuthenticated = isLoggedIn && !hasExpiredToken;

  // Pages qui nécessitent une authentification
  const protectedPaths = [
    ROUTES.dashboard,
    "/rdv",
    "/mes-rendez-vous",
    "/clients",
    "/portfolio",
    "/mon-portfolio",
    "/mes-produits",
    "/mes-flashs",
    "/mon-compte",
    "/parametres",
    "/stocks",
    "/factures",
    "/messagerie",
    "/review",
    "/admin",
  ];

  // Pages d'authentification (connexion, inscription)
  const authPaths = [ROUTES.connexion, ROUTES.inscription];

  const isProtectedPath = protectedPaths.some((path) =>
    nextUrl.pathname.startsWith(path)
  );
  const isAuthPath = authPaths.some((path) => nextUrl.pathname.startsWith(path));

  // Si on essaie d'accéder à une page protégée sans être connecté ou avec token expiré
  if (isProtectedPath && !isAuthenticated) {
    console.log(
      "🔒 Accès à une page protégée sans authentification - Redirection"
    );
    return NextResponse.redirect(
      new URL(`${ROUTES.connexion}?callbackUrl=${nextUrl.pathname}`, req.url)
    );
  }

  // Si on est connecté et qu'on essaie d'accéder aux pages d'auth, rediriger vers le dashboard
  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};