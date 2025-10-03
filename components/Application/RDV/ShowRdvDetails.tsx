/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
import React from "react";
import Image from "next/image";
import { CalendarEvent } from "./Calendar";
import ConfirmRdv from "./ConfirmRdv";
import UpdateRdv from "./UpdateRdv";
import CancelRdv from "./CancelRdv";
import ChangeRdv from "./ChangeRdv";
import ChangeStatusButtons from "./ChangeStatusButtons";
import SendMessageRdv from "./SendMessageRdv";
import { UpdateRdvFormProps } from "@/lib/type";
import { openImageInNewTab } from "@/lib/utils/openImage";
import Link from "next/link";

interface ShowRdvDetailsProps {
  selectedEvent: CalendarEvent;
  onClose: () => void;
  handleRdvUpdated: (rdvId: string) => void;
  handleStatusChange: (rdvId: string, status: "COMPLETED" | "NO_SHOW") => void;
  handlePaymentStatusChange: (rdvId: string, isPayed: boolean) => void;
  userId: string | null;
  price: number | undefined;
}

export default function ShowRdvDetails({
  selectedEvent,
  onClose,
  handleRdvUpdated,
  handleStatusChange,
  handlePaymentStatusChange,
  userId,
  price,
}: ShowRdvDetailsProps) {
  return (
    <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl h-full flex flex-col">
      {/* Header du panneau avec design compact */}
      <div className="relative p-4 border-b border-white/10 bg-gradient-to-r from-noir-700/80 to-noir-500/80">
        <div className="absolute inset-0 bg-gradient-to-r from-tertiary-400/5 to-transparent"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-tertiary-500 to-primary-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">
                {selectedEvent.client.firstName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h4 className="text-lg font-bold font-one text-white tracking-wide">
                {selectedEvent.client.firstName} {selectedEvent.client.lastName}{" "}
                -{" "}
              </h4>
              <p className="text-white/70 text-xs font-one">
                {selectedEvent.title} - {selectedEvent.client.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-1.5 hover:bg-white/10 rounded-lg transition-colors group"
          >
            <svg
              className="w-5 h-5 text-white/70 group-hover:text-white transition-colors"
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

      {/* Contenu scrollable avec design compact */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {/* Statut avec design compact */}
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
            {selectedEvent.status === "PENDING" ? (
              <div className="bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-400/30 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <span className="text-orange-300 font-medium font-one text-xs">
                    En attente de confirmation
                  </span>
                </div>
              </div>
            ) : selectedEvent.status === "CONFIRMED" ? (
              <div className="bg-gradient-to-r from-green-500/15 to-emerald-500/15 border border-green-400/30 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-300 font-medium font-one text-xs">
                    Confirmé
                  </span>
                </div>
              </div>
            ) : selectedEvent.status === "COMPLETED" ? (
              <div className="bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-400/30 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-emerald-300 font-medium font-one text-xs">
                    Complété
                  </span>
                </div>
              </div>
            ) : selectedEvent.status === "NO_SHOW" ? (
              <div className="bg-gradient-to-r from-amber-500/15 to-orange-600/15 border border-amber-400/30 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  <span className="text-amber-300 font-medium font-one text-xs">
                    Pas présenté
                  </span>
                </div>
              </div>
            ) : selectedEvent.status === "CANCELED" ? (
              <div className="bg-gradient-to-r from-red-500/15 to-rose-500/15 border border-red-400/30 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-red-300 font-medium font-one text-xs">
                    Annulé
                  </span>
                </div>
              </div>
            ) : selectedEvent.status === "RESCHEDULING" ? (
              <div className="bg-gradient-to-r from-blue-500/15 to-cyan-500/15 border border-blue-400/30 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-300 font-medium font-one text-xs">
                    En attente de reprogrammation
                  </span>
                </div>
                <p className="text-blue-200/80 text-xs font-one mt-1">
                  Le client doit choisir un nouveau créneau
                </p>
              </div>
            ) : null}
          </div>

          {/* Actions compactes */}
        </div>
        <div className="">
          <div className="flex items-center gap-1 flex-wrap">
            {/* Bouton Confirmer - pas pour CONFIRMED, RESCHEDULING, COMPLETED, NO_SHOW */}
            {selectedEvent.status !== "CONFIRMED" &&
              selectedEvent.status !== "RESCHEDULING" &&
              selectedEvent.status !== "COMPLETED" &&
              selectedEvent.status !== "NO_SHOW" && (
                <ConfirmRdv
                  rdvId={selectedEvent.id}
                  appointment={selectedEvent}
                  onConfirm={() => handleRdvUpdated(selectedEvent.id)}
                />
              )}

            {/* Bouton Modifier - pas pour RDV passés confirmés, COMPLETED, NO_SHOW */}
            {!(
              selectedEvent.status === "CONFIRMED" &&
              new Date(selectedEvent.end) < new Date()
            ) &&
              selectedEvent.status !== "COMPLETED" &&
              selectedEvent.status !== "NO_SHOW" && (
                <UpdateRdv
                  rdv={selectedEvent as unknown as UpdateRdvFormProps}
                  userId={userId || ""}
                  onUpdate={() => handleRdvUpdated(selectedEvent.id)}
                />
              )}

            {/* Bouton Notifier changement - pas pour RDV passés confirmés, COMPLETED, NO_SHOW */}
            {!(
              selectedEvent.status === "CONFIRMED" &&
              new Date(selectedEvent.end) < new Date()
            ) &&
              selectedEvent.status !== "COMPLETED" &&
              selectedEvent.status !== "NO_SHOW" && (
                <ChangeRdv
                  rdvId={selectedEvent.id}
                  appointment={selectedEvent}
                  userId={userId || ""}
                />
              )}

            {/* Bouton Annuler - pas pour CANCELED, RDV passés confirmés, COMPLETED, NO_SHOW */}
            {selectedEvent.status !== "CANCELED" &&
              selectedEvent.status !== "COMPLETED" &&
              selectedEvent.status !== "NO_SHOW" &&
              !(
                selectedEvent.status === "CONFIRMED" &&
                new Date(selectedEvent.end) < new Date()
              ) && (
                <CancelRdv
                  rdvId={selectedEvent.id}
                  appointment={selectedEvent}
                  onCancel={() => handleRdvUpdated(selectedEvent.id)}
                />
              )}

            {/* Boutons pour changer le statut - pour RDV confirmés passés, COMPLETED, NO_SHOW */}
            {((selectedEvent.status === "CONFIRMED" &&
              new Date(selectedEvent.end) < new Date()) ||
              selectedEvent.status === "COMPLETED" ||
              selectedEvent.status === "NO_SHOW") && (
              <ChangeStatusButtons
                rdvId={selectedEvent.id}
                currentStatus={selectedEvent.status}
                onStatusChange={handleStatusChange}
                size="sm"
              />
            )}

            {/* Bouton Message - disponible pour tous les rendez-vous sauf CANCELED */}
            {selectedEvent.status !== "CANCELED" && (
              <SendMessageRdv
                rdvId={selectedEvent.id}
                appointment={selectedEvent}
                onMessageSent={() => handleRdvUpdated(selectedEvent.id)}
              />
            )}
          </div>
        </div>

        {/* Informations principales compactes */}
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
                <div className="w-6 h-6 bg-blue-500/20 rounded-md flex items-center justify-center">
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
                    {new Date(selectedEvent.start).toLocaleDateString("fr-FR")}
                  </p>
                  <p className="text-white font-one text-xs">
                    {new Date(selectedEvent.start).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(selectedEvent.end).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-2 border border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-500/20 rounded-md flex items-center justify-center">
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
                      (new Date(selectedEvent.end).getTime() -
                        new Date(selectedEvent.start).getTime()) /
                        (1000 * 60)
                    )}{" "}
                    min
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-2 border border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500/20 rounded-md flex items-center justify-center">
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
                    {selectedEvent.prestation}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-2 border border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-500/20 rounded-md flex items-center justify-center">
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
                    {selectedEvent.tatoueur.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Visio si applicable */}
        {selectedEvent.visio && (
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-3 border border-blue-400/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-300 font-medium font-one text-xs">
                Rendez-vous en ligne
              </span>
            </div>
            <p className="text-blue-200/80 text-xs font-one mb-3">
              Ce rendez-vous se déroulera en visioconférence
            </p>

            {selectedEvent.visioRoom && (
              <Link
                href={`/meeting/${selectedEvent.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg text-blue-300 hover:text-blue-200 transition-colors text-xs font-one font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Rejoindre la salle de visio
              </Link>
            )}
          </div>
        )}

        {/* Statut de paiement compact */}
        {(selectedEvent.prestation === "RETOUCHE" ||
          selectedEvent.prestation === "TATTOO" ||
          selectedEvent.prestation === "PIERCING") && (
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
                <label className="flex items-center gap-2 cursor-pointer bg-white/5 rounded-lg p-2 border border-white/10 hover:bg-white/10 transition-colors flex-1">
                  <input
                    type="radio"
                    name={`payment-${selectedEvent.id}`}
                    checked={selectedEvent.isPayed === false}
                    onChange={() =>
                      handlePaymentStatusChange(selectedEvent.id, false)
                    }
                    className="w-3 h-3 text-red-500"
                  />
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                    <span className="text-red-400 text-xs font-one">
                      Non payé
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-white/5 rounded-lg p-2 border border-white/10 hover:bg-white/10 transition-colors flex-1">
                  <input
                    type="radio"
                    name={`payment-${selectedEvent.id}`}
                    checked={selectedEvent.isPayed === true}
                    onChange={() =>
                      handlePaymentStatusChange(selectedEvent.id, true)
                    }
                    className="w-3 h-3 text-green-500"
                  />
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-xs font-one">
                      Payé
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Détails du tattoo compact */}
        {(() => {
          const tattooDetail = selectedEvent.tattooDetail;

          return (
            <>
              {tattooDetail && (
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
                    Détails : {selectedEvent.prestation}
                  </h5>

                  <div className="space-y-2">
                    {tattooDetail.description && (
                      <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                        <p className="text-white/60 text-xs font-one mb-1">
                          Description
                        </p>
                        <p className="text-white font-one text-xs leading-relaxed">
                          {tattooDetail.description}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      {tattooDetail.zone && (
                        <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                          <p className="text-white/60 text-xs font-one">Zone</p>
                          <p className="text-white font-one text-xs">
                            {tattooDetail.zone}
                          </p>
                        </div>
                      )}

                      {tattooDetail.size && (
                        <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                          <p className="text-white/60 text-xs font-one">
                            Taille
                          </p>
                          <p className="text-white font-one text-xs">
                            {tattooDetail.size}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Images de référence compactes */}
                    {(tattooDetail.reference || tattooDetail.sketch) && (
                      <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                        <p className="text-white/60 text-xs font-one mb-2">
                          Images
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {tattooDetail.reference && (
                            <div
                              className="relative w-full h-32 bg-white/5 rounded-md border border-white/10 overflow-hidden group cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openImageInNewTab(tattooDetail.reference);
                              }}
                            >
                              <Image
                                src={tattooDetail.reference}
                                alt="Référence"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-200 pointer-events-none"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center pointer-events-none">
                                <svg
                                  className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </div>
                            </div>
                          )}
                          {tattooDetail.sketch && (
                            <div
                              className="relative w-full h-32 bg-white/5 rounded-md border border-white/10 overflow-hidden group cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openImageInNewTab(tattooDetail.sketch);
                              }}
                            >
                              <Image
                                src={tattooDetail.sketch}
                                alt="Croquis"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-200 pointer-events-none"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center pointer-events-none">
                                <svg
                                  className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Prix compact */}
                    {price !== undefined && price !== null && (
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
            </>
          );
        })()}
      </div>

      {/* Footer compact */}
      <div className="p-3 border-t border-white/10 bg-white/5">
        <button
          onClick={onClose}
          className="cursor-pointer w-full py-2 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one"
        >
          Retour à la liste
        </button>
      </div>
    </div>
  );
}
