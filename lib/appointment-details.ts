/* eslint-disable @typescript-eslint/no-explicit-any */
import type { QueryClient } from "@tanstack/react-query";
import { getAppointmentDetailsAction } from "@/lib/queries/appointment-details";
import type { AppointmentDetailsBlock, AppointmentDetailsBundle } from "@/lib/types/appointment-details";

// La fiche d'un rendez-vous monte plusieurs blocs (photos, suivi de dessin, client…) qui demandent chacun « leur » partie :
// pendant ces quelques secondes ils partagent la même requête (et le même résultat si la fiche est rouverte aussitôt).
const SHARE_MS = 5000;

export const appointmentDetailsKey = (appointmentId: string) => ["appointment-details", appointmentId] as const;

/** Fiche complète d'un rendez-vous (une seule requête). `fresh` ignore le résultat partagé (relecture après une modification). */
export async function loadAppointmentDetails(queryClient: QueryClient, appointmentId: string, options: { fresh?: boolean } = {}): Promise<AppointmentDetailsBundle> {
  return queryClient.fetchQuery<AppointmentDetailsBundle>({
    queryKey: appointmentDetailsKey(appointmentId),
    queryFn: async () => {
      const result = await getAppointmentDetailsAction(appointmentId);
      if (!result.ok) throw new Error(result.message);
      return result.details;
    },
    staleTime: options.fresh ? 0 : SHARE_MS,
  });
}

type BlockData<K extends AppointmentDetailsBlock> = Extract<AppointmentDetailsBundle[K], { ok: true }>["data"];

/** Un bloc de la fiche. Lève une erreur si ce bloc a échoué côté serveur : chaque composant affiche sa propre erreur. */
export async function loadAppointmentBlock<K extends AppointmentDetailsBlock>(queryClient: QueryClient, appointmentId: string, name: K, options: { fresh?: boolean } = {}): Promise<BlockData<K>> {
  const details = await loadAppointmentDetails(queryClient, appointmentId, options);
  const section: any = details[name];
  if (!section) throw new Error("Donnée absente de la fiche.");
  if (!section.ok) throw new Error(section.message || "Chargement impossible.");
  return section.data as BlockData<K>;
}
