"use server";

import { getAuthHeaders } from "../session";

// Types pour les enums de piercing
export type PiercingZone =
  | "OREILLE"
  | "VISAGE"
  | "BOUCHE"
  | "CORPS"
  | "MICRODERMAL"
  | "AUTRE";
export type PiercingZoneOreille =
  | "LOBE"
  | "HELIX"
  | "TRAGUS"
  | "ROOK"
  | "CONCH"
  | "DAITH"
  | "ANTI_HELIX"
  | "INDUSTRIAL";
export type PiercingZoneVisage =
  | "NARINE"
  | "SEPTUM"
  | "BRIDGE"
  | "EYEBROW"
  | "ANTI_EYEBROW";
export type PiercingZoneBouche =
  | "LANGUE"
  | "LABRET"
  | "MONROE"
  | "MEDUSA"
  | "ANGEL_BITES"
  | "SNAKE_BITES";
export type PiercingCorps = "NOMBRIL" | "NIPPLE" | "SURFACE" | "GENITAL";

export interface PiercingPrice {
  id: string;
  piercingZone: PiercingZone;
  isActive: boolean;
  services: PiercingServicePrice[];
}

export interface PiercingServicePrice {
  id: string;
  piercingPriceId: string;
  piercingZoneOreille?: PiercingZoneOreille;
  piercingZoneVisage?: PiercingZoneVisage;
  piercingZoneBouche?: PiercingZoneBouche;
  piercingCorps?: PiercingCorps;
  price: number;
  description?: string;
  isActive: boolean;
}

export interface CreatePiercingPriceDto {
  piercingZone: PiercingZone;
  isActive?: boolean;
}

export interface CreatePiercingServicePriceDto {
  piercingPriceId: string;
  piercingZoneOreille?: PiercingZoneOreille;
  piercingZoneVisage?: PiercingZoneVisage;
  piercingZoneBouche?: PiercingZoneBouche;
  piercingCorps?: PiercingCorps;
  piercingZone?: PiercingZone;
  price: number;
  description?: string;
  isActive?: boolean;
}

// Server Actions
export async function getPiercingEnumsAction() {
  try {
    const headers = await getAuthHeaders();

    const [zones, oreille, visage, bouche, corps, microdermal] =
      await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/piercing-prices/enums/zones`,
          {
            headers,
          }
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/piercing-prices/enums/zone-oreille`,
          {
            headers,
          }
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/piercing-prices/enums/zone-visage`,
          {
            headers,
          }
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/piercing-prices/enums/zone-bouche`,
          {
            headers,
          }
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/piercing-prices/enums/corps`,
          {
            headers,
          }
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/piercing-prices/enums/zone-microdermal`,
          {
            headers,
          }
        ),
      ]);

    return {
      ok: true,
      data: {
        zones: await zones.json(),
        oreille: await oreille.json(),
        visage: await visage.json(),
        bouche: await bouche.json(),
        corps: await corps.json(),
        microdermal: await microdermal.json(),
      },
    };
  } catch {
    return { ok: false, message: "Erreur lors de la récupération des enums" };
  }
}

export async function createPiercingZoneAction(data: CreatePiercingPriceDto) {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/piercing-prices/zones`,
      {
        method: "POST",
        headers: {
          ...headers,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        ok: false,
        message: error.message || "Erreur lors de la création",
      };
    }

    const result = await response.json();
    return { ok: true, data: result };
  } catch {
    return { ok: false, message: "Erreur lors de la création de la zone" };
  }
}

export async function getPiercingZonesAction() {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/piercing-prices/zones`,
      {
        headers,
      }
    );

    if (!response.ok) {
      return { ok: false, message: "Erreur lors de la récupération" };
    }

    const result = await response.json();
    return { ok: true, data: result };
  } catch {
    return { ok: false, message: "Erreur lors de la récupération des zones" };
  }
}

export async function updatePiercingZoneAction(
  id: string,
  data: Partial<CreatePiercingPriceDto>
) {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/piercing-prices/zones/${id}`,
      {
        method: "PATCH",
        headers: {
          ...headers,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      return { ok: false, message: "Erreur lors de la mise à jour" };
    }

    const result = await response.json();
    return { ok: true, data: result };
  } catch {
    return { ok: false, message: "Erreur lors de la mise à jour" };
  }
}

export async function deletePiercingZoneAction(id: string) {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/piercing-prices/zones/${id}`,
      {
        method: "DELETE",
        headers,
      }
    );

    if (!response.ok) {
      return { ok: false, message: "Erreur lors de la suppression" };
    }

    return { ok: true };
  } catch {
    return { ok: false, message: "Erreur lors de la suppression" };
  }
}

