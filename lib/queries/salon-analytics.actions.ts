"use server";

import { getAuthHeaders } from "../session";

export interface SalonAnalyticsStatsDto {
  totalViews: number;
  uniqueVisitors: number;
  averageViewsPerDay: number;
  viewsByDay: Record<string, number>;
  viewsByDeviceType: Record<string, number>;
  viewsByReferrer: Record<string, number>;
  viewsByCountry: Record<string, number>;
  viewsByCity: Record<string, number>;
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  lastUpdated: string;
}

export interface SalonAnalyticsRealtimeDto {
  views24h: number;
  uniqueVisitors24h: number;
  byHour: Record<string, number>;
}

export interface SalonAnalyticsComparativeDto {
  viewsLast30Days: number;
  viewsPrevious30Days: number;
  percentageChange: number;
  trend: "UP" | "DOWN" | "STABLE";
}

export interface ActionResult<T> {
  ok: boolean;
  error: boolean;
  status: number;
  message?: string;
  data?: T;
}

const getErrorMessage = (payload: unknown, fallback: string): string => {
  if (payload && typeof payload === "object" && "message" in payload) {
    const candidate = (payload as { message?: unknown }).message;
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }
  return fallback;
};

const unwrapPayload = <T>(payload: unknown): T | undefined => {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const asRecord = payload as Record<string, unknown>;

  if (asRecord.data && typeof asRecord.data === "object") {
    return asRecord.data as T;
  }

  if (asRecord.result && typeof asRecord.result === "object") {
    return asRecord.result as T;
  }

  return payload as T;
};

const fetchSalonAnalytics = async <T>(
  endpoint: string,
): Promise<ActionResult<T>> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(endpoint, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        error: true,
        status: response.status,
        message: getErrorMessage(
          payload,
          `Erreur lors de la recuperation des analytics (${response.status})`,
        ),
      };
    }

    return {
      ok: true,
      error: false,
      status: response.status,
      data: unwrapPayload<T>(payload),
    };
  } catch (error) {
    console.error("Erreur server action salon analytics:", error);
    return {
      ok: false,
      error: true,
      status: 500,
      message: "Erreur reseau lors de la recuperation des analytics.",
    };
  }
};

export const getSalonStatsAction = async (
  salonId: string,
  days: number = 30,
): Promise<ActionResult<SalonAnalyticsStatsDto>> => {
  if (!salonId) {
    return {
      ok: false,
      error: true,
      status: 400,
      message: "salonId est requis.",
    };
  }

  const safeDays = Number.isFinite(days) && days > 0 ? Math.floor(days) : 30;

  return fetchSalonAnalytics<SalonAnalyticsStatsDto>(
    `${process.env.NEXT_PUBLIC_BACK_URL}/salon-analytics/${salonId}/stats?days=${safeDays}`,
  );
};

export const getSalonRealtimeStatsAction = async (
  salonId: string,
): Promise<ActionResult<SalonAnalyticsRealtimeDto>> => {
  if (!salonId) {
    return {
      ok: false,
      error: true,
      status: 400,
      message: "salonId est requis.",
    };
  }

  return fetchSalonAnalytics<SalonAnalyticsRealtimeDto>(
    `${process.env.NEXT_PUBLIC_BACK_URL}/salon-analytics/${salonId}/realtime`,
  );
};

export const getSalonComparativeStatsAction = async (
  salonId: string,
): Promise<ActionResult<SalonAnalyticsComparativeDto>> => {
  if (!salonId) {
    return {
      ok: false,
      error: true,
      status: 400,
      message: "salonId est requis.",
    };
  }

  return fetchSalonAnalytics<SalonAnalyticsComparativeDto>(
    `${process.env.NEXT_PUBLIC_BACK_URL}/salon-analytics/${salonId}/comparative`,
  );
};
