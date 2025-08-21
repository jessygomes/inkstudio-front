import { format as formatDateFns } from "date-fns";
import { fr } from "date-fns/locale";

export function formatFancySlot(date?: string, from?: string, to?: string) {
  if (!date) return "Sans date";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "Date invalide";
  const dayStr = formatDateFns(d, "EEEE d MMMM", { locale: fr });
  let heureStr = "";
  if (from && to) heureStr = `De ${from.slice(0, 5)} à ${to.slice(0, 5)}`;
  else if (from) heureStr = `À partir de ${from.slice(0, 5)}`;
  return `${dayStr.charAt(0).toUpperCase() + dayStr.slice(1)}${
    heureStr ? " - " + heureStr : ""
  }`;
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
