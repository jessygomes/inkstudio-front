"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAppointmentSchema } from "@/lib/zod/validator.schema";
import { TatoueurProps, TimeSlotProps } from "@/lib/type";
import { addMinutes, format } from "date-fns";
import { fr } from "date-fns/locale/fr";
// import { FormError } from "@/components/Shared/FormError";
// import { FormSuccess } from "@/components/Shared/FormSuccess";

export type UpdateRdvFormProps = {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  description: string;
  start: string;
  end: string;
  status: "PENDING" | "CONFIRMED" | "DECLINED" | "CANCELED";
  prestation: "TATTOO" | "PIERCING" | "RETOUCHE" | "PROJET";
  zone: string;
  size: number;
  estimatedPrice: number;
  tatoueurId: string;
  userId: string;
  tattooDetail?: {
    description?: string;
    zone?: string;
    size?: string;
    colorStyle?: string;
    reference?: string;
    sketch?: string;
    estimatedPrice?: number;
  };
};

export default function UpdateRdv({
  rdv,
  userId,
}: {
  rdv: UpdateRdvFormProps;
  userId: string;
}) {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tatoueurs, setTatoueurs] = useState<TatoueurProps[]>([]);
  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>(
    []
  );
  const [occupiedSlots, setOccupiedSlots] = useState<TimeSlotProps[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  const form = useForm<z.infer<typeof updateAppointmentSchema>>({
    resolver: zodResolver(updateAppointmentSchema),
    defaultValues: {
      ...rdv,
    },
  });

  const watchPrestation = form.watch("prestation");
  const watchStart = form.watch("start");

  // const watchStart = form.watch("start");
  // const watchEnd = form.watch("end");
  // const watchPrestation = form.watch("prestation");
  // const watchTatoueurId = form.watch("tatoueurId");

  // fetch tatoueurs
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

  // fetch créneaux horaires
  useEffect(() => {
    const selectedDate = watchStart?.slice(0, 10);
    if (!selectedDate || !userId) return;

    const fetchSlots = async () => {
      try {
        const slotsRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/timeslots/timeslots?date=${selectedDate}&salonId=${userId}`
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
          }/appointments/range?userId=${userId}&start=${startOfDay.toISOString()}&end=${endOfDay.toISOString()}`
        );
        const occupiedData = await occupiedRes.json();
        setOccupiedSlots(occupiedData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSlots();
  }, [watchStart, userId]);

  // Reset form quand le RDV change
  useEffect(() => {
    if (rdv) {
      form.reset({
        ...rdv,
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
      console.log("updatedData", updatedData);
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
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      setError(error.message);
    },
  });

  const onSubmit = async () => {
    setError(null);
    setLoading(true);

    if (selectedSlots.length > 0) {
      const sorted = selectedSlots
        .map((s) => new Date(s))
        .sort((a, b) => a.getTime() - b.getTime());
      form.setValue("start", sorted[0].toISOString());
      form.setValue(
        "end",
        addMinutes(sorted[sorted.length - 1], 30).toISOString()
      );
    }

    const isValid = await form.trigger();
    if (!isValid) {
      setError("Merci de corriger les erreurs.");
      setLoading(false);
      return;
    }

    const values = form.getValues();

    const payload = {
      ...values,
      tattooDetail: {
        ...values.tattooDetail,
        price: values.tattooDetail?.estimatedPrice,
      },
    };

    mutation.mutate(payload);
    setLoading(false);
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
          setShowModal(true);
          form.setValue("start", rdv.start); // <-- IMPORTANT !
        }}
        className="cursor-pointer bg-blue-900 text-white text-[10px] px-4 py-1 rounded-[20px] hover:bg-blue-800 transition"
      >
        Modifier RDV
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="bg-primary-500 rounded-[20px] p-6 w-[70%] flex flex-col gap-4 text-sm text-white"
          >
            {/* TITRE / CLIENT / EMAIL / PHONE*/}
            <div className="grid grid-cols-4 gap-4">
              <input
                {...form.register("title")}
                placeholder="Titre"
                className="bg-white/30 p-2 rounded-[20px]"
              />
              <input
                {...form.register("clientName")}
                placeholder="Nom du client"
                className="bg-white/30 p-2 rounded-[20px]"
              />
              <input
                {...form.register("clientEmail")}
                placeholder="Email du client"
                className="bg-white/30 p-2 rounded-[20px]"
              />
              <input
                {...form.register("clientPhone")}
                placeholder="Téléphone du client"
                className="bg-white/30 p-2 rounded-[20px]"
              />
            </div>

            {/* TATOUEUR / TYPE */}
            <div className="grid grid-cols-3 gap-4">
              <select
                {...form.register("tatoueurId")}
                className="bg-white/30 p-2 rounded-[20px]"
              >
                {tatoueurs.map((tatoueur) => (
                  <option key={tatoueur.id} value={tatoueur.id}>
                    {tatoueur.name}
                  </option>
                ))}
              </select>

              <select
                {...form.register("prestation")}
                className="bg-white/30 p-2 rounded-[20px]"
              >
                <option value="TATTOO">Tattoo</option>
                <option value="PROJET">Projet</option>
                <option value="RETOUCHE">Retouche</option>
                <option value="PIERCING">Piercing</option>
              </select>

              {/* DATE */}
              <input
                type="date"
                value={watchStart ? watchStart.slice(0, 10) : ""}
                onChange={(e) =>
                  form.setValue("start", new Date(e.target.value).toISOString())
                }
                className="bg-white/30 p-2 rounded-[20px]"
                required
              />
            </div>

            {/* CRENEAUX */}
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => {
                const isTaken = occupiedSlots.some((rdvOcc) => {
                  if (rdvOcc.id === rdv.id) return false;
                  const start = new Date(rdvOcc.start).getTime();
                  const end = new Date(rdvOcc.end).getTime();
                  const slotTime = new Date(slot.start).getTime();
                  return slotTime >= start && slotTime < end;
                });

                const isSelected = selectedSlots.includes(slot.start);

                return (
                  <button
                    key={slot.start}
                    type="button"
                    disabled={isTaken}
                    onClick={() => handleSlotClick(slot.start)}
                    className={`p-1 rounded-[20px] text-xs transition-all ${
                      isTaken
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
              <div className="grid grid-cols-2 gap-4">
                <input
                  {...form.register("tattooDetail.description")}
                  placeholder="Description du projet"
                  className="bg-white/30 p-2 rounded-[20px]"
                />
                <input
                  {...form.register("tattooDetail.zone")}
                  placeholder="Zone"
                  className="bg-white/30 p-2 rounded-[20px]"
                />
                <input
                  {...form.register("tattooDetail.size")}
                  placeholder="Taille"
                  className="bg-white/30 p-2 rounded-[20px]"
                />
                <input
                  {...form.register("tattooDetail.colorStyle")}
                  placeholder="Style / Couleur"
                  className="bg-white/30 p-2 rounded-[20px]"
                />
                <input
                  {...form.register("tattooDetail.reference")}
                  placeholder="Image de référence"
                  className="bg-white/30 p-2 rounded-[20px]"
                />
                <input
                  {...form.register("tattooDetail.sketch")}
                  placeholder="Croquis"
                  className="bg-white/30 p-2 rounded-[20px]"
                />
                <input
                  type="number"
                  {...form.register("tattooDetail.estimatedPrice", {
                    valueAsNumber: true,
                  })}
                  placeholder="Prix estimé"
                  className="bg-white/30 p-2 rounded-[20px]"
                />
              </div>
            )}

            {watchPrestation === "TATTOO" && (
              <div className="grid grid-cols-2 gap-4">
                <input
                  {...form.register("tattooDetail.description")}
                  placeholder="Description du tatouage"
                  className="bg-white/30 p-2 rounded-[20px]"
                />
                <input
                  {...form.register("tattooDetail.zone")}
                  placeholder="Zone"
                  className="bg-white/30 p-2 rounded-[20px]"
                />
                <input
                  {...form.register("tattooDetail.size")}
                  placeholder="Taille"
                  className="bg-white/30 p-2 rounded-[20px]"
                />
                <input
                  {...form.register("tattooDetail.colorStyle")}
                  placeholder="Style / Couleur"
                  className="bg-white/30 p-2 rounded-[20px]"
                />
                <input
                  type="number"
                  {...form.register("tattooDetail.estimatedPrice", {
                    valueAsNumber: true,
                  })}
                  placeholder="Prix estimé"
                  className="bg-white/30 p-2 rounded-[20px]"
                />
              </div>
            )}

            {watchPrestation === "PIERCING" && (
              <div className="grid grid-cols-2 gap-4">
                <input
                  {...form.register("tattooDetail.description")}
                  placeholder="Description du piercing"
                  className="bg-white/30 p-2 rounded-[20px]"
                />
                <input
                  {...form.register("tattooDetail.zone")}
                  placeholder="Zone du piercing"
                  className="bg-white/30 p-2 rounded-[20px]"
                />
                <input
                  type="number"
                  {...form.register("tattooDetail.estimatedPrice", {
                    valueAsNumber: true,
                  })}
                  placeholder="Prix"
                  className="bg-white/30 p-2 rounded-[20px]"
                />
              </div>
            )}

            {watchPrestation === "RETOUCHE" && (
              <div className="grid grid-cols-2 gap-4">
                <input
                  {...form.register("tattooDetail.description")}
                  placeholder="Description de la retouche"
                  className="bg-white/30 p-2 rounded-[20px]"
                />
                <input
                  {...form.register("tattooDetail.zone")}
                  placeholder="Zone de la retouche"
                  className="bg-white/30 p-2 rounded-[20px]"
                />
                <input
                  type="number"
                  {...form.register("tattooDetail.estimatedPrice", {
                    valueAsNumber: true,
                  })}
                  placeholder="Prix"
                  className="bg-white/30 p-2 rounded-[20px]"
                />
              </div>
            )}

            <div className="flex justify-center gap-4 mt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="bg-red-900 text-white px-6 py-2 rounded-[20px]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-green-700 text-white px-6 py-2 rounded-[20px] hover:bg-green-800"
              >
                {loading ? "Modification..." : "Modifier le rendez-vous"}
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
