"use client";
import React, { useState } from "react";
import { ClientProps } from "@/lib/type";
import { FiCheckCircle, FiFileText, FiExternalLink } from "react-icons/fi";
import ConsentFormModal from "../ConsentFormModal";

interface ConsentSectionProps {
  client: ClientProps;
  salonName: string;
  onConsentUpdated?: (url: string, signedAt: string) => void;
}

export default function ConsentSection({
  client,
  salonName,
  onConsentUpdated,
}: ConsentSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localUrl, setLocalUrl] = useState<string | null>(
    client.consentFileUrl ?? null
  );
  const [localSignedAt, setLocalSignedAt] = useState<string | null>(
    client.consentSignedAt ?? null
  );
  const [localSigned, setLocalSigned] = useState(client.consentSigned ?? false);

  const formatDate = (v?: string | null) =>
    v ? new Date(v).toLocaleDateString("fr-FR") : "---";

  const handleConsentSaved = (_: string, url: string, signedAt: string) => {
    setLocalUrl(url);
    setLocalSignedAt(signedAt);
    setLocalSigned(true);
    setIsModalOpen(false);
    onConsentUpdated?.(url, signedAt);
  };

  const enrichedClient: ClientProps = {
    ...client,
    consentFileUrl: localUrl,
    consentSignedAt: localSignedAt,
    consentSigned: localSigned,
  };

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/6 to-white/[0.02] p-4 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-tertiary-400/30 bg-tertiary-500/10">
              <FiFileText size={16} className="text-tertiary-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white font-one">Consentement eclaire</p>
              <p className="text-[11px] text-white/50 font-two">Formulaire de tatouage</p>
            </div>
          </div>
          {localSigned ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-[11px] font-semibold text-green-400 font-one">
              <FiCheckCircle size={11} /> Signe
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-[11px] font-semibold text-orange-400 font-one">
              En attente
            </span>
          )}
        </div>

        {localSigned && localSignedAt && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
            <p className="text-[10px] uppercase tracking-wide text-white/50 font-one">Informations de signature</p>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div>
                <p className="text-white/50 font-one text-[10px]">Signe le</p>
                <p className="text-white font-two">{formatDate(localSignedAt)}</p>
              </div>
              {localUrl && (
                <div>
                  <p className="text-white/50 font-one text-[10px]">Document</p>
                  <a href={localUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-tertiary-400 hover:underline font-two text-[11px]">
                    Voir le PDF <FiExternalLink size={10} />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {!localSigned && (
          <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-3">
            <p className="text-[11px] text-orange-300/80 font-two leading-relaxed">
              Aucun consentement signe pour ce client. Ouvrez le formulaire pour le generer et le faire signer.
            </p>
          </div>
        )}

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-tertiary-400/30 bg-tertiary-500/20 px-4 py-2.5 text-sm font-semibold text-tertiary-400 font-one uppercase tracking-wide transition-all hover:bg-tertiary-500/30 cursor-pointer"
        >
          <FiFileText size={14} />
          {localSigned ? "PDF généré" : "Ouvrir le formulaire"}
        </button>
      </div>

      <ConsentFormModal
        client={enrichedClient}
        salonName={salonName}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConsentSaved={handleConsentSaved}
      />
    </>
  );
}
