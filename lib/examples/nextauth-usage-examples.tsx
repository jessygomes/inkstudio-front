/**
 * Exemples d'utilisation de NextAuth dans différents contextes
 * 
 * Ce fichier contient des exemples pratiques pour utiliser NextAuth
 * dans votre application
 */

// ============================================
// 1. UTILISATION DANS UN SERVER COMPONENT
// ============================================

import { getCurrentUser, getAccessToken } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Récupérer l'utilisateur connecté
  const user = await getCurrentUser();

  // Rediriger si non connecté
  if (!user) {
    redirect("/connexion");
  }

  return (
    <div>
      <h1>Bonjour {user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Rôle: {user.role}</p>
    </div>
  );
}

// ============================================
// 2. UTILISATION DANS UN CLIENT COMPONENT
// ============================================

"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedClientComponent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirection si non connecté
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/connexion");
    }
  }, [status, router]);

  // Affichage pendant le chargement
  if (status === "loading") {
    return <div>Chargement...</div>;
  }

  // Affichage si non connecté
  if (!session) {
    return null;
  }

  return (
    <div>
      <h2>Informations utilisateur</h2>
      <p>Nom: {session.user.name}</p>
      <p>Email: {session.user.email}</p>
      <p>ID: {session.user.id}</p>
      <p>Rôle: {session.user.role}</p>
    </div>
  );
}

// ============================================
// 3. APPELS API AVEC TOKEN DANS SERVER ACTION
// ============================================

"use server";
import { getAuthHeaders, getAccessToken } from "@/lib/auth-helpers";

export async function fetchUserProfile() {
  try {
    // Récupérer les headers avec authentification
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/user/profile`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération du profil");
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur:", error);
    throw error;
  }
}

export async function updateUserProfile(data: any) {
  try {
    const token = await getAccessToken();

    if (!token) {
      throw new Error("Non authentifié");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/user/profile`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Erreur:", error);
    throw error;
  }
}

// ============================================
// 4. BOUTON DE DÉCONNEXION
// ============================================

"use client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({
      redirect: false, // Ne pas rediriger automatiquement
    });

    // Redirection manuelle
    router.push("/");
    router.refresh();
  };

  return (
    <button onClick={handleLogout} className="btn-logout">
      Se déconnecter
    </button>
  );
}

// ============================================
// 5. VÉRIFICATION DU RÔLE UTILISATEUR
// ============================================

import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export async function AdminOnlyPage() {
  const user = await getCurrentUser();

  // Vérifier si l'utilisateur est admin
  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard"); // Ou une page 403
  }

  return (
    <div>
      <h1>Page Admin</h1>
      <p>Réservée aux administrateurs</p>
    </div>
  );
}

// ============================================
// 6. UTILISATION AVEC REACT QUERY
// ============================================

"use client";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

export function UserDataComponent() {
  const { data: session } = useSession();

  const { data, isLoading, error } = useQuery({
    queryKey: ["userData", session?.user.id],
    queryFn: async () => {
      if (!session?.accessToken) {
        throw new Error("Non authentifié");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/user/data`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données");
      }

      return response.json();
    },
    enabled: !!session?.accessToken, // Ne lancer la requête que si authentifié
  });

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

// ============================================
// 7. HOOK PERSONNALISÉ POUR L'AUTHENTIFICATION
// ============================================

"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useRequireAuth(redirectTo = "/connexion") {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(redirectTo);
    }
  }, [status, router, redirectTo]);

  return {
    session,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
}

// Utilisation du hook
export function MyProtectedComponent() {
  const { session, isLoading, isAuthenticated } = useRequireAuth();

  if (isLoading) return <div>Chargement...</div>;
  if (!isAuthenticated) return null;

  return <div>Contenu protégé pour {session?.user.name}</div>;
}

// ============================================
// 8. FETCH AVEC GESTION D'ERREUR TOKEN EXPIRÉ
// ============================================

"use server";
import { getAccessToken } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getAccessToken();

  if (!token) {
    redirect("/connexion");
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Si le token est expiré (401)
    if (response.status === 401) {
      redirect("/connexion?reason=session_expired");
    }

    return response;
  } catch (error) {
    console.error("Erreur lors de la requête:", error);
    throw error;
  }
}

// Utilisation
export async function getMyData() {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_BACK_URL}/my-data`
  );

  return response.json();
}
