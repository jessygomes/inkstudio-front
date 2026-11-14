export type HealingStatus = "GOOD" | "NORMAL" | "REDNESS" | "WORRIED";
export type FollowUpReplyChannel = "EMAIL" | "EMAIL_AND_INKERA";

export const HEALING_LABELS: Record<HealingStatus, string> = {
  GOOD: "Tout se passe bien",
  NORMAL: "Ça démange ou ça pèle",
  REDNESS: "Rougeur ou gonflement",
  WORRIED: "Client inquiet",
};
export const isHealingConcern = (status?: string | null) => status === "REDNESS" || status === "WORRIED";

/** Toutes les photos d’un suivi (photoUrls, sinon l’ancienne photo unique). */
export const followUpPhotos = (followUp: { photoUrl?: string | null; photoUrls?: string[] | null }) =>
  followUp.photoUrls?.length ? followUp.photoUrls : followUp.photoUrl ? [followUp.photoUrl] : [];

/** Réponses proposées au salon selon l’état de la cicatrisation (modifiables avant l’envoi). */
export const REPLY_SUGGESTIONS: Record<HealingStatus | "DEFAULT", string[]> = {
  GOOD: [
    "Merci pour vos photos, la cicatrisation se passe très bien ! Continuez à hydrater la zone deux à trois fois par jour et protégez-la du soleil.",
    "Superbe cicatrisation, merci pour votre retour ! N’hésitez pas à nous écrire si vous avez la moindre question.",
  ],
  NORMAL: [
    "Merci pour vos photos. Les démangeaisons et la peau qui pèle sont normales à ce stade : ne grattez pas, hydratez avec une crème neutre et laissez la peau se renouveler.",
    "Tout est normal, c’est la phase où la peau se renouvelle. Continuez les soins, évitez de gratter et de vous exposer au soleil.",
  ],
  REDNESS: [
    "Merci de nous avoir prévenus. Une légère rougeur peut être normale les premiers jours. Si elle s’étend, devient chaude ou douloureuse, consultez un médecin. Pouvez-vous nous envoyer une nouvelle photo dans 48 h ?",
    "Merci pour votre retour. Passez nous voir au salon pour que nous regardions ensemble, et en cas de fièvre ou de douleur importante, consultez un médecin.",
  ],
  WORRIED: [
    "Merci de nous avoir écrit, nous allons regarder ça ensemble. Pouvez-vous nous appeler ou passer au salon ? En cas de douleur forte, de fièvre ou de suintement, consultez un médecin.",
    "Pas d’inquiétude, nous sommes là pour vous accompagner. D’après vos photos, nous vous conseillons de…",
  ],
  DEFAULT: [
    "Merci pour vos photos et votre retour ! Continuez à bien hydrater la zone et protégez-la du soleil.",
  ],
};

export interface FollowUpArtist { id: string; name: string }
export interface FollowUpItem {
  id: string;
  rating: number;
  review?: string | null;
  response?: string | null;
  photoUrl: string;
  /** 1 à 3 photos (les anciens suivis n’ont que photoUrl). */
  photoUrls?: string[] | null;
  /** État de la cicatrisation déclaré par le client (distinct de la note de satisfaction). */
  healingStatus?: HealingStatus | null;
  respondedAt?: string | null;
  responseChannels?: string | null;
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
