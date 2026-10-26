/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useEffect, useId, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { updateAppointmentSchema } from "@/lib/zod/validator.schema";
import { TatoueurProps, TimeSlotProps, UpdateRdvFormProps } from "@/lib/type";
import { addMinutes, format, isValid } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { toast } from "sonner";
import SalonImageUploader from "@/components/Application/MonCompte/SalonImageUploader";
import { updateAppointment } from "@/lib/queries/appointment";
import SideFormDrawer from "@/components/Shared/SideFormDrawer";
import { LoaderCircle } from "lucide-react";
import DrawingCardSelect from "@/components/Application/SuiviDessin/DrawingCardSelect";

export default function UpdateRdv({
  rdv,
  userId,
  onUpdate,
}: {
  rdv: UpdateRdvFormProps;
  userId: string;
  onUpdate?: () => void;
}) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const formId = useId();
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [slotsRetry, setSlotsRetry] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userRole = session?.user?.role;
  const agendaMode = session?.user?.agendaMode;
  const isUserTatoueur = userRole === "user_tatoueur";
  const isSalonGlobal =
    userRole === "user_salon" && String(agendaMode || "").toUpperCase() === "GLOBAL";
  const shouldUseGlobalAgenda = isSalonGlobal;

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

  const watchPrestation = useWatch({ control: form.control, name: "prestation" });
  const watchStart = useWatch({ control: form.control, name: "start" });

  const referenceImage = useWatch({ control: form.control, name: "tattooDetail.reference" });
  const sketchImage = useWatch({ control: form.control, name: "tattooDetail.sketch" });
  const drawingCardId = useWatch({ control: form.control, name: "drawingCardId" });

  const selectedDay = watchStart
    ? format(new Date(watchStart), "yyyy-MM-dd")
    : null;

  const displayedTimeSlots = useMemo(() => {
    const slotMap = new Map<string, { start: string; end: string }>();

    timeSlots.forEach((slot) => slotMap.set(slot.start, slot));

    const allSelected = [...selectedSlots, ...initialSlots];
    allSelected.forEach((slotStart) => {
      const slotDate = format(new Date(slotStart), "yyyy-MM-dd");
      if (selectedDay && slotDate === selectedDay && !slotMap.has(slotStart)) {
        const end = addMinutes(new Date(slotStart), 30).toISOString();
        slotMap.set(slotStart, { start: slotStart, end });
      }
    });

    return Array.from(slotMap.values()).sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );
  }, [timeSlots, selectedSlots, initialSlots, selectedDay]);

  const selectedDurationMinutes = selectedSlots.length * 30;
  const selectedDurationLabel =
    selectedDurationMinutes === 0
      ? "0 min"
      : selectedDurationMinutes < 60
      ? `${selectedDurationMinutes} min`
      : `${Math.floor(selectedDurationMinutes / 60)}h${String(
          selectedDurationMinutes % 60
        ).padStart(2, "0")}`;

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
    "mb-4 text-xs font-semibold text-white/85";
  const labelClass = "mb-1.5 block text-[11px] font-medium text-white/60";
  const inputClass =
    "min-h-10 w-full rounded-xl border border-white/10 bg-noir-700 px-3 py-2 text-xs text-white placeholder:text-white/30 transition focus:border-tertiary-400/50 focus:outline-none focus:ring-2 focus:ring-tertiary-400/10";

  //! FETCH tatoueurs
  useEffect(() => {
    const fetchTatoueurs = async () => {
      if (isUserTatoueur) {
        setTatoueurs([
          {
            id: userId,
            name: session?.user?.name || "Mon agenda",
            description: null,
            style: [],
            skills: [],
          },
        ]);
        setSelectedTatoueur(userId);
        form.setValue("tatoueurId", userId);
        return;
      }

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
  }, [userId, isUserTatoueur, session?.user?.name, form]);

  //! FETCH slots bloqués (par tatoueur)
  useEffect(() => {
    if (!selectedTatoueur && !isUserTatoueur) {
      setBlockedSlots([]);
      return;
    }
    const fetchBlockedSlots = async () => {
      try {
        const tatoueurScopeId = isUserTatoueur ? userId : selectedTatoueur;
        const blockedUrl = shouldUseGlobalAgenda
          ? `${process.env.NEXT_PUBLIC_BACK_URL}/blocked-slots/salon/${userId}`
          : `${process.env.NEXT_PUBLIC_BACK_URL}/blocked-slots/tatoueur/${tatoueurScopeId}`;

        const res = await fetch(
          blockedUrl
        );
        const data = await res.json();
        if (!data.error) setBlockedSlots(data.blockedSlots || []);
        else setBlockedSlots([]);
      } catch {
        setBlockedSlots([]);
      }
    };
    fetchBlockedSlots();
  }, [selectedTatoueur, isUserTatoueur, shouldUseGlobalAgenda, userId]);

  //! FETCH timeSlots (dispos), occupiedSlots, proposedSlots (pour la journée)
  useEffect(() => {
    if (!showModal) return;
    const selectedDate = watchStart
      ? format(new Date(watchStart), "yyyy-MM-dd")
      : null;
    if (!selectedDate || (!selectedTatoueur && !isUserTatoueur)) {
      setSlotsLoading(false);
      setSlotsError(null);
      setTimeSlots([]);
      setOccupiedSlots([]);
      setProposedSlots([]);
      return;
    }

    let active = true;
    setSlotsLoading(true);
    setSlotsError(null);
    const fetchAll = async () => {
      try {
        const tatoueurScopeId = isUserTatoueur ? userId : selectedTatoueur;

        // 1) créneaux dispos
        const slotsRes = await fetch(
          rdv.venueSalonId && (isUserTatoueur || (rdv as any).performerUserId) ? `${process.env.NEXT_PUBLIC_BACK_URL}/residencies/my-availability?date=${selectedDate}&artistId=${isUserTatoueur ? userId : (rdv as any).performerUserId}&salonId=${rdv.venueSalonId}&appointmentId=${rdv.id}` : isUserTatoueur ? `${process.env.NEXT_PUBLIC_BACK_URL}/timeslots/salon/${userId}?date=${selectedDate}&includeUnavailable=true` : `${process.env.NEXT_PUBLIC_BACK_URL}/timeslots/tatoueur?date=${selectedDate}&tatoueurId=${tatoueurScopeId}&includeUnavailable=true`,
          { headers: { Authorization: `Bearer ${session?.accessToken}` } }
        );
        if (!slotsRes.ok) throw new Error("Disponibilités indisponibles");
        const slotsData = await slotsRes.json();
        if (active) setTimeSlots(Array.isArray(slotsData) ? slotsData : []);

        // bornes journée
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        // 2) RDV occupés
        const occupiedUrl = shouldUseGlobalAgenda
          ? `${
              process.env.NEXT_PUBLIC_BACK_URL
            }/appointments/range?userId=${userId}&start=${startOfDay.toISOString()}&end=${endOfDay.toISOString()}`
          : `${
              process.env.NEXT_PUBLIC_BACK_URL
            }/appointments/tatoueur-range?tatoueurId=${tatoueurScopeId}&start=${startOfDay.toISOString()}&end=${endOfDay.toISOString()}`;

        const occupiedRes = await fetch(occupiedUrl);
        if (!occupiedRes.ok) throw new Error("Agenda indisponible");
        const occupiedData = await occupiedRes.json();
        if (active) setOccupiedSlots(Array.isArray(occupiedData) ? occupiedData : occupiedData?.appointments || []);

        // 3) créneaux déjà proposés
        const proposeUrl = `${
          process.env.NEXT_PUBLIC_BACK_URL
        }/blocked-slots/propose-creneau?tatoueurId=${tatoueurScopeId}&start=${encodeURIComponent(
          startOfDay.toISOString()
        )}&end=${encodeURIComponent(endOfDay.toISOString())}`;

        const proposedRes = await fetch(proposeUrl);
        if (!proposedRes.ok) throw new Error("Créneaux proposés indisponibles");
        const proposedData = await proposedRes.json();
        if (active) setProposedSlots(Array.isArray(proposedData) ? proposedData : []);
      } catch (err) {
        if (active) setSlotsError("Impossible de charger les disponibilités. Réessayez en sélectionnant la date.");
        console.error("Erreur fetch slots UpdateRdv:", err);
        if (active) setTimeSlots([]);
        if (active) setOccupiedSlots([]);
        if (active) setProposedSlots([]);
      } finally {
        if (active) setSlotsLoading(false);
      }
    };

    fetchAll();
    return () => { active = false; };
  }, [watchStart, selectedTatoueur, isUserTatoueur, shouldUseGlobalAgenda, userId, showModal, slotsRetry]);

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

    const initialTatoueurId = isUserTatoueur ? userId : rdv.tatoueurId;
    setSelectedTatoueur(initialTatoueurId);
    form.setValue("tatoueurId", initialTatoueurId);

    // reconstruire les slots du RDV (initial)
    const slots: string[] = [];
    let cur = new Date(rdv.start);
    while (cur < new Date(rdv.end)) {
      slots.push(cur.toISOString());
      cur = addMinutes(cur, 30);
    }
    setInitialSlots(slots);
    setSelectedSlots(slots); // au départ, la sélection = ce qui est stocké
  }, [rdv, form, isUserTatoueur, userId]);

  // Helpers — checks
  const isSlotBlocked = (slotStart: string, slotEnd?: string) => {
    if (!selectedTatoueur && !isUserTatoueur) return false;
    const start = new Date(slotStart);
    const end = slotEnd ? new Date(slotEnd) : addMinutes(start, 30);
    const s = start.getTime();
    const e = end.getTime();

    return blockedSlots.some((b) => {
      const bs = new Date(b.startDate).getTime();
      const be = new Date(b.endDate).getTime();
      const overlaps = s < be && e > bs;
      const concernsTatoueur = shouldUseGlobalAgenda
        ? b.tatoueurId == null
        : b.tatoueurId === selectedTatoueur || b.tatoueurId === null;
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
    if (slotsLoading || slotsError) {
      setError("Attendez le chargement des disponibilités avant d’enregistrer.");
      return;
    }

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
    setError(null);
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
      setError("Sélectionnez des créneaux consécutifs pour définir la durée du rendez-vous.");
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
        className="inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium font-one transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400 disabled:cursor-not-allowed disabled:opacity-50 border-white/10 bg-white/[0.025] text-white/70 hover:border-white/20 hover:bg-white/5 hover:text-white"
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

      {showModal && <SideFormDrawer title="Modifier le rendez-vous" category="Rendez-vous" description="Ajustez la prestation, l’artiste et les horaires, puis enregistrez vos modifications." onClose={() => setShowModal(false)} busy={loading || mutation.isPending} footer={<><button type="button" onClick={() => setShowModal(false)} disabled={loading || mutation.isPending} className="min-h-10 cursor-pointer rounded-xl border border-white/10 px-3 py-2 text-xs text-white/65 transition hover:bg-white/5 disabled:opacity-50">Fermer</button><button type="submit" form={formId} disabled={loading || mutation.isPending || slotsLoading || !!slotsError} className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/90 px-4 py-2 text-xs font-medium text-noir-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50">{(loading || mutation.isPending) && <LoaderCircle size={14} className="animate-spin" />}{loading || mutation.isPending ? "Enregistrement…" : "Enregistrer les modifications"}</button></>}><form id={formId}
                onSubmit={form.handleSubmit(onSubmit, () => setError("Merci de vérifier les champs du formulaire."))}
                className="@container space-y-4"
              ><fieldset disabled={loading || mutation.isPending} className="min-w-0 space-y-4 disabled:opacity-60">
                {/* Client (lecture seule) */}
                <section className="flex items-center gap-3 rounded-2xl border border-white/10 bg-noir-600 p-4"><div className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white/60">{rdv.client?.firstName?.charAt(0)}{rdv.client?.lastName?.charAt(0)}</div><div className="min-w-0"><p className="text-[10px] text-white/40">Rendez-vous de</p><p className="mt-1 truncate text-sm font-medium text-white/85">{rdv.client?.firstName} {rdv.client?.lastName}</p><p className="mt-1 break-all text-[11px] text-white/45">{rdv.client?.email}{rdv.client?.phone ? " · " + rdv.client?.phone : ""}</p></div></section>

                {/* Détails RDV */}
                <div className="rounded-2xl border border-white/10 bg-noir-600 p-4">
                  <h3 className={sectionTitleClass}>
                    Détails du rendez-vous
                  </h3>
                  <div className="grid grid-cols-1 @sm:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <label htmlFor={formId + "-title"} className={labelClass}>
                        Titre
                      </label>
                      <input id={formId + "-title"} aria-invalid={!!form.getFieldState("title", form.formState).error}
                        {...form.register("title")}
                        className={inputClass}
                      />{form.getFieldState("title", form.formState).error?.message && <p role="alert" className="mt-1 text-[10px] text-red-300">{form.getFieldState("title", form.formState).error?.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <label htmlFor={formId + "-tatoueurId"} className={labelClass}>
                        Tatoueur
                      </label>
                      <select id={formId + "-tatoueurId"} aria-invalid={!!form.getFieldState("tatoueurId", form.formState).error}
                        {...form.register("tatoueurId")}
                        disabled={isUserTatoueur}
                        onChange={(e) => {
                          setSelectedTatoueur(e.target.value);
                          form.setValue("tatoueurId", e.target.value);
                        }}
                        className={inputClass}
                      >
                        {isUserTatoueur && tatoueurs.length === 0 && (
                          <option value={userId} className="bg-noir-700">
                            {session?.user?.name || "Mon agenda"}
                          </option>
                        )}
                        {tatoueurs.map((tatoueur) => (
                          <option
                            key={tatoueur.id}
                            value={tatoueur.id}
                            className="bg-noir-700"
                          >
                            {tatoueur.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1 @sm:col-span-2">
                      <label htmlFor={formId + "-prestation"} className={labelClass}>
                        Type
                      </label>
                      <select id={formId + "-prestation"} aria-invalid={!!form.getFieldState("prestation", form.formState).error}
                        {...form.register("prestation")}
                        className={inputClass}
                      >
                        <option value="TATTOO" className="bg-noir-700">
                          Tatouage
                        </option>
                        <option value="PROJET" className="bg-noir-700">
                          Projet
                        </option>
                        <option value="RETOUCHE" className="bg-noir-700">
                          Retouche
                        </option>
                        <option value="PIERCING" className="bg-noir-700">
                          Piercing
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Créneaux horaires */}
                <div className="rounded-2xl border border-white/10 bg-noir-600 p-4">
                  <h3 className={sectionTitleClass}>
                    Créneaux horaires
                  </h3>

                  <div className="space-y-1">
                    <label htmlFor={formId + "-date"} className={labelClass}>
                      Date
                    </label>
                    <input id={formId + "-date"} style={{ colorScheme: "dark" }}
                      type="date"
                      value={
                        watchStart && isValid(new Date(watchStart))
                          ? format(new Date(watchStart), "yyyy-MM-dd")
                          : format(new Date(), "yyyy-MM-dd")
                      }
                      onChange={(e) => {
                        if (!e.target.value) return;
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

                  <div className="my-4 flex flex-wrap items-start justify-between gap-3"><div><p className="text-[11px] font-medium text-white/70">Choisir les horaires</p><p className="mt-1 text-[10px] leading-5 text-white/40">Sélectionnez des créneaux consécutifs de 30 minutes.</p></div><button type="button" onClick={() => setSelectedSlots([])} className="min-h-8 cursor-pointer rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] text-white/55 transition hover:bg-white/5">Effacer la sélection</button></div><div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-noir-700 px-3 py-2.5"><span className="text-[11px] text-white/45">Durée sélectionnée</span><span className="text-xs font-medium tabular-nums text-white/85">{selectedDurationLabel}</span></div>{slotsLoading && <p role="status" className="mb-3 flex items-center gap-2 text-[11px] text-white/45"><LoaderCircle size={13} className="animate-spin" />Chargement des disponibilités…</p>}{slotsError && <div role="alert" className="mb-3 rounded-xl border border-red-400/15 bg-red-400/5 p-3 text-[11px] text-red-300">{slotsError}<button type="button" onClick={() => setSlotsRetry(value => value + 1)} className="ml-2 cursor-pointer underline underline-offset-2">Réessayer</button></div>}{!slotsLoading && !slotsError && !displayedTimeSlots.length && <p className="mb-3 rounded-xl border border-dashed border-white/10 p-4 text-center text-[11px] text-white/45">Aucun créneau disponible pour cette date et cet artiste.</p>}

                  <div className="grid grid-cols-3 gap-2 @sm:grid-cols-4 @lg:grid-cols-5">
                    {displayedTimeSlots.map((slot) => {
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

                      const buttonClass = "min-h-14 cursor-pointer rounded-xl border px-2 py-2 text-center text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400 disabled:cursor-not-allowed " + (disabled ? "border-white/[0.06] bg-white/[0.015] text-white/25" : isSelected ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15" : isCurrent ? "border-amber-400/20 bg-amber-400/5 text-amber-200 hover:bg-amber-400/10" : "border-white/10 bg-noir-700 text-white/65 hover:border-white/25 hover:bg-white/5");
                      const buttonText = format(new Date(slot.start), "HH:mm", { locale: fr }) + " – " + format(new Date(slot.end), "HH:mm", { locale: fr });

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
                          disabled={disabled || slotsLoading || !!slotsError}
                          onClick={() =>
                            !disabled && handleSlotClick(slot.start)
                          }
                          className={buttonClass}
                          title={title}
                          aria-label={buttonText + " : " + title}
                          aria-pressed={isSelected}
                        >
                          <span className="block tabular-nums">{format(new Date(slot.start), "HH:mm")}</span><span className="mt-1 block text-[9px] font-normal opacity-70">{disabled ? "Indisponible" : isSelected ? "Sélectionné" : isCurrent ? "Actuel" : "à " + format(new Date(slot.end), "HH:mm")}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Légende */}
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-white/45">{[{ label: "Disponible", style: "border-white/20 bg-noir-700" }, { label: "Sélectionné", style: "border-emerald-400/30 bg-emerald-400/10" }, { label: "Actuel non retenu", style: "border-amber-400/20 bg-amber-400/5" }, { label: "Indisponible", style: "border-white/5 bg-white/5" }].map(item => <span key={item.label} className="flex items-center gap-1.5"><span className={"size-2.5 rounded border " + item.style} />{item.label}</span>)}</div>

                  {/* Indication de changement */}
                  {!sameSet(selectedSlots, initialSlots) && (
                    <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.025] p-3 text-[11px] leading-5 text-white/55">L’horaire sera mis à jour à l’enregistrement.</p>
                  )}
                </div>

                {/* Sections conditionnelles */}
                {watchPrestation === "PROJET" && (
                  <div className="rounded-2xl border border-white/10 bg-noir-600 p-4">
                    <h3 className={sectionTitleClass}>
                      Détails du projet
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label htmlFor={formId + "-tattooDetail-description"} className={labelClass}>
                          Description
                        </label>
                        <textarea id={formId + "-tattooDetail-description"} aria-invalid={!!form.getFieldState("tattooDetail.description", form.formState).error}
                          {...form.register("tattooDetail.description")}
                          rows={3}
                          className={`${inputClass} min-h-24 resize-y`}
                        />{form.getFieldState("tattooDetail.description", form.formState).error?.message && <p role="alert" className="mt-1 text-[10px] text-red-300">{form.getFieldState("tattooDetail.description", form.formState).error?.message}</p>}
                      </div>
                      <div className="grid grid-cols-2 @md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label htmlFor={formId + "-tattooDetail-zone"} className={labelClass}>
                            Zone
                          </label>
                          <input id={formId + "-tattooDetail-zone"} aria-invalid={!!form.getFieldState("tattooDetail.zone", form.formState).error}
                            {...form.register("tattooDetail.zone")}
                            className={inputClass}
                          />{form.getFieldState("tattooDetail.zone", form.formState).error?.message && <p role="alert" className="mt-1 text-[10px] text-red-300">{form.getFieldState("tattooDetail.zone", form.formState).error?.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <label htmlFor={formId + "-tattooDetail-size"} className={labelClass}>
                            Taille
                          </label>
                          <input id={formId + "-tattooDetail-size"} aria-invalid={!!form.getFieldState("tattooDetail.size", form.formState).error}
                            {...form.register("tattooDetail.size")}
                            className={inputClass}
                          />{form.getFieldState("tattooDetail.size", form.formState).error?.message && <p role="alert" className="mt-1 text-[10px] text-red-300">{form.getFieldState("tattooDetail.size", form.formState).error?.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <label htmlFor={formId + "-tattooDetail-colorStyle"} className={labelClass}>
                            Style/Couleur
                          </label>
                          <input id={formId + "-tattooDetail-colorStyle"} aria-invalid={!!form.getFieldState("tattooDetail.colorStyle", form.formState).error}
                            {...form.register("tattooDetail.colorStyle")}
                            className={inputClass}
                          />{form.getFieldState("tattooDetail.colorStyle", form.formState).error?.message && <p role="alert" className="mt-1 text-[10px] text-red-300">{form.getFieldState("tattooDetail.colorStyle", form.formState).error?.message}</p>}
                        </div>
                      </div>

                      {/* Uploads */}
                      <div className="grid grid-cols-1 @sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs text-white/70 font-one">
                            Image de référence 1
                          </label>
                          <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                            <SalonImageUploader
                              currentImage={
                                referenceImage ||
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
                                sketchImage || undefined
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
                        <label htmlFor={formId + "-tattooDetail-estimatedPrice"} className={labelClass}>
                          Prix (€)
                        </label>
                        <input id={formId + "-tattooDetail-estimatedPrice"} aria-invalid={!!form.getFieldState("tattooDetail.estimatedPrice", form.formState).error}
                          type="number"
                          step="0.01"
                          {...form.register("tattooDetail.estimatedPrice", {
                            setValueAs: value => value === "" ? undefined : Number(value),
                          })}
                          className={inputClass}
                        />{form.getFieldState("tattooDetail.estimatedPrice", form.formState).error?.message && <p role="alert" className="mt-1 text-[10px] text-red-300">{form.getFieldState("tattooDetail.estimatedPrice", form.formState).error?.message}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {watchPrestation === "TATTOO" && (
                  <div className="rounded-2xl border border-white/10 bg-noir-600 p-4">
                    <h3 className={sectionTitleClass}>
                      Détails du tatouage
                    </h3>
                    <div className="space-y-4">
                      <DrawingCardSelect
                        value={drawingCardId}
                        clientId={rdv.clientId}
                        clientEmail={rdv.client?.email}
                        onChange={(value) => form.setValue("drawingCardId", value)}
                      />
                      <div className="space-y-1">
                        <label htmlFor={formId + "-tattooDetail-description"} className={labelClass}>
                          Description
                        </label>
                        <textarea id={formId + "-tattooDetail-description"} aria-invalid={!!form.getFieldState("tattooDetail.description", form.formState).error}
                          {...form.register("tattooDetail.description")}
                          rows={3}
                          className={`${inputClass} resize-none`}
                        />{form.getFieldState("tattooDetail.description", form.formState).error?.message && <p role="alert" className="mt-1 text-[10px] text-red-300">{form.getFieldState("tattooDetail.description", form.formState).error?.message}</p>}
                      </div>
                      <div className="grid grid-cols-2 @lg:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label htmlFor={formId + "-tattooDetail-zone"} className={labelClass}>
                            Zone
                          </label>
                          <input id={formId + "-tattooDetail-zone"} aria-invalid={!!form.getFieldState("tattooDetail.zone", form.formState).error}
                            {...form.register("tattooDetail.zone")}
                            className={inputClass}
                          />{form.getFieldState("tattooDetail.zone", form.formState).error?.message && <p role="alert" className="mt-1 text-[10px] text-red-300">{form.getFieldState("tattooDetail.zone", form.formState).error?.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <label htmlFor={formId + "-tattooDetail-size"} className={labelClass}>
                            Taille
                          </label>
                          <input id={formId + "-tattooDetail-size"} aria-invalid={!!form.getFieldState("tattooDetail.size", form.formState).error}
                            {...form.register("tattooDetail.size")}
                            className={inputClass}
                          />{form.getFieldState("tattooDetail.size", form.formState).error?.message && <p role="alert" className="mt-1 text-[10px] text-red-300">{form.getFieldState("tattooDetail.size", form.formState).error?.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <label htmlFor={formId + "-tattooDetail-colorStyle"} className={labelClass}>
                            Style/Couleur
                          </label>
                          <input id={formId + "-tattooDetail-colorStyle"} aria-invalid={!!form.getFieldState("tattooDetail.colorStyle", form.formState).error}
                            {...form.register("tattooDetail.colorStyle")}
                            className={inputClass}
                          />{form.getFieldState("tattooDetail.colorStyle", form.formState).error?.message && <p role="alert" className="mt-1 text-[10px] text-red-300">{form.getFieldState("tattooDetail.colorStyle", form.formState).error?.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <label htmlFor={formId + "-tattooDetail-price"} className={labelClass}>
                            Prix (€)
                          </label>
                          <input id={formId + "-tattooDetail-price"} aria-invalid={!!form.getFieldState("tattooDetail.price", form.formState).error}
                            type="number"
                            step="0.01"
                            {...form.register("tattooDetail.price", {
                              setValueAs: value => value === "" ? undefined : Number(value),
                            })}
                            className={inputClass}
                          />{form.getFieldState("tattooDetail.price", form.formState).error?.message && <p role="alert" className="mt-1 text-[10px] text-red-300">{form.getFieldState("tattooDetail.price", form.formState).error?.message}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {watchPrestation === "PIERCING" && (
                  <div className="rounded-2xl border border-white/10 bg-noir-600 p-4">
                    <h3 className={sectionTitleClass}>
                      Détails du piercing
                    </h3>
                    <div className="grid grid-cols-1 @md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label htmlFor={formId + "-tattooDetail-description"} className={labelClass}>
                          Description
                        </label>
                        <input id={formId + "-tattooDetail-description"} aria-invalid={!!form.getFieldState("tattooDetail.description", form.formState).error}
                          {...form.register("tattooDetail.description")}
                          className={inputClass}
                        />{form.getFieldState("tattooDetail.description", form.formState).error?.message && <p role="alert" className="mt-1 text-[10px] text-red-300">{form.getFieldState("tattooDetail.description", form.formState).error?.message}</p>}
                      </div>
                      <div className="space-y-1">
                        <label htmlFor={formId + "-tattooDetail-zone"} className={labelClass}>
                          Zone
                        </label>
                        <input id={formId + "-tattooDetail-zone"} aria-invalid={!!form.getFieldState("tattooDetail.zone", form.formState).error}
                          {...form.register("tattooDetail.zone")}
                          className={inputClass}
                        />{form.getFieldState("tattooDetail.zone", form.formState).error?.message && <p role="alert" className="mt-1 text-[10px] text-red-300">{form.getFieldState("tattooDetail.zone", form.formState).error?.message}</p>}
                      </div>
                      <div className="space-y-1">
                        <label htmlFor={formId + "-tattooDetail-price"} className={labelClass}>
                          Prix (€)
                        </label>
                        <input id={formId + "-tattooDetail-price"} aria-invalid={!!form.getFieldState("tattooDetail.price", form.formState).error}
                          type="number"
                          step="0.01"
                          {...form.register("tattooDetail.price", {
                            setValueAs: value => value === "" ? undefined : Number(value),
                          })}
                          className={inputClass}
                        />{form.getFieldState("tattooDetail.price", form.formState).error?.message && <p role="alert" className="mt-1 text-[10px] text-red-300">{form.getFieldState("tattooDetail.price", form.formState).error?.message}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {watchPrestation === "RETOUCHE" && (
                  <div className="rounded-2xl border border-white/10 bg-noir-600 p-4">
                    <h3 className={sectionTitleClass}>
                      Détails de la retouche
                    </h3>
                    <div className="grid grid-cols-1 @md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label htmlFor={formId + "-tattooDetail-description"} className={labelClass}>
                          Description
                        </label>
                        <input id={formId + "-tattooDetail-description"} aria-invalid={!!form.getFieldState("tattooDetail.description", form.formState).error}
                          {...form.register("tattooDetail.description")}
                          className={inputClass}
                        />{form.getFieldState("tattooDetail.description", form.formState).error?.message && <p role="alert" className="mt-1 text-[10px] text-red-300">{form.getFieldState("tattooDetail.description", form.formState).error?.message}</p>}
                      </div>
                      <div className="space-y-1">
                        <label htmlFor={formId + "-tattooDetail-zone"} className={labelClass}>
                          Zone
                        </label>
                        <input id={formId + "-tattooDetail-zone"} aria-invalid={!!form.getFieldState("tattooDetail.zone", form.formState).error}
                          {...form.register("tattooDetail.zone")}
                          className={inputClass}
                        />{form.getFieldState("tattooDetail.zone", form.formState).error?.message && <p role="alert" className="mt-1 text-[10px] text-red-300">{form.getFieldState("tattooDetail.zone", form.formState).error?.message}</p>}
                      </div>
                      <div className="space-y-1">
                        <label htmlFor={formId + "-tattooDetail-price"} className={labelClass}>
                          Prix (€)
                        </label>
                        <input id={formId + "-tattooDetail-price"} aria-invalid={!!form.getFieldState("tattooDetail.price", form.formState).error}
                          type="number"
                          step="0.01"
                          {...form.register("tattooDetail.price", {
                            setValueAs: value => value === "" ? undefined : Number(value),
                          })}
                          className={inputClass}
                        />{form.getFieldState("tattooDetail.price", form.formState).error?.message && <p role="alert" className="mt-1 text-[10px] text-red-300">{form.getFieldState("tattooDetail.price", form.formState).error?.message}</p>}
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
              </fieldset></form></SideFormDrawer>}
    </>
  );
}
