export const verificationDocumentTypes = ["HYGIENE_SALUBRITE", "ARS_DECLARATION", "LEGAL_PROOF"] as const;

export function documentStatus(status?: string) {
  const value = (status ?? "").toLowerCase();
  if (["approved", "approuve", "validé", "valide"].includes(value)) return "approved";
  if (["rejected", "refuse", "refusé"].includes(value)) return "rejected";
  return "pending";
}

export function documentLabel(type?: string) {
  if (type === "HYGIENE_SALUBRITE") return "Hygiène et salubrité";
  if (type === "ARS_DECLARATION") return "Déclaration ARS";
  if (type === "LEGAL_PROOF") return "Preuves légales";
  if (type === "AUTRE_JUSTIFICATIF") return "Autre justificatif";
  return (type || "Justificatif").replaceAll("_", " ");
}
