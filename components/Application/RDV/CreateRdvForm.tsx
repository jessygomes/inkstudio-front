/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { FormError } from "@/components/Shared/FormError";
import { FormSuccess } from "@/components/Shared/FormSuccess";
import { appointmentSchema } from "@/lib/zod/validator.schema";
import { TatoueurProps, TimeSlotProps } from "@/lib/type";
import { addMinutes, format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { toast } from "sonner";
import Link from "next/link";

export default function CreateRdvForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [loading, setLoading] = useState(false);

  //! Date sélectionnée pour le rendez-vous
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>(
    []
  );

  //! stocke les créneaux horaires disponibles
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]); // stocke les start ISO
  const [occupiedSlots, setOccupiedSlots] = useState<TimeSlotProps[]>([]);

  //! Selection de la prestation change les inputs à afficher
  const [selectedPrestation, setSelectedPrestation] = useState("");
  const [selectedTatoueur, setSelectedTatoueur] = useState<string | null>(null);

  //! Récupérer les tatoueurs
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

  // console.log("tatoueurs", tatoueurs);

  //! Fetch slots en fonction du tatoueur sélectionné
  // useEffect(() => {
  //   if (!selectedTatoueur) return;

  //   const selected = tatoueurs.find((t) => t.id === selectedTatoueur);
  //   if (selected?.hours) {
  //     try {
  //       const parsedHours = JSON.parse(selected.hours);
  //       setTimeSlots(generateTimeSlots(parsedHours, selectedDate));
  //     } catch (e) {
  //       console.error("Erreur parsing horaires du tatoueur :", e);
  //     }
  //   }

  // console.log("selectedTatoueur", selectedTatoueur);
  // console.log("selectedDate", selectedDate);

  // console.log("timeslot", timeSlots);

  useEffect(() => {
    if (!selectedDate || !selectedTatoueur) return;

    const fetchTimeSlots = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/timeslots/tatoueur?date=${selectedDate}&tatoueurId=${selectedTatoueur}`
        );
        // if (!res.ok) {
        //   throw new Error("Erreur lors de la récupération des créneaux");
        // }
        const data = await res.json();
        setTimeSlots(data);
      } catch (err) {
        setTimeSlots([]);
        console.error("Erreur lors du fetch des créneaux :", err);
      }
    };

    const fetchOccupied = async () => {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACK_URL
        }/appointments/tatoueur-range?tatoueurId=${selectedTatoueur}&start=${startOfDay.toISOString()}&end=${endOfDay.toISOString()}`
      );
      const data = await res.json();
      setOccupiedSlots(data);
    };

    fetchTimeSlots();
    fetchOccupied();
  }, [selectedDate, selectedTatoueur]);

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
  // useEffect(() => {
  //   const fetchTimeSlots = async () => {
  //     if (!selectedDate || !userId) return;
  //     try {
  //       const res = await fetch(
  //         // `${process.env.NEXT_PUBLIC_BACK_URL}/timeslots/timeslots?date=${selectedDate}&salonId=${userId}`
  //         `${process.env.NEXT_PUBLIC_BACK_URL}/timeslots/timeslots?date=${selectedDate}&tatoueurId=${selectedTatoueur}`
  //       );
  //       const data = await res.json();
  //       console.log("✅ Slots reçus :", data);
  //       setTimeSlots(data);
  //     } catch (err) {
  //       console.error("Erreur lors du fetch des créneaux :", err);
  //     }
  //   };

  //   const fetchOccupiedSlots = async () => {
  //     if (!selectedDate || !userId) return;

  //     const startOfDay = new Date(selectedDate);
  //     startOfDay.setHours(0, 0, 0, 0);

  //     const endOfDay = new Date(selectedDate);
  //     endOfDay.setHours(23, 59, 59, 999);

  //     try {
  //       const res = await fetch(
  //         `${
  //           process.env.NEXT_PUBLIC_BACK_URL
  //         }/appointments/range?tatoueurId=${selectedTatoueur}&start=${startOfDay.toISOString()}&end=${endOfDay.toISOString()}`
  //       );

  //       const data = await res.json();
  //       setOccupiedSlots(data); // [{ start: "...", end: "..." }]
  //     } catch (err) {
  //       console.error("Erreur fetch créneaux occupés :", err);
  //     }
  //   };

  //   fetchTimeSlots();
  //   fetchOccupiedSlots();
  // }, [selectedDate, userId]);

  // console.log("selectedDate", selectedDate);
  // console.log("timeSlots", timeSlots);

  //! Fonction pour rechercher un client par email
  const [searchClientQuery, setSearchClientQuery] = useState("");
  const [clientResults, setClientResults] = useState<any[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClientSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setClientResults([]);
        return;
      }

      console.log(
        "Searching clients with query:",
        query,
        "for userId:",
        userId
      );

      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_BACK_URL
          }/clients/search?query=${encodeURIComponent(query)}&userId=${userId}`
        );
        if (!res.ok) {
          setClientResults([]);
          throw new Error("Erreur lors de la recherche de clients");
        }
        const results = await res.json();
        console.log("Client search results:", results);

        // Gérer la structure de réponse du backend
        if (results.error) {
          console.log("Erreur backend:", results.message);
          setClientResults([]);
        } else {
          setClientResults(results.clients || []);
        }
      } catch (error) {
        console.error("Erreur recherche client :", error);
        setClientResults([]);
      }
    },
    [userId]
  );

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (searchClientQuery.length < 2) {
      setClientResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      handleClientSearch(searchClientQuery);
    }, 400); // délai de 400ms

    searchTimeoutRef.current = timeout;
  }, [searchClientQuery, handleClientSearch]);

  console.log("clientResults", clientResults);

  //! Formulaire de création de rendez-vous
  const form = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      title: "",
      clientFirstname: "",
      clientLastname: "",
      clientEmail: "",
      clientPhone: "",
      clientBirthday: undefined,
      prestation: "",
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
      toast.error("Erreur lors de la création du rendez-vous.");
    } finally {
      setLoading(false);
      router.push("/mes-rendez-vous");
      setSelectedSlots([]); // Réinitialise les créneaux sélectionnés
      setSelectedTatoueur(null); // Réinitialise le tatoueur sélectionné
      toast.success("Rendez-vous créé avec succès !");
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
        <div className="flex gap-2 items-end">
          <input
            type="text"
            value={searchClientQuery}
            onChange={(e) => setSearchClientQuery(e.target.value)}
            className="w-full border-b border-gray-300 bg-white/30 px-3 py-2 text-xs text-white"
            placeholder="Rechercher un client par nom ou email..."
          />
        </div>
        {clientResults.length > 0 && (
          <div className="border border-tertiary-500 rounded p-1 mb-4 bg-primary-400 max-h-40 overflow-auto hover:bg-primary-500">
            {clientResults.map((client) => (
              <div
                key={client.id}
                className="cursor-pointer text-noir-500 px-2 py-1 text-xs"
                onClick={() => {
                  form.setValue("clientLastname", client.lastName);
                  form.setValue("clientFirstname", client.firstName);
                  form.setValue("clientEmail", client.email);
                  form.setValue("clientPhone", client.phone);
                  setSearchClientQuery(""); // reset l'input
                  setClientResults([]); // fermer les résultats
                }}
              >
                {client.firstName} {client.lastName} - {client.email}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col gap-2 ">
            <label htmlFor="clientLastname">Nom du client</label>
            <input
              placeholder="Prénom du client"
              {...form.register("clientLastname")}
              className="bg-white/30 py-2 px-4 rounded-[20px]"
            />
            {form.formState.errors.clientLastname && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.clientLastname.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 ">
            <label htmlFor="clientName">Prénom du client</label>
            <input
              placeholder="Prénom du client"
              {...form.register("clientFirstname")}
              className="bg-white/30 py-2 px-4 rounded-[20px]"
            />
            {form.formState.errors.clientFirstname && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.clientFirstname.message}
              </p>
            )}
          </div>

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
            <label htmlFor="clientPhone">Téléphone du client (optionnel)</label>
            <input
              placeholder="Tél du client"
              {...form.register("clientPhone")}
              className="bg-white/30 py-2 px-4 rounded-[20px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {" "}
          <div className="flex flex-col gap-2">
            <label htmlFor="title">Titre</label>
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
            <label htmlFor="tatoueurId">Selectionnez le tatoueur</label>
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

        <div className="grid grid-cols-2 gap-4">
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

        {/* Champs pour prestation de type "PROJET" */}
        {selectedPrestation === "PROJET" && (
          <>
            <div className="flex flex-col gap-2 ">
              <label htmlFor="description">Description du projet</label>
              <textarea
                placeholder="Description du projet"
                {...form.register("description")}
                className="bg-white/30 py-2 px-4 rounded-[20px]"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
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
          </>
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
          <>
            <div className="flex flex-col gap-2 ">
              <label htmlFor="description">Description du piercing</label>
              <textarea
                placeholder="Description"
                {...form.register("description")}
                className="bg-white/30 py-2 px-4 rounded-[20px]"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
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
          </>
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

        <div className="flex gap-4 mt-2">
          <Link
            href={"/mes-rendez-vous"}
            className="relative text-xs cursor-pointer w-full bg-noir-500/60 text-center text-white font-one py-2 px-4 rounded-[20px] hover:bg-noir-500/80 transition-all ease-in-out duration-300"
          >
            Revenir à la liste des rendez-vous
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="relative mx-auto text-xs cursor-pointer bg-gradient-to-l from-tertiary-400 to-tertiary-500 w-full text-center text-white font-one py-2 px-4 rounded-[20px] hover:bg-tertiary-500 transition-all ease-in-out duration-300"
          >
            {loading ? "Création..." : "Créer le rendez-vous"}
          </button>
        </div>
      </form>
    </div>
  );
}
