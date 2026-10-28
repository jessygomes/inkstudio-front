export interface FollowUpArtist { id: string; name: string }
export interface FollowUpItem {
  id: string;
  rating: number;
  review?: string | null;
  response?: string | null;
  photoUrl: string;
  createdAt: string;
  isAnswered: boolean;
  isPhotoPublic: boolean;
  appointmentId: string;
  clientId?: string | null;
  appointment?: {
    id: string;
    title: string;
    start: string;
    end: string;
    client?: { id: string; firstName?: string; lastName?: string } | null;
    tatoueur?: FollowUpArtist | null;
  } | null;
}
export const followUpClientName = (followUp: FollowUpItem) => [followUp.appointment?.client?.firstName, followUp.appointment?.client?.lastName].filter(Boolean).join(" ") || "Client non renseigné";
export const followUpRatingLabel = (rating: number) => ["Non renseigné", "Très insatisfait", "Insatisfait", "Neutre", "Satisfait", "Très satisfait"][Math.max(0, Math.min(5, Math.round(rating)))] || "Non renseigné";
export const followUpDate = (value: string, withTime = false) => new Date(value).toLocaleString("fr-FR", { day: "numeric", month: "short", year: "numeric", ...(withTime ? { hour: "2-digit", minute: "2-digit" } as const : {}), timeZone: "Europe/Paris" });
