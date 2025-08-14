/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { TatoueurProps } from "../../MonCompte/TatoueurSalon";
import { TimeSlotProps } from "@/lib/type";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { proposeCreneauSchema } from "@/lib/zod/validator.schema";
import { AppointmentRequest, Availability } from "../DemandeRdvClient";
import { z } from "zod";
import { addMinutes, format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatTime, formatDate } from "@/lib/utils";

export default function ProposeCreneau({
  userId,
  demande,
  onUpdate,
}: {
  userId: string;
  demande: AppointmentRequest;
  onUpdate?: () => void;
}) {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Liste & sélection tatoueur
  const [tatoueurs, setTatoueurs] = useState<TatoueurProps[]>([]);

  // Créneaux
  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>(
    []
  );
  const [occupiedSlots, setOccupiedSlots] = useState<TimeSlotProps[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  // Date UI (yyyy-MM-dd) pour l'input et les fetch
  const [selectedDateStr, setSelectedDateStr] = useState("");

  // -------- utils
  const toObject = <T extends object>(val: unknown): T => {
    if (!val) return {} as T;
    if (typeof val === "string") {
      try {
        return JSON.parse(val) as T;
      } catch {
        return {} as T;
      }
    }
    if (typeof val === "object") return val as T;
    return {} as T;
  };
  const av = toObject<Availability>(demande.availability);
  const primary = av?.primary;
  const alternative = av?.alternative;

  // -------- form
  const form = useForm<z.infer<typeof proposeCreneauSchema>>({
    resolver: zodResolver(proposeCreneauSchema),
    defaultValues: {
      proposedDate: "", // sera set en ISO lors du change de date
      proposedFrom: "", // sera set par selectedSlots
      proposedTo: "", // sera set par selectedSlots
      tatoueurId: "",
      message: "",
    },
  });

  const watchTatoueurId = form.watch("tatoueurId");
  const watchMessage = form.watch("message");

  // fetch tatoueurs
  useEffect(() => {
    const fetchTatoueurs = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs/user/${userId}`
      );
      const data = await response.json();
      setTatoueurs(data);
    };
    fetchTatoueurs();
  }, [userId]);

  // Fetch créneaux horaires quand tatoueur + date changent
  useEffect(() => {
    if (!selectedDateStr || !watchTatoueurId) {
      setTimeSlots([]);
      setOccupiedSlots([]);
      return;
    }

    const fetchSlots = async () => {
      try {
        // 1) créneaux dispo
        const slotsRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/timeslots/tatoueur?date=${selectedDateStr}&tatoueurId=${watchTatoueurId}`
        );
        const slotsData = await slotsRes.json();
        setTimeSlots(slotsData);

        // 2) créneaux occupés de la journée
        const startOfDay = new Date(`${selectedDateStr}T00:00:00`);
        const endOfDay = new Date(`${selectedDateStr}T23:59:59`);
        const occupiedRes = await fetch(
          `${
            process.env.NEXT_PUBLIC_BACK_URL
          }/appointments/tatoueur-range?tatoueurId=${watchTatoueurId}&start=${startOfDay.toISOString()}&end=${endOfDay.toISOString()}`
        );
        const occupiedData = await occupiedRes.json();
        setOccupiedSlots(occupiedData);
      } catch (error) {
        console.error("Erreur lors de la récupération des créneaux :", error);
        setTimeSlots([]);
        setOccupiedSlots([]);
      }
    };

    fetchSlots();
  }, [selectedDateStr, watchTatoueurId]);

  // Mettre à jour proposedFrom / proposedTo quand les slots changent
  useEffect(() => {
    if (selectedSlots.length === 0) {
      form.setValue("proposedFrom", "", { shouldValidate: true });
      form.setValue("proposedTo", "", { shouldValidate: true });
      return;
    }

    const sorted = selectedSlots
      .map((s) => new Date(s))
      .sort((a, b) => a.getTime() - b.getTime());

    const newStart = sorted[0].toISOString();
    const newEnd = addMinutes(sorted[sorted.length - 1], 30).toISOString();

    form.setValue("proposedFrom", newStart, { shouldValidate: true });
    form.setValue("proposedTo", newEnd, { shouldValidate: true });
  }, [selectedSlots, form]);

  // Reset quand la demande change
  useEffect(() => {
    if (demande) {
      form.reset({
        proposedDate: "",
        proposedFrom: "",
        proposedTo: "",
        tatoueurId: "",
        message: "",
      });
      setSelectedSlots([]);
      setSelectedDateStr("");
      setError(null);
    }
  }, [demande, form]);

  // -------- submit
  const mutation = useMutation({
    mutationFn: async (proposeData: z.infer<typeof proposeCreneauSchema>) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/appointment-request/propose-slot/${demande.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(proposeData),
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.message || "Erreur inconnue");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demandes"] });
      setShowModal(false);
      setError(null);
      setLoading(false);
      toast.success("Proposition envoyée avec succès !");
      onUpdate?.();
    },
    onError: (error: any) => {
      setError(error.message);
      setLoading(false);
      toast.error(`Erreur : ${error.message}`);
    },
  });

  const onSubmit = async (data: z.infer<typeof proposeCreneauSchema>) => {
    if (loading || mutation.isPending) return;
    setError(null);
    setLoading(true);

    try {
      // À ce stade, proposedFrom/proposedTo/proposedDate sont déjà set dans le form
      // (grâce aux useEffect ci-dessus). On peut envoyer tel quel.
      // Si besoin, on peut forcer un reformatage ici.

      // Validation finale (facultative car handleSubmit a déjà validé)
      const isValid = await form.trigger();
      if (!isValid) {
        setError("Merci de corriger les erreurs.");
        setLoading(false);
        return;
      }

      mutation.mutate(data);
    } catch (err: unknown) {
      console.error("❌ Erreur dans onSubmit :", err);
      const msg =
        err instanceof Error ? err.message : "Une erreur est survenue.";
      setError(msg);
      setLoading(false);
      toast.error(`Erreur : ${msg}`);
    }
  };

  // Slots consécutifs
  const handleSlotClick = (slotStart: string) => {
    if (selectedSlots.includes(slotStart)) {
      const newSelection = selectedSlots.filter((s) => s !== slotStart);
      const timestamps = newSelection.map((s) => new Date(s).getTime()).sort();
      const areConsecutive = timestamps.every((time, i) => {
        if (i === 0) return true;
        return time - timestamps[i - 1] === 30 * 60 * 1000;
      });
      if (areConsecutive || newSelection.length <= 1) {
        setSelectedSlots(newSelection);
      } else {
        alert("Les créneaux restants ne sont plus consécutifs.");
      }
      return;
    }
    const newSelection = [...selectedSlots, slotStart]
      .filter((s, i, arr) => arr.indexOf(s) === i)
      .sort();
    const timestamps = newSelection.map((s) => new Date(s).getTime());
    const areConsecutive = timestamps.every((time, i) => {
      if (i === 0) return true;
      return time - timestamps[i - 1] === 30 * 60 * 1000;
    });
    if (areConsecutive) {
      setSelectedSlots(newSelection);
    } else {
      alert("Les créneaux doivent être consécutifs.");
    }
  };

  return (
    <div>
      <button
        onClick={() => {
          setError(null);
          setLoading(false);
          setShowModal(true);
        }}
        disabled={loading || mutation.isPending}
        className="cursor-pointer px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-600/30 rounded-lg text-xs font-one font-medium transition-colors flex items-center gap-1 disabled:opacity-60"
      >
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
            d="M12 8v4m0 0l3 3m-3-3l-3 3"
          />
        </svg>
        Proposer un créneau
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-noir-700 rounded-lg backdrop-blur-sm flex items-center justify-center">
          <div className="bg-noir-500 h-full rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white font-one tracking-wide">
                  Proposer un créneau
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <span className="cursor-pointer text-white text-xl">×</span>
                </button>
              </div>
              <p className="text-white/70 mt-1 text-sm">
                Proposer un créneau pour {demande.clientFirstname}{" "}
                {demande.clientLastname}
              </p>
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Récap client */}
              {demande && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold">
                        {demande.clientFirstname?.charAt(0).toUpperCase() ||
                          "?"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-one font-semibold mb-1">
                        {demande.clientFirstname} {demande.clientLastname}
                      </h3>

                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-white/60 text-xs font-one mb-2">
                          Disponibilités du client
                        </p>
                        <div className="space-y-2">
                          {primary?.date && (
                            <div className="flex items-center gap-2 text-xs text-white/80 font-one">
                              <span className="font-semibold text-blue-400">
                                Primaire :
                              </span>
                              <span>
                                {formatDate(primary.date)}
                                {primary.from && (
                                  <>{` ${formatTime(primary.from)}`}</>
                                )}
                                {primary.to && <> – {formatTime(primary.to)}</>}
                              </span>
                            </div>
                          )}
                          {alternative?.date && (
                            <div className="flex items-center gap-2 text-xs text-white/80 font-one">
                              <span className="font-semibold text-purple-400">
                                Alternative :
                              </span>
                              <span>
                                {formatDate(alternative.date)}
                                {alternative.from && (
                                  <>{` ${formatTime(alternative.from)}`}</>
                                )}
                                {alternative.to && (
                                  <> – {formatTime(alternative.to)}</>
                                )}
                              </span>
                            </div>
                          )}
                          {!primary?.date && !alternative?.date && (
                            <div className="text-xs text-white/50 font-one">
                              Aucune disponibilité renseignée.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-white/60 text-xs font-one">
                          Prestation
                        </p>
                        <p className="text-white font-one">
                          {demande.prestation}
                        </p>
                      </div>

                      {demande.clientEmail && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-white/60 text-xs font-one">
                            Contact
                          </p>
                          <div className="grid grid-cols-2">
                            <p className="text-white/80 text-xs font-one">
                              {demande.clientEmail}
                            </p>
                            {demande.clientPhone && (
                              <p className="text-white/80 text-xs font-one">
                                {demande.clientPhone}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <form
                id="propose-creneau-form"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                {/* Tatoueur */}
                <div className="space-y-1 mb-4">
                  <label className="text-xs text-white/70 font-one">
                    Tatoueur
                  </label>
                  <select
                    value={watchTatoueurId || ""}
                    onChange={(e) =>
                      form.setValue("tatoueurId", e.target.value, {
                        shouldValidate: true,
                      })
                    }
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                    required
                  >
                    <option value="">Sélectionner un tatoueur</option>
                    {tatoueurs.map((tatoueur) => (
                      <option
                        key={tatoueur.id}
                        value={tatoueur.id}
                        className="bg-primary-500"
                      >
                        {tatoueur.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-1 mb-4">
                  <label className="text-xs text-white/70 font-one">Date</label>
                  <input
                    type="date"
                    value={selectedDateStr}
                    onChange={(e) => {
                      const val = e.target.value; // yyyy-MM-dd
                      setSelectedDateStr(val);
                      // On stocke en ISO dans le form (comme UpdateRdv)
                      const iso = new Date(`${val}T00:00:00`).toISOString();
                      form.setValue("proposedDate", iso, {
                        shouldValidate: true,
                      });
                      setSelectedSlots([]);
                    }}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                    required
                  />
                </div>

                {/* Sélection des créneaux */}
                <div className="space-y-1 my-4">
                  <label className="text-xs text-white/70 font-one">
                    Sélectionnez les créneaux (30 min)
                  </label>
                  <p className="text-xs text-white/50">
                    Cliquez sur les créneaux pour les sélectionner. Ils doivent
                    être consécutifs.
                  </p>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
                  {timeSlots.map((slot) => {
                    const slotTime = new Date(slot.start).getTime();
                    const isTaken = occupiedSlots.some((rdvOcc) => {
                      const start = new Date(rdvOcc.start).getTime();
                      const end = new Date(rdvOcc.end).getTime();
                      return slotTime >= start && slotTime < end;
                    });
                    const isSelected = selectedSlots.includes(slot.start);
                    const disabled = isTaken;
                    return (
                      <button
                        key={slot.start}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleSlotClick(slot.start)}
                        className={`p-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                          disabled
                            ? "bg-gray-500/20 text-gray-400 cursor-not-allowed border border-gray-500/30"
                            : isSelected
                            ? "bg-tertiary-500 text-white border border-tertiary-400"
                            : "bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-tertiary-400/50"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-xs">
                            {format(new Date(slot.start), "HH:mm", {
                              locale: fr,
                            })}
                          </div>
                          <div className="text-xs opacity-70">-</div>
                          <div className="text-xs">
                            {format(new Date(slot.end), "HH:mm", {
                              locale: fr,
                            })}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Message */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
                  <h3 className="text-white font-semibold font-one mb-3 text-sm">
                    💬 Message de confirmation
                  </h3>
                  <div className="space-y-3">
                    <textarea
                      {...form.register("message")}
                      value={watchMessage}
                      placeholder="Message personnalisé de confirmation (optionnel)..."
                      className="w-full h-20 p-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-tertiary-400 focus:border-transparent resize-none transition-colors"
                      maxLength={300}
                      disabled={mutation.isPending}
                      onChange={(e) => form.setValue("message", e.target.value)}
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-white/50 font-one">
                        Le client recevra un email de confirmation
                      </p>
                      <p className="text-xs text-white/50 font-one">
                        {(watchMessage || "").length}/300
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-white/70 font-one">
                        💡 Suggestions :
                      </p>
                      {[
                        "Merci pour votre demande, je vous propose ces créneaux.",
                        "Voici quelques créneaux disponibles pour votre rendez-vous.",
                        "N'hésitez pas à me faire part de vos préférences.",
                      ].map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => form.setValue("message", suggestion)}
                          disabled={mutation.isPending}
                          className="cursor-pointer block w-full text-left p-2 bg-white/5 hover:bg-white/10 rounded-md border border-white/10 hover:border-tertiary-400/30 transition-all text-xs text-white/80 font-one disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* champs cachés pour satisfaire le schéma si besoin */}
                <input type="hidden" {...form.register("proposedFrom")} />
                <input type="hidden" {...form.register("proposedTo")} />

                {error && (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
                    <p className="text-red-300 text-xs">{error}</p>
                  </div>
                )}
              </form>
            </div>

            {/* Footer fixé en bas */}
            <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={mutation.isPending}
                className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                type="submit"
                form="propose-creneau-form"
                disabled={
                  mutation.isPending ||
                  loading ||
                  !watchTatoueurId ||
                  !selectedSlots.length ||
                  !selectedDateStr
                }
                className="cursor-pointer px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending || loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>Envoi de la proposition...</span>
                  </>
                ) : (
                  <>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Envoyer la proposition</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Remarque : Ajoutez l'attribut id="propose-creneau-form" au <form> pour que le bouton submit fonctionne même en dehors du scrollable.
