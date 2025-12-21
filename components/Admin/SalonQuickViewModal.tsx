"use client";

import Image from "next/image";
import { FiMail, FiPhone, FiMapPin, FiCalendar } from "react-icons/fi";
import { LuShieldCheck, LuX } from "react-icons/lu";

export interface AdminSalon {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  salonName: string | null;
  phone: string | null;
  city: string | null;
  postalCode: string | null;
  image: string | null;
  description: string | null;
  verifiedSalon: boolean;
  saasPlan: string;
  createdAt: string;
  updatedAt: string;
}

interface SalonQuickViewModalProps {
  salon: AdminSalon;
  onClose: () => void;
}

export default function SalonQuickViewModal({
  salon,
  onClose,
}: SalonQuickViewModalProps) {
  const displayName =
    salon.salonName ||
    `${salon.firstName || ""} ${salon.lastName || ""}`.trim() ||
    "Sans nom";

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-0 md:px-4">
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-4xl bg-gradient-to-br from-noir-700 to-noir-800 border border-white/10 rounded-none md:rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-noir-700/90 to-noir-500/70 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
              {salon.image ? (
                <Image
                  src={salon.image}
                  alt={displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/50 font-bold font-one text-lg">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="text-[11px] text-white/60 font-one uppercase tracking-wide">
                Salon
              </p>
              <h3 className="text-xl font-one font-bold text-white">
                {displayName}
              </h3>
              <div className="flex items-center gap-2 text-xs text-white/70">
                <span className="px-2 py-0.5 rounded bg-white/10 border border-white/15 font-one uppercase">
                  {salon.saasPlan || "-"}
                </span>
                {salon.verifiedSalon && (
                  <span className="flex items-center gap-1 text-tertiary-400 font-one">
                    <LuShieldCheck size={14} /> Vérifié
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
            aria-label="Fermer"
          >
            <LuX size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-5 py-4 text-sm text-white/80 font-one overflow-y-auto md:max-h-[calc(90vh-160px)]">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white/70">
              <FiMail size={14} />
              <span>{salon.email}</span>
            </div>
            {salon.phone && (
              <div className="flex items-center gap-2 text-white/70">
                <FiPhone size={14} />
                <span>{salon.phone}</span>
              </div>
            )}
            {(salon.city || salon.postalCode) && (
              <div className="flex items-center gap-2 text-white/70">
                <FiMapPin size={14} />
                <span>
                  {salon.postalCode && `${salon.postalCode} `}
                  {salon.city}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-white/70">
              <FiCalendar size={14} />
              <span>Créé le {formatDate(salon.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <FiCalendar size={14} />
              <span>Mis à jour le {formatDate(salon.updatedAt)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-white/50 text-xs mb-1">Vérification</p>
              <p className="text-white/80 text-sm">
                {salon.verifiedSalon ? "Salon vérifié" : "Non vérifié"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-white/10 bg-white/5">
          <div className="text-xs text-white/60 font-one">ID : {salon.id}</div>
          <div className="flex gap-2">
            <a
              href={`/admin/users/${salon.id}`}
              className="px-4 py-2 text-sm bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg font-one font-medium"
            >
              Voir la fiche complète
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg font-one"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
