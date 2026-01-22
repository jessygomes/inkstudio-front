"use server";
import { getAuthHeaders } from "../session";

//! ----------------------------------------------------------------------------

//! RECUPERER LES PREFERENCES DE NOTIFICATION CHAT D'UN UTILISATEUR

//! ----------------------------------------------------------------------------

export async function getNotificationPreferenceChat() {
  const headers = await getAuthHeaders();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/notification-preferences`,
    {
      method: "GET",
      headers,
      cache: "no-store",
    },
  );
  if (!res.ok) {
    throw new Error(
      `Erreur lors de la récupération des préférences de notification chat`,
    );
  }

  const data = await res.json();
  return data;
}

//! ----------------------------------------------------------------------------

//! METTRE A JOUR LES PREFERENCES DE NOTIFICATION CHAT D'UN UTILISATEUR
//! ----------------------------------------------------------------------------
export async function updateNotificationPreferenceChat(
  emailNotificationsEnabled: boolean,
  emailFrequency: "IMMEDIATE" | "HOURLY" | "DAILY" | "NEVER",
) {
  const headers = await getAuthHeaders();
  const body = {
    emailNotificationsEnabled,
    emailFrequency,
  };
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/notification-preferences`,
    {
      method: "PATCH",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    throw new Error(
      `Erreur lors de la mise à jour des préférences de notification chat`,
    );
  }
  const data = await res.json();

  console.log("Updated Notification Preference Chat Data:", data);
  return data;
}