export async function getSpecificZonesByTypeAction(zone: PiercingZone) {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/piercing-prices/enums/specific-zones/${zone}`,
      {
        headers,
      }
    );

    if (!response.ok) {
      return { ok: false, message: "Erreur lors de la récupération" };
    }

    const result = await response.json();
    return { ok: true, data: result };
  } catch {
    return {
      ok: false,
      message: "Erreur lors de la récupération des zones spécifiques",
    };
  }
}

// Services de piercing (zones spécifiques avec prix)
export async function createPiercingServiceAction(
  data: CreatePiercingServicePriceDto
) {
  try {
    const headers = await getAuthHeaders();

    console.log("Creating piercing service with data:", data);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/piercing-prices/services`,
      {
        method: "POST",
        headers: {
          ...headers,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Create service error:", error);
      return {
        ok: false,
        message: error.message || "Erreur lors de la création du service",
      };
    }

    const result = await response.json();
    console.log("Service created successfully:", result);
    return { ok: true, data: result };
  } catch (error) {
    console.error("Create service exception:", error);
    return { ok: false, message: "Erreur lors de la création du service" };
  }
}

export async function getPiercingServicesAction(piercingPriceId?: string) {
  try {
    const headers = await getAuthHeaders();

    let url = `${process.env.NEXT_PUBLIC_BACK_URL}/piercing-prices/services`;
    if (piercingPriceId) {
      url += `?piercingPriceId=${piercingPriceId}`;
    }

    const response = await fetch(url, {
      headers,
    });

    if (!response.ok) {
      return {
        ok: false,
        message: "Erreur lors de la récupération des services",
      };
    }

    const result = await response.json();
    return { ok: true, data: result };
  } catch {
    return {
      ok: false,
      message: "Erreur lors de la récupération des services",
    };
  }
}

export async function updatePiercingServiceAction(
  id: string,
  data: Partial<CreatePiercingServicePriceDto>
) {
  try {
    const headers = await getAuthHeaders();

    console.log("Updating piercing service:", id, "with data:", data);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/piercing-prices/services/${id}`,
      {
        method: "PATCH",
        headers: {
          ...headers,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Update service error:", error);
      return {
        ok: false,
        message: error.message || "Erreur lors de la mise à jour du service",
      };
    }

    const result = await response.json();
    console.log("Service updated successfully:", result);
    return { ok: true, data: result };
  } catch (error) {
    console.error("Update service exception:", error);
    return { ok: false, message: "Erreur lors de la mise à jour du service" };
  }
}

export async function deletePiercingServiceAction(id: string) {
  try {
    const headers = await getAuthHeaders();

    console.log("Deleting piercing service:", id);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/piercing-prices/services/${id}`,
      {
        method: "DELETE",
        headers,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Delete service error:", error);
      return { ok: false, message: "Erreur lors de la suppression du service" };
    }

    console.log("Service deleted successfully");
    return { ok: true };
  } catch (error) {
    console.error("Delete service exception:", error);
    return { ok: false, message: "Erreur lors de la suppression du service" };
  }
}

export async function getSalonPricingOverviewAction() {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/piercing-prices/overview`,
      {
        headers,
      }
    );

    if (!response.ok) {
      return {
        ok: false,
        message: "Erreur lors de la récupération de l'aperçu",
      };
    }

    const result = await response.json();
    return { ok: true, data: result };
  } catch {
    return { ok: false, message: "Erreur lors de la récupération de l'aperçu" };
  }
}

export async function getAvailableZonesForConfigurationAction() {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/piercing-prices/available-zones`,
      {
        headers,
      }
    );

    if (!response.ok) {
      return {
        ok: false,
        message: "Erreur lors de la récupération des zones disponibles",
      };
    }

    const result = await response.json();
    return { ok: true, data: result };
  } catch {
    return {
      ok: false,
      message: "Erreur lors de la récupération des zones disponibles",
    };
  }
}
