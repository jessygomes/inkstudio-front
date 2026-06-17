/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  getIncomingTeamRequestsAction,
  getLinkedSalonsAction,
  leaveCurrentSalonAction,
  respondToTeamRequestAction,
  type IncomingTeamRequest,
  type LinkedSalon,
} from "@/lib/queries/team-requests";

export default function IndependentTeamSection() {
  type PendingPermissionSelection = {
    allowSalonAgendaAccess: boolean | null;
    allowSalonCreateAppointments: boolean | null;
  };

  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<IncomingTeamRequest[]>([]);
  const [linkedSalons, setLinkedSalons] = useState<LinkedSalon[]>([]);
  const [isRespondingById, setIsRespondingById] = useState<Record<string, boolean>>({});
  const [isLeavingCurrentSalon, setIsLeavingCurrentSalon] = useState(false);
  const [permissionSelectionByRequestId, setPermissionSelectionByRequestId] = useState<
    Record<string, PendingPermissionSelection>
  >({});

  const currentLinkedSalons = useMemo(
    () => linkedSalons.filter((salon) => salon.isCurrentSalon === true),
    [linkedSalons],
  );

  const pendingCount = useMemo(
    () => requests.filter((request) => request.status === "PENDING").length,
    [requests],
  );

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      const [incomingResult, linkedResult] = await Promise.all([
        getIncomingTeamRequestsAction(),
        getLinkedSalonsAction(),
      ]);

      if (incomingResult.ok) {
        setRequests(incomingResult.requests);
      }

      if (linkedResult.ok) {
        setLinkedSalons(linkedResult.salons);
      }

      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleRespond = async (request: IncomingTeamRequest, action: "accept" | "refuse") => {
    setIsRespondingById((prev) => ({ ...prev, [request.id]: true }));

    try {
      const currentSelection = permissionSelectionByRequestId[request.id] ?? {
        allowSalonAgendaAccess: null,
        allowSalonCreateAppointments: null,
      };

      if (
        action === "accept" &&
        (currentSelection.allowSalonAgendaAccess === null ||
          currentSelection.allowSalonCreateAppointments === null)
      ) {
        toast.error(
          "Avant d'accepter, indiquez si le salon peut voir vos RDV et en créer pour vous.",
        );
        return;
      }

      const result = await respondToTeamRequestAction({
        requestId: request.id,
        action,
        allowSalonAgendaAccess:
          action === "accept"
            ? Boolean(currentSelection.allowSalonAgendaAccess)
            : undefined,
        allowSalonCreateAppointments:
          action === "accept"
            ? Boolean(currentSelection.allowSalonCreateAppointments)
            : undefined,
      });

      if (!result.ok) {
        toast.error(result.message || "Action impossible");
        return;
      }

      setRequests((prev) => prev.filter((item) => item.id !== request.id));
      setPermissionSelectionByRequestId((prev) => {
        const next = { ...prev };
        delete next[request.id];
        return next;
      });

      if (action === "accept") {
        setLinkedSalons((prev) => {
          const salonId = request.salon.id;
          if (prev.some((item) => item.id === salonId)) return prev;

          return [
            {
              id: salonId,
              salonName:
                request.salon.salonName ||
                `${request.salon.firstName || ""} ${request.salon.lastName || ""}`.trim() ||
                "Salon",
              profileImage: request.salon.image || null,
              image: request.salon.image || null,
              isCurrentSalon: true,
              linkedAt: new Date().toISOString(),
            },
            ...prev,
          ];
        });
      }

      toast.success(action === "accept" ? "Demande acceptée" : "Demande refusée");
    } finally {
      setIsRespondingById((prev) => ({ ...prev, [request.id]: false }));
    }
  };

  const handleLeaveCurrentSalon = async (salonId: string) => {
    setIsLeavingCurrentSalon(true);

    try {
      const result = await leaveCurrentSalonAction();

      if (!result.ok) {
        toast.error(result.message || "Impossible de quitter ce salon.");
        return;
      }

      setLinkedSalons((prev) => prev.filter((salon) => salon.id !== salonId));
      toast.success(result.message || "Vous avez quitté le salon.");
    } finally {
      setIsLeavingCurrentSalon(false);
    }
  };

  return (
    <>
      <div className="dashboard-embedded-panel p-3 sm:p-8">
        <h3 className="mb-3 text-sm uppercase tracking-widest text-white font-one">
          Salons reliés
        </h3>

        {isLoading ? (
          <p className="text-xs text-white/60 font-one">Chargement...</p>
        ) : currentLinkedSalons.length === 0 ? (
          <p className="text-xs text-white/60 font-one">Aucun salon relié pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {currentLinkedSalons.map((salon) => (
              <article
                key={salon.id}
                className="rounded-2xl border border-white/10 bg-white/6 p-3"
              >
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                  <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-white/10">
                    {salon.profileImage || salon.image ? (
                      <Image
                        src={salon.profileImage || salon.image || ""}
                        alt={salon.salonName || "Salon"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/50 text-xs font-one">
                        S
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm text-white font-one">
                        {salon.salonName || "Salon"}
                      </p>
                      {salon.isCurrentSalon && (
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-1.5 py-0.5 text-[9px] text-emerald-300 font-one">
                          Actuel
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/50 font-one">
                      {salon.city && salon.postalCode
                        ? `${salon.city} ${salon.postalCode}`
                        : `ID: ${salon.id}`}
                    </p>
                  </div>
                </div>

                  {salon.isCurrentSalon && (
                    <button
                      type="button"
                      disabled={isLeavingCurrentSalon}
                      onClick={() => handleLeaveCurrentSalon(salon.id)}
                      className="cursor-pointer rounded-2xl border border-red-500/35 bg-red-500/15 px-2.5 py-1 text-[10px] text-red-300 font-one transition-colors hover:bg-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLeavingCurrentSalon ? "Retrait..." : "Quitter ce salon"}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-embedded-panel p-3 sm:p-8">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm uppercase tracking-widest text-white font-one">
            Demandes d'équipe reçues
          </h3>
          <span className="rounded-full border border-tertiary-400/35 bg-tertiary-500/15 px-2 py-0.5 text-[10px] text-tertiary-500 font-one">
            {pendingCount} en attente
          </span>
        </div>

        {isLoading ? (
          <p className="text-xs text-white/60 font-one">Chargement...</p>
        ) : requests.length === 0 ? (
          <p className="text-xs text-white/60 font-one">Aucune demande en attente.</p>
        ) : (
          <div className="space-y-2.5">
            {requests.map((request) => {
              const isBusy = Boolean(isRespondingById[request.id]);
              const permissionSelection = permissionSelectionByRequestId[request.id] ?? {
                allowSalonAgendaAccess: null,
                allowSalonCreateAppointments: null,
              };
              const isAcceptDisabled =
                isBusy ||
                permissionSelection.allowSalonAgendaAccess === null ||
                permissionSelection.allowSalonCreateAppointments === null;
              const salonLabel =
                request.salon.salonName ||
                `${request.salon.firstName || ""} ${request.salon.lastName || ""}`.trim() ||
                "Salon";

              return (
                <article
                  key={request.id}
                  className="rounded-3xl border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.2)]"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex items-center gap-2.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-tertiary-400/85 to-tertiary-500/85 text-sm font-semibold text-white font-one shadow-lg shadow-tertiary-500/20">
                          {salonLabel.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <p className="truncate text-sm text-white font-one font-semibold">{salonLabel}</p>
                          <p className="text-[11px] text-white/50 font-one">
                            {request.createdAt
                              ? `Reçue le ${new Date(request.createdAt).toLocaleDateString("fr-FR")}`
                              : "Demande reçue"}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full border border-tertiary-400/30 bg-tertiary-500/15 px-2 py-0.5 text-[10px] text-tertiary-400 font-one">
                        Invitation
                      </span>
                    </div>

                    {request.message && (
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                        <p className="text-xs text-white/72 font-one leading-relaxed">
                          {request.message}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2 rounded-2xl border border-white/10 bg-white/4 p-3">
                      <div className="space-y-1.5">
                        <p className="text-[11px] text-white/70 font-one">
                          Le salon peut voir mon agenda et mes RDV ?
                        </p>
                        <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              setPermissionSelectionByRequestId((prev) => ({
                                ...prev,
                                [request.id]: {
                                  ...permissionSelection,
                                  allowSalonAgendaAccess: true,
                                },
                              }))
                            }
                            className={`cursor-pointer rounded-lg border px-3 py-1 text-[11px] font-one transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                              permissionSelection.allowSalonAgendaAccess === true
                                ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-200"
                                : "border-transparent bg-transparent text-white/70 hover:bg-white/12"
                            }`}
                          >
                            Oui
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              setPermissionSelectionByRequestId((prev) => ({
                                ...prev,
                                [request.id]: {
                                  ...permissionSelection,
                                  allowSalonAgendaAccess: false,
                                },
                              }))
                            }
                            className={`cursor-pointer rounded-lg border px-3 py-1 text-[11px] font-one transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                              permissionSelection.allowSalonAgendaAccess === false
                                ? "border-rose-500/40 bg-rose-500/20 text-rose-200"
                                : "border-transparent bg-transparent text-white/70 hover:bg-white/12"
                            }`}
                          >
                            Non
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[11px] text-white/70 font-one">
                          Le salon peut créer des RDV pour moi ?
                        </p>
                        <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              setPermissionSelectionByRequestId((prev) => ({
                                ...prev,
                                [request.id]: {
                                  ...permissionSelection,
                                  allowSalonCreateAppointments: true,
                                },
                              }))
                            }
                            className={`cursor-pointer rounded-lg border px-3 py-1 text-[11px] font-one transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                              permissionSelection.allowSalonCreateAppointments === true
                                ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-200"
                                : "border-transparent bg-transparent text-white/70 hover:bg-white/12"
                            }`}
                          >
                            Oui
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              setPermissionSelectionByRequestId((prev) => ({
                                ...prev,
                                [request.id]: {
                                  ...permissionSelection,
                                  allowSalonCreateAppointments: false,
                                },
                              }))
                            }
                            className={`cursor-pointer rounded-lg border px-3 py-1 text-[11px] font-one transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                              permissionSelection.allowSalonCreateAppointments === false
                                ? "border-rose-500/40 bg-rose-500/20 text-rose-200"
                                : "border-transparent bg-transparent text-white/70 hover:bg-white/12"
                            }`}
                          >
                            Non
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleRespond(request, "refuse")}
                        className="cursor-pointer rounded-xl border border-red-500/35 bg-red-500/15 px-3 py-1.5 text-[11px] text-red-300 font-one transition-colors hover:bg-red-500/25 disabled:opacity-50"
                      >
                        Refuser
                      </button>
                      <button
                        type="button"
                        disabled={isAcceptDisabled}
                        onClick={() => handleRespond(request, "accept")}
                        className="cursor-pointer rounded-xl border border-emerald-500/35 bg-emerald-500/15 px-3 py-1.5 text-[11px] text-emerald-300 font-one transition-colors hover:bg-emerald-500/25 disabled:opacity-50"
                      >
                        Accepter
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
