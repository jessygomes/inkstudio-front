/* eslint-disable @typescript-eslint/no-explicit-any */
import type { QueryClient } from "@tanstack/react-query";
import { getDashboardSummaryAction } from "@/lib/queries/dashboard";
import type { DashboardBlockName, DashboardSummary, DashboardSummaryParams } from "@/lib/types/dashboard";

/** Donnée d'un bloc : même forme que la réponse de la route d'origine (certaines renvoient `{ error: true, message }`). */
export type DashboardData = { error?: boolean; message?: string; [key: string]: any };

const pad = (value: number) => String(value).padStart(2, "0");

/** Lundi 00:00 de la semaine en cours (heure locale), comme le bloc « Remplissage du planning ». */
export const currentMonday = (now = new Date()) => {
  const day = new Date(now);
  day.setDate(day.getDate() - ((day.getDay() + 6) % 7));
  day.setHours(0, 0, 0, 0);
  return day;
};

/** Paramètres par défaut de l'accueil : aujourd'hui, semaine en cours, mois en cours (heure locale du navigateur). */
export function defaultDashboardParams(now = new Date()): DashboardSummaryParams {
  const start = currentMonday(now);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return {
    date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    fillStart: start.toISOString(),
    fillEnd: end.toISOString(),
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

// Les blocs de l'accueil se montent en même temps et demandent chacun « leur » partie : pendant ces quelques secondes
// ils partagent la même requête. Au-delà, une relecture (retour sur l'onglet, après une réponse…) repart au serveur.
const SHARE_MS = 3000;

/**
 * Donnée d'un bloc de l'accueil, lue dans le résumé unique `GET /dashboard/summary`.
 * Lève une erreur si le bloc a échoué côté serveur (ex. plan FREE) : chaque bloc affiche sa propre erreur.
 */
export async function loadDashboardBlock<T = DashboardData>(queryClient: QueryClient, userId: string, name: DashboardBlockName): Promise<T> {
  const params = defaultDashboardParams();
  const summary = await queryClient.fetchQuery<DashboardSummary>({
    queryKey: ["dashboard-summary", userId, params.date, params.fillStart, params.month, params.year],
    queryFn: async () => {
      const result = await getDashboardSummaryAction(params);
      if (!result.ok) throw new Error(result.message);
      return result.summary;
    },
    staleTime: SHARE_MS,
  });
  const section = summary[name];
  if (!section) throw new Error("Donnée absente du tableau de bord.");
  if (!section.ok) throw new Error(section.message || "Chargement impossible.");
  return section.data as T;
}
