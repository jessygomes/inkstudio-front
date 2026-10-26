export type LocationPresence = { type: "daily" } | { type: "recurring"; days: number[] } | { type: "period"; startDate: string; endDate: string };
export function presenceDescription(p?: LocationPresence | null) {
  if (!p) return "Présence non renseignée";
  if (p.type === "daily") return "Tous les jours · salon habituel";
  if (p.type === "recurring") return p.days.map(d => ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"][d - 1]).join(", ") + " · chaque semaine";
  const format = (date: string) => new Date(date + "T12:00:00Z").toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" });
  return "Du " + format(p.startDate) + " au " + format(p.endDate) + " inclus";
}
