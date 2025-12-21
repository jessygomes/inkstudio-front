"use client";
import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/components/Auth/Context/UserContext";
import {
  getSalonVerificationDocuments,
  submitSalonDocument,
  SalonVerificationDocumentType,
  SalonVerificationDocument,
} from "@/lib/queries/salon-verification";
import { useUploadThing } from "@/lib/utils/uploadthing";
import { MdOutlineVerified } from "react-icons/md";
import { FiUploadCloud } from "react-icons/fi";

interface DocumentType {
  id: SalonVerificationDocumentType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const DOCUMENT_TYPES: DocumentType[] = [
  {
    id: "HYGIENE_SALUBRITE",
    label: "Hygiène & Salubrité",
    description:
      "Document attestant du respect des normes d'hygiène (certificat SNDI, audit...)",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    id: "ARS_DECLARATION",
    label: "Déclaration ARS",
    description:
      "Document de déclaration auprès de l'Agence Régionale de Santé",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    id: "LEGAL_PROOF",
    label: "Preuves légales",
    description: "Extrait Kbis, statuts ou autres documents légaux",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
];

export default function VerificationDocumentsSection() {
  const user = useUser();
  const { startUpload } = useUploadThing("salonDocuments");

  const [documents, setDocuments] = useState<SalonVerificationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const result = await getSalonVerificationDocuments();
      if (result.ok && result.data) {
        setDocuments(result.data);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des documents:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadDocuments();
    }
  }, [user?.id, loadDocuments]);

  const handleFileUpload = async (
    type: SalonVerificationDocumentType,
    files: FileList | null
  ) => {
    if (!files || files.length === 0) return;

    try {
      setUploading((prev) => ({ ...prev, [type]: true }));
      setError(null);

      const file = files[0];

      // Upload vers uploadthing
      const uploadResult = await startUpload([file]);

      if (!uploadResult || uploadResult.length === 0) {
        throw new Error("Erreur lors de l'upload du fichier");
      }

      const fileUrl = uploadResult[0].url;

      // Soumettre le document
      const submitResult = await submitSalonDocument(type, fileUrl);

      if (!submitResult.ok) {
        throw new Error(submitResult.message);
      }

      // Recharger les documents
      await loadDocuments();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de l'upload";
      setError(message);
      console.error("Erreur:", err);
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const getDocumentStatus = (type: SalonVerificationDocumentType) => {
    return documents.find((doc) => doc.type === type);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500/20 border-green-500/50 text-green-400";
      case "REJECTED":
        return "bg-red-500/20 border-red-500/50 text-red-400";
      case "PENDING":
        return "bg-amber-500/20 border-amber-500/50 text-amber-400";
      default:
        return "bg-gray-500/20 border-gray-500/50 text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "✓ Approuvé";
      case "REJECTED":
        return "✕ Refusé";
      case "PENDING":
        return "⏳ En attente";
      default:
        return status;
    }
  };

  return (
    <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-tertiary-400/30 flex items-center justify-center">
          <MdOutlineVerified className="w-5 h-5 sm:w-6 sm:h-6 text-tertiary-400" />
        </div>
        <h2 className="text-lg sm:text-xl text-white font-one font-semibold">
          Vérification du salon
        </h2>
      </div>

      <p className="text-white/70 text-xs sm:text-sm font-one mb-6">
        Déposez les documents requis pour vérifier votre salon et augmenter la
        confiance de vos clients.
      </p>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-3">
          <svg
            className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-red-300 text-xs sm:text-sm font-one">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tertiary-400"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DOCUMENT_TYPES.map((docType) => {
            const doc = getDocumentStatus(docType.id);

            return (
              <div
                key={docType.id}
                className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-4 flex flex-col gap-3 hover:border-tertiary-400/30 transition-all duration-200"
              >
                {/* Header avec icône et statut */}
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-lg bg-tertiary-400/20 flex items-center justify-center text-tertiary-400 flex-shrink-0">
                    {docType.icon}
                  </div>
                  {doc && (
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-semibold border ${getStatusColor(
                        doc.status
                      )}`}
                    >
                      {getStatusLabel(doc.status)}
                    </span>
                  )}
                </div>

                {/* Titre et description */}
                <div>
                  <h3 className="text-white font-semibold text-sm font-one mb-1">
                    {docType.label}
                  </h3>
                  <p className="text-white/60 text-xs font-one leading-relaxed">
                    {docType.description}
                  </p>
                </div>

                {/* Document actuel ou upload */}
                {doc && doc.status !== "REJECTED" ? (
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-white/80 text-xs font-one truncate mb-1">
                          Document déposé
                        </p>
                        <p className="text-white/50 text-xs font-one">
                          {new Date(doc.uploadedAt).toLocaleDateString("fr-FR")}
                        </p>
                        {doc.rejectionReason && (
                          <p className="text-red-300 text-xs font-one mt-2">
                            {doc.rejectionReason}
                          </p>
                        )}
                      </div>
                      {doc.status === "APPROVED" && (
                        <div className="w-5 h-5 rounded-full bg-green-500/30 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-3 h-3 text-green-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <div className="bg-white/5 border-2 border-dashed border-white/20 hover:border-tertiary-400/50 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200">
                      <FiUploadCloud className="w-5 h-5 text-white/70 group-hover:text-tertiary-400" />
                      <div className="text-center">
                        <p className="text-white text-xs font-semibold font-one">
                          {uploading[docType.id]
                            ? "Upload en cours..."
                            : "Cliquez pour uploader"}
                        </p>
                        <p className="text-white/50 text-[10px] font-one">
                          PDF, JPG ou PNG
                        </p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        handleFileUpload(docType.id, e.target.files)
                      }
                      disabled={uploading[docType.id]}
                      className="hidden"
                    />
                  </label>
                )}

                {doc && doc.status === "REJECTED" && (
                  <label className="cursor-pointer">
                    <div className="bg-red-500/10 border-2 border-dashed border-red-500/30 hover:border-red-500/50 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200">
                      <FiUploadCloud className="w-5 h-5 text-red-400" />
                      <div className="text-center">
                        <p className="text-white text-xs font-semibold font-one">
                          {uploading[docType.id]
                            ? "Upload en cours..."
                            : "Renvoyer le document"}
                        </p>
                        <p className="text-white/50 text-[10px] font-one">
                          PDF, JPG ou PNG
                        </p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        handleFileUpload(docType.id, e.target.files)
                      }
                      disabled={uploading[docType.id]}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Info message */}
      <div className="mt-6 bg-tertiary-500/10 border border-tertiary-500/30 rounded-lg p-4 flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-tertiary-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg
            className="w-3 h-3 text-tertiary-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div>
          <p className="text-tertiary-400 text-xs sm:text-sm font-one font-semibold mb-1">
            Une fois tous les documents approuvés
          </p>
          <p className="text-tertiary-400/80 text-xs font-one leading-relaxed">
            Votre salon sera marqué comme vérifié, augmentant ainsi la confiance
            de vos clients.
          </p>
        </div>
      </div>
    </div>
  );
}
