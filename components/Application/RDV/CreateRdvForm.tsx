"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormError } from "@/components/Shared/FormError";
import { FormSuccess } from "@/components/Shared/FormSuccess";
import { appointmentSchema } from "@/lib/zod/validator.schema";
import { TatoueurProps, TimeSlotProps } from "@/lib/type";
import { addMinutes, format } from "date-fns";
import { fr } from "date-fns/locale/fr";

export default function CreateRdvForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [loading, setLoading] = useState(false);

  //! Selection de la prestation change les inputs à afficher
  const [selectedPrestation, setSelectedPrestation] = useState("");
  const [selectedTatoueur, setSelectedTatoueur] = useState<string | null>(null);

  //! Récupérer le nom nom et l'ID des tatoueurs du salon
  const [tatoueurs, setTatoueurs] = useState<TatoueurProps[]>([]);

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

  //!
  const [selectedDate, setSelectedDate] = useState<string>("2025-04-23");
  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>(
    []
  );

  // stocke les créneaux horaires disponibles
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]); // stocke les start ISO
  const [occupiedSlots, setOccupiedSlots] = useState<TimeSlotProps[]>([]);

  // ! Fonction pour gérer le clic sur un créneau horaire
  // Fait en sorte que les créneaux soient consécutifs
  // et que l'on puisse en sélectionner plusieurs
  // ou en désélectionner un (toggle OFF)
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

  // Récupération des créneaux horaires disponibles et les créneaux horaires occupés pour la date sélectionnée
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedDate || !userId) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/timeslots/timeslots?date=${selectedDate}&salonId=${userId}`
        );
        const data = await res.json();
        console.log("✅ Slots reçus :", data);
        setTimeSlots(data);
      } catch (err) {
        console.error("Erreur lors du fetch des créneaux :", err);
      }
    };

    const fetchOccupiedSlots = async () => {
      if (!selectedDate || !userId) return;

      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_BACK_URL
          }/appointments/range?userId=${userId}&start=${startOfDay.toISOString()}&end=${endOfDay.toISOString()}`
        );

        const data = await res.json();
        setOccupiedSlots(data); // [{ start: "...", end: "..." }]
      } catch (err) {
        console.error("Erreur fetch créneaux occupés :", err);
      }
    };

    fetchTimeSlots();
    fetchOccupiedSlots();
  }, [selectedDate, userId]);

  // console.log("selectedDate", selectedDate);
  // console.log("timeSlots", timeSlots);

  //! Formulaire de création de rendez-vous
  const form = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      title: "",
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      clientBirthday: undefined,
      prestation: "TATTOO",
      allDay: false,
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      tatoueurId: "",
      status: "PENDING",
      zone: "",
      description: "",
      colorStyle: "",
      size: "",
      reference: "",
      sketch: "",
      estimatedPrice: 1,
      userId: userId,
    },
  });

  const onSubmit = async (data: z.infer<typeof appointmentSchema>) => {
    console.log("Début de la soumission...");
    console.log("data", data);
    setLoading(true);
    setError("");
    setSuccess("");

    // Empêcher l’envoi si aucun créneau sélectionné
    if (selectedSlots.length === 0) {
      setError("Veuillez sélectionner au moins un créneau horaire.");
      setLoading(false);
      return;
    }

    // Générer dynamiquement start/end
    const sorted = selectedSlots
      .map((s) => new Date(s))
      .sort((a, b) => a.getTime() - b.getTime());

    const start = sorted[0].toISOString();
    const end = addMinutes(sorted[sorted.length - 1], 30).toISOString();

    // 👇 Met à jour les valeurs dans le formulaire
    form.setValue("start", start);
    form.setValue("end", end);

    const isValid = await form.trigger();
    if (!isValid) {
      setError("Merci de corriger les erreurs du formulaire.");
      setLoading(false);
      return;
    }

    const rdvBody = {
      ...data,
      userId,
      start,
      end,
    };

    console.log("✅ Données envoyées :", rdvBody);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/appointments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(rdvBody),
        }
      );

      const result = await response.json();

      if (result.error) {
        setError(result.message || "Une erreur est survenue.");
        setLoading(false);
        return;
      }

      setSuccess("Rendez-vous créé avec succès !");
      form.reset();
    } catch {
      setError("Erreur serveur. Veuillez réessayer.");
    } finally {
      setLoading(false);
      router.push("/mes-rendez-vous");
      setSelectedSlots([]); // Réinitialise les créneaux sélectionnés
      setSelectedTatoueur(null); // Réinitialise le tatoueur sélectionné
    }
  };

  //! Affichage du formulaire de création de rendez-vous
  return (
    <div className="relative">
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log("❌ Erreurs de validation", errors);
        })}
        className="flex flex-col gap-4 text-white font-one text-sm"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="clientName">Titre</label>
            <input
              placeholder="Titre"
              {...form.register("title")}
              className="bg-white/30 py-2 px-4 rounded-[20px]"
            />
            {form.formState.errors.title && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 ">
            <label htmlFor="clientName">Nom du client</label>
            <input
              placeholder="Nom du client"
              {...form.register("clientName")}
              className="bg-white/30 py-2 px-4 rounded-[20px]"
            />
            {form.formState.errors.clientName && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.clientName.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 ">
            <label htmlFor="clientName">Email du client</label>
            <input
              placeholder="Email du client"
              {...form.register("clientEmail")}
              className="bg-white/30 py-2 px-4 rounded-[20px]"
            />
            {form.formState.errors.clientEmail && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.clientEmail.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 ">
            <label htmlFor="clientName">Téléphone du client</label>
            <input
              placeholder="Tél du client"
              {...form.register("clientPhone")}
              className="bg-white/30 py-2 px-4 rounded-[20px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 ">
            <label htmlFor="clientName">Selectionnez le tatoueur</label>
            <select
              {...form.register("tatoueurId")}
              onChange={(e) => {
                setSelectedTatoueur(e.target.value);
              }}
              className="bg-white/30 py-2 px-4 rounded-[20px]"
            >
              <option value="" className="bg-noir-700/50">
                -- Choisissez un tatoueur --
              </option>
              {tatoueurs.map((tatoueur) => (
                <option
                  key={tatoueur.id}
                  value={tatoueur.id}
                  className="bg-noir-700/50"
                >
                  {tatoueur.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 ">
            <label htmlFor="clientName">Type du RDV</label>
            <select
              {...form.register("prestation")}
              onChange={(e) => {
                setSelectedPrestation(e.target.value);
              }}
              className="bg-white/30 py-2 px-4 rounded-[20px]"
            >
              <option value="" className="bg-noir-700/50">
                -- Choisissez le type du rendez-vous --
              </option>
              <option value="TATTOO" className="bg-noir-700/50">
                Tattoo
              </option>
              <option value="PROJET" className="bg-noir-700/50">
                Projet
              </option>
              <option value="RETOUCHE" className="bg-noir-700/50">
                Retouche
              </option>
              <option value="PIERCING" className="bg-noir-700/50">
                Piercing
              </option>
            </select>
          </div>
        </div>

        {selectedTatoueur && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="date">Date du rendez-vous</label>
              <input
                type="date"
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white/30 py-2 px-4 rounded-[20px]"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => {
                const isOccupied = (start: string) => {
                  const startDate = new Date(start).getTime();
                  return occupiedSlots.some((rdv) => {
                    const rdvStart = new Date(rdv.start).getTime();
                    const rdvEnd = new Date(rdv.end).getTime();
                    return startDate >= rdvStart && startDate < rdvEnd;
                  });
                };
                const isSelected = selectedSlots.includes(slot.start);
                const startTime = format(new Date(slot.start), "HH:mm", {
                  locale: fr,
                });
                const endTime = format(new Date(slot.end), "HH:mm", {
                  locale: fr,
                });
                const isTaken = isOccupied(slot.start);

                return (
                  <button
                    key={slot.start}
                    type="button"
                    onClick={() => !isTaken && handleSlotClick(slot.start)} // Désactive le clic si le créneau est occupé
                    className={` py-2 px-3 rounded-[12px] text-sm transition-all 
                    ${
                      isTaken
                        ? " bg-gray-400 text-gray-300 cursor-not-allowed" // Style pour les créneaux occupés
                        : isSelected
                        ? "bg-tertiary-500 text-white cursor-pointer" // Style pour les créneaux sélectionnés
                        : "bg-white/20 text-white border-white/20 border cursor-pointer" // Style par défaut
                    } hover:bg-tertiary-400`}
                  >
                    {startTime} - {endTime}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Champs pour prestation de type "PROJET" */}
        {selectedPrestation === "PROJET" && (
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col gap-2 ">
              <label htmlFor="description">Description du projet</label>
              <input
                placeholder="Description du projet"
                {...form.register("description")}
                className="bg-white/30 py-2 px-4 rounded-[20px]"
              />
            </div>
            <div className="flex flex-col gap-2 ">
              <label htmlFor="zone">Zone du corps</label>
              <input
                placeholder="Bras avant droit"
                {...form.register("zone")}
                className="bg-white/30 py-2 px-4 rounded-[20px]"
              />
            </div>
            <div className="flex flex-col gap-2 ">
              <label htmlFor="size">Taille du tatouage (cm)</label>
              <input
                placeholder="20cm x 30cm"
                {...form.register("size")}
                className="bg-white/30 py-2 px-4 rounded-[20px]"
              />
            </div>
            <div className="flex flex-col gap-2 ">
              <label htmlFor="colorStyle">Style / Couleur du tatouage</label>
              <input
                placeholder="Style gothique, couleur rouge et noir"
                {...form.register("colorStyle")}
                className="bg-white/30 py-2 px-4 rounded-[20px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 ">
                <label htmlFor="clientName">Image de référence 1</label>
                <input
                  placeholder="Image de référence 1"
                  {...form.register("reference")}
                  className="bg-white/30 py-2 px-4 rounded-[20px]"
                />
              </div>

              <div className="flex flex-col gap-2 ">
                <label htmlFor="clientName">Image de référence 2</label>
                <input
                  placeholder="Image de référence 2"
                  {...form.register("sketch")}
                  className="bg-white/30 py-2 px-4 rounded-[20px]"
                />
              </div>
            </div>
          </div>
        )}

        {selectedPrestation === "TATTOO" && (
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col gap-2 ">
              <label htmlFor="description">Description</label>
              <input
                placeholder="Description du tatouage"
                {...form.register("description")}
                className="bg-white/30 py-2 px-4 rounded-[20px]"
              />
            </div>
            <div className="flex flex-col gap-2 ">
              <label htmlFor="zone">Zone du corps</label>
              <input
                placeholder="Avant bras droit"
                {...form.register("zone")}
                className="bg-white/30 py-2 px-4 rounded-[20px]"
              />
            </div>
            <div className="flex flex-col gap-2 ">
              <label htmlFor="size">Taille du tatouage</label>
              <input
                placeholder="30cm x 20cm"
                {...form.register("size")}
                className="bg-white/30 py-2 px-4 rounded-[20px]"
              />
            </div>
            <div className="flex flex-col gap-2 ">
              <label htmlFor="colorStyle">Style / Couleur du tatouage</label>
              <input
                placeholder="Style gothique, couleur rouge et noir"
                {...form.register("colorStyle")}
                className="bg-white/30 py-2 px-4 rounded-[20px]"
              />
            </div>
            <div className="flex flex-col gap-2 ">
              <label htmlFor="estimatedPrice">Prix</label>
              <input
                type="number"
                min={0}
                placeholder="Prix estimé"
                {...form.register("estimatedPrice", { valueAsNumber: true })}
                className="bg-white/30 py-2 px-4 rounded-[20px]"
              />
            </div>
          </div>
        )}

        {selectedPrestation === "PIERCING" && (
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2 ">
              <label htmlFor="description">Description du piercing</label>
              <input
                placeholder="Description"
                {...form.register("description")}
                className="bg-white/30 py-2 px-4 rounded-[20px]"
              />
            </div>
            <div className="flex flex-col gap-2 ">
              <label htmlFor="zone">Zone du piercing</label>
              <input
                placeholder="Zone (si projet)"
                {...form.register("zone")}
                className="bg-white/30 py-2 px-4 rounded-[20px]"
              />
            </div>

            <div className="flex flex-col gap-2 ">
              <label htmlFor="estimatedPrice">Prix</label>
              <input
                type="number"
                placeholder="Prix estimé"
                {...form.register("estimatedPrice")}
                className="bg-white/30 py-2 px-4 rounded-[20px]"
              />
            </div>
          </div>
        )}

        {selectedPrestation === "RETOUCHE" && (
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2 ">
              <label htmlFor="description">Description de la retouche</label>
              <input
                placeholder="Description de la retouche"
                {...form.register("description")}
                className="bg-white/30 py-2 px-4 rounded-[20px]"
              />
            </div>
            <div className="flex flex-col gap-2 ">
              <label htmlFor="zone">Zone du tatouage</label>
              <input
                placeholder="Mollet gauche"
                {...form.register("zone")}
                className="bg-white/30 py-2 px-4 rounded-[20px]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="estimatedPrice">Prix</label>
              <input
                type="number"
                placeholder="Prix estimé"
                {...form.register("estimatedPrice")}
                className="bg-white/30 py-2 px-4 rounded-[20px]"
              />
            </div>
          </div>
        )}

        <FormError message={error} />
        <FormSuccess message={success} />

        <button
          type="submit"
          disabled={loading}
          className="relative mx-auto text-xs cursor-pointer bg-gradient-to-l from-tertiary-400 to-tertiary-500 min-w-[200px] max-w-[400px] text-center text-white font-one py-2 px-4 rounded-[20px] hover:scale-105 transition-all ease-in-out duration-300"
        >
          {loading ? "Création..." : "Créer le rendez-vous"}
        </button>
      </form>
    </div>
  );
}
