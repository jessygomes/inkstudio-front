"use server";

import { getAuthHeaders } from "../session";

export interface MoodboardImageDto {
  id: string;
  imageUrl?: string;
  url?: string;
  caption?: string | null;
  title?: string | null;
  description?: string | null;
  position?: number | null;
}

export interface MoodboardDto {
  id: string;
  name?: string | null;
  title?: string | null;
  description?: string | null;
  images?: MoodboardImageDto[];
}

export async function getMoodboardByAppointmentAction(appointmentId: string) {
  try {
    const headers = await getAuthHeaders();

    const candidateUrls = [
      `${process.env.NEXT_PUBLIC_BACK_URL}/moodboard/appointment/${appointmentId}`,
      `${process.env.NEXT_PUBLIC_BACK_URL}/moodboards/appointment/${appointmentId}`,
    ];

    for (const url of candidateUrls) {
      const response = await fetch(url, {
        method: "GET",
        headers,
        cache: "no-store",
      });

      if (response.status === 404) {
        continue;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          ok: false,
          message:
            errorData?.message ||
            "Erreur lors de la récupération du moodboard du rendez-vous",
        };
      }

      const data = await response.json();
      const moodboard = data?.moodboard ?? null;

      console.log("Moodboard récupéré :", moodboard);

      return {
        ok: true,
        data: moodboard as MoodboardDto | null,
      };
    }

    return {
      ok: false,
      message: "Endpoint moodboard introuvable.",
    };
  } catch {
    return {
      ok: false,
      message: "Erreur lors de la récupération du moodboard du rendez-vous",
    };
  }
}
