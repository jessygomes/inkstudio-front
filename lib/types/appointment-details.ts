/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AppointmentPhoto } from "@/lib/queries/appointment-photos";
import type { AppointmentCardStatus } from "@/lib/types/suiviDessin";
import type { DashboardSection } from "@/lib/types/dashboard";

/** Réponse de `GET /appointments/:id/details` : chaque bloc réussit ou échoue seul. */
export type AppointmentDetailsBundle = {
  /** Le rendez-vous, avec `client` et `conversation` (que `GET /appointments/:id` ne renvoie pas). */
  appointment: DashboardSection<any>;
  photos: DashboardSection<AppointmentPhoto[]>;
  drawingStatus: DashboardSection<AppointmentCardStatus>;
};

export type AppointmentDetailsBlock = keyof AppointmentDetailsBundle;
