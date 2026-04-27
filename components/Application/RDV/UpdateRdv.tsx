/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAppointmentSchema } from "@/lib/zod/validator.schema";
import { TatoueurProps, TimeSlotProps, UpdateRdvFormProps } from "@/lib/type";
import { addMinutes, format, isValid } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { toast } from "sonner";
import SalonImageUploader from "@/components/Application/MonCompte/SalonImageUploader";
import { updateAppointment } from "@/lib/queries/appointment";

export default function UpdateRdv({
  rdv,
  userId,
  onUpdate,
}: {
  rdv: UpdateRdvFormProps;
  userId: string;
  onUpdate?: () => void;
}) {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TATOUEURS
  const [tatoueurs, setTatoueurs] = useState<TatoueurProps[]>([]);
  const [selectedTatoueur, setSelectedTatoueur] = useState<string | null>(
    rdv.tatoueurId
  );

  // SLOTS DISPONIBLES / PRIS / BLOQUÉS / PROPOSÉS
  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>(
    []
  );
  const [occupiedSlots, setOccupiedSlots] = useState<TimeSlotProps[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<any[]>([]);
  const [proposedSlots, setProposedSlots] = useState<any[]>([]);

  // SÉLECTION COURANTE (édition) + SÉLECTION INITIALE (celle du RDV en base)
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [initialSlots, setInitialSlots] = useState<string[]>([]);

  // RHF
  const form = useForm<z.infer<typeof updateAppointmentSchema>>({
    resolver: zodResolver(updateAppointmentSchema),
    defaultValues: {
      ...rdv,
      start:
        typeof rdv.start === "string"
          ? rdv.start
          : new Date(rdv.start).toISOString(),
      end:
        typeof rdv.end === "string" ? rdv.end : new Date(rdv.end).toISOString(),
    },
  });

  const watchPrestation = form.watch("prestation");
  const watchStart = form.watch("start");

  // Helpers temps
  const toTs = (s: string) => new Date(s).getTime();
  const areConsecutive = (ts: number[]) =>
    ts.every((t, i) => (i === 0 ? true : t - ts[i - 1] === 30 * 60 * 1000));
  const sameSet = (a: string[], b: string[]) => {
    const at = a.map(toTs).sort((x, y) => x - y);
    const bt = b.map(toTs).sort((x, y) => x - y);
    if (at.length !== bt.length) return false;
    for (let i = 0; i < at.length; i++) if (at[i] !== bt[i]) return false;
    return true;
  };

  const rdvDayStr = format(new Date(rdv.start), "yyyy-MM-dd");

  const sectionTitleClass =
    "mb-2.5 text-[9px] font-medium uppercase tracking-[0.14em] text-white/35 font-one";
  const labelClass = "text-[11px] text-white/65 font-one";
  const inputClass =
    "w-full p-2.5 bg-white/6 border border-white/12 rounded-xl text-white text-xs placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-tertiary-400/50 focus:border-transparent transition-colors";
  const disabledInputClass =
    "w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-white/80 text-xs";

  // FETCH tatoueurs
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

  // FETCH slots bloqués (par tatoueur)
  useEffect(() => {
    if (!selectedTatoueur) {
      setBlockedSlots([]);
      return;
    }
    const fetchBlockedSlots = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/blocked-slots/tatoueur/${selectedTatoueur}`
        );
        const data = await res.json();
        if (!data.error) setBlockedSlots(data.blockedSlots || []);
        else setBlockedSlots([]);
      } catch {
        setBlockedSlots([]);
      }
    };
    fetchBlockedSlots();
  }, [selectedTatoueur]);

  // FETCH timeSlots (dispos), occupiedSlots, proposedSlots (pour la journée)
  useEffect(() => {
    const selectedDate = watchStart
      ? format(new Date(watchStart), "yyyy-MM-dd")
      : null;
    if (!selectedDate || !selectedTatoueur) {
      setTimeSlots([]);
      setOccupiedSlots([]);
      setProposedSlots([]);
      return;
    }

    const fetchAll = async () => {
      try {
        // 1) créneaux dispos
        const slotsRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/timeslots/tatoueur?date=${selectedDate}&tatoueurId=${selectedTatoueur}`
        );
        const slotsData = await slotsRes.json();
        setTimeSlots(slotsData);

        // bornes journée
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        // 2) RDV occupés
        const occupiedRes = await fetch(
          `${
            process.env.NEXT_PUBLIC_BACK_URL
          }/appointments/tatoueur-range?tatoueurId=${selectedTatoueur}&start=${startOfDay.toISOString()}&end=${endOfDay.toISOString()}`
        );
        const occupiedData = await occupiedRes.json();
        setOccupiedSlots(occupiedData);

        // 3) créneaux déjà proposés
        const proposeUrl = `${
          process.env.NEXT_PUBLIC_BACK_URL
        }/blocked-slots/propose-creneau?tatoueurId=${selectedTatoueur}&start=${encodeURIComponent(
          startOfDay.toISOString()
        )}&end=${encodeURIComponent(endOfDay.toISOString())}`;

        const proposedRes = await fetch(proposeUrl);
        const proposedData = await proposedRes.json();
        setProposedSlots(Array.isArray(proposedData) ? proposedData : []);
      } catch (err) {
        console.error("Erreur fetch slots UpdateRdv:", err);
        setTimeSlots([]);
        setOccupiedSlots([]);
        setProposedSlots([]);
      }
    };

    fetchAll();
  }, [watchStart, selectedTatoueur]);

  // Reset form quand RDV change (et initialise initialSlots + selectedSlots)
  useEffect(() => {
    if (!rdv) return;

    form.reset({
      ...rdv,
      start:
        typeof rdv.start === "string"
          ? rdv.start
          : new Date(rdv.start).toISOString(),
      end:
        typeof rdv.end === "string" ? rdv.end : new Date(rdv.end).toISOString(),
      tattooDetail: {
        ...rdv.tattooDetail,
        description: rdv.tattooDetail?.description || "",
        zone: rdv.tattooDetail?.zone || "",
        size: rdv.tattooDetail?.size || "",
        colorStyle: rdv.tattooDetail?.colorStyle || "",
        reference: rdv.tattooDetail?.reference || "",
        sketch: rdv.tattooDetail?.sketch || "",
        estimatedPrice: rdv.tattooDetail?.estimatedPrice || 0,
        price: rdv.tattooDetail?.price || 0,
      },
    });

    setSelectedTatoueur(rdv.tatoueurId);

    // reconstruire les slots du RDV (initial)
    const slots: string[] = [];
    let cur = new Date(rdv.start);
    while (cur < new Date(rdv.end)) {
      slots.push(cur.toISOString());
      cur = addMinutes(cur, 30);
    }
    setInitialSlots(slots);
    setSelectedSlots(slots); // au départ, la sélection = ce qui est stocké
  }, [rdv, form]);

  // Helpers — checks
  const isSlotBlocked = (slotStart: string, slotEnd?: string) => {
    if (!selectedTatoueur) return false;
    const start = new Date(slotStart);
    const end = slotEnd ? new Date(slotEnd) : addMinutes(start, 30);
    const s = start.getTime();
    const e = end.getTime();

    return blockedSlots.some((b) => {
      const bs = new Date(b.startDate).getTime();
      const be = new Date(b.endDate).getTime();
      const overlaps = s < be && e > bs;
      const concernsTatoueur =
        b.tatoueurId === selectedTatoueur || b.tatoueurId === null;
      return overlaps && concernsTatoueur;
    });
  };

  const getProposedSlot = (slotStart: string, slotEnd: string) => {
    const s = new Date(slotStart).getTime();
    const e = new Date(slotEnd).getTime();
    return proposedSlots.find((p: any) => {
      const from = new Date(p.from).getTime();
      const to = new Date(p.to).getTime();
      return s < to && e > from;
    });
  };

  // SUBMIT
  const mutation = useMutation({
    mutationFn: async (
      updatedData: z.infer<typeof updateAppointmentSchema>
    ) => {
      console.log("Mutation with data:", updatedData);
      const data = await updateAppointment(rdv.id, updatedData);

      if (data.error) throw new Error(data.message || "Erreur inconnue");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setShowModal(false);
      setError(null);
      setLoading(false);
      toast.success("Rendez-vous modifié avec succès !");
      onUpdate?.();
    },
    onError: (error: any) => {
      setError(error.message);
      setLoading(false);
      toast.error(`Erreur : ${error.message}`);
    },
  });

  const onSubmit = async (data: z.infer<typeof updateAppointmentSchema>) => {
    if (loading || mutation.isPending) return;

    // console.log("Données soumises :", data);

    setError(null);
    setLoading(true);

    try {
      // convert to string
      if (typeof data.start !== "string") {
        data.start = new Date(data.start as Date | string).toISOString();
      }
      if (typeof data.end !== "string") {
        data.end = new Date(data.end as Date | string).toISOString();
      }

      // a-t-on modifié la sélection ?
      const selectionChanged = !sameSet(selectedSlots, initialSlots);

      if (selectionChanged) {
        if (selectedSlots.length === 0) {
          setError("Sélectionnez au moins un créneau pour modifier le RDV.");
          setLoading(false);
          return;
        }
        // recalcule start/end depuis la nouvelle sélection
        const sorted = selectedSlots
          .map((s) => new Date(s))
          .sort((a, b) => a.getTime() - b.getTime());

        const newStart = sorted[0].toISOString();
        const newEnd = addMinutes(sorted[sorted.length - 1], 30).toISOString();

        form.setValue("start", newStart);
        form.setValue("end", newEnd);

        data.start = newStart;
        data.end = newEnd;
      }
      // sinon : pas de changement → garder start/end actuels

      const ok = await form.trigger();
      if (!ok) {
        setError("Merci de corriger les erreurs.");
        setLoading(false);
        return;
      }

      const payload = {
        ...data,
        tattooDetail: {
          ...data.tattooDetail,
          // Pour les projets, on utilise estimatedPrice, pour les autres on garde price
          price:
            data.prestation === "PROJET"
              ? data.tattooDetail?.estimatedPrice
              : data.tattooDetail?.price,
        },
      };

      mutation.mutate(payload);
    } catch (err: any) {
      const msg = err?.message || "Une erreur est survenue.";
      setError(msg);
      setLoading(false);
      toast.error(`Erreur : ${msg}`);
    }
  };

  // SÉLECTION des créneaux (consécutifs) + découpe intelligente
  const handleSlotClick = (slotStart: string) => {
    const clickedTs = toTs(slotStart);
    const isAlreadySelected = selectedSlots.some((s) => toTs(s) === clickedTs);

    if (isAlreadySelected) {
      const newSelection = selectedSlots.filter((s) => toTs(s) !== clickedTs);
      const times = newSelection.map(toTs).sort((a, b) => a - b);
      if (areConsecutive(times) || newSelection.length <= 1) {
        setSelectedSlots(newSelection);
        return;
      }
      // coupe : garde le segment consécutif le plus long (gauche ou droite)
      const left = selectedSlots
        .filter((s) => toTs(s) < clickedTs)
        .sort((a, b) => toTs(a) - toTs(b));
      const right = selectedSlots
        .filter((s) => toTs(s) > clickedTs)
        .sort((a, b) => toTs(a) - toTs(b));
      const keep = left.length >= right.length ? left : right;
      setSelectedSlots(keep);
      return;
    }

    const ns = [...selectedSlots, slotStart]
      .filter((s, i, arr) => arr.indexOf(s) === i)
      .sort((a, b) => toTs(a) - toTs(b));

    const times = ns.map(toTs);
    if (areConsecutive(times)) {
      setSelectedSlots(ns);
    } else {
      alert("Les créneaux doivent être consécutifs.");
    }
  };

  // UI
  return (
    <>
      <button
        onClick={() => {
          setError(null);
          setLoading(false);
          setShowModal(true);
          const startStr =
            typeof rdv.start === "string"
              ? rdv.start
              : new Date(rdv.start).toISOString();
          form.setValue("start", startStr);
        }}
        className="cursor-pointer px-2.5 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 rounded-[14px] text-xs font-one font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shadow-sm hover:shadow-md"
        title="Modifier ce rendez-vous"
      >
        <svg
          className="w-3.5 h-3.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        <span>Modifier</span>
      </button>

      {showModal && (
        <div className="absolute inset-0 z-[9999] bg-black/30 backdrop-blur-[1px]">
          <div className="dashboard-embedded-panel flex h-full w-full flex-col overflow-hidden rounded-[28px]">
            {/* Header */}
            <div className="dashboard-embedded-header px-4 py-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white font-one tracking-wide">
                  Modifier le rendez-vous
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <span className="cursor-pointer text-white text-xl">×</span>
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-2.5"
              >
                {/* Client (lecture seule) */}
                <div className="dashboard-embedded-section p-3">
                  <h3 className={sectionTitleClass}>
                    Client{" "}
                    <span className="text-[10px] font-medium text-white/45 normal-case tracking-normal">
                      (les infos du client ne sont pas modifiables ici.)
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className={labelClass}>
                        Prénom
                      </label>
                      <input
                        {...form.register("client.firstName")}
                        disabled
                        className={disabledInputClass}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>
                        Nom
                      </label>
                      <input
                        {...form.register("client.lastName")}
                        disabled
                        className={disabledInputClass}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>
                        Email
                      </label>
                      <input
                        {...form.register("client.email")}
                        disabled
                        className={disabledInputClass}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>
                        Téléphone
                      </label>
                      <input
                        {...form.register("client.phone")}
                        disabled
                        className={disabledInputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Détails RDV */}
                <div className="dashboard-embedded-section p-3">
                  <h3 className={sectionTitleClass}>
                    Détails du rendez-vous
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className={labelClass}>
                        Titre
                      </label>
                      <input
                        {...form.register("title")}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>
                        Tatoueur
                      </label>
                      <select
                        {...form.register("tatoueurId")}
                        onChange={(e) => {
                          setSelectedTatoueur(e.target.value);
                          form.setValue("tatoueurId", e.target.value);
                        }}
                        className={inputClass}
                      >
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
                    <div className="space-y-1 col-span-2">
                      <label className={labelClass}>
                        Type
                      </label>
                      <select
                        {...form.register("prestation")}
                        className={inputClass}
                      >
                        <option value="TATTOO" className="bg-primary-500">
                          Tatouage
                        </option>
                        <option value="PROJET" className="bg-primary-500">
                          Projet
                        </option>
                        <option value="RETOUCHE" className="bg-primary-500">
                          Retouche
                        </option>
                        <option value="PIERCING" className="bg-primary-500">
                          Piercing
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Créneaux horaires */}
                <div className="dashboard-embedded-section p-3">
                  <h3 className={sectionTitleClass}>
                    Créneaux horaires
                  </h3>

                  <div className="space-y-1">
                    <label className={labelClass}>
                      Date
                    </label>
                    <input
                      type="date"
                      value={
                        watchStart && isValid(new Date(watchStart))
                          ? format(new Date(watchStart), "yyyy-MM-dd")
                          : format(new Date(), "yyyy-MM-dd")
                      }
                      onChange={(e) => {
                        const dateIso = new Date(e.target.value).toISOString();
                        form.setValue("start", dateIso);
                        form.setValue("end", dateIso);

                        // si on change de jour : réinitialise la sélection
                        setSelectedSlots([]);

                        // si ce n'est pas le jour du RDV actuel, les "slots initiaux" sont vides
                        const sameDayAsRdv = e.target.value === rdvDayStr;
                        if (sameDayAsRdv) {
                          // reconstruire à partir du RDV
                          const slots: string[] = [];
                          let cur = new Date(rdv.start);
                          while (cur < new Date(rdv.end)) {
                            slots.push(cur.toISOString());
                            cur = addMinutes(cur, 30);
                          }
                          setInitialSlots(slots);
                        } else {
                          setInitialSlots([]);
                        }
                      }}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between my-4">
                    <div>
                      <label className="text-xs text-white/70 font-one">
                        Sélectionnez les créneaux (30 min)
                      </label>
                      <p className="text-xs text-white/50">
                        Cliquez pour (dé)sélectionner. Les créneaux doivent
                        rester consécutifs.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedSlots([])}
                      className="cursor-pointer px-2.5 py-1.5 bg-white/8 hover:bg-white/14 text-white rounded-xl border border-white/15 transition-colors text-xs font-one"
                    >
                      Tout désélectionner
                    </button>
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {timeSlots.map((slot) => {
                      const slotTime = new Date(slot.start).getTime();

                      // déjà pris par d'autres RDV
                      const isTaken = occupiedSlots.some((rdvOcc) => {
                        if (String(rdvOcc.id) === String(rdv.id)) return false;
                        const start = new Date(rdvOcc.start).getTime();
                        const end = new Date(rdvOcc.end).getTime();
                        return slotTime >= start && slotTime < end;
                      });

                      // est-ce un slot du RDV actuel (stocké) ?
                      const startRdv = new Date(rdv.start).getTime();
                      const endRdv = new Date(rdv.end).getTime();
                      const isCurrent =
                        slotTime >= startRdv && slotTime < endRdv;

                      // bloqué ?
                      const blocked = isSlotBlocked(slot.start, slot.end);

                      // déjà proposé ?
                      const proposed = getProposedSlot(slot.start, slot.end);
                      const isProposed = !!proposed;

                      // sélection de l'utilisateur (édition)
                      const isSelected = selectedSlots.some(
                        (s) => toTs(s) === toTs(slot.start)
                      );

                      // désactivation (sauf si slot "current" pour pouvoir le retirer)
                      const disabled =
                        (isTaken || blocked || isProposed) && !isCurrent;

                      // style du bouton — ordre de priorité :
                      // 1) états désactivés (proposé/bloqué/occupé) hors "current"
                      // 2) sélection combinée :
                      //    - conservé (current + selected) -> cyan
                      //    - sera retiré (current sans selected) -> amber
                      //    - nouveau (selected sans current) -> green
                      // 3) libre (par défaut)
                      let buttonClass =
                        "p-2 rounded-xl text-xs font-medium transition-all duration-200 border ";
                      let buttonText = `${format(
                        new Date(slot.start),
                        "HH:mm",
                        {
                          locale: fr,
                        }
                      )}-${format(new Date(slot.end), "HH:mm", {
                        locale: fr,
                      })}`;

                      if (isProposed && !isCurrent) {
                        buttonClass +=
                          "bg-blue-900/40 text-blue-300 border-blue-700/50 cursor-not-allowed";
                        buttonText += " ⏳";
                      } else if (blocked && !isCurrent) {
                        buttonClass +=
                          "bg-red-900/50 text-red-300 border-red-700/50 cursor-not-allowed";
                        buttonText += " 🚫";
                      } else if (isTaken && !isCurrent) {
                        buttonClass +=
                          "bg-gray-700/50 text-gray-400 border-gray-600/50 cursor-not-allowed";
                        buttonText += " ❌";
                      } else if (isSelected && isCurrent) {
                        // Conservé (dans le RDV et encore sélectionné)
                        buttonClass +=
                          "bg-green-800/30 text-green-200 border-green-800/50 hover:bg-green-800/50";
                      } else if (!isSelected && isCurrent) {
                        // Sera retiré (actuel mais décoché)
                        buttonClass +=
                          "bg-amber-600/30 text-amber-200 border-amber-500/50 hover:bg-amber-600/50";
                      } else if (isSelected && !isCurrent) {
                        // Nouveau (sélectionné, pas encore dans le RDV)
                        buttonClass +=
                          "bg-green-600/30 text-green-200 border-green-500/50 hover:bg-green-600/50";
                      } else {
                        // Libre
                        buttonClass +=
                          "bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-tertiary-400/50";
                      }

                      // tooltip
                      let title = "";
                      if (isProposed) {
                        title = `Déjà proposé à ${
                          proposed.appointmentRequest?.clientFirstname || ""
                        } ${
                          proposed.appointmentRequest?.clientLastname || ""
                        } (${
                          proposed.appointmentRequest?.clientEmail || ""
                        })\nPrestation: ${
                          proposed.appointmentRequest?.prestation || ""
                        }`;
                      } else if (blocked) {
                        title = "Créneau bloqué - indisponible";
                      } else if (isTaken && !isCurrent) {
                        title = "Créneau déjà réservé";
                      } else if (isSelected && isCurrent) {
                        title =
                          "Conservé (fait partie du RDV et reste sélectionné)";
                      } else if (!isSelected && isCurrent) {
                        title = "Créneau du rdv actuel";
                      } else if (isSelected && !isCurrent) {
                        title = "Nouveau créneau sélectionné";
                      } else {
                        title = "Créneau disponible";
                      }

                      return (
                        <button
                          key={slot.start}
                          type="button"
                          disabled={disabled}
                          onClick={() =>
                            !disabled && handleSlotClick(slot.start)
                          }
                          className={buttonClass}
                          title={title}
                        >
                          <div className="text-center">{buttonText}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Légende */}
                  <div className="mt-4 flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-white/10 border border-white/20 rounded" />
                      <span className="text-white/70 font-one">Libre</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-800/30 border border-green-800/50 rounded" />
                      <span className="text-white/70 font-one">
                        Conservé (actuel + sélection)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-amber-600/30 border border-amber-500/50 rounded" />
                      <span className="text-white/70 font-one">Actuel</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-600/30 border border-green-500/50 rounded" />
                      <span className="text-white/70 font-one">
                        Nouveau sélectionné
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-700/50 border border-gray-600/50 rounded" />
                      <span className="text-white/70 font-one">Occupé ❌</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-900/50 border border-red-700/50 rounded" />
                      <span className="text-white/70 font-one">Bloqué 🚫</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-900/40 border border-blue-700/50 rounded" />
                      <span className="text-white/70 font-one">Proposé ⏳</span>
                    </div>
                  </div>

                  {/* Indication de changement */}
                  {!sameSet(selectedSlots, initialSlots) && (
                    <div className="mt-4 p-2 rounded-lg border border-tertiary-500/30 bg-tertiary-500/10 font-one text-[10px] text-white/50">
                      Modifications détectées : l’horaire sera mis à jour à
                      l’enregistrement.
                    </div>
                  )}
                </div>

                {/* Sections conditionnelles */}
                {watchPrestation === "PROJET" && (
                  <div className="dashboard-embedded-section p-3">
                    <h3 className={sectionTitleClass}>
                      Détails du projet
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className={labelClass}>
                          Description
                        </label>
                        <textarea
                          {...form.register("tattooDetail.description")}
                          rows={3}
                          className={`${inputClass} h-44 resize-none`}
                        />
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className={labelClass}>
                            Zone
                          </label>
                          <input
                            {...form.register("tattooDetail.zone")}
                            className={inputClass}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={labelClass}>
                            Taille
                          </label>
                          <input
                            {...form.register("tattooDetail.size")}
                            className={inputClass}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={labelClass}>
                            Style/Couleur
                          </label>
                          <input
                            {...form.register("tattooDetail.colorStyle")}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      {/* Uploads */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs text-white/70 font-one">
                            Image de référence 1
                          </label>
                          <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                            <SalonImageUploader
                              currentImage={
                                form.watch("tattooDetail.reference") ||
                                undefined
                              }
                              onImageUpload={(imageUrl) =>
                                form.setValue(
                                  "tattooDetail.reference",
                                  imageUrl
                                )
                              }
                              onImageRemove={() =>
                                form.setValue("tattooDetail.reference", "")
                              }
                              compact
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs text-white/70 font-one">
                            Croquis / Référence 2
                          </label>
                          <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                            <SalonImageUploader
                              currentImage={
                                form.watch("tattooDetail.sketch") || undefined
                              }
                              onImageUpload={(imageUrl) =>
                                form.setValue("tattooDetail.sketch", imageUrl)
                              }
                              onImageRemove={() =>
                                form.setValue("tattooDetail.sketch", "")
                              }
                              compact
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className={labelClass}>
                          Prix (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          {...form.register("tattooDetail.estimatedPrice", {
                            valueAsNumber: true,
                          })}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {watchPrestation === "TATTOO" && (
                  <div className="dashboard-embedded-section p-3">
                    <h3 className={sectionTitleClass}>
                      Détails du tatouage
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className={labelClass}>
                          Description
                        </label>
                        <textarea
                          {...form.register("tattooDetail.description")}
                          rows={3}
                          className={`${inputClass} resize-none`}
                        />
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className={labelClass}>
                            Zone
                          </label>
                          <input
                            {...form.register("tattooDetail.zone")}
                            className={inputClass}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={labelClass}>
                            Taille
                          </label>
                          <input
                            {...form.register("tattooDetail.size")}
                            className={inputClass}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={labelClass}>
                            Style/Couleur
                          </label>
                          <input
                            {...form.register("tattooDetail.colorStyle")}
                            className={inputClass}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={labelClass}>
                            Prix (€)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            {...form.register("tattooDetail.price", {
                              valueAsNumber: true,
                            })}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {watchPrestation === "PIERCING" && (
                  <div className="dashboard-embedded-section p-3">
                    <h3 className={sectionTitleClass}>
                      Détails du piercing
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className={labelClass}>
                          Description
                        </label>
                        <input
                          {...form.register("tattooDetail.description")}
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={labelClass}>
                          Zone
                        </label>
                        <input
                          {...form.register("tattooDetail.zone")}
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={labelClass}>
                          Prix (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          {...form.register("tattooDetail.price", {
                            valueAsNumber: true,
                          })}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {watchPrestation === "RETOUCHE" && (
                  <div className="dashboard-embedded-section p-3">
                    <h3 className={sectionTitleClass}>
                      Détails de la retouche
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className={labelClass}>
                          Description
                        </label>
                        <input
                          {...form.register("tattooDetail.description")}
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={labelClass}>
                          Zone
                        </label>
                        <input
                          {...form.register("tattooDetail.zone")}
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={labelClass}>
                          Prix (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          {...form.register("tattooDetail.price", {
                            valueAsNumber: true,
                          })}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Erreurs */}
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
                    <p className="text-red-300 text-xs">{error}</p>
                  </div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="dashboard-embedded-footer px-4 py-2.5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="cursor-pointer px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-[14px] border border-white/20 transition-colors font-medium font-one text-xs"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || mutation.isPending}
                onClick={form.handleSubmit(onSubmit)}
                className="cursor-pointer px-5 py-1.5 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-500 text-white rounded-[14px] transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs"
              >
                {loading || mutation.isPending
                  ? "Modification..."
                  : "Sauvegarder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
