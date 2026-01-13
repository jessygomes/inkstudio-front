import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Middleware NextAuth pour protéger les routes
 * Utilise la fonction auth() de NextAuth pour vérifier l'authentification
 */
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Pages qui nécessitent une authentification
  const protectedPaths = [
    "/dashboard",
    "/rdv",
    "/clients",
    "/portfolio",
    "/mes-produits",
    "/mon-compte",
    "/parametres",
    "/stocks",
    "/factures",
    "/admin",
  ];

  // Pages d'authentification (connexion, inscription)
  const authPaths = ["/connexion", "/inscription"];

  const isProtectedPath = protectedPaths.some((path) =>
    nextUrl.pathname.startsWith(path)
  );
  const isAuthPath = authPaths.some((path) =>
    nextUrl.pathname.startsWith(path)
  );

  // Si on essaie d'accéder à une page protégée sans être connecté
  if (isProtectedPath && !isLoggedIn) {
    console.log(
      "🔒 Accès à une page protégée sans authentification - Redirection"
    );
    return NextResponse.redirect(
      new URL("/connexion?callbackUrl=" + nextUrl.pathname, req.url)
    );
  }

  // Si on est connecté et qu'on essaie d'accéder aux pages d'auth, rediriger vers le dashboard
  if (isAuthPath && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
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
