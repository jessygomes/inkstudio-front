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

type ProposeDto = z.infer<typeof proposeCreneauSchema>;

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

  // Liste tatoueurs
  const [tatoueurs, setTatoueurs] = useState<TatoueurProps[]>([]);

  // ====== SLOT #1 ======
  const [selectedDateStr1, setSelectedDateStr1] = useState("");
  const [timeSlots1, setTimeSlots1] = useState<
    { start: string; end: string }[]
  >([]);
  const [occupiedSlots1, setOccupiedSlots1] = useState<TimeSlotProps[]>([]);
  const [proposedSlots1, setProposedSlots1] = useState<any[]>([]);
  const [selectedSlots1, setSelectedSlots1] = useState<string[]>([]);

  // ====== SLOT #2 ======
  const [selectedDateStr2, setSelectedDateStr2] = useState("");
  const [timeSlots2, setTimeSlots2] = useState<
    { start: string; end: string }[]
  >([]);
  const [occupiedSlots2, setOccupiedSlots2] = useState<TimeSlotProps[]>([]);
  const [proposedSlots2, setProposedSlots2] = useState<any[]>([]);
  const [selectedSlots2, setSelectedSlots2] = useState<string[]>([]);

  // Bloqués (par tatoueur, toutes dates)
  const [blockedSlots, setBlockedSlots] = useState<any[]>([]);

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
  const form = useForm<ProposeDto>({
    resolver: zodResolver(proposeCreneauSchema),
    defaultValues: {
      tatoueurId: "",
      message: "",
      slots: [],
    },
  });

  const watchTatoueurId = form.watch("tatoueurId");
  const watchMessage = form.watch("message") || "";

  // fetch tatoueurs
  useEffect(() => {
    const fetchTatoueurs = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs/user/${userId}`
        );
        const data = await response.json();
        setTatoueurs(data);
      } catch {
        setTatoueurs([]);
      }
    };
    fetchTatoueurs();
  }, [userId]);

  // fetch slots dispo + occupés + déjà proposés pour UNE journée
  async function fetchDayData(
    dateStr: string,
    tatoueurId: string,
    setDaySlots: (v: { start: string; end: string }[]) => void,
    setOccupied: (v: TimeSlotProps[]) => void,
    setProposed: (v: any[]) => void
  ) {
    // 1) Disponibles
    const slotsRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/timeslots/tatoueur?date=${dateStr}&tatoueurId=${tatoueurId}`
    );
    const slotsData = await slotsRes.json();
    setDaySlots(slotsData);

    // 2) Occupés
    const startOfDay = new Date(`${dateStr}T00:00:00`);
    const endOfDay = new Date(`${dateStr}T23:59:59`);
    const occRes = await fetch(
      `${
        process.env.NEXT_PUBLIC_BACK_URL
      }/appointments/tatoueur-range?tatoueurId=${tatoueurId}&start=${startOfDay.toISOString()}&end=${endOfDay.toISOString()}`
    );
    const occData = await occRes.json();
    setOccupied(occData);

    // 3) Déjà proposés (overlaps jour)
    const proposeUrl = `${
      process.env.NEXT_PUBLIC_BACK_URL
    }/blocked-slots/propose-creneau?tatoueurId=${tatoueurId}&start=${encodeURIComponent(
      startOfDay.toISOString()
    )}&end=${encodeURIComponent(endOfDay.toISOString())}`;
    const proposedRes = await fetch(proposeUrl);
    const proposedData = await proposedRes.json();
    setProposed(Array.isArray(proposedData) ? proposedData : []);
  }

  // fetch créneaux bloqués pour le tatoueur sélectionné
  useEffect(() => {
    if (!watchTatoueurId) {
      setBlockedSlots([]);
      return;
    }
    const run = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/blocked-slots/tatoueur/${watchTatoueurId}`
        );
        const data = await res.json();
        setBlockedSlots(!data?.error ? data.blockedSlots || [] : []);
      } catch {
        setBlockedSlots([]);
      }
    };
    run();
  }, [watchTatoueurId]);

  // Fetch pour SLOT #1
  useEffect(() => {
    if (!selectedDateStr1 || !watchTatoueurId) {
      setTimeSlots1([]);
      setOccupiedSlots1([]);
      setProposedSlots1([]);
      return;
    }
    fetchDayData(
      selectedDateStr1,
      watchTatoueurId,
      setTimeSlots1,
      setOccupiedSlots1,
      setProposedSlots1
    ).catch(() => {
      setTimeSlots1([]);
      setOccupiedSlots1([]);
      setProposedSlots1([]);
    });
  }, [selectedDateStr1, watchTatoueurId]);

  // Fetch pour SLOT #2
  useEffect(() => {
    if (!selectedDateStr2 || !watchTatoueurId) {
      setTimeSlots2([]);
      setOccupiedSlots2([]);
      setProposedSlots2([]);
      return;
    }
    fetchDayData(
      selectedDateStr2,
      watchTatoueurId,
      setTimeSlots2,
      setOccupiedSlots2,
      setProposedSlots2
    ).catch(() => {
      setTimeSlots2([]);
      setOccupiedSlots2([]);
      setProposedSlots2([]);
    });
  }, [selectedDateStr2, watchTatoueurId]);

  // Reset quand la demande change
  useEffect(() => {
    if (demande) {
      form.reset({ tatoueurId: "", message: "", slots: [] });
      setSelectedDateStr1("");
      setSelectedDateStr2("");
      setSelectedSlots1([]);
      setSelectedSlots2([]);
      setProposedSlots1([]);
      setProposedSlots2([]);
      setBlockedSlots([]);
      setError(null);
    }
  }, [demande, form]);

  // -------- helpers sélection
  function areConsecutive(ts: number[]) {
    return ts.every((time, i) =>
      i === 0 ? true : time - ts[i - 1] === 30 * 60 * 1000
    );
  }

  function handleSlotClick(slotStart: string, group: 1 | 2) {
    const [sel, setSel] =
      group === 1
        ? [selectedSlots1, setSelectedSlots1]
        : [selectedSlots2, setSelectedSlots2];

    if (sel.includes(slotStart)) {
      const ns = sel.filter((s) => s !== slotStart);
      const times = ns.map((s) => new Date(s).getTime()).sort((a, b) => a - b);
      if (areConsecutive(times) || ns.length <= 1) setSel(ns);
      else alert("Les créneaux restants ne sont plus consécutifs.");
      return;
    }

    const ns = [...sel, slotStart]
      .filter((s, i, arr) => arr.indexOf(s) === i)
      .sort();
    const times = ns.map((s) => new Date(s).getTime());
    if (areConsecutive(times)) setSel(ns);
    else alert("Les créneaux doivent être consécutifs.");
  }

  function toInterval(selected: string[]) {
    if (!selected.length) return null;
    const sorted = selected
      .map((s) => new Date(s))
      .sort((a, b) => a.getTime() - b.getTime());
    return {
      from: sorted[0].toISOString(),
      to: addMinutes(sorted[sorted.length - 1], 30).toISOString(),
    };
  }

  const interval1 = toInterval(selectedSlots1);
  const interval2 = toInterval(selectedSlots2);
  const slotsPayload = [interval1, interval2]
    .filter(
      (interval): interval is { from: string; to: string } => interval !== null
    )
    .map(({ from, to }) => ({ from, to, tatoueurId: watchTatoueurId! })) as {
    from: string;
    to: string;
    tatoueurId: string;
  }[];

  // -------- helpers état slots (bloqué / proposé)
  const isSlotBlocked = (slotStart: string, slotEnd?: string) => {
    if (!watchTatoueurId) return false;

    const start = new Date(slotStart);
    const end = slotEnd
      ? new Date(slotEnd)
      : new Date(start.getTime() + 30 * 60 * 1000);
    const s = start.getTime();
    const e = end.getTime();

    return blockedSlots.some((b) => {
      const bs = new Date(b.startDate).getTime();
      const be = new Date(b.endDate).getTime();
      const overlaps = s < be && e > bs;
      const concernsTatoueur =
        b.tatoueurId === watchTatoueurId || b.tatoueurId === null;
      return overlaps && concernsTatoueur;
    });
  };

  const getProposedSlot = (
    slotStart: string,
    slotEnd: string,
    proposedArr: any[]
  ) => {
    const s = new Date(slotStart).getTime();
    const e = new Date(slotEnd).getTime();
    return proposedArr.find((p: any) => {
      const from = new Date(p.from).getTime();
      const to = new Date(p.to).getTime();
      return s < to && e > from;
    });
  };

  // -------- submit
  const mutation = useMutation({
    mutationFn: async (payload: ProposeDto) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/appointment-request/propose-slot/${demande.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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
    onError: (err: any) => {
      setError(err.message);
      setLoading(false);
      toast.error(`Erreur : ${err.message}`);
    },
  });

  const onSubmit = async () => {
    if (loading || mutation.isPending) return;
    setError(null);
    setLoading(true);

    if (!interval1) {
      const msg = "Merci de sélectionner un créneau (date et heure).";
      setError(msg);
      setLoading(false);
      toast.error(msg);
      return;
    }

    try {
      form.setValue("slots", slotsPayload as any, { shouldValidate: true });

      const ok = await form.trigger(["tatoueurId", "slots"]);
      if (!ok) {
        setError("Merci de corriger les erreurs.");
        setLoading(false);
        return;
      }

      const payload: ProposeDto = {
        tatoueurId: watchTatoueurId!,
        message: watchMessage,
        slots: slotsPayload,
      };

      mutation.mutate(payload);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Une erreur est survenue.";
      setError(msg);
      setLoading(false);
      toast.error(`Erreur : ${msg}`);
    }
  };

  // ====== UI SlotPicker interne
  function SlotPicker({
    label,
    selectedDateStr,
    setSelectedDateStr,
    timeSlots,
    occupiedSlots,
    selectedSlots,
    proposedArr,
    group,
  }: {
    label: string;
    selectedDateStr: string;
    setSelectedDateStr: (v: string) => void;
    timeSlots: { start: string; end: string }[];
    occupiedSlots: TimeSlotProps[];
    selectedSlots: string[];
    proposedArr: any[];
    group: 1 | 2;
  }) {
    return (
      <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold font-one mb-3 text-sm">
            {label}
          </h3>
          {!!selectedSlots.length && (
            <button
              type="button"
              onClick={() =>
                group === 1 ? setSelectedSlots1([]) : setSelectedSlots2([])
              }
              className="cursor-pointer px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 text-xs font-one"
            >
              Tout désélectionner
            </button>
          )}
        </div>

        <div className="space-y-1 mb-3">
          <label className="text-xs text-white/70 font-one">Date</label>
          <input
            type="date"
            value={selectedDateStr}
            onChange={(e) => {
              setSelectedDateStr(e.target.value);
              if (group === 1) setSelectedSlots1([]);
              else setSelectedSlots2([]);
            }}
            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
          />
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {timeSlots.map((slot) => {
            const t = new Date(slot.start).getTime();

            const isTaken = occupiedSlots.some((o) => {
              const s = new Date(o.start).getTime();
              const e = new Date(o.end).getTime();
              return t >= s && t < e;
            });

            const isBlocked = isSlotBlocked(slot.start, slot.end);

            const proposed = getProposedSlot(slot.start, slot.end, proposedArr);
            const isProposed = !!proposed;

            const isSelected = selectedSlots.includes(slot.start);
            const disabled =
              isTaken || isBlocked || isProposed || !selectedDateStr;

            // classes + texte + tooltip (mêmes codes que CreateRdv)
            let buttonClass =
              "cursor-pointer px-2 py-1 rounded text-xs text-white font-one transition-all duration-200 border ";
            let buttonText = `${format(new Date(slot.start), "HH:mm", {
              locale: fr,
            })}-${format(new Date(slot.end), "HH:mm", { locale: fr })}`;

            if (isProposed) {
              buttonClass +=
                "bg-blue-900/40 text-blue-300 border-blue-700/50 cursor-not-allowed";
              buttonText += " ⏳";
            } else if (isBlocked) {
              buttonClass +=
                "bg-red-900/50 text-red-300 border-red-700/50 cursor-not-allowed";
              buttonText += " 🚫";
            } else if (isTaken) {
              buttonClass +=
                "bg-gray-700/50 text-gray-400 border-gray-600/50 cursor-not-allowed";
              buttonText += " ❌";
            } else if (isSelected) {
              buttonClass +=
                "bg-green-600/30 text-green-300 border-green-500/50 hover:bg-green-600/50";
            } else {
              buttonClass +=
                "bg-tertiary-600/20 text-tertiary-300 border-tertiary-500/30 hover:bg-tertiary-600/40 hover:text-white";
            }

            let title = "";
            if (isProposed) {
              title = `Déjà proposé à ${
                proposed?.appointmentRequest?.clientFirstname || ""
              } ${proposed?.appointmentRequest?.clientLastname || ""} (${
                proposed?.appointmentRequest?.clientEmail || ""
              })\nPrestation: ${
                proposed?.appointmentRequest?.prestation || ""
              }`;
            } else if (isBlocked) {
              title = "Créneau bloqué - indisponible";
            } else if (isTaken) {
              title = "Créneau déjà réservé";
            } else if (isSelected) {
              title = "Créneau sélectionné - cliquer pour désélectionner";
            } else {
              title = "Créneau disponible - cliquer pour sélectionner";
            }

            return (
              <button
                key={`${label}-${slot.start}`}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && handleSlotClick(slot.start, group)}
                className={buttonClass}
                title={title}
              >
                {buttonText}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

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
                  Proposer des créneaux
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <span className="cursor-pointer text-white text-xl">×</span>
                </button>
              </div>
              <p className="text-white/70 mt-1 text-sm">
                Proposer deux créneaux à {demande.clientFirstname}{" "}
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
                onSubmit={(e) => {
                  e.preventDefault();
                  onSubmit();
                }}
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

                {/* Créneau #1 */}
                <SlotPicker
                  label="Créneau #1"
                  selectedDateStr={selectedDateStr1}
                  setSelectedDateStr={setSelectedDateStr1}
                  timeSlots={timeSlots1}
                  occupiedSlots={occupiedSlots1}
                  selectedSlots={selectedSlots1}
                  proposedArr={proposedSlots1}
                  group={1}
                />

                {/* Créneau #2 */}
                <SlotPicker
                  label="Créneau #2"
                  selectedDateStr={selectedDateStr2}
                  setSelectedDateStr={setSelectedDateStr2}
                  timeSlots={timeSlots2}
                  occupiedSlots={occupiedSlots2}
                  selectedSlots={selectedSlots2}
                  proposedArr={proposedSlots2}
                  group={2}
                />

                {/* Légende commune */}
                <div className="mt-2 flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-tertiary-600/20 border border-tertiary-500/30 rounded"></div>
                    <span className="text-white/70 font-one">Libre</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600/30 border border-green-500/50 rounded"></div>
                    <span className="text-white/70 font-one">Sélectionné</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-700/50 border border-gray-600/50 rounded"></div>
                    <span className="text-white/70 font-one">Occupé ❌</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-900/50 border border-red-700/50 rounded"></div>
                    <span className="text-white/70 font-one">Bloqué 🚫</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-900/40 border border-blue-700/50 rounded"></div>
                    <span className="text-white/70 font-one">Proposé ⏳</span>
                  </div>
                </div>

                {/* Message */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4 mt-4">
                  <h3 className="text-white font-semibold font-one mb-3 text-sm">
                    💬 Message
                  </h3>
                  <div className="space-y-3">
                    <textarea
                      {...form.register("message")}
                      value={watchMessage}
                      placeholder="Message personnalisé (optionnel)..."
                      className="w-full h-20 p-3 bg-white/10 border border-white/20 rounded-lg text-white text-xs placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-tertiary-400 focus:border-transparent resize-none transition-colors"
                      maxLength={300}
                      disabled={mutation.isPending}
                      onChange={(e) => form.setValue("message", e.target.value)}
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-white/50 font-one">
                        Le client recevra un email avec le lien.
                      </p>
                      <p className="text-xs text-white/50 font-one">
                        {watchMessage.length}/300
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
                  !interval1
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
