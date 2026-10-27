/* eslint-disable react/no-unescaped-entities */
"use client";
import imageCompression from "browser-image-compression";
import SettingsSectionHeader from "./SettingsSectionHeader";
import { BadgeCheck } from "lucide-react";

import DashboardButton from "@/components/Shared/DashboardButton";
import styles from "./SettingsCard.module.css";
import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/components/Auth/Context/UserContext";
import { getSalonVerificationDocuments, submitSalonDocument, SalonVerificationDocumentType, SalonVerificationDocument } from "@/lib/queries/salon-verification";
import { useUploadThing } from "@/lib/utils/uploadthing";

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
      setError(null);
      const result = await getSalonVerificationDocuments();
      if (result.ok && result.data) {
        setDocuments(result.data);
      } else {
        setError("Impossible de charger les documents. Rechargez la page pour réessayer.");
      }
    } catch (err) {
      console.error("Erreur lors du chargement des documents:", err);
      setError("Impossible de charger les documents. Rechargez la page pour réessayer.");
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
    files: FileList | null,
  ) => {
    if (!files || files.length === 0) return;

    try {
      setUploading((prev) => ({ ...prev, [type]: true }));
      setError(null);

      const file = files[0];
      if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
        throw new Error("Format non accepté. Choisissez un fichier PDF, JPG ou PNG.");
      }
      if (file.size > 32 * 1024 * 1024) {
        throw new Error("Le fichier est trop volumineux. La taille maximale est de 32 Mo.");
      }

      let uploadFile = file;
      if (file.type.startsWith("image/")) {
        const compressed = await imageCompression(file, {
          maxSizeMB: 4,
          maxWidthOrHeight: 2560,
          useWebWorker: true,
          initialQuality: 0.85,
          preserveExif: false,
        });
        if (compressed.size < file.size) {
          uploadFile = compressed;
        }
      }

      // Upload vers uploadthing
      const uploadResult = await startUpload([uploadFile]);

      if (!uploadResult || uploadResult.length === 0) {
        throw new Error("Erreur lors de l'upload du fichier");
      }

      const fileUrl = uploadResult[0].ufsUrl;

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

  return (<div className={styles.card}><SettingsSectionHeader icon={BadgeCheck} title="Vérification du salon" description="Vos justificatifs professionnels et leur état de validation."/>
<div className={styles.body}>{error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-300">{error}</p>}
{loading ? <p role="status" className={styles.empty}>Chargement des documents…</p> : <div>{DOCUMENT_TYPES.map(docType=>{const doc=getDocumentStatus(docType.id);return <div key={docType.id} className={styles.document}>
<span className={styles.icon}>{docType.icon}</span><div><div className="flex flex-wrap items-center gap-2"><h3 className={styles.label}>{docType.label}</h3><span className={"rounded-md border px-2 py-0.5 text-[10px] " + (doc ? getStatusColor(doc.status) : "border-white/10 text-white/40")}>{doc ? getStatusLabel(doc.status) : "À fournir"}</span></div><p className={styles.note}>{docType.description}</p>{doc && <p className={styles.note}>Déposé le {new Date(doc.uploadedAt).toLocaleDateString("fr-FR")}</p>}{doc?.rejectionReason && <p className="mt-2 text-xs text-red-300">{doc.rejectionReason}</p>}{doc?.status==="PENDING" && <p className={styles.note}>En cours de vérification par notre équipe.</p>}</div>
{(!doc || doc.status==="REJECTED") && <div className={styles.documentActions}><input id={"document-"+docType.id} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" disabled={uploading[docType.id]} onChange={event=>{void handleFileUpload(docType.id,event.target.files);event.target.value="";}}/><DashboardButton variant="secondary" className="min-w-0! h-9 px-3" disabled={uploading[docType.id]} onClick={()=>document.getElementById("document-"+docType.id)?.click()}><FiUploadCloud className="h-3.5 w-3.5"/>{uploading[docType.id] ? "Envoi…" : doc ? "Renvoyer" : "Ajouter"}</DashboardButton></div>}
</div>})}</div>}
<div className={styles.notice}><p className={styles.label}>Hygiène &amp; Salubrité : le justificatif obligatoire</p><p>Ce document permet de vérifier votre salon. Les autres justificatifs complètent votre dossier.</p><p className={styles.note}>Formats acceptés : PDF, JPG ou PNG. Maximum 32 Mo par fichier. Les images sont compressées automatiquement avant l'envoi ; les PDF sont conservés tels quels.</p></div></div></div>);
}
