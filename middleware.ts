import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Récupérer le token depuis les cookies
  const token = request.cookies.get("access_token")?.value;

  // Pages qui nécessitent une authentification
  const protectedPaths = [
    "/dashboard",
    "/rdv",
    "/clients",
    "/portfolio",
    "/mes-produits",
    "/mon-compte",
    "/parametres",
  ];

  // Pages d'authentification
  const authPaths = ["/connexion", "/inscription"];

  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );
  const isAuthPath = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Si on essaie d'accéder à une page protégée sans token
  if (isProtectedPath && !token) {
    console.log(
      "🔒 Accès à une page protégée sans token - Redirection vers connexion"
    );
    return NextResponse.redirect(
      new URL("/connexion?reason=no-token", request.url)
    );
  }

  // Si on a un token et qu'on essaie d'accéder aux pages d'auth, rediriger vers dashboard
  // La validation de la validité du token sera gérée côté composant
  if (isAuthPath && token) {
    console.log(
      "✅ Token présent sur page d'auth - Redirection vers dashboard"
    );
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

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
