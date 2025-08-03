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

  //! STOCKER LES TATOUEURS
  const [tatoueurs, setTatoueurs] = useState<TatoueurProps[]>([]);
  const [selectedTatoueur, setSelectedTatoueur] = useState<string | null>(
    rdv.tatoueurId
  );

  //! STOCKER LES CRÉNEAUX DISPONIBLES
  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>(
    []
  );
  const [occupiedSlots, setOccupiedSlots] = useState<TimeSlotProps[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  //! INITIALISATION DU FORMULAIRE
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

  // const watchStart = form.watch("start");
  // const watchEnd = form.watch("end");
  // const watchPrestation = form.watch("prestation");
  // const watchTatoueurId = form.watch("tatoueurId");

  //! fetch tatoueurs
  useEffect(() => {
    const fetchTatoueurs = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs`
      );
      const data = await response.json();
      setTatoueurs(data);
    };
    fetchTatoueurs();
  }, []);

  //! Fetch créneaux horaires
  useEffect(() => {
    const selectedDate = watchStart
      ? format(new Date(watchStart), "yyyy-MM-dd")
      : null;
    if (!selectedDate || !userId) return;

    const fetchSlots = async () => {
      try {
        const slotsRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/timeslots/tatoueur?date=${selectedDate}&tatoueurId=${selectedTatoueur}`
        );
        const slotsData = await slotsRes.json();
        setTimeSlots(slotsData);

        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const occupiedRes = await fetch(
          `${
            process.env.NEXT_PUBLIC_BACK_URL
          }/appointments/tatoueur-range?tatoueurId=${selectedTatoueur}&start=${startOfDay.toISOString()}&end=${endOfDay.toISOString()}`
        );
        const occupiedData = await occupiedRes.json();
        setOccupiedSlots(occupiedData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSlots();
  }, [watchStart, selectedTatoueur, userId]);

  //! Reset form quand le RDV change
  useEffect(() => {
    if (rdv) {
      form.reset({
        ...rdv,
        start:
          typeof rdv.start === "string"
            ? rdv.start
            : new Date(rdv.start).toISOString(),
        end:
          typeof rdv.end === "string"
            ? rdv.end
            : new Date(rdv.end).toISOString(),
        tattooDetail: {
          ...rdv.tattooDetail,
          description: rdv.tattooDetail?.description || "",
          zone: rdv.tattooDetail?.zone || "",
          size: rdv.tattooDetail?.size || "",
          colorStyle: rdv.tattooDetail?.colorStyle || "",
          reference: rdv.tattooDetail?.reference || "",
          sketch: rdv.tattooDetail?.sketch || "",
          estimatedPrice: rdv.tattooDetail?.estimatedPrice || 0,
        },
      });

      // Reset selectedTatoueur à celui du nouveau RDV
      setSelectedTatoueur(rdv.tatoueurId);

      // Regénérer les selectedSlots
      const slots = [];
      let current = new Date(rdv.start);
      while (current < new Date(rdv.end)) {
        slots.push(current.toISOString());
        current = addMinutes(current, 30);
      }
      setSelectedSlots(slots);
    }
  }, [rdv, form]);

  //! ENVOI DU FORMULAIRE
  const mutation = useMutation({
    mutationFn: async (
      updatedData: z.infer<typeof updateAppointmentSchema>
    ) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/update/${rdv.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.message || "Erreur inconnue");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setShowModal(false);
      setError(null);
      setLoading(false);
      toast.success("Rendez-vous modifié avec succès !");
      if (onUpdate) onUpdate();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      setError(error.message);
      setLoading(false);
      toast.error(`Erreur : ${error.message}`);
    },
  });

  const onSubmit = async (data: z.infer<typeof updateAppointmentSchema>) => {
    // Éviter les soumissions multiples
    if (loading || mutation.isPending) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // S'assurer que start et end sont des strings
      if (typeof data.start !== "string") {
        data.start = new Date(data.start as Date | string).toISOString();
      }
      if (typeof data.end !== "string") {
        data.end = new Date(data.end as Date | string).toISOString();
      }

      // Si des créneaux sont sélectionnés, on met à jour les heures
      if (selectedSlots.length > 0) {
        const sorted = selectedSlots
          .map((s) => new Date(s))
          .sort((a, b) => a.getTime() - b.getTime());

        const newStart = sorted[0].toISOString();
        const newEnd = addMinutes(sorted[sorted.length - 1], 30).toISOString();

        // Met à jour le form avec des strings
        form.setValue("start", newStart);
        form.setValue("end", newEnd);

        // Met à jour aussi les valeurs envoyées
        data.start = newStart;
        data.end = newEnd;
      }

      // Vérifie les champs
      const isValid = await form.trigger();
      if (!isValid) {
        setError("Merci de corriger les erreurs.");
        setLoading(false);
        return;
      }

      // Préparation des données
      const payload = {
        ...data,
        tattooDetail: {
          ...data.tattooDetail,
          price: data.tattooDetail?.estimatedPrice,
        },
      };

      // Utiliser mutation.mutate au lieu de mutateAsync
      mutation.mutate(payload);
    } catch (error: unknown) {
      console.error("❌ Erreur dans onSubmit :", error);
      const errorMessage =
        error instanceof Error ? error.message : "Une erreur est survenue.";
      setError(errorMessage);
      setLoading(false);
      toast.error(`Erreur : ${errorMessage}`);
    }
  };

  //! GESTION DES CRÉNEAUX SÉLECTIONNÉS
  const handleSlotClick = (slotStart: string) => {
    if (selectedSlots.includes(slotStart)) {
      // Si déjà sélectionné, on l'enlève (toggle OFF)
      const newSelection = selectedSlots.filter((s) => s !== slotStart);

      // Vérifie que les slots restants sont toujours consécutifs
      const timestamps = newSelection.map((s) => new Date(s).getTime()).sort();
      const areConsecutive = timestamps.every((time, i) => {
        if (i === 0) return true;
        return time - timestamps[i - 1] === 30 * 60 * 1000;
      });

      // Si après suppression c'est bon → on update
      if (areConsecutive || newSelection.length <= 1) {
        setSelectedSlots(newSelection);
      } else {
        alert("Les créneaux restants ne sont plus consécutifs.");
      }

      return;
    }

    // Sinon on l'ajoute et on vérifie que tous les slots sont consécutifs
    const newSelection = [...selectedSlots, slotStart]
      .filter((s, i, arr) => arr.indexOf(s) === i) // évite les doublons
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

  //! AFFICHAGE DU MODAL
  return (
    <>
      <button
        onClick={() => {
          // Réinitialiser les états
          setError(null);
          setLoading(false);
          setShowModal(true);

          // S'assurer que start est une string
          const startStr =
            typeof rdv.start === "string"
              ? rdv.start
              : new Date(rdv.start).toISOString();
          form.setValue("start", startStr);
        }}
        className="cursor-pointer px-3 py-1.5 bg-tertiary-500/20 hover:bg-tertiary-500/30 text-tertiary-400 border border-tertiary-500/30 rounded-lg text-xs font-one font-medium transition-colors flex items-center gap-1"
      >
        Modifier
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-noir-700 rounded-3xl backdrop-blur-sm flex items-center justify-center">
          <div className="bg-noir-500 rounded-3xl w-full h-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white font-one tracking-wide">
                  Modifier le rendez-vous
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <span className="text-white text-xl">×</span>
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Section: Informations client (lecture seule) */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                    Client{" "}
                    <span className="text-[10px] font-medium text-white/50">
                      (les infos du client ne sont pas modifiables ici.)
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-white/70 font-one">
                        Prénom
                      </label>
                      <input
                        {...form.register("client.firstName")}
                        disabled
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-white/70 font-one">
                        Nom
                      </label>
                      <input
                        {...form.register("client.lastName")}
                        disabled
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-white/70 font-one">
                        Email
                      </label>
                      <input
                        {...form.register("client.email")}
                        disabled
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-white/70 font-one">
                        Téléphone
                      </label>
                      <input
                        {...form.register("client.phone")}
                        disabled
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Informations générales */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                    Détails du rendez-vous
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className="text-xs text-white/70 font-one">
                        Titre
                      </label>
                      <input
                        {...form.register("title")}
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-white/70 font-one">
                        Tatoueur
                      </label>
                      <select
                        {...form.register("tatoueurId")}
                        onChange={(e) => {
                          setSelectedTatoueur(e.target.value);
                          form.setValue("tatoueurId", e.target.value);
                        }}
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
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
                    <div className="space-y-1">
                      <label className="text-xs text-white/70 font-one">
                        Type
                      </label>
                      <select
                        {...form.register("prestation")}
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
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

                {/* Section: Créneaux horaires */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                    Créneaux horaires
                  </h3>
                  <div className="space-y-1">
                    <label className="text-xs text-white/70 font-one">
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
                        const dateStr = new Date(e.target.value).toISOString();
                        form.setValue("start", dateStr);
                        form.setValue("end", dateStr);
                      }}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-1 my-4">
                    <label className="text-xs text-white/70 font-one">
                      Sélectionnez les créneaux (30 min)
                    </label>
                    <p className="text-xs text-white/50">
                      Cliquez sur les créneaux pour les sélectionner. Ils
                      doivent être consécutifs.
                    </p>
                  </div>
                  {/* Affichage des créneaux disponibles */}
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {timeSlots.map((slot) => {
                      const slotTime = new Date(slot.start).getTime();
                      const isTaken = occupiedSlots.some((rdvOcc) => {
                        if (String(rdvOcc.id) === String(rdv.id)) return false;
                        const start = new Date(rdvOcc.start).getTime();
                        const end = new Date(rdvOcc.end).getTime();
                        return slotTime >= start && slotTime < end;
                      });

                      const startRdv = new Date(rdv.start).getTime();
                      const endRdv = new Date(rdv.end).getTime();
                      const isPartOfCurrentRdv =
                        slotTime >= startRdv && slotTime < endRdv;
                      const isSelected = selectedSlots.includes(slot.start);
                      const disabled = isTaken && !isPartOfCurrentRdv;

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
                </div>

                {/* Sections conditionnelles selon le type de prestation */}
                {watchPrestation === "PROJET" && (
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                      Détails du projet
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs text-white/70 font-one">
                          Description
                        </label>
                        <textarea
                          {...form.register("tattooDetail.description")}
                          rows={3}
                          className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-white/70 font-one">
                            Zone
                          </label>
                          <input
                            {...form.register("tattooDetail.zone")}
                            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-white/70 font-one">
                            Taille
                          </label>
                          <input
                            {...form.register("tattooDetail.size")}
                            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-white/70 font-one">
                            Style/Couleur
                          </label>
                          <input
                            {...form.register("tattooDetail.colorStyle")}
                            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Section Upload des images de référence */}
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
                              onImageUpload={(imageUrl) => {
                                form.setValue(
                                  "tattooDetail.reference",
                                  imageUrl
                                );
                              }}
                              onImageRemove={() => {
                                form.setValue("tattooDetail.reference", "");
                              }}
                              compact={true}
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
                              onImageUpload={(imageUrl) => {
                                form.setValue("tattooDetail.sketch", imageUrl);
                              }}
                              onImageRemove={() => {
                                form.setValue("tattooDetail.sketch", "");
                              }}
                              compact={true}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-white/70 font-one">
                          Prix (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          {...form.register("tattooDetail.estimatedPrice", {
                            valueAsNumber: true,
                          })}
                          className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {watchPrestation === "TATTOO" && (
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                      Détails du tatouage
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs text-white/70 font-one">
                          Description
                        </label>
                        <textarea
                          {...form.register("tattooDetail.description")}
                          rows={3}
                          className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-white/70 font-one">
                            Zone
                          </label>
                          <input
                            {...form.register("tattooDetail.zone")}
                            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-white/70 font-one">
                            Taille
                          </label>
                          <input
                            {...form.register("tattooDetail.size")}
                            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-white/70 font-one">
                            Style/Couleur
                          </label>
                          <input
                            {...form.register("tattooDetail.colorStyle")}
                            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-white/70 font-one">
                            Prix (€)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            {...form.register("tattooDetail.estimatedPrice", {
                              valueAsNumber: true,
                            })}
                            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {watchPrestation === "PIERCING" && (
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                      Détails du piercing
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-white/70 font-one">
                          Description
                        </label>
                        <input
                          {...form.register("tattooDetail.description")}
                          className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-white/70 font-one">
                          Zone
                        </label>
                        <input
                          {...form.register("tattooDetail.zone")}
                          className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-white/70 font-one">
                          Prix (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          {...form.register("tattooDetail.estimatedPrice", {
                            valueAsNumber: true,
                          })}
                          className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {watchPrestation === "RETOUCHE" && (
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                      Détails de la retouche
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-white/70 font-one">
                          Description
                        </label>
                        <input
                          {...form.register("tattooDetail.description")}
                          className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-white/70 font-one">
                          Zone
                        </label>
                        <input
                          {...form.register("tattooDetail.zone")}
                          className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-white/70 font-one">
                          Prix (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          {...form.register("tattooDetail.estimatedPrice", {
                            valueAsNumber: true,
                          })}
                          className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages d'erreur */}
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
                    <p className="text-red-300 text-xs">{error}</p>
                  </div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || mutation.isPending}
                onClick={form.handleSubmit(onSubmit)}
                className="cursor-pointer px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs"
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
