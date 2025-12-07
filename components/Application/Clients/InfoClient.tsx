/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState } from "react";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import { RiHealthBookLine } from "react-icons/ri";
import { FaFilePen } from "react-icons/fa6";
import { CiCalendarDate, CiUser } from "react-icons/ci";
import { MdOutlineRateReview } from "react-icons/md";
import Image from "next/image";
import { AppointmentProps, ClientProps, TattooHistoryProps } from "@/lib/type";

interface InfoClientProps {
  client: ClientProps;
  isOpen: boolean;
  onClose: () => void;
}
export default function InfoClient({
  client,
  isOpen,
  onClose,
}: InfoClientProps) {
  // États locaux pour les sections dépliables
  const [showAppointments, setShowAppointments] = useState(false);
  const [showTattooHistory, setShowTattooHistory] = useState(false);
  const [showTattooCare, setShowTattooCare] = useState(false);
  const [showFollowUpSubmissions, setShowFollowUpSubmissions] = useState(false);

  // Fonctions utilitaires
  const getRatingStars = (rating: number) => {
    return "⭐".repeat(rating) + "☆".repeat(5 - rating);
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1:
        return "Très insatisfait";
      case 2:
        return "Insatisfait";
      case 3:
        return "Neutre";
      case 4:
        return "Satisfait";
      case 5:
        return "Très satisfait";
      default:
        return "";
    }
  };

  if (!isOpen || !client) return null;

  return (
    <div
      data-modal
      className="fixed inset-0 z-[9999] lg:bg-black/60 lg:backdrop-blur-sm bg-noir-700 flex items-end lg:items-center justify-center p-0 lg:p-4 overflow-hidden"
      style={{ height: "100dvh", width: "100vw" }}
    >
      <div className="bg-noir-500 rounded-none lg:rounded-3xl w-full h-full lg:w-[90vw] lg:h-[90vh] overflow-hidden flex flex-col border-0 lg:border-2 lg:border-white/20 lg:shadow-2xl min-h-0">
        {/* Header fixe responsive moderne */}
        <div className="relative bg-gradient-to-r from-tertiary-400/20 via-tertiary-500/10 to-transparent border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tertiary-400/30 to-tertiary-500/20 flex items-center justify-center border-2 border-tertiary-400/40 shadow-lg">
              <span className="text-white font-bold text-xl font-one">
                {client.firstName.charAt(0)}
                {client.lastName.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white font-one tracking-wide truncate">
                {client.firstName} {client.lastName}
              </h2>
              <p className="text-white/70 mt-1 text-sm font-one flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Fiche client complète
              </p>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer p-2 hover:bg-white/10 rounded-xl transition-all duration-200 hover:rotate-90 ml-2 group"
            >
              <svg
                className="w-6 h-6 text-white/70 group-hover:text-white transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenu scrollable responsive */}
        <div className="flex-1 overflow-y-auto p-3 lg:p-6 min-h-0">
          <div className="space-y-4">
            {/* Informations de base responsive */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl p-4 border border-white/10 shadow-lg">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-tertiary-400/30 to-tertiary-500/20 flex items-center justify-center border border-tertiary-400/30">
                  <CiUser size={18} className="text-tertiary-400" />
                </div>
                <h3 className="text-base font-semibold text-white font-one uppercase tracking-wide">
                  Informations personnelles
                </h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                  <p className="text-xs text-tertiary-400 font-one font-semibold mb-1">
                    Email
                  </p>
                  <p className="text-white font-two text-sm break-all">
                    {client.email}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                  <p className="text-xs text-tertiary-400 font-one font-semibold mb-1">
                    Téléphone
                  </p>
                  <p className="text-white font-two text-sm">
                    {client.phone || "Non renseigné"}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                  <p className="text-xs text-tertiary-400 font-one font-semibold mb-1">
                    Date de naissance
                  </p>
                  <p className="text-white font-two text-sm">
                    {client.birthDate
                      ? new Date(client.birthDate).toLocaleDateString("fr-FR")
                      : "Non renseignée"}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                  <p className="text-xs text-tertiary-400 font-one font-semibold mb-1">
                    Adresse
                  </p>
                  <p className="text-white font-two text-sm break-words">
                    {client.address || "Non renseignée"}
                  </p>
                </div>
              </div>
            </div>

            {/* Section Rendez-vous responsive */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl p-4 border border-white/10 shadow-lg">
              <button
                onClick={() => setShowAppointments(!showAppointments)}
                className="w-full flex items-center justify-between group hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-tertiary-400/30 to-tertiary-500/20 flex items-center justify-center border border-tertiary-400/30 group-hover:border-tertiary-400/50 transition-all">
                    <CiCalendarDate size={18} className="text-tertiary-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white font-one uppercase tracking-wide flex items-center gap-2">
                    Rendez-vous
                    <span className="px-2.5 py-1 bg-tertiary-400/20 border border-tertiary-400/30 rounded-md text-xs font-semibold text-tertiary-400">
                      {client.appointments.length}
                    </span>
                  </h3>
                </div>
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                  {showAppointments ? (
                    <IoChevronUp className="text-white/70 w-5 h-5" />
                  ) : (
                    <IoChevronDown className="text-white/70 w-5 h-5" />
                  )}
                </div>
              </button>

              {showAppointments && (
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {client.appointments.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-tertiary-400/20 to-tertiary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-tertiary-400/20">
                        <CiCalendarDate className="w-8 h-8 text-tertiary-400" />
                      </div>
                      <p className="text-white/60 text-sm font-one">
                        Aucun rendez-vous
                      </p>
                    </div>
                  ) : (
                    client.appointments.map(
                      (rdv: AppointmentProps, index: number) => (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-white/10 to-white/5 p-3 rounded-lg border border-white/20 hover:border-tertiary-400/30 transition-all duration-200"
                        >
                          {/* Header du rendez-vous */}
                          <div className="flex items-start justify-between gap-3 mb-2 pb-2 border-b border-white/10">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-one font-semibold text-sm mb-1 truncate">
                                {rdv.title}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-white/70">
                                <span className="flex items-center gap-1">
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                  {new Date(rdv.start).toLocaleDateString(
                                    "fr-FR",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )}
                                </span>
                                <span className="text-white/40">•</span>
                                <span className="flex items-center gap-1">
                                  <svg
                                    className="w-3 h-3"
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
                                  {new Date(rdv.start).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}{" "}
                                  -{" "}
                                  {new Date(rdv.end).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>
                            <span className="px-2 py-1 bg-tertiary-400/20 border border-tertiary-400/30 rounded text-xs font-semibold text-tertiary-400 whitespace-nowrap">
                              {rdv.prestation}
                            </span>
                          </div>

                          {/* Détails compacts */}
                          <div className="space-y-1.5">
                            {rdv.description && (
                              <div className="flex gap-2">
                                <span className="text-xs text-white/50 font-one min-w-[70px]">
                                  Description:
                                </span>
                                <p className="text-white/80 text-xs font-two flex-1 line-clamp-2">
                                  {rdv.description}
                                </p>
                              </div>
                            )}
                            {rdv.status && (
                              <div className="flex gap-2 items-center">
                                <span className="text-xs text-white/50 font-one min-w-[70px]">
                                  Statut:
                                </span>
                                <span
                                  className={`text-xs font-semibold ${
                                    rdv.status === "CONFIRMED"
                                      ? "text-green-400"
                                      : rdv.status === "PENDING"
                                      ? "text-orange-400"
                                      : rdv.status === "CANCELED"
                                      ? "text-red-400"
                                      : rdv.status === "DECLINED"
                                      ? "text-gray-400"
                                      : "text-white/70"
                                  }`}
                                >
                                  {rdv.status === "CONFIRMED"
                                    ? "✓ Confirmé"
                                    : rdv.status === "PENDING"
                                    ? "⏳ En attente"
                                    : rdv.status === "CANCELED"
                                    ? "✕ Annulé"
                                    : rdv.status === "DECLINED"
                                    ? "⊘ Refusé"
                                    : rdv.status}
                                </span>
                              </div>
                            )}
                            {rdv.tatoueurId && (
                              <div className="flex gap-2">
                                <span className="text-xs text-white/50 font-one min-w-[70px]">
                                  Tatoueur:
                                </span>
                                <span className="text-white/80 text-xs font-two">
                                  {rdv.tatoueurId}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              )}
            </div>

            {/* Section Historique des tatouages */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl p-4 border border-white/10 shadow-lg">
              <button
                onClick={() => setShowTattooHistory(!showTattooHistory)}
                className="w-full flex items-center justify-between group hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-tertiary-400/30 to-tertiary-500/20 flex items-center justify-center border border-tertiary-400/30 group-hover:border-tertiary-400/50 transition-all">
                    <FaFilePen size={16} className="text-tertiary-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white font-one uppercase tracking-wide flex items-center gap-2">
                    Historique tatouages
                    <span className="px-2.5 py-1 bg-tertiary-400/20 border border-tertiary-400/30 rounded-md text-xs font-semibold text-tertiary-400">
                      {client.tattooHistory?.length || 0}
                    </span>
                  </h3>
                </div>
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                  {showTattooHistory ? (
                    <IoChevronUp className="text-white/70 w-5 h-5" />
                  ) : (
                    <IoChevronDown className="text-white/70 w-5 h-5" />
                  )}
                </div>
              </button>

              {showTattooHistory && (
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {client.tattooHistory && client.tattooHistory.length > 0 ? (
                    client.tattooHistory.map(
                      (tattoo: TattooHistoryProps, index: number) => (
                        <div
                          key={tattoo.id}
                          className="bg-gradient-to-br from-white/10 to-white/5 p-3 rounded-lg border border-white/20 hover:border-tertiary-400/30 transition-all duration-200"
                        >
                          {/* Header compact avec photo et date */}
                          <div className="flex items-start justify-between gap-3 mb-2 pb-2 border-b border-white/10">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 border border-white/20 flex-shrink-0">
                                {tattoo.photo ? (
                                  <Image
                                    width={40}
                                    height={40}
                                    src={tattoo.photo}
                                    alt="Photo du tatouage"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <FaFilePen className="w-4 h-4 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-one font-semibold text-sm truncate">
                                  Tatouage #{index + 1}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-white/70">
                                  <span className="flex items-center gap-1">
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                    {new Date(tattoo.date).toLocaleDateString(
                                      "fr-FR",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      }
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {tattoo.photo && (
                              <button
                                onClick={() =>
                                  window.open(tattoo.photo, "_blank")
                                }
                                className="cursor-pointer text-tertiary-400 hover:text-tertiary-300 text-xs font-one whitespace-nowrap"
                              >
                                Voir →
                              </button>
                            )}
                          </div>

                          {/* Détails compacts */}
                          <div className="space-y-1.5">
                            <div className="flex gap-2">
                              <span className="text-xs text-white/50 font-one min-w-[80px]">
                                Zone :
                              </span>
                              <span className="text-white/80 text-xs font-two flex-1">
                                {tattoo.zone || "Non spécifiée"}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-xs text-white/50 font-one min-w-[80px]">
                                Taille :
                              </span>
                              <span className="text-white/80 text-xs font-two flex-1">
                                {tattoo.size || "Non spécifiée"}
                              </span>
                            </div>
                            {tattoo.price && (
                              <div className="flex gap-2">
                                <span className="text-xs text-white/50 font-one min-w-[80px]">
                                  Prix :
                                </span>
                                <span className="text-green-400 text-xs font-two font-semibold">
                                  {tattoo.price}€
                                </span>
                              </div>
                            )}
                            {tattoo.tatoueurId && (
                              <div className="flex gap-2">
                                <span className="text-xs text-white/50 font-one min-w-[80px]">
                                  Tatoueur :
                                </span>
                                <span className="text-white/80 text-xs font-two">
                                  {tattoo.tatoueur.name}
                                </span>
                              </div>
                            )}
                            {tattoo.healingTime && (
                              <div className="flex gap-2">
                                <span className="text-xs text-white/50 font-one min-w-[80px]">
                                  Cicatrisation :
                                </span>
                                <span className="text-white/80 text-xs font-two flex-1">
                                  {tattoo.healingTime}
                                </span>
                              </div>
                            )}
                            {tattoo.careProducts && (
                              <div className="flex gap-2">
                                <span className="text-xs text-white/50 font-one min-w-[80px]">
                                  Soins :
                                </span>
                                <span className="text-purple-400 text-xs font-two flex-1">
                                  {tattoo.careProducts}
                                </span>
                              </div>
                            )}
                            {tattoo.description && (
                              <div className="flex gap-2">
                                <span className="text-xs text-white/50 font-one min-w-[80px]">
                                  Description :
                                </span>
                                <p className="text-white/80 text-xs font-two flex-1 line-clamp-2">
                                  {tattoo.description}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-tertiary-400/20 to-tertiary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-tertiary-400/20">
                        <FaFilePen className="w-8 h-8 text-tertiary-400" />
                      </div>
                      <p className="text-white/60 text-sm font-one">
                        Aucun historique de tatouage
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Section Historique médical responsive */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl p-4 border border-white/10 shadow-lg">
              <button
                onClick={() => setShowTattooCare(!showTattooCare)}
                className="w-full flex items-center justify-between group hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-tertiary-400/30 to-tertiary-500/20 flex items-center justify-center border border-tertiary-400/30 group-hover:border-tertiary-400/50 transition-all">
                    <RiHealthBookLine size={16} className="text-tertiary-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white font-one uppercase tracking-wide">
                    Historique médical
                  </h3>
                </div>
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                  {showTattooCare ? (
                    <IoChevronUp className="text-white/70 w-5 h-5" />
                  ) : (
                    <IoChevronDown className="text-white/70 w-5 h-5" />
                  )}
                </div>
              </button>

              {showTattooCare && (
                <div className="mt-4 space-y-4">
                  {client.medicalHistory ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        <div className="bg-white/10 p-3 rounded-lg border border-white/20">
                          <p className="text-xs text-white/70 font-one mb-1">
                            Allergies
                          </p>
                          <p className="text-white font-two text-sm break-words">
                            {client.medicalHistory.allergies ||
                              "Aucune allergie connue"}
                          </p>
                        </div>

                        <div className="bg-white/10 p-3 rounded-lg border border-white/20">
                          <p className="text-xs text-white/70 font-one mb-1">
                            Problèmes de santé
                          </p>
                          <p className="text-white font-two text-sm break-words">
                            {client.medicalHistory.healthIssues ||
                              "Aucun problème de santé signalé"}
                          </p>
                        </div>

                        <div className="bg-white/10 p-3 rounded-lg border border-white/20">
                          <p className="text-xs text-white/70 font-one mb-1">
                            Médicaments
                          </p>
                          <p className="text-white font-two text-sm break-words">
                            {client.medicalHistory.medications ||
                              "Aucun médicament"}
                          </p>
                        </div>

                        <div className="bg-white/10 p-3 rounded-lg border border-white/20">
                          <p className="text-xs text-white/70 font-one mb-1">
                            Historique tatouages
                          </p>
                          <p className="text-white font-two text-sm break-words">
                            {client.medicalHistory.tattooHistory ||
                              "Aucun historique de tatouage"}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`p-3 rounded-lg border ${
                          client.medicalHistory.pregnancy
                            ? "border-yellow-400/50 bg-yellow-400/10"
                            : "border-green-400/50 bg-green-400/10"
                        }`}
                      >
                        <p className="text-xs text-white/70 font-one mb-1">
                          Grossesse / Allaitement
                        </p>
                        <p
                          className={`text-sm font-semibold ${
                            client.medicalHistory.pregnancy
                              ? "text-yellow-300"
                              : "text-green-300"
                          }`}
                        >
                          {client.medicalHistory.pregnancy
                            ? "⚠️ Enceinte ou allaite actuellement"
                            : "✅ Non enceinte / n'allaite pas"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/60 text-sm">
                      Aucune information médicale disponible
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Section Suivis de cicatrisation responsive */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl p-4 border border-white/10 shadow-lg">
              <button
                onClick={() =>
                  setShowFollowUpSubmissions(!showFollowUpSubmissions)
                }
                className="w-full flex items-center justify-between group hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-tertiary-400/30 to-tertiary-500/20 flex items-center justify-center border border-tertiary-400/30 group-hover:border-tertiary-400/50 transition-all">
                    <MdOutlineRateReview
                      size={16}
                      className="text-tertiary-400"
                    />
                  </div>
                  <h3 className="text-base font-semibold text-white font-one uppercase tracking-wide flex items-center gap-2">
                    Suivis cicatrisation
                    <span className="px-2.5 py-1 bg-tertiary-400/20 border border-tertiary-400/30 rounded-md text-xs font-semibold text-tertiary-400">
                      {client.FollowUpSubmission?.length || 0}
                    </span>
                  </h3>
                </div>
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                  {showFollowUpSubmissions ? (
                    <IoChevronUp className="text-white/70 w-5 h-5" />
                  ) : (
                    <IoChevronDown className="text-white/70 w-5 h-5" />
                  )}
                </div>
              </button>

              {showFollowUpSubmissions && (
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {client.FollowUpSubmission &&
                  client.FollowUpSubmission.length > 0 ? (
                    client.FollowUpSubmission.map(
                      (followUp: any, index: number) => (
                        <div
                          key={followUp.id}
                          className="bg-gradient-to-br from-white/10 to-white/5 p-3 rounded-lg border border-white/20 hover:border-tertiary-400/30 transition-all duration-200"
                        >
                          {/* Header compact avec photo et statut */}
                          <div className="flex items-start justify-between gap-3 mb-2 pb-2 border-b border-white/10">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 border border-white/20 flex-shrink-0">
                                {followUp.photoUrl ? (
                                  <Image
                                    width={40}
                                    height={40}
                                    src={followUp.photoUrl}
                                    alt="Photo de cicatrisation"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <svg
                                      className="w-4 h-4 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-white font-one font-semibold text-sm">
                                    Suivi #{index + 1}
                                  </h4>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                      followUp.isAnswered
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-orange-500/20 text-orange-400"
                                    }`}
                                  >
                                    {followUp.isAnswered ? "✓" : "⏳"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-white/70">
                                  <span className="flex items-center gap-1">
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                    {new Date(
                                      followUp.createdAt
                                    ).toLocaleDateString("fr-FR", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {followUp.photoUrl && (
                              <button
                                onClick={() =>
                                  window.open(followUp.photoUrl, "_blank")
                                }
                                className="cursor-pointer text-tertiary-400 hover:text-tertiary-300 text-xs font-one whitespace-nowrap"
                              >
                                Voir →
                              </button>
                            )}
                          </div>

                          {/* Détails compacts */}
                          <div className="space-y-1.5">
                            <div className="flex gap-2 items-center">
                              <span className="text-xs text-white/50 font-one min-w-[80px]">
                                Satisfaction:
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-yellow-400 text-xs">
                                  {getRatingStars(followUp.rating)}
                                </span>
                                <span className="text-white/70 text-xs font-two">
                                  {getRatingLabel(followUp.rating)}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <span className="text-xs text-white/50 font-one min-w-[80px]">
                                Visibilité:
                              </span>
                              <span
                                className={`text-xs font-semibold ${
                                  followUp.isPhotoPublic
                                    ? "text-blue-400"
                                    : "text-gray-400"
                                }`}
                              >
                                {followUp.isPhotoPublic
                                  ? "🌐 Publique"
                                  : "🔒 Privée"}
                              </span>
                            </div>
                            {followUp.review && (
                              <div className="flex gap-2">
                                <span className="text-xs text-white/50 font-one min-w-[80px]">
                                  Avis:
                                </span>
                                <p className="text-white/80 text-xs font-two flex-1 line-clamp-2 italic">
                                  "{followUp.review}"
                                </p>
                              </div>
                            )}
                            {followUp.appointmentId && (
                              <div className="flex gap-2">
                                <span className="text-xs text-white/50 font-one min-w-[80px]">
                                  RDV associé:
                                </span>
                                <span className="text-white/60 text-xs font-two truncate">
                                  {followUp.appointmentId}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-tertiary-400/20 to-tertiary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-tertiary-400/20">
                        <MdOutlineRateReview className="w-8 h-8 text-tertiary-400" />
                      </div>
                      <p className="text-white/60 text-sm font-one">
                        Aucun suivi de cicatrisation
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer fixe responsive moderne */}
        <div className="p-3 border-t border-white/10 bg-gradient-to-r from-white/5 to-white/[0.02]">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="cursor-pointer px-5 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-semibold font-one text-sm shadow-lg hover:shadow-tertiary-400/30 hover:scale-105"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
