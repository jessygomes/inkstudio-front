"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import SignatureCanvas from "react-signature-canvas";
import jsPDF from "jspdf";
import { ClientProps } from "@/lib/type";
import { useUploadThing } from "@/lib/utils/uploadthing";
import { updateClientConsent } from "@/lib/queries/client";
import { FiTrash2, FiUpload, FiCheckCircle, FiExternalLink } from "react-icons/fi";

interface ConsentFormModalProps {
  client: ClientProps;
  salonName: string;
  isOpen: boolean;
  onClose: () => void;
  onConsentSaved?: (clientId: string, url: string, signedAt: string) => void;
}

interface EditableClientInfo {
  firstName: string;
  lastName: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  isMinor: boolean;
  guardianName: string;
  guardianPhone: string;
}

export default function ConsentFormModal({
  client,
  salonName,
  isOpen,
  onClose,
  onConsentSaved,
}: ConsentFormModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);
  const signatureContainerRef = useRef<HTMLDivElement>(null);
  const isSubmittingRef = useRef(false);

  // Info client éditable (pré-remplie)
  const [info, setInfo] = useState<EditableClientInfo>({
    firstName: client.firstName,
    lastName: client.lastName,
    birthDate: client.birthDate
      ? new Date(client.birthDate).toISOString().split("T")[0]
      : "",
    phone: client.phone,
    email: client.email,
    address: client.address ?? "",
    isMinor: client.isMinor ?? false,
    guardianName: client.guardianName ?? "",
    guardianPhone: client.guardianPhone ?? "",
  });

  // Consentements
  const [marketingConsent, setMarketingConsent] = useState(
    client.marketingConsent ?? false
  );
  const [photoConsent, setPhotoConsent] = useState(false);

  // UI states
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedUrl, setSavedUrl] = useState<string | null>(
    client.consentFileUrl ?? null
  );
  const [savedAt, setSavedAt] = useState<string | null>(
    client.consentSignedAt ?? null
  );

  const { startUpload, isUploading } = useUploadThing("consentPdf");

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    // Réinitialiser les infos quand le client change
    setInfo({
      firstName: client.firstName,
      lastName: client.lastName,
      birthDate: client.birthDate
        ? new Date(client.birthDate).toISOString().split("T")[0]
        : "",
      phone: client.phone,
      email: client.email,
      address: client.address ?? "",
      isMinor: client.isMinor ?? false,
      guardianName: client.guardianName ?? "",
      guardianPhone: client.guardianPhone ?? "",
    });
    setMarketingConsent(client.marketingConsent ?? false);
    setSavedUrl(client.consentFileUrl ?? null);
    setSavedAt(client.consentSignedAt ?? null);
    setError(null);
    setPhotoConsent(false);
  }, [client]);

  const syncSignatureCanvasSize = useCallback(() => {
    if (!sigCanvas.current || !signatureContainerRef.current) return;

    const pad = sigCanvas.current;
    const canvas = pad.getCanvas();
    const rect = signatureContainerRef.current.getBoundingClientRect();
    const dpr = Math.max(window.devicePixelRatio || 1, 1);

    const nextWidth = Math.max(Math.floor(rect.width * dpr), 1);
    const nextHeight = Math.max(Math.floor(rect.height * dpr), 1);

    if (canvas.width === nextWidth && canvas.height === nextHeight) return;

    const signatureSnapshot = !pad.isEmpty() ? pad.toDataURL("image/png") : null;

    canvas.width = nextWidth;
    canvas.height = nextHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    pad.clear();

    if (signatureSnapshot) {
      pad.fromDataURL(signatureSnapshot, {
        width: rect.width,
        height: rect.height,
      });
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !isMounted) return;

    syncSignatureCanvasSize();

    const resizeObserver = new ResizeObserver(() => {
      syncSignatureCanvasSize();
    });

    if (signatureContainerRef.current) {
      resizeObserver.observe(signatureContainerRef.current);
    }

    window.addEventListener("orientationchange", syncSignatureCanvasSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("orientationchange", syncSignatureCanvasSize);
    };
  }, [isOpen, isMounted, syncSignatureCanvasSize]);

  const clearSignature = useCallback(() => sigCanvas.current?.clear(), []);

  const set = (key: keyof EditableClientInfo, value: string | boolean) =>
    setInfo((prev) => ({ ...prev, [key]: value }));

  const handleGenerate = async () => {
    if (isSubmittingRef.current) return;

    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      setError("Veuillez signer le formulaire avant de valider.");
      return;
    }

    isSubmittingRef.current = true;
    setError(null);
    setIsGenerating(true);
    try {
      const signatureDataUrl = sigCanvas.current
        .getTrimmedCanvas()
        .toDataURL("image/png");

      const pdf = buildConsentPdf(
        info,
        salonName,
        signatureDataUrl,
        marketingConsent,
        photoConsent
      );
      const pdfBlob = pdf.output("blob");
      const pdfFile = new File(
        [pdfBlob],
        `consentement_${info.firstName}_${info.lastName}_${Date.now()}.pdf`,
        { type: "application/pdf" }
      );

      const uploadResult = await startUpload([pdfFile]);
      if (!uploadResult || uploadResult.length === 0) {
        throw new Error("Échec de l'upload du PDF");
      }
      const fileUrl = uploadResult[0].ufsUrl ?? uploadResult[0].url;
      if (!fileUrl) throw new Error("URL du fichier introuvable après upload");

      const signedAt = new Date().toISOString();

      const result = await updateClientConsent(client.id, fileUrl, signedAt);
      if (!result.ok) throw new Error(result.message ?? "Erreur lors de la sauvegarde");

      setSavedUrl(fileUrl);
      setSavedAt(signedAt);
      onConsentSaved?.(client.id, fileUrl, signedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsGenerating(false);
      isSubmittingRef.current = false;
    }
  };

  if (!isOpen || !isMounted) return null;

  const isLoading = isGenerating || isUploading;
  const formatDate = (v?: string | null) =>
    v ? new Date(v).toLocaleDateString("fr-FR") : "—";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <div className="bg-noir-500 w-full h-[100dvh] overflow-hidden flex flex-col sm:h-auto sm:max-h-[92vh] sm:w-full sm:max-w-2xl sm:rounded-2xl sm:border sm:border-white/10 sm:shadow-2xl">

        {/* ── Header ── */}
        <div className="relative bg-noir-700 border-b border-white/10 px-5 pt-4 pb-3 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white font-one tracking-wide">
                Formulaire de consentement
              </h2>
              <p className="text-[11px] text-white/50 font-two mt-0.5">
                {info.firstName} {info.lastName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer p-2 hover:bg-white/10 rounded-2xl transition-all hover:rotate-90 group"
            >
              <svg className="w-4 h-4 text-white/70 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Badge consentement existant */}
          {savedUrl && (
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-1.5">
              <FiCheckCircle size={13} className="text-green-400 shrink-0" />
              <p className="text-[11px] text-green-400 font-two flex-1">
                Consentement signé le {formatDate(savedAt)}
              </p>
              <a
                href={savedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-tertiary-400 hover:underline font-two"
              >
                PDF <FiExternalLink size={11} />
              </a>
            </div>
          )}
        </div>

        {/* ── Corps scrollable ── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">

          {/* 1. Informations du client (éditables) */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
            <p className="text-[10px] font-one font-semibold uppercase tracking-widest text-white/50">
              ■ Informations du client
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Prénom" value={info.firstName} onChange={(v) => set("firstName", v)} />
              <Field label="Nom" value={info.lastName} onChange={(v) => set("lastName", v)} />
              <Field label="Date de naissance" type="date" value={info.birthDate} onChange={(v) => set("birthDate", v)} />
              <Field label="Téléphone" type="tel" value={info.phone} onChange={(v) => set("phone", v)} />
              <Field label="Email" type="email" value={info.email} onChange={(v) => set("email", v)} className="sm:col-span-2" />
              <Field label="Adresse" value={info.address} onChange={(v) => set("address", v)} className="sm:col-span-2" />
            </div>

            <label className="flex items-center gap-2 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={info.isMinor}
                onChange={(e) => set("isMinor", e.target.checked)}
                className="accent-tertiary-400"
              />
              <span className="text-xs text-white/70 font-two">Client mineur</span>
            </label>

            {info.isMinor && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-2 border-t border-white/10 pt-3">
                <p className="text-[10px] font-one uppercase tracking-widest text-white/40 sm:col-span-2">
                  Représentant légal
                </p>
                <Field label="Nom du représentant" value={info.guardianName} onChange={(v) => set("guardianName", v)} />
                <Field label="Téléphone du représentant" type="tel" value={info.guardianPhone} onChange={(v) => set("guardianPhone", v)} />
              </div>
            )}
          </section>

          {/* 2. Déclaration de consentement (lecture seule) */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
            <p className="text-[10px] font-one font-semibold uppercase tracking-widest text-white/50 mb-2">
              ■ Déclaration de consentement
            </p>
            <p className="text-[11px] text-white/80 font-two font-semibold leading-snug">
              EN SIGNANT CE DOCUMENT, JE CERTIFIE QUE LA PRESTATION DE TATOUAGE EST RÉALISÉE AVEC MON TOTAL CONSENTEMENT.
            </p>
            <div className="space-y-1.5 mt-2">
              {CONSENT_ITEMS.map((item, i) => (
                <p key={i} className="flex items-start gap-2 text-[11px] text-white/65 font-two leading-snug">
                  <span className="text-tertiary-400 mt-px shrink-0">■</span>
                  {item}
                </p>
              ))}
            </div>
          </section>

          {/* 3. Consentements RGPD */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
            <p className="text-[10px] font-one font-semibold uppercase tracking-widest text-white/50">
              ■ Consentements RGPD & Données
            </p>
            <p className="text-[11px] text-white/60 font-two leading-snug">
              Conformément au RGPD (UE 2016/679), vous consentez à la collecte et au traitement de vos données personnelles dans le cadre de votre suivi client. Ces données sont strictement confidentielles et ne seront jamais cédées à des tiers.
            </p>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={marketingConsent} onChange={(e) => setMarketingConsent(e.target.checked)} className="mt-0.5 accent-tertiary-400" />
              <span className="text-[12px] text-white/75 font-two leading-snug">
                J&apos;accepte la collecte et le traitement de mes données personnelles.
              </span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={photoConsent} onChange={(e) => setPhotoConsent(e.target.checked)} className="mt-0.5 accent-tertiary-400" />
              <span className="text-[12px] text-white/75 font-two leading-snug">
                J&apos;autorise la publication de photos de mon tatouage à des fins de portfolio (Instagram, site web…).
              </span>
            </label>
            <p className="text-[10px] text-white/40 font-two leading-snug pt-1 border-t border-white/10">
              Vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données. Pour exercer ces droits, contactez le salon directement.
            </p>
          </section>

          {/* 4. Zone de signature */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-one font-semibold uppercase tracking-widest text-white/50">
                ■ Signature du client & signature du tatoueur
              </p>
              <button
                onClick={clearSignature}
                className="flex items-center gap-1 text-[11px] text-white/40 hover:text-red-400 transition-colors cursor-pointer"
              >
                <FiTrash2 size={12} /> Effacer
              </button>
            </div>
            <div
              ref={signatureContainerRef}
              className="rounded-xl border-2 border-dashed border-white/20 bg-white overflow-hidden touch-none h-40"
            >
              <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{
                  width: 1,
                  height: 1,
                  className: "w-full h-full",
                  style: { touchAction: "none", display: "block" },
                }}
              />
            </div>
            <p className="text-[10px] text-white/35 font-two text-center">
              Signez avec votre doigt ou votre souris
            </p>
          </section>

          {/* Message d'erreur */}
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2">
              <p className="text-xs text-red-400 font-two">{error}</p>
            </div>
          )}
        </div>

        {/* ── Footer fixe ── */}
        <div className="shrink-0 border-t border-white/10 bg-noir-700/60 px-4 py-3 flex flex-col sm:flex-row gap-2 justify-end">
          <button
            onClick={onClose}
            className="cursor-pointer px-5 py-2 rounded-2xl border border-white/10 text-sm text-white/60 font-one hover:bg-white/5 transition-all"
          >
            Annuler
          </button>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="cursor-pointer flex items-center justify-center gap-2 rounded-2xl border border-tertiary-400/30 bg-gradient-to-r from-tertiary-400/20 to-tertiary-500/20 px-6 py-2 text-sm font-semibold text-tertiary-400 font-one uppercase tracking-wide transition-all hover:from-tertiary-400/30 hover:to-tertiary-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiUpload size={14} />
            {isLoading
              ? "Génération…"
              : savedUrl
                ? "PDF généré"
                : "Générer & enregistrer le PDF"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Sous-composant champ texte ──
function Field({
  label,
  value,
  onChange,
  type = "text",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-[10px] text-white/50 font-one uppercase tracking-wide mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white font-two placeholder-white/30 focus:border-tertiary-400/50 focus:outline-none focus:ring-1 focus:ring-tertiary-400/30 transition-all"
      />
    </div>
  );
}

// ── Items de consentement ──
const CONSENT_ITEMS = [
  "Être majeur(e) et en avoir apporté la preuve si demandé.",
  "Avoir validé la nature du motif avec le tatoueur et vérifié l'orthographe en cas de lettrage.",
  "Ne pas être enceinte, ou allaitante.",
  "Ne pas être sous l'emprise d'une substance pouvant altérer ma capacité de jugement et de décision.",
  "Avoir été informé(e) du caractère douloureux des actes.",
  "Avoir été informé(e) des risques possibles d'infections, d'allergies — en particulier aux encres.",
  "Avoir été informé(e) que le tatouage est un acte artistique définitif et irréversible.",
  "N'avoir aucune maladie ou ne prendre aucun traitement constituant une contre-indication au tatouage.",
];

// ── Générateur de PDF ──
function buildConsentPdf(
  info: EditableClientInfo,
  salonName: string,
  signatureDataUrl: string,
  marketingConsent: boolean,
  photoConsent: boolean
): jsPDF {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = 210;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  const addLine = (h = 6) => { y += h; };
  const checkPageBreak = (needed = 8) => {
    if (y + needed > 280) { pdf.addPage(); y = 18; }
  };

  // En-tête
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.setTextColor(30, 30, 30);
  pdf.text(salonName.toUpperCase(), pageWidth / 2, y, { align: "center" });
  addLine(7);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10.5);
  pdf.setTextColor(80, 80, 80);
  pdf.text("Formulaire de Consentement Éclairé — Tatouage", pageWidth / 2, y, { align: "center" });
  addLine(6);
  pdf.setFontSize(9);
  pdf.text(`Date : ${new Date().toLocaleDateString("fr-FR")}`, pageWidth / 2, y, { align: "center" });
  addLine(8);
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, y, pageWidth - margin, y);
  addLine(8);

  const sectionTitle = (title: string) => {
    checkPageBreak(14);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(50, 50, 50);
    pdf.text(title.toUpperCase(), margin, y);
    addLine(8);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.5);
    pdf.setTextColor(60, 60, 60);
  };

  const field = (label: string, value: string, x: number, fy: number) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(100, 100, 100);
    pdf.text(label, x, fy);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(30, 30, 30);
    pdf.text(value || "—", x + 30, fy);
  };

  sectionTitle("Informations du client");
  field("Nom :", info.lastName, margin, y);
  field("Prénom :", info.firstName, margin + contentWidth / 2, y);
  addLine(7);
  field(
    "Date de naissance :",
    info.birthDate ? new Date(info.birthDate).toLocaleDateString("fr-FR") : "—",
    margin, y
  );
  field("Téléphone :", info.phone, margin + contentWidth / 2, y);
  addLine(7);
  field("Email :", info.email, margin, y);
  addLine(7);
  if (info.address) { field("Adresse :", info.address, margin, y); addLine(7); }
  addLine(2);

  sectionTitle("Déclaration de consentement");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  pdf.setTextColor(30, 30, 30);
  const intro = pdf.splitTextToSize(
    "EN SIGNANT CE DOCUMENT, JE CERTIFIE QUE LA PRESTATION DE TATOUAGE EST RÉALISÉE AVEC MON TOTAL CONSENTEMENT.",
    contentWidth
  );
  checkPageBreak(intro.length * 5.2 + 6);
  pdf.text(intro, margin, y);
  y += intro.length * 5.2 + 4;

  CONSENT_ITEMS.forEach((item) => {
    checkPageBreak(8);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(40, 40, 40);
    const lines = pdf.splitTextToSize(`- ${item}`, contentWidth - 2);
    pdf.text(lines, margin + 3, y);
    y += lines.length * 5.2 + 0.8;
  });
  addLine(4);

  sectionTitle("Consentement RGPD & Utilisation des données");
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(60, 60, 60);
  const rgpdText = pdf.splitTextToSize(
    "Conformément au RGPD (UE 2016/679), vous consentez à la collecte et au traitement de vos données personnelles dans le cadre de votre suivi client. Ces données sont strictement confidentielles et ne seront jamais cédées à des tiers.",
    contentWidth
  );
  checkPageBreak(rgpdText.length * 5.2 + 7);
  pdf.text(rgpdText, margin, y);
  y += rgpdText.length * 5.2 + 4;

  const checkBox = (checked: boolean, text: string) => {
    checkPageBreak(8);
    pdf.setFontSize(9);
    pdf.text(checked ? "[x]" : "[ ]", margin + 3, y);
    const lines = pdf.splitTextToSize(text, contentWidth - 12);
    pdf.text(lines, margin + 9, y);
    y += lines.length * 5 + 1.5;
  };
  checkBox(marketingConsent, "J'accepte la collecte et le traitement de mes données personnelles.");
  checkBox(photoConsent, "J'autorise la publication de photos de mon tatouage à des fins de portfolio (Instagram, site web…).");
  addLine(4);

  if (info.isMinor) {
    sectionTitle("Représentant légal (client mineur)");
    field("Nom du représentant :", info.guardianName || "—", margin, y);
    addLine(7);
    field("Téléphone :", info.guardianPhone || "—", margin, y);
    addLine(9);
  }

  checkPageBreak(54);
  sectionTitle("Signatures");
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(8.5);
  pdf.setTextColor(80, 80, 80);
  pdf.text(
    "Je soussigné(e) déclare avoir lu, compris et accepté l'ensemble des conditions énoncées dans ce formulaire.",
    margin, y, { maxWidth: contentWidth }
  );
  addLine(10);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(50, 50, 50);
  pdf.text("Signature du client & signature du tatoueur :", margin, y);
  addLine(5);
  pdf.addImage(signatureDataUrl, "PNG", margin, y, 50, 14);
  addLine(19);

  addLine(4);

  checkPageBreak(8);
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, y, pageWidth - margin, y);
  addLine(5);
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(8);
  pdf.setTextColor(130, 130, 130);
  pdf.text(
    "Ce document est conservé dans le dossier client conformément aux obligations légales et au RGPD.",
    pageWidth / 2, y, { align: "center" }
  );

  return pdf;
}
