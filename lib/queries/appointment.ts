/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { getAuthHeaders } from "../session";

//! ----------------------------------------------------------------------------

//! RECUPERER TOUS LES RDV EN FONCTION D'UNE DATE (ou rangée)

//! ----------------------------------------------------------------------------
export const fetchAppointments = async (
  userId: string,
  start: string,
  end: string,
  page: number = 1,
  limit: number = 5
) => {
  try {
    /* Format de réponse des données : 
      error: false,
      appointments,
  */

    const headers = await getAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/range?userId=${userId}&start=${start}&end=${end}&page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );
    if (!res.ok) throw new Error("Erreur lors du chargement des rendez-vous");
    const data = await res.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! RECUPERER TOUS LES RDV D'UN SALON

//! ----------------------------------------------------------------------------
export const fetchAllAppointments = async (
  userId: string,
  page: number = 1,
  limit: number = 5
) => {
  /* Format de réponse des données : 
      error: false,
      appointments,
      pagination: {
      currentPage: page,
      totalPages,
      totalAppointments,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
  */
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/salon/${userId}?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching all appointments:", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! RECUPERER UN RDV

//! ----------------------------------------------------------------------------
export const fetchAppointmentById = async (rdvId: string) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/${rdvId}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );
    if (!res.ok) throw new Error("Erreur lors du chargement du rendez-vous");
    const data = await res.json();
    return data || null;
  } catch (error) {
    console.error("Error fetching appointment by ID:", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! CREER UN RDV

//! ----------------------------------------------------------------------------
export const createAppointment = async (rdvBody: any) => {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/appointments`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(rdvBody),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data?.error) {
      const message =
        data?.message ||
        `Erreur lors de la création du rendez-vous (${res.status})`;
      throw new Error(message);
    }

    return data;
  } catch (err) {
    console.error("Error creating appointment:", err);
    throw err;
  }
};

//! ----------------------------------------------------------------------------

//! MODIFIER UN RDV

//! ----------------------------------------------------------------------------
export const updateAppointment = async (rdvId: string, updatedData: any) => {
  try {
    const headers = await getAuthHeaders();

    console.log("Updating appointment with data:", updatedData);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/update/${rdvId}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify(updatedData),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data?.error) {
      const message =
        data?.message ||
        `Erreur lors de la mise à jour du rendez-vous (${res.status})`;
      throw new Error(message);
    }

    return data;
  } catch (err) {
    console.error("Error updating appointment:", err);
    throw err;
  }
};

//! ----------------------------------------------------------------------------

//! VOIR TOUS LES RDV DU JOUR (DASHBOARD)

//! ----------------------------------------------------------------------------
export const fetchTodayAppointmentsAction = async (date?: string) => {
  try {
    const headers = await getAuthHeaders();

    const url = date
      ? `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/today?date=${date}`
      : `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/today`;

    const res = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Erreur lors du chargement des rendez-vous");

    const data = await res.json();

    return data || [];
  } catch (error) {
    console.error("Error fetching today's appointments:", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! RECUPERER LES DEMANDES DE RDV (PENDING FOR DASHBOARD)

//! ----------------------------------------------------------------------------
export const fetchPendingAppointmentsAction = async () => {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/appointment-requests/not-confirmed`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    if (!res.ok)
      throw new Error("Erreur lors du chargement des demandes de RDV");

    const data = await res.json();

    return data || [];
  } catch (error) {
    console.error("Error fetching pending appointments:", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! RECUPERER LES DEMANDES DE RDV (PENDING FOR DASHBOARD)

//! ----------------------------------------------------------------------------
export const fetchDemandesAction = async () => {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/appointment-requests`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    if (!res.ok)
      throw new Error("Erreur lors du chargement des demandes de RDV");

    const data = await res.json();

    return data || [];
  } catch (error) {
    console.error("Error fetching request appointments:", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! PROPOSER UN CRENEAU POUR UNE DEMANDE DE RDV CLIENT

//! ----------------------------------------------------------------------------
export const proposeAppointment = async (demandeId: string, payload: any) => {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/appointment-request/propose-slot/${demandeId}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data?.error) {
      const message =
        data?.message ||
        `Erreur lors de la proposition du créneau (${res.status})`;
      throw new Error(message);
    }

    return data;
  } catch (err) {
    console.error("Error proposing appointment:", err);
    throw err;
  }
};

//! ----------------------------------------------------------------------------

//! TAUX DE REMPLISSAGE DES CRENEAUX PAR SEMAINE

//! ----------------------------------------------------------------------------
export const weeklyFillRateAction = async (start: string, end: string) => {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_BACK_URL
      }/appointments/weekly-fill-rate?start=${encodeURIComponent(
        start
      )}&end=${encodeURIComponent(end)}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    if (!res.ok)
      throw new Error("Erreur lors du chargement du taux de remplissage");

    const data = await res.json();

    return data || [];
  } catch (error) {
    console.error("Error fetching weekly fill rate:", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! TAUX D'ANNULATION DES RDV

//! ----------------------------------------------------------------------------
export const cancelRateAction = async () => {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/cancellation-rate`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    if (!res.ok)
      throw new Error("Erreur lors du chargement du taux de remplissage");

    const data = await res.json();

    return data || [];
  } catch (error) {
    console.error("Error fetching weekly fill rate:", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! TOTAL DES RDV PAYES PAR MOIS

//! ----------------------------------------------------------------------------
export const totalPaidAppointmentsAction = async (
  month: number,
  year: number
) => {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/monthly-paid-appointments?month=${month}&year=${year}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    if (!res.ok)
      throw new Error("Erreur lors du chargement du total des RDV payés");

    const data = await res.json();

    return data || [];
  } catch (error) {
    console.error("Error fetching total paid appointments:", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! RDV EN ATTENTE DE CONFIRMATION

//! ----------------------------------------------------------------------------
export const waitingConfirmationAppointmentsAction = async () => {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/pending-confirmation`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    if (!res.ok)
      throw new Error(
        "Erreur lors du chargement des RDV en attente de confirmation"
      );

    const data = await res.json();

    return data || [];
  } catch (error) {
    console.error("Error fetching waiting confirmation appointments:", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! RDV PAYE

//! ----------------------------------------------------------------------------
export const paidAppointmentsAction = async (
  rdvId: string,
  isPayed: boolean
) => {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/payed/${rdvId}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ isPayed }),
      }
    );

    if (!res.ok)
      throw new Error("Erreur lors de la mise à jour du statut de paiement");

    return res.json();
  } catch (error) {
    console.error("Error patch paidAppointmentsAction:", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! CONFIRMER UN RDV | ANNULER UN RDV

//! ----------------------------------------------------------------------------
export const confirmAppointmentAction = async (
  rdvId: string,
  endpoint: string,
  actionMessage: string
) => {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/${endpoint}/${rdvId}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          message: actionMessage.trim() || undefined,
        }),
      }
    );

    if (!res.ok)
      // const errorData = await response.json();
      throw new Error(
        `Erreur lors de ${
          endpoint === "confirm" ? "la confirmation" : "l'annulation"
        }`
      );

    return res.json();
  } catch (error) {
    console.error("Error patch confirmAppointmentAction:", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! CHANGER LE STATUS D'UN RDV (COMPLETED ou NO_SHOW)

//! ----------------------------------------------------------------------------
export const changeAppointmentStatusAction = async (
  rdvId: string,
  status: "COMPLETED" | "NO_SHOW"
) => {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/change-status/${rdvId}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      }
    );

    if (!res.ok) throw new Error("Erreur lors du changement de statut du RDV");

    return res.json();
  } catch (error) {
    console.error("Error patch changeAppointmentStatusAction:", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! ENVOYER UN MAIL CUSTOM AU CLIENT

//! ----------------------------------------------------------------------------
export const sendCustomEmailAction = async (
  rdvId: string,
  subject: string,
  message: string
) => {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/send-custom-email/${rdvId}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          appointmentId: rdvId,
          subject,
          message,
        }),
      }
    );

    if (!res.ok) throw new Error("Erreur lors de l'envoi du mail");

    return res.json();
  } catch (error) {
    console.error("Error in sendCustomEmailAction:", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! PROPOSER UNE REPROGRAMMATION DE RDV

//! ----------------------------------------------------------------------------
export const proposeRescheduleAppointmentAction = async (
  rdvId: string,
  reason?: string
) => {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/propose-reschedule`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          appointmentId: rdvId, // Changé de rdvId à appointmentId
          reason: reason || undefined,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok || data?.error) {
      const errorMessage =
        data?.message || `Erreur ${res.status}: ${res.statusText}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error("Error in proposeRescheduleAppointmentAction:", error);
    throw error;
  }
};

//! ----------------------------------------------------------------------------

//! SALON : REFUSER LA DEMANDE DE RDV D'UN CLIENT

//! ----------------------------------------------------------------------------
export const declineRequestAction = async (
  demandeId: string,
  reason: string
) => {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/decline-appointment-request`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          appointmentRequestId: demandeId,
          reason: reason.trim() || undefined,
        }),
      }
    );

    if (!res.ok) throw new Error("Erreur lors du refus de la demande de RDV");

    return res.json();
  } catch (error) {
    console.error("Error patch declineRequestAction:", error);
    throw error;
  }
};
