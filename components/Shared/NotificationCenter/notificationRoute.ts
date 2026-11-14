import type { AppNotification } from "@/lib/queries/notification-center";

const str = (n: AppNotification, key: string): string | null => {
  const v = n.data?.[key];
  return typeof v === "string" && v ? v : null;
};

/** Page du site à ouvrir en cliquant sur une notification (null = rien à ouvrir). */
export function notificationHref(n: AppNotification): string | null {
  const conversationId = str(n, "conversationId");
  const appointmentId = str(n, "appointmentId");
  switch (n.type) {
    case "message.new":
    case "message.unread_threshold":
    case "message.unanswered":
    case "contact.new":
    case "thread.assigned":
      return conversationId ? `/messagerie/${conversationId}` : "/messagerie";
    case "stock.low":
    case "stock.expiring":
      return "/stocks";
    case "drawing.client_feedback":
      return "/suiviDessin";
    case "followup.reply":
      return "/dashboard";
    case "client.account_linked":
    case "client.booking_name_mismatch": {
      // La liste des clients filtre sur l'e-mail puis ouvre la fiche indiquée par ?client=<id>.
      const clientId = str(n, "clientId");
      const clientEmail = str(n, "clientEmail");
      if (!clientId) return "/clients";
      const params = new URLSearchParams({ client: clientId, ...(clientEmail ? { search: clientEmail } : {}) });
      return `/clients?${params.toString()}`;
    }
    case "review.new":
      return "/review";
    case "explorer.proposal_reply":
      return "/explorer";
    case "team.invitation_received":
    case "team.invitation_accepted":
    case "team.permission_request":
      return "/mon-compte";
    default:
      break;
  }
  // La page des rendez-vous ouvre la fiche indiquée par ?rdv=<id>.
  if (n.category === "appointments") return appointmentId ? `/mes-rendez-vous?rdv=${encodeURIComponent(appointmentId)}` : "/mes-rendez-vous";
  if (n.category === "account") return "/parametres";
  return null;
}

export const CATEGORY_LABELS: Record<string, { label: string; description: string }> = {
  appointments: { label: "Rendez-vous", description: "Nouveaux rendez-vous, annulations, modifications et rappels." },
  messages: { label: "Messages", description: "Nouveaux messages et conversations sans réponse." },
  stock: { label: "Stock", description: "Stock bas, ruptures et produits bientôt périmés." },
  followups: { label: "Clients et suivis", description: "Clients qui rejoignent Inkera, réponses aux suivis de cicatrisation et retours sur les dessins." },
  explorer: { label: "Explorer", description: "Réponses aux propositions envoyées sur les projets." },
  reviews: { label: "Avis", description: "Nouveaux avis clients." },
  team: { label: "Équipe", description: "Invitations, demandes d’autorisation et affectations." },
  account: { label: "Compte et abonnement", description: "Essai, paiement, factures, profil et bilan hebdomadaire." },
};

/** "il y a 5 min", "hier", "12 nov." */
export function timeAgo(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l’instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const days = Math.floor(h / 24);
  if (days === 1) return "hier";
  if (days < 7) return `il y a ${days} j`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
