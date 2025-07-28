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
// import { FormError } from "@/components/Shared/FormError";
// import { FormSuccess } from "@/components/Shared/FormSuccess";

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
        className="cursor-pointer bg-blue-900 text-white text-[10px] px-4 py-1 rounded-[20px] hover:bg-blue-800 transition"
      >
        Modifier RDV
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50">
          <form
            onSubmit={form.handleSubmit((data) => {
              onSubmit(data);
            })}
            className="bg-primary-500 rounded-[20px] p-6 w-[80%] h-[95%] flex flex-col gap-2 text-sm text-white"
          >
            {/* TITRE / CLIENT / EMAIL / PHONE*/}
            <div className="grid grid-cols-4 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="clientLastname">Nom du client</label>
                <input
                  {...form.register("client.lastName")}
                  placeholder="Nom du client"
                  className="bg-white/30 p-2 rounded-[20px] text-xs"
                  disabled
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="clientName">Prénom du client</label>
                <input
                  {...form.register("client.firstName")}
                  placeholder="Nom du client"
                  className="bg-white/30 p-2 rounded-[20px] text-xs"
                  disabled
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="clientName">Email du client</label>
                <input
                  {...form.register("client.email")}
                  placeholder="Email du client"
                  className="bg-white/30 p-2 rounded-[20px] text-xs"
                  disabled
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="clientPhone">Téléphone du client</label>
                <input
                  {...form.register("client.phone")}
                  placeholder="Téléphone du client"
                  className="bg-white/30 p-2 rounded-[20px] text-xs"
                  disabled
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="title">Titre</label>
              <input
                {...form.register("title")}
                placeholder="Titre"
                className="bg-white/30 p-2 rounded-[20px] text-xs"
              />
            </div>

            {/* STATUT */}

            {/* TATOUEUR / TYPE */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="tatoueurId">Selectionnez le tatoueur</label>
                <select
                  {...form.register("tatoueurId")}
                  onChange={(e) => {
                    setSelectedTatoueur(e.target.value);
                    form.setValue("tatoueurId", e.target.value);
                  }}
                  className="bg-white/30 p-2 rounded-[20px] text-xs"
                >
                  {tatoueurs.map((tatoueur) => (
                    <option key={tatoueur.id} value={tatoueur.id}>
                      {tatoueur.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="clientName">Type du RDV</label>
                <select
                  {...form.register("prestation")}
                  className="bg-white/30 p-2 rounded-[20px] text-xs"
                >
                  <option value="TATTOO">Tattoo</option>
                  <option value="PROJET">Projet</option>
                  <option value="RETOUCHE">Retouche</option>
                  <option value="PIERCING">Piercing</option>
                </select>
              </div>

              {/* DATE */}
              <div className="flex flex-col gap-1">
                <label htmlFor="date">Date du rendez-vous</label>
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
                    form.setValue("end", dateStr); // On met la même date pour end aussi
                  }}
                  className="bg-white/30 p-2 rounded-[20px] text-xs"
                  required
                />
              </div>
            </div>

            {/* CRENEAUX */}
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => {
                const slotTime = new Date(slot.start).getTime();

                // const isCurrentRdvSlot = selectedSlots.includes(slot.start);

                const isTaken = occupiedSlots.some((rdvOcc) => {
                  // Ne pas tenir compte du RDV en cours
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

                // => Ne pas considérer comme pris si fait partie du RDV actuel
                const disabled = isTaken && !isPartOfCurrentRdv;

                return (
                  <button
                    key={slot.start}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSlotClick(slot.start)}
                    className={`p-1 rounded-[20px] text-xs transition-all ${
                      disabled
                        ? "bg-gray-400 text-gray-300 cursor-not-allowed"
                        : isSelected
                        ? "bg-tertiary-500 text-white"
                        : "bg-white/20 text-white border border-white/20"
                    } hover:bg-tertiary-400`}
                  >
                    {format(new Date(slot.start), "HH:mm", { locale: fr })} -{" "}
                    {format(new Date(slot.end), "HH:mm", { locale: fr })}
                  </button>
                );
              })}
            </div>

            {/* DESCRIPTION / ZONE / TAILLE / PRIX */}
            {/* Champs dynamiques selon le type de prestation */}
            {watchPrestation === "PROJET" && (
              <>
                <div className="flex flex-col gap-1 ">
                  <label htmlFor="description">Description du projet</label>
                  <textarea
                    {...form.register("tattooDetail.description")}
                    placeholder="Description du projet"
                    className="bg-white/30 p-2 rounded-[20px] text-xs"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="zone">Zone du corps</label>
                    <input
                      {...form.register("tattooDetail.zone")}
                      placeholder="Zone"
                      className="bg-white/30 p-2 rounded-[20px] text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1 ">
                    <label htmlFor="size">Taille du tatouage (cm)</label>
                    <input
                      {...form.register("tattooDetail.size")}
                      placeholder="Taille"
                      className="bg-white/30 p-2 rounded-[20px] text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1 ">
                    <label htmlFor="colorStyle">
                      Style / Couleur du tatouage
                    </label>
                    <input
                      {...form.register("tattooDetail.colorStyle")}
                      placeholder="Style / Couleur"
                      className="bg-white/30 p-2 rounded-[20px] text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1 ">
                    <label htmlFor="clientName">Image de référence 1</label>
                    <input
                      {...form.register("tattooDetail.reference")}
                      placeholder="Image de référence"
                      className="bg-white/30 p-2 rounded-[20px] text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1 ">
                    <label htmlFor="clientName">Image de référence 2</label>
                    <input
                      {...form.register("tattooDetail.sketch")}
                      placeholder="Croquis"
                      className="bg-white/30 p-2 rounded-[20px] text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1 ">
                    <label htmlFor="estimatedPrice">Prix</label>
                    <input
                      type="number"
                      {...form.register("tattooDetail.estimatedPrice", {
                        valueAsNumber: true,
                      })}
                      placeholder="Prix estimé"
                      className="bg-white/30 p-2 rounded-[20px] text-xs"
                    />
                  </div>
                </div>
              </>
            )}

            {watchPrestation === "TATTOO" && (
              <>
                <div className="flex flex-col gap-1">
                  <label htmlFor="description">Description</label>
                  <textarea
                    {...form.register("tattooDetail.description")}
                    placeholder="Description du tatouage"
                    className="bg-white/30 p-2 rounded-[20px] text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-1">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="zone">Zone du corps</label>
                    <input
                      {...form.register("tattooDetail.zone")}
                      placeholder="Zone"
                      className="bg-white/30 p-2 rounded-[20px] text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1 ">
                    <label htmlFor="size">Taille du tatouage</label>
                    <input
                      {...form.register("tattooDetail.size")}
                      placeholder="Taille"
                      className="bg-white/30 p-2 rounded-[20px] text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1 ">
                    <label htmlFor="colorStyle">
                      Style / Couleur du tatouage
                    </label>
                    <input
                      {...form.register("tattooDetail.colorStyle")}
                      placeholder="Style / Couleur"
                      className="bg-white/30 p-2 rounded-[20px] text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1 ">
                    <label htmlFor="estimatedPrice">Prix</label>
                    <input
                      type="number"
                      {...form.register("tattooDetail.estimatedPrice", {
                        valueAsNumber: true,
                      })}
                      placeholder="Prix estimé"
                      className="bg-white/30 p-2 rounded-[20px] text-xs"
                    />
                  </div>
                </div>
              </>
            )}

            {watchPrestation === "PIERCING" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="description">Description du piercing</label>
                  <input
                    {...form.register("tattooDetail.description")}
                    placeholder="Description du piercing"
                    className="bg-white/30 p-2 rounded-[20px] text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="zone">Zone du piercing</label>
                  <input
                    {...form.register("tattooDetail.zone")}
                    placeholder="Zone du piercing"
                    className="bg-white/30 p-2 rounded-[20px] text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="estimatedPrice">Prix</label>
                  <input
                    type="number"
                    {...form.register("tattooDetail.estimatedPrice", {
                      valueAsNumber: true,
                    })}
                    placeholder="Prix"
                    className="bg-white/30 p-2 rounded-[20px] text-xs"
                  />
                </div>
              </div>
            )}

            {watchPrestation === "RETOUCHE" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="description">
                    Description de la retouche
                  </label>
                  <input
                    {...form.register("tattooDetail.description")}
                    placeholder="Description de la retouche"
                    className="bg-white/30 p-2 rounded-[20px] text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="zone">Zone du tatouage</label>
                  <input
                    {...form.register("tattooDetail.zone")}
                    placeholder="Zone de la retouche"
                    className="bg-white/30 p-2 rounded-[20px] text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="estimatedPrice">Prix</label>
                  <input
                    type="number"
                    {...form.register("tattooDetail.estimatedPrice", {
                      valueAsNumber: true,
                    })}
                    placeholder="Prix"
                    className="bg-white/30 p-2 rounded-[20px] text-xs"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-center gap-4 mt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="cursor-pointer bg-red-900 text-white px-6 py-2 rounded-[20px]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || mutation.isPending}
                className="cursor-pointer bg-green-700 text-white px-6 py-2 rounded-[20px] hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading || mutation.isPending
                  ? "Modification..."
                  : "Modifier le rendez-vous"}
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
            )}
          </form>
        </div>
      )}
    </>
  );
}
