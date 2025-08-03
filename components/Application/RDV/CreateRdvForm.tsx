/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { appointmentSchema } from "@/lib/zod/validator.schema";
import { TatoueurProps, TimeSlotProps } from "@/lib/type";
import { addMinutes, format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { toast } from "sonner";
import Link from "next/link";
import SalonImageUploader from "@/components/Application/MonCompte/SalonImageUploader";

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
      price: 1,
      estimatedPrice: 1,
      userId: userId,
    },
  });

  const onSubmit = async (data: z.infer<typeof appointmentSchema>) => {
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
    <div className="min-h-screen bg-noir-700 pb-8">
      <div className="container mx-auto max-w-6xl">
        {/* Form Content */}
        <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.log("❌ Erreurs de validation", errors);
            })}
            className="space-y-6"
          >
            {/* Section: Recherche client */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                🔍 Recherche client
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    Rechercher un client existant
                  </label>
                  <input
                    type="text"
                    value={searchClientQuery}
                    onChange={(e) => setSearchClientQuery(e.target.value)}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    placeholder="Rechercher par nom ou email..."
                  />
                </div>

                {clientResults.length > 0 && (
                  <div className="bg-white/10 border border-white/20 rounded-lg max-h-40 overflow-auto">
                    {clientResults.map((client) => (
                      <div
                        key={client.id}
                        className="cursor-pointer px-3 py-2 text-white text-xs hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
                        onClick={() => {
                          form.setValue("clientLastname", client.lastName);
                          form.setValue("clientFirstname", client.firstName);
                          form.setValue("clientEmail", client.email);
                          form.setValue("clientPhone", client.phone);
                          setSearchClientQuery("");
                          setClientResults([]);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <span>
                            {client.firstName} {client.lastName}
                          </span>
                          <span className="text-white/60">{client.email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section: Informations client */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                👤 Informations client
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">Nom</label>
                  <input
                    placeholder="Nom du client"
                    {...form.register("clientLastname")}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                  {form.formState.errors.clientLastname && (
                    <p className="text-red-300 text-xs">
                      {form.formState.errors.clientLastname.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    Prénom
                  </label>
                  <input
                    placeholder="Prénom du client"
                    {...form.register("clientFirstname")}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                  {form.formState.errors.clientFirstname && (
                    <p className="text-red-300 text-xs">
                      {form.formState.errors.clientFirstname.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    Email
                  </label>
                  <input
                    placeholder="Email du client"
                    {...form.register("clientEmail")}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                  {form.formState.errors.clientEmail && (
                    <p className="text-red-300 text-xs">
                      {form.formState.errors.clientEmail.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    Téléphone (optionnel)
                  </label>
                  <input
                    placeholder="Téléphone du client"
                    {...form.register("clientPhone")}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                </div>
              </div>
            </div>

            {/* Section: Informations générales */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                📋 Détails du rendez-vous
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    Titre
                  </label>
                  <input
                    placeholder="Titre du rendez-vous"
                    {...form.register("title")}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                  {form.formState.errors.title && (
                    <p className="text-red-300 text-xs">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    Tatoueur
                  </label>
                  <select
                    {...form.register("tatoueurId")}
                    onChange={(e) => {
                      setSelectedTatoueur(e.target.value);
                    }}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                  >
                    <option value="" className="bg-noir-500">
                      -- Choisissez un tatoueur --
                    </option>
                    {tatoueurs.map((tatoueur) => (
                      <option
                        key={tatoueur.id}
                        value={tatoueur.id}
                        className="bg-noir-500"
                      >
                        {tatoueur.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-white/70 font-one">
                  Type de prestation
                </label>
                <select
                  {...form.register("prestation")}
                  onChange={(e) => {
                    setSelectedPrestation(e.target.value);
                  }}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                >
                  <option value="" className="bg-noir-500">
                    -- Choisissez le type du rendez-vous --
                  </option>
                  <option value="TATTOO" className="bg-noir-500">
                    Tatouage
                  </option>
                  <option value="PROJET" className="bg-noir-500">
                    Projet
                  </option>
                  <option value="RETOUCHE" className="bg-noir-500">
                    Retouche
                  </option>
                  <option value="PIERCING" className="bg-noir-500">
                    Piercing
                  </option>
                </select>
              </div>
            </div>

            {/* Section: Créneaux horaires */}
            {selectedTatoueur && (
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                  🕒 Créneaux horaires
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-white/70 font-one">
                      Date du rendez-vous
                    </label>
                    <input
                      type="date"
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                    />
                  </div>

                  {timeSlots.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs text-white/70 font-one">
                        Sélectionnez les créneaux (30 min chacun)
                      </label>
                      <p className="text-xs text-white/50 mb-3">
                        Cliquez sur les créneaux pour les sélectionner. Ils
                        doivent être consécutifs.
                      </p>
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {timeSlots.map((slot) => {
                          const isOccupied = (start: string) => {
                            const startDate = new Date(start).getTime();
                            return occupiedSlots.some((rdv) => {
                              const rdvStart = new Date(rdv.start).getTime();
                              const rdvEnd = new Date(rdv.end).getTime();
                              return (
                                startDate >= rdvStart && startDate < rdvEnd
                              );
                            });
                          };
                          const isSelected = selectedSlots.includes(slot.start);
                          const startTime = format(
                            new Date(slot.start),
                            "HH:mm",
                            {
                              locale: fr,
                            }
                          );
                          const endTime = format(new Date(slot.end), "HH:mm", {
                            locale: fr,
                          });
                          const isTaken = isOccupied(slot.start);

                          return (
                            <button
                              key={slot.start}
                              type="button"
                              onClick={() =>
                                !isTaken && handleSlotClick(slot.start)
                              }
                              className={`p-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                                isTaken
                                  ? "bg-gray-500/20 text-gray-400 cursor-not-allowed border border-gray-500/30"
                                  : isSelected
                                  ? "bg-tertiary-500 text-white border border-tertiary-400"
                                  : "bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-tertiary-400/50"
                              }`}
                            >
                              <div className="text-center">
                                <div>{startTime}</div>
                                <div className="opacity-70">-</div>
                                <div>{endTime}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sections conditionnelles selon le type de prestation */}
            {selectedPrestation === "PROJET" && (
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                  🎨 Détails du projet
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-white/70 font-one">
                      Description du projet
                    </label>
                    <textarea
                      placeholder="Description du projet"
                      {...form.register("description")}
                      rows={3}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors resize-none placeholder-white/50"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-white/70 font-one">
                        Zone du corps
                      </label>
                      <input
                        placeholder="Bras avant droit"
                        {...form.register("zone")}
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-white/70 font-one">
                        Taille (cm)
                      </label>
                      <input
                        placeholder="20cm x 30cm"
                        {...form.register("size")}
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-white/70 font-one">
                        Style/Couleur
                      </label>
                      <input
                        placeholder="Style gothique, rouge et noir"
                        {...form.register("colorStyle")}
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-white/70 font-one">
                        Prix estimé (€)
                      </label>
                      <input
                        type="number"
                        min={0}
                        placeholder="Prix estimé"
                        {...form.register("estimatedPrice", {
                          valueAsNumber: true,
                        })}
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                      />
                    </div>
                  </div>

                  {/* Section Upload des images de référence */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-white/70 font-one">
                        Image de référence 1
                      </label>
                      <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                        <SalonImageUploader
                          currentImage={form.watch("reference") || undefined}
                          onImageUpload={(imageUrl) => {
                            form.setValue("reference", imageUrl);
                          }}
                          onImageRemove={() => {
                            form.setValue("reference", "");
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
                          currentImage={form.watch("sketch") || undefined}
                          onImageUpload={(imageUrl) => {
                            form.setValue("sketch", imageUrl);
                          }}
                          onImageRemove={() => {
                            form.setValue("sketch", "");
                          }}
                          compact={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedPrestation === "TATTOO" && (
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                  🖋️ Détails du tatouage
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-white/70 font-one">
                      Description
                    </label>
                    <input
                      placeholder="Description du tatouage"
                      {...form.register("description")}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-white/70 font-one">
                        Zone du corps
                      </label>
                      <input
                        placeholder="Avant bras droit"
                        {...form.register("zone")}
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-white/70 font-one">
                        Taille
                      </label>
                      <input
                        placeholder="30cm x 20cm"
                        {...form.register("size")}
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-white/70 font-one">
                        Style/Couleur
                      </label>
                      <input
                        placeholder="Style gothique, rouge et noir"
                        {...form.register("colorStyle")}
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-white/70 font-one">
                        Prix (€)
                      </label>
                      <input
                        type="number"
                        min={0}
                        placeholder="Prix"
                        {...form.register("price", {
                          valueAsNumber: true,
                        })}
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedPrestation === "PIERCING" && (
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                  💎 Détails du piercing
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-white/70 font-one">
                      Description du piercing
                    </label>
                    <textarea
                      placeholder="Description"
                      {...form.register("description")}
                      rows={3}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors resize-none placeholder-white/50"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-white/70 font-one">
                        Zone du piercing
                      </label>
                      <input
                        placeholder="Zone du piercing"
                        {...form.register("zone")}
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-white/70 font-one">
                        Prix (€)
                      </label>
                      <input
                        type="number"
                        placeholder="Prix"
                        {...form.register("price")}
                        className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedPrestation === "RETOUCHE" && (
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                  🔧 Détails de la retouche
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-white/70 font-one">
                      Description de la retouche
                    </label>
                    <input
                      placeholder="Description de la retouche"
                      {...form.register("description")}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-white/70 font-one">
                      Zone du tatouage
                    </label>
                    <input
                      placeholder="Mollet gauche"
                      {...form.register("zone")}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-white/70 font-one">
                      Prix (€)
                    </label>
                    <input
                      type="number"
                      placeholder="Prix"
                      {...form.register("price")}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Messages d'erreur et de succès */}
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
                <p className="text-red-300 text-xs">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-xl">
                <p className="text-green-300 text-xs">{success}</p>
              </div>
            )}

            {/* Footer avec boutons d'action */}
            <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
              <Link
                href={"/mes-rendez-vous"}
                className="cursor-pointer px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer px-8 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs"
              >
                {loading ? "Création..." : "Créer le rendez-vous"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
