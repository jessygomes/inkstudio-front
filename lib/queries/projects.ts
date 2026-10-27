"use server";
import { getAuthHeaders } from "../session";

export type ExploredProject = {
  id: string;
  name: string;
  description?: string;
  projectCity?: string;
  projectCategory?: string;
  projectSize?: string;
  projectStyles: string[];
  projectHashtags: string[];
  projectBodyPlacement?: string;
  projectMobility?: string;
  projectRadiusKm?: number;
  images: { id: string; url: string; caption?: string }[];
  proposals: { id: string; status: string; message?: string; conversationId?: string | null }[];
};
export type ExploreResult = {
  data: ExploredProject[];
  total: number;
  page: number;
  totalPages: number;
};
export async function getProjectFilterOptions(): Promise<{
  styles: string[];
  categories: string[];
}> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/projects/options`,
    { headers: await getAuthHeaders(), cache: "no-store" },
  );
  if (!response.ok) throw new Error("Filtres indisponibles.");
  return response.json();
}
export async function exploreProjects(
  filters: Record<string, string>,
): Promise<ExploreResult> {
  const query = new URLSearchParams(
    Object.entries(filters).filter(([, value]) => value),
  );
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/projects/explore?${query}`,
    { headers: await getAuthHeaders(), cache: "no-store" },
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Projets indisponibles.");
  return data;
}
export async function proposeProject(id: string, message: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/projects/moodboards/${encodeURIComponent(id)}/proposals`,
    {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({ message }),
      cache: "no-store",
    },
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Envoi impossible.");
  return data as { id: string; conversationId?: string };
}
