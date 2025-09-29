import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
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

  // Si on a un token, vérifier sa validité pour les pages protégées
  if (isProtectedPath && token) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/auth`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Si le token est expiré ou invalide
      if (response.status === 401) {
        console.log(
          "🔒 Token expiré/invalide détecté - Suppression et redirection"
        );

        // Créer une réponse avec redirection et suppression des cookies
        const redirectResponse = NextResponse.redirect(
          new URL("/connexion?reason=token_expired", request.url)
        );

        // Supprimer les cookies expirés
        redirectResponse.cookies.delete("access_token");
        redirectResponse.cookies.delete("userId");

        return redirectResponse;
      }

      // Si erreur réseau ou autre problème, on laisse passer
      // L'erreur sera gérée côté composant
      if (!response.ok && response.status !== 401) {
        console.warn(
          `⚠️ Erreur lors de la vérification du token: ${response.status}`
        );
      }
    } catch (error) {
      console.warn("⚠️ Erreur réseau lors de la vérification du token:", error);
      // En cas d'erreur réseau, on laisse passer pour éviter de bloquer l'utilisateur
    }
  }

  // Si on a un token et qu'on essaie d'accéder aux pages d'auth, rediriger vers dashboard
  // Note: La validité du token sera vérifiée par le composant si nécessaire
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
