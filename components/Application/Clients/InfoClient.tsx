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

  console.log("Client pour infos détaillées:", client);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-[9999] sm:bg-black/60 sm:backdrop-blur-sm bg-noir-700 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-noir-500 rounded-none sm:rounded-3xl w-full h-full sm:h-auto sm:max-w-5xl sm:max-h-[90vh] overflow-hidden flex flex-col border-0 sm:border sm:border-white/20 sm:shadow-2xl">
        {/* Header fixe responsive */}
        <div className="p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white font-one tracking-wide truncate">
                {client.firstName} {client.lastName}
              </h2>
              <p className="text-white/70 mt-2 text-sm">
                Informations détaillées du client
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-full transition-colors ml-2"
            >
              <span className="cursor-pointer text-white text-xl">×</span>
            </button>
          </div>
        </div>

        {/* Contenu scrollable responsive */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4 sm:space-y-6">
            {/* Informations de base responsive */}
            <div className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-one uppercase tracking-wide mb-3">
                <CiUser size={18} className="sm:w-5 sm:h-5" /> Informations
                personnelles
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-white/70 font-one">Email</p>
                  <p className="text-white font-two text-sm break-all">
                    {client.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/70 font-one">Téléphone</p>
                  <p className="text-white font-two text-sm">
                    {client.phone || "Non renseigné"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/70 font-one">
                    Date de naissance
                  </p>
                  <p className="text-white font-two text-sm">
                    {client.birthDate
                      ? new Date(client.birthDate).toLocaleDateString("fr-FR")
                      : "Non renseignée"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/70 font-one">Adresse</p>
                  <p className="text-white font-two text-sm break-words">
                    {client.address || "Non renseignée"}
                  </p>
                </div>
              </div>
            </div>

            {/* Section Rendez-vous responsive */}
            <div className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
              <button
                onClick={() => setShowAppointments(!showAppointments)}
                className="w-full flex items-center justify-between mb-4"
              >
                <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-one uppercase tracking-wide">
                  <CiCalendarDate size={18} className="sm:w-5 sm:h-5" />
                  <span className="truncate">
                    Rendez-vous ({client.appointments.length})
                  </span>
                </h3>
                {showAppointments ? (
                  <IoChevronUp className="text-white/70 flex-shrink-0" />
                ) : (
                  <IoChevronDown className="text-white/70 flex-shrink-0" />
                )}
              </button>

              {showAppointments && (
                <div className="space-y-3">
                  {client.appointments.length === 0 ? (
                    <p className="text-white/60 text-sm">Aucun rendez-vous</p>
                  ) : (
                    client.appointments.map(
                      (rdv: AppointmentProps, index: number) => (
                        <div
                          key={index}
                          className="bg-white/10 p-3 rounded-lg border border-white/20"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <p className="text-xs text-white/70 font-one">
                                Date
                              </p>
                              <p className="text-white font-two text-sm">
                                {new Date(rdv.start).toLocaleDateString(
                                  "fr-FR"
                                )}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-white/70 font-one">
                                Heure
                              </p>
                              <p className="text-white font-two text-sm">
                                {new Date(rdv.start).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                -{" "}
                                {new Date(rdv.end).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-white/70 font-one">
                                Prestation
                              </p>
                              <p className="text-white font-two text-sm">
                                {rdv.prestation}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-white/70 font-one">
                                Titre
                              </p>
                              <p className="text-white font-two text-sm break-words">
                                {rdv.title}
                              </p>
                            </div>
                          </div>
                          {rdv.description && (
                            <div className="space-y-1 mt-3">
                              <p className="text-xs text-white/70 font-one">
                                Description
                              </p>
                              <p className="text-tertiary-300 font-two text-sm break-words">
                                {rdv.description}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    )
                  )}
                </div>
              )}
            </div>

            {/* Section Historique des tatouages */}
            <div className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
              <button
                onClick={() => setShowTattooHistory(!showTattooHistory)}
                className="w-full flex items-center justify-between mb-4"
              >
                <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-one uppercase tracking-wide">
                  <FaFilePen size={16} className="sm:w-5 sm:h-5" />
                  <span className="truncate">
                    Historique tatouages ({client.tattooHistory?.length || 0})
                  </span>
                </h3>
                {showTattooHistory ? (
                  <IoChevronUp className="text-white/70 flex-shrink-0" />
                ) : (
                  <IoChevronDown className="text-white/70 flex-shrink-0" />
                )}
              </button>

              {showTattooHistory && (
                <div className="space-y-4">
                  {client.tattooHistory && client.tattooHistory.length > 0 ? (
                    client.tattooHistory.map(
                      (tattoo: TattooHistoryProps, index: number) => (
                        <div
                          key={tattoo.id}
                          className="bg-white/10 p-3 sm:p-4 rounded-lg border border-white/20"
                        >
                          <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-3">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 border border-white/20 flex-shrink-0">
                                {tattoo.photo ? (
                                  <Image
                                    width={48}
                                    height={48}
                                    src={tattoo.photo}
                                    alt="Photo du tatouage"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <FaFilePen className="w-5 h-5 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-one text-sm font-semibold">
                                  Tatouage #{index + 1}
                                </p>
                                <p className="text-white/70 text-xs font-one">
                                  {new Date(tattoo.date).toLocaleDateString(
                                    "fr-FR"
                                  )}
                                </p>
                              </div>
                            </div>

                            {tattoo.photo && (
                              <button
                                onClick={() =>
                                  window.open(tattoo.photo, "_blank")
                                }
                                className="cursor-pointer text-tertiary-400 hover:text-tertiary-300 text-xs font-one"
                              >
                                Voir photo →
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p className="text-xs text-white/70 font-one">
                                Zone
                              </p>
                              <p className="text-white font-two text-sm">
                                {tattoo.zone || "Non spécifiée"}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <p className="text-xs text-white/70 font-one">
                                Taille
                              </p>
                              <p className="text-white font-two text-sm">
                                {tattoo.size || "Non spécifiée"}
                              </p>
                            </div>

                            {tattoo.price && (
                              <div className="space-y-2">
                                <p className="text-xs text-white/70 font-one">
                                  Prix
                                </p>
                                <p className="text-green-400 font-two text-sm font-semibold">
                                  {tattoo.price}€
                                </p>
                              </div>
                            )}

                            {tattoo.healingTime && (
                              <div className="space-y-2">
                                <p className="text-xs text-white/70 font-one">
                                  Temps de cicatrisation
                                </p>
                                <p className="text-white font-two text-sm">
                                  {tattoo.healingTime}
                                </p>
                              </div>
                            )}
                          </div>

                          {tattoo.description && (
                            <div className="mt-4 space-y-2">
                              <p className="text-xs text-white/70 font-one">
                                Description
                              </p>
                              <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                <p className="text-white/90 text-sm font-one break-words">
                                  {tattoo.description}
                                </p>
                              </div>
                            </div>
                          )}

                          {tattoo.careProducts && (
                            <div className="mt-4">
                              <div className="space-y-2">
                                <p className="text-xs text-white/70 font-one">
                                  Produits de soin
                                </p>
                                <p className="text-purple-400 font-two text-sm">
                                  {tattoo.careProducts}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FaFilePen className="w-6 h-6 text-gray-500" />
                      </div>
                      <p className="text-white/60 text-sm">
                        Aucun historique de tatouage
                      </p>
                      <p className="text-white/40 text-xs mt-1">
                        Aucun tatouage enregistré pour ce client
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Section Historique médical responsive */}
            <div className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
              <button
                onClick={() => setShowTattooCare(!showTattooCare)}
                className="w-full flex items-center justify-between mb-4"
              >
                <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-one uppercase tracking-wide">
                  <RiHealthBookLine size={16} className="sm:w-5 sm:h-5" />
                  <span className="truncate">Historique médical</span>
                </h3>
                {showTattooCare ? (
                  <IoChevronUp className="text-white/70 flex-shrink-0" />
                ) : (
                  <IoChevronDown className="text-white/70 flex-shrink-0" />
                )}
              </button>

              {showTattooCare && (
                <div className="space-y-4">
                  {client.medicalHistory ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
            <div className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10">
              <button
                onClick={() =>
                  setShowFollowUpSubmissions(!showFollowUpSubmissions)
                }
                className="w-full flex items-center justify-between mb-4"
              >
                <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-one uppercase tracking-wide">
                  <MdOutlineRateReview size={16} className="sm:w-5 sm:h-5" />
                  <span className="truncate">
                    Suivis cicatrisation (
                    {client.FollowUpSubmission?.length || 0})
                  </span>
                </h3>
                {showFollowUpSubmissions ? (
                  <IoChevronUp className="text-white/70 flex-shrink-0" />
                ) : (
                  <IoChevronDown className="text-white/70 flex-shrink-0" />
                )}
              </button>

              {showFollowUpSubmissions && (
                <div className="space-y-4">
                  {client.FollowUpSubmission &&
                  client.FollowUpSubmission.length > 0 ? (
                    client.FollowUpSubmission.map(
                      (followUp: any, index: number) => (
                        <div
                          key={followUp.id}
                          className="bg-white/10 p-3 sm:p-4 rounded-lg border border-white/20"
                        >
                          <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-3">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 border border-white/20 flex-shrink-0">
                                {followUp.photoUrl ? (
                                  <Image
                                    width={48}
                                    height={48}
                                    src={followUp.photoUrl}
                                    alt="Photo de cicatrisation"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <svg
                                      className="w-5 h-5 text-gray-400"
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
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                                  <p className="text-white font-one text-sm font-semibold">
                                    Suivi #{index + 1}
                                  </p>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium border w-fit ${
                                      followUp.isAnswered
                                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                                        : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                                    }`}
                                  >
                                    {followUp.isAnswered
                                      ? "Répondu"
                                      : "En attente"}
                                  </span>
                                </div>
                                <p className="text-white/70 text-xs font-one">
                                  {formatDate(followUp.createdAt)}
                                </p>
                              </div>
                            </div>

                            {followUp.photoUrl && (
                              <button
                                onClick={() =>
                                  window.open(followUp.photoUrl, "_blank")
                                }
                                className="cursor-pointer text-tertiary-400 hover:text-tertiary-300 text-xs font-one"
                              >
                                Voir photo →
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p className="text-xs text-white/70 font-one">
                                Satisfaction
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-yellow-400 text-sm">
                                  {getRatingStars(followUp.rating)}
                                </span>
                                <span className="text-white/80 text-xs font-one">
                                  {getRatingLabel(followUp.rating)}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-xs text-white/70 font-one">
                                Visibilité photo
                              </p>
                              <span
                                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${
                                  followUp.isPhotoPublic
                                    ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                    : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                                }`}
                              >
                                {followUp.isPhotoPublic ? "Publique" : "Privée"}
                              </span>
                            </div>
                          </div>

                          {followUp.review && (
                            <div className="mt-4 space-y-2">
                              <p className="text-xs text-white/70 font-one">
                                Avis du client
                              </p>
                              <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                <p className="text-white/90 text-sm font-one italic break-words">
                                  "{followUp.review}"
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="mt-4 pt-3 border-t border-white/10">
                            <p className="text-xs text-white/50 font-one break-all">
                              Rendez-vous associé: {followUp.appointmentId}
                            </p>
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MdOutlineRateReview className="w-6 h-6 text-gray-500" />
                      </div>
                      <p className="text-white/60 text-sm">
                        Aucun suivi de cicatrisation
                      </p>
                      <p className="text-white/40 text-xs mt-1">
                        Le client n'a pas encore envoyé de suivi
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer fixe responsive */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="cursor-pointer px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
