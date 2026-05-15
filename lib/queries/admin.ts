/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { getAuthHeaders } from "../session";

//! ----------------------------------------------------------------------------

//! DASHBOARD FUNCTION

//! ----------------------------------------------------------------------------
export async function getAdminDashboardStats() {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/admin/stats`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );
    if (!response.ok) {
      console.error("Response not ok:", response.statusText);
      return {
        ok: false,
        message: `Erreur HTTP ${response.status}: ${response.statusText}`,
      };
    }
    const data = await response.json();
    if (data.error) {
      return {
        ok: false,
        message:
          data.message || "Erreur lors de la récupération des statistiques",
      };
    }
    return {
      ok: true,
      stats: data.stats,
      message: "Statistiques récupérées avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return {
      ok: false,
      message: "Erreur lors de la récupération des statistiques",
    };
  }
}

//! ----------------------------------------------------------------------------

//! RECUPERER TOUS LES SALONS INSCRITS

//! ----------------------------------------------------------------------------
export async function getAllRegisteredSalons(
  page: number = 1,
  limit: number = 10,
  search?: string,
  saasPlan?: "FREE" | "PRO" | "BUSINESS",
  verified?: boolean
) {
  try {
    const headers = await getAuthHeaders();

    // Construire les paramètres de requête
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search?.trim()) {
      params.append("search", search.trim());
    }

    if (saasPlan) {
      params.append("saasPlan", saasPlan);
    }

    if (verified !== undefined) {
      params.append("verifiedSalon", verified.toString());
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/admin/salons?${params.toString()}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Response not ok:", response.statusText);
      return {
        ok: false,
        message: `Erreur HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (data.error) {
      return {
        ok: false,
        message: data.message || "Erreur lors de la récupération des salons",
      };
    }

    return {
      ok: true,
      salons: data.salons,
      pagination: data.pagination,
      message: "Salons récupérés avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des salons:", error);
    return {
      ok: false,
      message: "Erreur lors de la récupération des salons",
    };
  }
}

//! ----------------------------------------------------------------------------

//! RECUPERER TOUS LES CLIENTS

//! ----------------------------------------------------------------------------
export async function getAllClients(
  page: number = 1,
  limit: number = 10,
  search?: string
) {
  try {
    const headers = await getAuthHeaders();

    // Construire les paramètres de requête
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search?.trim()) {
      params.append("search", search.trim());
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/admin/clients?${params.toString()}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Response not ok:", response.statusText);
      return {
        ok: false,
        message: `Erreur HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (data.error) {
      return {
        ok: false,
        message: data.message || "Erreur lors de la récupération des clients",
      };
    }

    return {
      ok: true,
      clients: data.clients,
      pagination: data.pagination,
      message: "Clients récupérés avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des clients:", error);
    return {
      ok: false,
      message: "Erreur lors de la récupération des clients",
    };
  }
}

//! ----------------------------------------------------------------------------

//! RECUPERER UN SALON PAR ID

//! ----------------------------------------------------------------------------
export async function getSalonById(id: string) {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/admin/users/${id}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Response not ok:", response.statusText);
      return {
        ok: false,
        message: `Erreur HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (data.error) {
      return {
        ok: false,
        message: data.message || "Erreur lors de la récupération du salon",
      };
    }

    return {
      ok: true,
      salon: data.salon || data, // fallback si l'API renvoie l'objet directement
      message: "Salon récupéré avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du salon:", error);
    return {
      ok: false,
      message: "Erreur lors de la récupération du salon",
    };
  }
}

//! ----------------------------------------------------------------------------

//! RECUPERER LES SALONS EN ATTENTE DE VERIFICATION

//! ----------------------------------------------------------------------------
export async function getSalonsPendingVerification(
  page: number = 1,
  limit: number = 10,
  search?: string
) {
  try {
    const headers = await getAuthHeaders();
    // Construire les paramètres de requête
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search?.trim()) {
      params.append("search", search.trim());
    }
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BACK_URL
      }/admin/salons/pending-documents?${params.toString()}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );
    if (!response.ok) {
      console.error("Response not ok:", response.statusText);
      return {
        ok: false,
        message: `Erreur HTTP ${response.status}: ${response.statusText}`,
      };
    }
    const data = await response.json();
    if (data.error) {
      return {
        ok: false,
        message:
          data.message ||
          "Erreur lors de la récupération des salons à vérifier",
      };
    }

    return {
      ok: true,
      salons: data.salons,
      pagination: data.pagination,
      message: "Salons à vérifier récupérés avec succès",
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des salons à vérifier:",
      error
    );
    return {
      ok: false,
      message: "Erreur lors de la récupération des salons à vérifier",
    };
  }
}

//! ----------------------------------------------------------------------------

//! VALIDER OU REJETER UN DOCUMENT DE VERIFICATION

//! ----------------------------------------------------------------------------
export async function reviewSalonDocument(
  docId: string,
  status: "PENDING" | "APPROVED" | "REJECTED",
  rejectionReason?: string
) {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/salon-verification/documents/${docId}/status`,
      {
        method: "PATCH",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          ...(rejectionReason && { rejectionReason }),
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Response not ok:", response.statusText);
      return {
        ok: false,
        message: `Erreur HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (data.error) {
      return {
        ok: false,
        message: data.message || "Erreur lors de la validation du document",
      };
    }

    return {
      ok: true,
      document: data.document,
      message: data.message || "Document validé avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la validation du document:", error);
    return {
      ok: false,
      message: "Erreur lors de la validation du document",
    };
  }
}

//! ----------------------------------------------------------------------------

//! RECUPERER LES DONNEES D'EVOLUTION MENSUELLE

//! ----------------------------------------------------------------------------
export async function getMonthlyEvolution(months: number = 6) {
  try {
    const headers = await getAuthHeaders();

    const params = new URLSearchParams({
      months: months.toString(),
    });

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BACK_URL
      }/admin/evolution?${params.toString()}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Response not ok:", response.statusText);
      return {
        ok: false,
        message: `Erreur HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (data.error) {
      return {
        ok: false,
        message:
          data.message ||
          "Erreur lors de la récupération des données d'évolution",
      };
    }

    return {
      ok: true,
      data: data.data,
      message: "Données d'évolution récupérées avec succès",
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données d'évolution:",
      error
    );
    return {
      ok: false,
      message: "Erreur lors de la récupération des données d'évolution",
    };
  }
}


//! ----------------------------------------------------------------------------

//! RECUPERER LES TOP SALONS

//! ----------------------------------------------------------------------------
interface TopSalon {
  id: string;
  name: string;
  image?: string;
  city: string;
  views: number;
  rank: number;
}

export async function getTopSalons(limit = 10, days = 30): Promise<TopSalon[]> {
  try {
    const headers = await getAuthHeaders();
    
    const params = new URLSearchParams({
      limit: limit.toString(),
      days: days.toString(),
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/salon-analytics/admin/top-salons?${params.toString()}`,
      {
        method: 'GET',
        headers,
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch top salons: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform backend data to match TopSalon interface
    const transformedData: TopSalon[] = data.map((item: any, index: number) => ({
      id: item.salon?.id || '',
      name: item.salon?.salonName || 'N/A',
      city: item.salon?.city || 'N/A',
      views: item.viewCount || 0,
      rank: index + 1,
    })).filter((item: TopSalon) => item.id); // Filter out items without valid salon
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching top salons:', error);
    throw error;
  }
}
