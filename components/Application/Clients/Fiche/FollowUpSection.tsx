"use client";
import React, { useState } from "react";
import { MdOutlineRateReview } from "react-icons/md";
import Image from "next/image";
import { AppointmentProps, ClientProps } from "@/lib/type";
import { fetchAppointmentById } from "@/lib/queries/appointment";

interface FollowUpSectionProps {
  followUpSubmissions: ClientProps["FollowUpSubmission"] | undefined;
}

type FollowUpItem = NonNullable<ClientProps["FollowUpSubmission"]>[number];

export default function FollowUpSection({
  followUpSubmissions,
}: FollowUpSectionProps) {
  const [appointmentDetailsById, setAppointmentDetailsById] = useState<
    Record<string, AppointmentProps>
  >({});
  const [expandedFollowUps, setExpandedFollowUps] = useState<Set<string>>(new Set());
  const [loadingAppointmentIds, setLoadingAppointmentIds] = useState<Set<string>>(new Set());
  const [appointmentErrorById, setAppointmentErrorById] = useState<Record<string, string>>({});

  const toggleRelatedAppointment = async (followUpId: string, appointmentId: string) => {
    const isOpen = expandedFollowUps.has(followUpId);

    setExpandedFollowUps((prev) => {
      const next = new Set(prev);
      if (isOpen) {
        next.delete(followUpId);
      } else {
        next.add(followUpId);
      }
      return next;
    });

    if (isOpen || appointmentDetailsById[appointmentId] || loadingAppointmentIds.has(appointmentId)) {
      return;
    }

    setLoadingAppointmentIds((prev) => {
      const next = new Set(prev);
      next.add(appointmentId);
      return next;
    });

    setAppointmentErrorById((prev) => {
      const next = { ...prev };
      delete next[appointmentId];
      return next;
    });

    try {
      const result = await fetchAppointmentById(appointmentId);
      const appointment = (result?.appointment ?? result) as AppointmentProps | null;

      if (appointment) {
        setAppointmentDetailsById((prev) => ({
          ...prev,
          [appointmentId]: appointment,
        }));
      } else {
        setAppointmentErrorById((prev) => ({
          ...prev,
          [appointmentId]: "Rendez-vous introuvable.",
        }));
      }
    } catch (error) {
      console.error("Erreur lors du chargement du rendez-vous associé:", error);
      setAppointmentErrorById((prev) => ({
        ...prev,
        [appointmentId]: "Impossible de charger le rendez-vous associé.",
      }));
    } finally {
      setLoadingAppointmentIds((prev) => {
        const next = new Set(prev);
        next.delete(appointmentId);
        return next;
      });
    }
  };

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

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-4 border border-white/10 shadow-lg">

      {followUpSubmissions && followUpSubmissions.length > 0 ? (
        <div className="space-y-3">
          {followUpSubmissions.map((followUp: FollowUpItem, index: number) => {
            const appointmentId = followUp.appointmentId;
            const isAppointmentLoading = appointmentId ? loadingAppointmentIds.has(appointmentId) : false;
            const appointmentError = appointmentId ? appointmentErrorById[appointmentId] : undefined;
            const linkedAppointment = appointmentId ? appointmentDetailsById[appointmentId] : undefined;
            const isExpanded = expandedFollowUps.has(followUp.id);

            const projectDescription =
              linkedAppointment?.tattooDetail?.description || linkedAppointment?.description || "Non renseignée";
            const projectPrice =
              linkedAppointment?.tattooDetail?.price ??
              linkedAppointment?.tattooDetail?.estimatedPrice ??
              linkedAppointment?.estimatedPrice;
            const projectZone = linkedAppointment
              ? linkedAppointment.prestation === "PIERCING"
                ? linkedAppointment.tattooDetail?.piercingZone || linkedAppointment.tattooDetail?.zone || linkedAppointment.zone
                : linkedAppointment.tattooDetail?.zone || linkedAppointment.zone
              : undefined;
            const projectSize = linkedAppointment
              ? linkedAppointment.tattooDetail?.size ||
                (typeof linkedAppointment.size === "number" ? String(linkedAppointment.size) : linkedAppointment.size) ||
                "Non renseignée"
              : "Non renseignée";

            return (
              <div
                key={followUp.id}
                className="overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-r from-white/10 via-white/5 to-transparent p-3 transition-all duration-200 hover:border-tertiary-400/35"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="h-12 w-12 rounded-2xl overflow-hidden bg-white/10 border border-white/20 flex-shrink-0">
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
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h4 className="text-white font-one font-semibold text-sm sm:text-[15px]">
                          Suivi #{index + 1}
                        </h4>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                            followUp.isAnswered ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"
                          }`}
                        >
                          {followUp.isAnswered ? "Répondu" : "En attente"}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                            followUp.isPhotoPublic
                              ? "border-blue-400/30 bg-blue-500/15 text-blue-300"
                              : "border-white/15 bg-white/8 text-white/70"
                          }`}
                        >
                          {followUp.isPhotoPublic ? "Photo publique" : "Photo privée"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-white/70 font-one">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {new Date(followUp.createdAt).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[11px] text-white/75">
                          {getRatingStars(followUp.rating)}
                        </span>
                        <span className="text-[11px] text-white/55">{getRatingLabel(followUp.rating)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    {followUp.photoUrl && (
                      <button
                        onClick={() => window.open(followUp.photoUrl, "_blank")}
                        className="cursor-pointer rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-[11px] font-one text-white/80 transition-colors hover:border-tertiary-400/30 hover:text-white"
                      >
                        Voir la photo
                      </button>
                    )}
                    <button
                      onClick={() => toggleRelatedAppointment(followUp.id, appointmentId!)}
                      className="cursor-pointer rounded-full border border-tertiary-400/30 bg-tertiary-500/15 px-3 py-1.5 text-[11px] font-one text-tertiary-400 transition-colors hover:text-tertiary-500"
                    >
                      {isExpanded ? "Masquer le rdv associé" : "Voir le rdv associé"}
                    </button>
                  </div>
                </div>

                {followUp.review && (
                  <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="mb-1 text-[10px] uppercase tracking-wide text-white/45 font-one">Avis client</p>
                    <p className="text-xs italic leading-relaxed text-white/80 font-two">
                      &quot;{followUp.review}&quot;
                    </p>
                  </div>
                )}

                {appointmentId && isExpanded && (
                  <div className="mt-3 border-t border-white/10 pt-3">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-one uppercase tracking-wide text-white/45">RDV associé</p>
                        {isAppointmentLoading && <span className="text-[10px] text-white/60 font-one">Chargement...</span>}
                      </div>

                      {appointmentError && <p className="text-xs text-red-300 font-one">{appointmentError}</p>}

                      {linkedAppointment && !isAppointmentLoading && (
                        <>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-white font-one truncate">{linkedAppointment.title}</p>
                            <span className="rounded-2xl border border-tertiary-400/30 bg-tertiary-500/15 px-2 py-0.5 text-[10px] font-semibold text-white">
                              {linkedAppointment.prestation}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="rounded-2xl border border-white/10 bg-white/5 px-2.5 py-2 sm:col-span-2">
                              <p className="text-[10px] uppercase tracking-wide text-white/50 font-one">Description</p>
                              <p className="text-xs text-white/85 font-two leading-relaxed">{projectDescription}</p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 px-2.5 py-2">
                              <p className="text-[10px] uppercase tracking-wide text-white/50 font-one">Prix</p>
                              <p className="text-xs text-white/85 font-two">
                                {projectPrice != null ? `${projectPrice} EUR` : "Non renseigné"}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 px-2.5 py-2">
                              <p className="text-[10px] uppercase tracking-wide text-white/50 font-one">Date</p>
                              <p className="text-xs text-white/85 font-two">
                                {new Date(linkedAppointment.start).toLocaleDateString("fr-FR", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 px-2.5 py-2">
                              <p className="text-[10px] uppercase tracking-wide text-white/50 font-one">Horaire</p>
                              <p className="text-xs text-white/85 font-two">
                                {new Date(linkedAppointment.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                {" - "}
                                {new Date(linkedAppointment.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 px-2.5 py-2">
                              <p className="text-[10px] uppercase tracking-wide text-white/50 font-one">
                                {linkedAppointment.prestation === "PIERCING" ? "Zone de piercing" : "Zone"}
                              </p>
                              <p className="text-xs text-white/85 font-two">{projectZone || "Non renseignée"}</p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 px-2.5 py-2">
                              <p className="text-[10px] uppercase tracking-wide text-white/50 font-one">Taille</p>
                              <p className="text-xs text-white/85 font-two">{projectSize}</p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 px-2.5 py-2">
                              <p className="text-[10px] uppercase tracking-wide text-white/50 font-one">Tatoueur</p>
                              <p className="text-xs text-white/85 font-two">{linkedAppointment.tatoueur?.name || "Non renseigné"}</p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/5 px-2.5 py-2">
                              <p className="text-[10px] uppercase tracking-wide text-white/50 font-one">Statut</p>
                              <p className="text-xs text-white/85 font-two">{linkedAppointment.status}</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-tertiary-400/20 to-tertiary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-tertiary-400/20">
            <MdOutlineRateReview className="w-6 h-6 text-tertiary-400" />
          </div>
          <p className="text-white/60 text-sm font-one">Aucun suivi de cicatrisation</p>
        </div>
      )}
    </div>
  );
}
