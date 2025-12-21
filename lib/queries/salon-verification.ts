"use server";
import { getAuthHeaders } from "../session";

export type SalonVerificationDocumentType =
  | "HYGIENE_SALUBRITE"
  | "ARS_DECLARATION"
  | "LEGAL_PROOF";

export type VerificationStatusDocument = "PENDING" | "APPROVED" | "REJECTED";

export interface SalonVerificationDocument {
  id: string;
  userId: string;
  type: SalonVerificationDocumentType;
  fileUrl: string;
  status: VerificationStatusDocument;
  rejectionReason?: string | null;
  uploadedAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
}

//! SOUMETTRE UN DOCUMENT DE VÉRIFICATION
export const submitSalonDocument = async (
  type: SalonVerificationDocumentType,
  fileUrl: string
) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/salon-verification/documents`,
      {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          fileUrl,
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Response not ok:", response.statusText);
      return {
        ok: false,
        message: `Erreur HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      ok: true,
      data: data.document as SalonVerificationDocument,
      message: data.message || "Document soumis avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la soumission du document:", error);
    return {
      ok: false,
      message: "Erreur lors de la soumission du document",
    };
  }
};

//! RÉCUPÉRER LES DOCUMENTS DE VÉRIFICATION DU SALON
export const getSalonVerificationDocuments = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/salon-verification/documents`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Response not ok:", response.statusText);
      return {
        ok: false,
        message: `Erreur HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      ok: true,
      data: data.documents as SalonVerificationDocument[],
      message: "Documents récupérés avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des documents:", error);
    return {
      ok: false,
      message: "Erreur lors de la récupération des documents",
    };
  }
};
