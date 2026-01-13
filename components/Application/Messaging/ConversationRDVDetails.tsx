/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useEffect, useState } from "react";
import { ConversationDto } from "@/lib/queries/conversation.action";
import { fetchAppointmentById } from "@/lib/queries/appointment";
import { AppointmentProps } from "@/lib/type";

interface ConversationRDVDetailsProps {
  conversation: ConversationDto;
}

export default function ConversationRDVDetails({
  conversation,
}: ConversationRDVDetailsProps) {
  const [appointment, setAppointment] = useState<AppointmentProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRDV = async () => {
      if (!conversation.appointmentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await fetchAppointmentById(conversation.appointmentId);
        setAppointment(result);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur inconnue";
        setError(errorMessage);
        console.error("Erreur lors du chargement du RDV:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRDV();
  }, [conversation.appointmentId]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-lg border border-white/20 shadow-2xl h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-tertiary-500/50 rounded-full animate-spin border-t-tertiary-400"></div>
          <p className="text-white/50 text-sm font-one">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-lg border border-white/20 shadow-2xl h-full flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-white/50 text-sm font-one">
            Aucun rendez-vous associé
          </p>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    PENDING: "from-orange-500/15 to-amber-500/15 border-orange-400/30",
    CONFIRMED: "from-green-500/15 to-emerald-500/15 border-green-400/30",
    COMPLETED: "from-emerald-500/15 to-teal-500/15 border-emerald-400/30",
    CANCELLED: "from-red-500/15 to-rose-500/15 border-red-400/30",
    NO_SHOW: "from-amber-500/15 to-orange-600/15 border-amber-400/30",
    RESCHEDULING: "from-blue-500/15 to-cyan-500/15 border-blue-400/30",
  };

  const statusTextColors: Record<string, string> = {
    PENDING: "text-orange-300",
    CONFIRMED: "text-green-300",
    COMPLETED: "text-emerald-300",
    CANCELLED: "text-red-300",
    NO_SHOW: "text-amber-300",
    RESCHEDULING: "text-blue-300",
  };

  const statusDotColors: Record<string, string> = {
    PENDING: "bg-orange-400",
    CONFIRMED: "bg-green-400",
    COMPLETED: "bg-emerald-400",
    CANCELLED: "bg-red-400",
    NO_SHOW: "bg-amber-400",
    RESCHEDULING: "bg-blue-400",
  };

  const price =
    appointment.tattooDetail?.price ||
    appointment.tattooDetail?.estimatedPrice ||
    0;

  return (
    <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg sm:rounded-lg border border-white/20 shadow-2xl h-full flex flex-col">
      {/* Header */}
      <div className="relative p-4 border-b border-white/10 bg-gradient-to-r rounded-t-lg from-noir-700/80 to-noir-500/80">
        <div className="absolute inset-0 bg-gradient-to-r from-tertiary-400/5 to-transparent"></div>
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-tertiary-500 to-primary-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">
              {conversation.client.firstName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-bold font-one text-white tracking-wide">
              {conversation.client.firstName} {conversation.client.lastName} -{" "}
            </h4>
            <p className="text-white/70 text-xs font-one truncate">
              {conversation.subject}
            </p>
          </div>
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {/* Statut */}
        <div className="bg-gradient-to-r from-white/8 to-white/4 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-white font-one text-sm flex items-center gap-2">
              <svg
                className="w-4 h-4 text-tertiary-400"
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
              Statut
            </h5>
          </div>

          <div className="mb-3">
            <div
              className={`bg-gradient-to-r ${
                statusColors[appointment.status] || "from-white/5 to-white/3"
              } border rounded-lg p-2`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 ${
                    statusDotColors[appointment.status] || "bg-gray-400"
                  } rounded-full ${
                    appointment.status === "PENDING" ||
                    appointment.status === "RESCHEDULING"
                      ? "animate-pulse"
                      : ""
                  }`}
                ></div>
                <span
                  className={`${
                    statusTextColors[appointment.status] || "text-white"
                  } font-medium font-one text-xs`}
                >
                  {appointment.status === "PENDING"
                    ? "En attente de confirmation"
                    : appointment.status === "CONFIRMED"
                    ? "Confirmé"
                    : appointment.status === "COMPLETED"
                    ? "Complété"
                    : appointment.status === "NO_SHOW"
                    ? "Pas présenté"
                    : appointment.status === "CANCELLED"
                    ? "Annulé"
                    : appointment.status === "RESCHEDULING"
                    ? "En attente de reprogrammation"
                    : appointment.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Informations principales */}
        <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
          <h5 className="text-white font-one text-sm flex items-center gap-2 mb-3">
            <svg
              className="w-4 h-4 text-tertiary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Informations
          </h5>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded-lg p-2 border border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded-md flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-3 h-3 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-2-2v6a2 2 0 01-2 2H10a2 2 0 01-2-2v-6"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white/60 text-xs font-one">Date & Heure</p>
                  <p className="text-white font-one text-xs">
                    {new Date(appointment.start).toLocaleDateString("fr-FR")}
                  </p>
                  <p className="text-white font-one text-xs">
                    {new Date(appointment.start).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(appointment.end).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-2 border border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-500/20 rounded-md flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-3 h-3 text-purple-400"
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
                </div>
                <div>
                  <p className="text-white/60 text-xs font-one">Durée</p>
                  <p className="text-white font-one text-xs">
                    {Math.round(
                      (new Date(appointment.end).getTime() -
                        new Date(appointment.start).getTime()) /
                        (1000 * 60)
                    )}{" "}
                    min
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-2 border border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500/20 rounded-md flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-3 h-3 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white/60 text-xs font-one">Prestation</p>
                  <p className="text-white font-one text-xs">
                    {appointment.prestation}
                  </p>
                </div>
              </div>
            </div>

            {appointment.tatoueur && (
              <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-500/20 rounded-md flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-orange-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-one">Tatoueur</p>
                    <p className="text-white font-one text-xs">
                      {appointment.tatoueur.name}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Paiement */}
        {(appointment.prestation === "RETOUCHE" ||
          appointment.prestation === "TATTOO" ||
          appointment.prestation === "PIERCING") && (
          <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
            <h5 className="text-white font-one text-sm flex items-center gap-2 mb-3">
              <svg
                className="w-4 h-4 text-tertiary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Paiement
            </h5>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    appointment.isPayed
                      ? "bg-green-900/40 text-green-300"
                      : "bg-red-900/40 text-red-300"
                  }`}
                >
                  {appointment.isPayed ? "✓ Payé" : "✗ Non payé"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Détails du tattoo */}
        {appointment.tattooDetail && (
          <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
            <h5 className="text-white font-one text-sm flex items-center gap-2 mb-3">
              <svg
                className="w-4 h-4 text-tertiary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
              Détails : {appointment.prestation}
            </h5>

            <div className="space-y-2">
              {appointment.tattooDetail.description && (
                <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                  <p className="text-white/60 text-xs font-one mb-1">
                    Description
                  </p>
                  <p className="text-white font-one text-xs leading-relaxed">
                    {appointment.tattooDetail.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {appointment.tattooDetail.zone && (
                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <p className="text-white/60 text-xs font-one">Zone</p>
                    <p className="text-white font-one text-xs">
                      {appointment.tattooDetail.zone}
                    </p>
                  </div>
                )}

                {appointment.tattooDetail.size && (
                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <p className="text-white/60 text-xs font-one">Taille</p>
                    <p className="text-white font-one text-xs">
                      {appointment.tattooDetail.size}
                    </p>
                  </div>
                )}
              </div>

              {/* Prix */}
              {price > 0 && (
                <div className="bg-gradient-to-r from-tertiary-500/10 to-primary-500/10 rounded-lg p-2 border border-tertiary-400/20">
                  <div className="bg-white/5 rounded-md p-2 border border-white/5">
                    <p className="text-orange-400 font-one font-semibold text-xs">
                      💰 Prix : {price}€
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {/* {appointment.notes && (
          <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
            <h5 className="text-white font-one text-sm flex items-center gap-2 mb-3">
              <svg
                className="w-4 h-4 text-tertiary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Notes
            </h5>
            <div className="bg-white/5 rounded-lg p-2 border border-white/5">
              <p className="text-white/70 font-one text-xs leading-relaxed">
                {appointment.notes}
              </p>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}
