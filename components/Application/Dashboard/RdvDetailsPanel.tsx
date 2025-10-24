"use client";
import Image from "next/image";
import Link from "next/link";
import ConfirmRdv from "../RDV/ConfirmRdv";
import CancelRdv from "../RDV/CancelRdv";
import UpdateRdv from "../RDV/UpdateRdv";
import ChangeStatusButtons from "../RDV/ChangeStatusButtons";
import SendMessageRdv from "../RDV/SendMessageRdv";
import ChangeRdv from "../RDV/ChangeRdv";
import { UpdateRdvFormProps } from "@/lib/type";
import { openImageInNewTab } from "@/lib/utils/openImage";
import { useScrollLock } from "@/lib/hook/useScrollLock";

interface Client {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Tatoueur {
  id: string;
  name: string;
  userId: string;
  img: string;
}

interface TattooDetail {
  description?: string;
  zone?: string;
  size?: string;
  colorStyle?: string;
  reference?: string;
  sketch?: string;
  estimatedPrice?: number;
  price?: number;
}

interface RendezVous {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CANCELED"
    | "RESCHEDULING"
    | "COMPLETED"
    | "NO_SHOW";
  prestation: string;
  client: Client;
  clientId: string;
  tatoueur: Tatoueur;
  tatoueurId: string;
  tattooDetail: TattooDetail;
  tattooDetailId: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isPayed?: boolean;
  visio?: boolean;
  visioRoom?: string;
}

interface RdvDetailsPanelProps {
  selectedAppointment: RendezVous;
  onClose: () => void;
  handleRdvUpdated: (updatedId: string) => void;
  handleStatusChange: (rdvId: string, status: "COMPLETED" | "NO_SHOW") => void;
  handlePaymentStatusChange: (rdvId: string, isPayed: boolean) => void;
  userId: string;
}

export default function RdvDetailsPanel({
  selectedAppointment,
  onClose,
  handleRdvUpdated,
  handleStatusChange,
  handlePaymentStatusChange,
  userId,
}: RdvDetailsPanelProps) {
  // Bloquer le scroll du body quand la modal est ouverte
  useScrollLock(true);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-noir-700 md:bg-gradient-to-br md:from-noir-700/70 md:via-noir-600/98 md:to-noir-500/70 md:backdrop-blur-md md:flex md:items-center md:justify-center lg:absolute lg:inset-0 lg:bg-transparent lg:rounded-xl flex flex-col animate-in slide-in-from-bottom-4 lg:slide-in-from-right-4 duration-300 overflow-hidden"
      style={{
        height: "100dvh",
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 50,
      }}
    >
      <div className="h-full w-full md:h-fit md:w-[70%] md:max-h-[85vh] lg:w-full lg:h-full bg-noir-700 md:bg-gradient-to-br md:from-noir-700/95 md:to-noir-600/95 lg:bg-gradient-to-br lg:from-noir-700/95 lg:to-noir-600/95 lg:backdrop-blur-sm rounded-none md:rounded-xl lg:rounded-xl flex flex-col border-0 md:border md:border-white/20 lg:border lg:border-white/20 md:shadow-2xl lg:shadow-2xl min-h-0">
        {/* Header du panneau */}
        <div className="relative p-4 border-b border-white/10 bg-noir-700 md:bg-gradient-to-r md:from-noir-700/80 md:to-noir-500/80 lg:bg-gradient-to-r lg:from-noir-700/80 lg:to-noir-500/80 md:rounded-t-xl lg:rounded-t-xl">
          <div className="absolute inset-0 bg-transparent md:bg-gradient-to-r md:from-tertiary-400/5 md:to-transparent lg:bg-gradient-to-r lg:from-tertiary-400/5 lg:to-transparent md:rounded-t-xl lg:rounded-t-xl"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-tertiary-500 to-tertiary-400 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">
                  {selectedAppointment.client.firstName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h4 className="text-lg font-bold font-one text-white tracking-wide">
                  {selectedAppointment.client.firstName}{" "}
                  {selectedAppointment.client.lastName}
                </h4>
                <p className="text-white/70 text-sm lg:text-xs font-one">
                  {selectedAppointment.title}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer p-2 lg:p-1.5 hover:bg-white/10 rounded-lg transition-colors group"
            >
              <svg
                className="w-6 h-6 lg:w-5 lg:h-5 text-white/70 group-hover:text-white transition-colors"
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

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent bg-noir-700">
          {/* Statut */}
          <div className="bg-gradient-to-r from-white/8 to-white/4 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-white font-one text-sm flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-tertiary-500"
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
              {selectedAppointment.status === "PENDING" ? (
                <div className="bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-400/30 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                    <span className="text-orange-300 font-medium font-one text-xs">
                      En attente de confirmation
                    </span>
                  </div>
                </div>
              ) : selectedAppointment.status === "CONFIRMED" ? (
                <div className="bg-gradient-to-r from-green-500/15 to-emerald-500/15 border border-green-400/30 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-300 font-medium font-one text-xs">
                      Confirmé
                    </span>
                  </div>
                </div>
              ) : selectedAppointment.status === "COMPLETED" ? (
                <div className="bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-400/30 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span className="text-emerald-300 font-medium font-one text-xs">
                      Complété
                    </span>
                  </div>
                </div>
              ) : selectedAppointment.status === "NO_SHOW" ? (
                <div className="bg-gradient-to-r from-amber-500/15 to-orange-600/15 border border-amber-400/30 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="text-amber-300 font-medium font-one text-xs">
                      Pas présenté
                    </span>
                  </div>
                </div>
              ) : selectedAppointment.status === "CANCELED" ? (
                <div className="bg-gradient-to-r from-red-500/15 to-rose-500/15 border border-red-400/30 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="text-red-300 font-medium font-one text-xs">
                      Annulé
                    </span>
                  </div>
                </div>
              ) : selectedAppointment.status === "RESCHEDULING" ? (
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
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-wrap">
            {/* Bouton Confirmer */}
            {selectedAppointment.status !== "CONFIRMED" &&
              selectedAppointment.status !== "RESCHEDULING" &&
              selectedAppointment.status !== "COMPLETED" &&
              selectedAppointment.status !== "NO_SHOW" && (
                <ConfirmRdv
                  rdvId={selectedAppointment.id}
                  appointment={selectedAppointment}
                  onConfirm={() => handleRdvUpdated(selectedAppointment.id)}
                />
              )}

            {/* Bouton Modifier */}
            {!(
              selectedAppointment.status === "CONFIRMED" &&
              new Date(selectedAppointment.end) < new Date()
            ) &&
              selectedAppointment.status !== "COMPLETED" &&
              selectedAppointment.status !== "NO_SHOW" && (
                <UpdateRdv
                  rdv={selectedAppointment as unknown as UpdateRdvFormProps}
                  userId={userId}
                  onUpdate={() => handleRdvUpdated(selectedAppointment.id)}
                />
              )}

            <ChangeRdv
              rdvId={selectedAppointment.id}
              userId={userId}
              appointment={selectedAppointment}
            />

            {/* Bouton Annuler */}
            {selectedAppointment.status !== "CANCELED" &&
              selectedAppointment.status !== "COMPLETED" &&
              selectedAppointment.status !== "NO_SHOW" &&
              !(
                selectedAppointment.status === "CONFIRMED" &&
                new Date(selectedAppointment.end) < new Date()
              ) && (
                <CancelRdv
                  rdvId={selectedAppointment.id}
                  appointment={selectedAppointment}
                  onCancel={() => handleRdvUpdated(selectedAppointment.id)}
                />
              )}

            {/* Boutons pour changer le statut */}
            {((selectedAppointment.status === "CONFIRMED" &&
              new Date(selectedAppointment.end) < new Date()) ||
              selectedAppointment.status === "COMPLETED" ||
              selectedAppointment.status === "NO_SHOW") && (
              <ChangeStatusButtons
                rdvId={selectedAppointment.id}
                currentStatus={selectedAppointment.status}
                onStatusChange={handleStatusChange}
                size="sm"
              />
            )}

            {/* Bouton Message */}
            {selectedAppointment.status !== "CANCELED" && (
              <SendMessageRdv
                rdvId={selectedAppointment.id}
                appointment={selectedAppointment}
                onMessageSent={() => handleRdvUpdated(selectedAppointment.id)}
              />
            )}
          </div>

          {/* Informations principales */}
          <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
            <h5 className="text-white font-one text-sm flex items-center gap-2 mb-3">
              <svg
                className="w-4 h-4 text-tertiary-500"
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-one">Heure</p>
                    <p className="text-white font-one text-xs">
                      {formatTime(selectedAppointment.start)} -{" "}
                      {formatTime(selectedAppointment.end)}
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
                      {calculateDuration(
                        selectedAppointment.start,
                        selectedAppointment.end
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
                      {selectedAppointment.prestation}
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
                      {selectedAppointment.tatoueur.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Visio si applicable */}
          {selectedAppointment.visio && (
            <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
              <h5 className="text-white font-one text-sm flex items-center gap-2 mb-3">
                <svg
                  className="w-4 h-4 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Visioconférence
              </h5>

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

                {selectedAppointment.visioRoom && (
                  <Link
                    href={`/meeting/${selectedAppointment.id}`}
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
            </div>
          )}

          {/* Statut de paiement */}
          {(selectedAppointment.prestation === "RETOUCHE" ||
            selectedAppointment.prestation === "TATTOO" ||
            selectedAppointment.prestation === "PIERCING") && (
            <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
              <h5 className="text-white font-one text-sm flex items-center gap-2 mb-3">
                <svg
                  className="w-4 h-4 text-tertiary-500"
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
                      name={`payment-${selectedAppointment.id}`}
                      checked={selectedAppointment.isPayed === false}
                      onChange={() =>
                        handlePaymentStatusChange(selectedAppointment.id, false)
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
                      name={`payment-${selectedAppointment.id}`}
                      checked={selectedAppointment.isPayed === true}
                      onChange={() =>
                        handlePaymentStatusChange(selectedAppointment.id, true)
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

          {/* Détails du tattoo */}
          {selectedAppointment.tattooDetail && (
            <div className="bg-gradient-to-br from-white/6 to-white/3 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
              <h5 className="text-white font-one text-sm flex items-center gap-2 mb-3">
                <svg
                  className="w-4 h-4 text-tertiary-500"
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
                Détails : {selectedAppointment.prestation}
              </h5>

              <div className="space-y-2">
                {selectedAppointment.tattooDetail.description && (
                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <p className="text-white/60 text-xs font-one mb-1">
                      Description
                    </p>
                    <p className="text-white font-one text-xs leading-relaxed">
                      {selectedAppointment.tattooDetail.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {selectedAppointment.tattooDetail.zone && (
                    <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                      <p className="text-white/60 text-xs font-one">Zone</p>
                      <p className="text-white font-one text-xs">
                        {selectedAppointment.tattooDetail.zone}
                      </p>
                    </div>
                  )}

                  {selectedAppointment.tattooDetail.size && (
                    <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                      <p className="text-white/60 text-xs font-one">Taille</p>
                      <p className="text-white font-one text-xs">
                        {selectedAppointment.tattooDetail.size}
                      </p>
                    </div>
                  )}
                </div>

                {/* Images de référence */}
                {(selectedAppointment.tattooDetail.reference ||
                  selectedAppointment.tattooDetail.sketch) && (
                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <p className="text-white/60 text-xs font-one mb-2">
                      Images
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedAppointment.tattooDetail.reference && (
                        <div
                          className="relative w-full h-16 bg-white/5 rounded-md border border-white/10 overflow-hidden group cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openImageInNewTab(
                              selectedAppointment.tattooDetail.reference!
                            );
                          }}
                        >
                          <Image
                            src={selectedAppointment.tattooDetail.reference}
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
                      {selectedAppointment.tattooDetail.sketch && (
                        <div
                          className="relative w-full h-16 bg-white/5 rounded-md border border-white/10 overflow-hidden group cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openImageInNewTab(
                              selectedAppointment.tattooDetail.sketch!
                            );
                          }}
                        >
                          <Image
                            src={selectedAppointment.tattooDetail.sketch}
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

                {/* Prix */}
                {((selectedAppointment.tattooDetail.estimatedPrice !==
                  undefined &&
                  selectedAppointment.tattooDetail.estimatedPrice !== null &&
                  selectedAppointment.tattooDetail.estimatedPrice > 0) ||
                  (selectedAppointment.tattooDetail.price !== undefined &&
                    selectedAppointment.tattooDetail.price !== null &&
                    selectedAppointment.tattooDetail.price > 0)) && (
                  <div className="bg-gradient-to-r from-tertiary-500/10 to-primary-500/10 rounded-lg p-2 border border-tertiary-400/20">
                    <div className="flex gap-2">
                      {selectedAppointment.tattooDetail.estimatedPrice !==
                        undefined &&
                        selectedAppointment.tattooDetail.estimatedPrice !==
                          null &&
                        selectedAppointment.tattooDetail.estimatedPrice > 0 && (
                          <div className="bg-white/5 rounded-md p-2 border border-white/5 flex-1">
                            <p className="text-orange-400 font-one font-semibold text-xs">
                              💰 Prix estimé :{" "}
                              {selectedAppointment.tattooDetail.estimatedPrice}€
                            </p>
                          </div>
                        )}
                      {selectedAppointment.tattooDetail.price !== undefined &&
                        selectedAppointment.tattooDetail.price !== null &&
                        selectedAppointment.tattooDetail.price > 0 && (
                          <div className="bg-white/5 rounded-md p-2 border border-white/5 flex-1">
                            <p className="text-green-400 font-one font-semibold text-xs">
                              ✅ Prix final :{" "}
                              {selectedAppointment.tattooDetail.price}€
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-white/5 lg:rounded-b-xl">
          <button
            onClick={onClose}
            className="cursor-pointer w-full py-2 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    </div>
  );
}
