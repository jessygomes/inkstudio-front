/* eslint-disable react/no-unescaped-entities */
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
import { createAppointment } from "@/lib/queries/appointment";

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
  const [blockedSlots, setBlockedSlots] = useState<any[]>([]);
  const [proposeCreneau, setProposeCreneau] = useState<any[]>([]);

  //! Selection de la prestation change les inputs à afficher
  const [selectedPrestation, setSelectedPrestation] = useState("");
  const [selectedTatoueur, setSelectedTatoueur] = useState<string | null>(null);

  //! Récupérer les tatoueurs
  const [tatoueurs, setTatoueurs] = useState<TatoueurProps[]>([]);

  useEffect(() => {
    const fetchTatoueurs = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs/user/${userId}`
      );
      const data = await response.json();
      setTatoueurs(data);
    };
    fetchTatoueurs();
  }, []);

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

    // NOUVELLE FONCTION : Récupérer les créneaux bloqués
    const fetchBlockedSlots = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/blocked-slots/tatoueur/${selectedTatoueur}`
        );
        const data = await res.json();
        if (!data.error) {
          setBlockedSlots(data.blockedSlots || []);
        }
      } catch (err) {
        console.error("Erreur lors du fetch des créneaux bloqués :", err);
        setBlockedSlots([]);
      }
    };

    // Correction ici : bien formatter start et end en ISO et appeler la bonne route
    const fetchProposeCreneau = async () => {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      try {
        const url = `${
          process.env.NEXT_PUBLIC_BACK_URL
        }/blocked-slots/propose-creneau?tatoueurId=${selectedTatoueur}&start=${encodeURIComponent(
          startOfDay.toISOString()
        )}&end=${encodeURIComponent(endOfDay.toISOString())}`;

        const res = await fetch(url);

        const data = await res.json();

        // Ici, data doit être un tableau (cf. service)
        setProposeCreneau(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur lors du fetch des créneaux proposés :", err);
        setProposeCreneau([]);
      }
    };

    fetchTimeSlots();
    fetchOccupied();
    fetchBlockedSlots();
    fetchProposeCreneau();
  }, [selectedDate, selectedTatoueur]);

  // Fonction pour vérifier si un créneau est dans une période bloquée
  const isSlotBlocked = (slotStart: string, slotEnd?: string) => {
    // Vérification plus stricte du tatoueur sélectionné
    if (!selectedTatoueur) {
      return false;
    }

    const slotStartDate = new Date(slotStart);
    // Si pas de slotEnd fournie, calculer la fin du créneau (30 min après le début)
    const slotEndDate = slotEnd
      ? new Date(slotEnd)
      : new Date(slotStartDate.getTime() + 30 * 60 * 1000);

    const isBlocked = blockedSlots.some((blocked) => {
      const blockedStart = new Date(blocked.startDate);
      const blockedEnd = new Date(blocked.endDate);

      // Normaliser toutes les dates en UTC pour la comparaison
      const slotStartUTC = slotStartDate.getTime();
      const slotEndUTC = slotEndDate.getTime();
      const blockedStartUTC = blockedStart.getTime();
      const blockedEndUTC = blockedEnd.getTime();

      // Vérifier si le créneau chevauche avec la période bloquée
      // Un créneau est bloqué si :
      // - Il commence avant la fin du blocage ET
      // - Il se termine après le début du blocage
      const hasOverlap =
        slotStartUTC < blockedEndUTC && slotEndUTC > blockedStartUTC;

      // Vérifier que le blocage concerne le bon tatoueur
      const concernsTatoueur =
        blocked.tatoueurId === selectedTatoueur || blocked.tatoueurId === null;

      return hasOverlap && concernsTatoueur;
    });
    return isBlocked;
  };

  // ! Fonction pour gérer le clic sur un créneau horaire
  // Fait en sorte que les créneaux soient consécutifs
  // et que l'on puisse en sélectionner plusieurs
  // ou en désélectionner un (toggle OFF)
  const handleSlotClick = (slotStart: string) => {
    // Vérifier si le créneau est bloqué avant de permettre la sélection
    const isBlockedResult = isSlotBlocked(slotStart);

    if (isBlockedResult) {
      toast.error("Ce créneau est indisponible (période bloquée)");
      return;
    }

    // Vérifier si le créneau est occupé
    const isOccupied = (start: string) => {
      return occupiedSlots.some((slot) => {
        const slotStart = new Date(start);
        const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);
        const occupiedStart = new Date(slot.start);
        const occupiedEnd = new Date(slot.end);

        return slotStart < occupiedEnd && slotEnd > occupiedStart;
      });
    };

    const isOccupiedResult = isOccupied(slotStart);

    if (isOccupiedResult) {
      toast.error("Ce créneau est déjà occupé");
      return;
    }

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

        // Gérer la structure de réponse du backend
        if (results.error) {
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
    },
  });

  const onSubmit = async (data: z.infer<typeof appointmentSchema>) => {
    setLoading(true);
    setError("");
    setSuccess("");

    // Empêcher l'envoi si aucun créneau sélectionné
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
      start,
      end,
    };

    try {
      const result = await createAppointment(rdvBody);

      if (result.error === true) {
        // Gestion spécifique des erreurs de limite SaaS
        if (
          result.message &&
          result.message.includes("Limite de rendez-vous par mois atteinte")
        ) {
          setError("SAAS_LIMIT_APPOINTMENTS");
        } else if (
          result.message &&
          result.message.includes("Limite de fiches clients atteinte")
        ) {
          setError("SAAS_LIMIT_CLIENTS");
        } else {
          setError(result.message || "Une erreur est survenue.");
        }
        setLoading(false);
        return;
      }

      setSuccess("Rendez-vous créé avec succès !");
      form.reset();
      router.push("/mes-rendez-vous");
      setSelectedSlots([]); // Réinitialise les créneaux sélectionnés
      setSelectedTatoueur(null); // Réinitialise le tatoueur sélectionné
      toast.success("Rendez-vous créé avec succès !");
    } catch {
      setError("Erreur serveur. Veuillez réessayer.");
      toast.error("Erreur lors de la création du rendez-vous.");
    } finally {
      setLoading(false);
    }
  };

  // Ajout d'un helper pour savoir si un créneau est déjà proposé
  const getProposedSlot = (slotStart: string, slotEnd: string) => {
    // On cherche un créneau proposé qui chevauche ce slot
    return proposeCreneau.find((proposed: any) => {
      const from = new Date(proposed.from).getTime();
      const to = new Date(proposed.to).getTime();
      const slotStartTime = new Date(slotStart).getTime();
      const slotEndTime = new Date(slotEnd).getTime();
      // chevauchement strict
      return slotStartTime < to && slotEndTime > from;
    });
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
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                    />
                  </div>

                  {/* Affichage conditionnel des créneaux ou message de fermeture */}
                  {selectedDate && selectedTatoueur && (
                    <>
                      {timeSlots.length > 0 ? (
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
                                return occupiedSlots.some((occupiedSlot) => {
                                  const slotStart = new Date(start);
                                  const slotEnd = new Date(
                                    slotStart.getTime() + 30 * 60 * 1000
                                  );
                                  const occupiedStart = new Date(
                                    occupiedSlot.start
                                  );
                                  const occupiedEnd = new Date(
                                    occupiedSlot.end
                                  );

                                  return (
                                    slotStart < occupiedEnd &&
                                    slotEnd > occupiedStart
                                  );
                                });
                              };

                              const isSelected = selectedSlots.includes(
                                slot.start
                              );
                              const startTime = format(
                                new Date(slot.start),
                                "HH:mm",
                                { locale: fr }
                              );
                              const endTime = format(
                                new Date(slot.end),
                                "HH:mm",
                                { locale: fr }
                              );
                              const isTaken = isOccupied(slot.start);
                              const isBlocked = isSlotBlocked(
                                slot.start,
                                slot.end
                              );

                              // Ajout : check si déjà proposé
                              const proposed = getProposedSlot(
                                slot.start,
                                slot.end
                              );
                              const isProposed = !!proposed;

                              // Déterminer la couleur et l'état du bouton
                              let buttonClass =
                                "cursor-pointer px-2 py-1 rounded text-xs text-white font-one transition-all duration-200 border ";
                              let buttonText = `${startTime}-${endTime}`;
                              let isDisabled = false;

                              if (isProposed) {
                                buttonClass +=
                                  "bg-blue-900/40 text-blue-300 border-blue-700/50 cursor-not-allowed";
                                buttonText += " ⏳";
                                isDisabled = true;
                              } else if (isBlocked) {
                                buttonClass +=
                                  "bg-red-900/50 text-red-300 border-red-700/50 cursor-not-allowed";
                                buttonText += " 🚫";
                                isDisabled = true;
                              } else if (isTaken) {
                                buttonClass +=
                                  "bg-gray-700/50 text-gray-400 border-gray-600/50 cursor-not-allowed";
                                buttonText += " ❌";
                                isDisabled = true;
                              } else if (isSelected) {
                                buttonClass +=
                                  "bg-green-600/30 text-green-300 border-green-500/50 hover:bg-green-600/50";
                              } else {
                                buttonClass +=
                                  "bg-tertiary-600/20 text-tertiary-300 border-tertiary-500/30 hover:bg-tertiary-600/40 hover:text-white";
                              }

                              // Ajout du tooltip pour les créneaux proposés
                              let buttonTitle = "";
                              if (isProposed) {
                                buttonTitle = `Déjà proposé à ${
                                  proposed.appointmentRequest
                                    ?.clientFirstname || ""
                                } ${
                                  proposed.appointmentRequest?.clientLastname ||
                                  ""
                                } (${
                                  proposed.appointmentRequest?.clientEmail || ""
                                })\nPrestation: ${
                                  proposed.appointmentRequest?.prestation || ""
                                }`;
                              } else if (isBlocked) {
                                buttonTitle = "Créneau bloqué - indisponible";
                              } else if (isTaken) {
                                buttonTitle = "Créneau déjà réservé";
                              } else if (isSelected) {
                                buttonTitle =
                                  "Créneau sélectionné - cliquer pour désélectionner";
                              } else {
                                buttonTitle =
                                  "Créneau disponible - cliquer pour sélectionner";
                              }

                              return (
                                <button
                                  key={`${slot.start}-${slot.end}`}
                                  type="button"
                                  onClick={() =>
                                    !isDisabled && handleSlotClick(slot.start)
                                  }
                                  disabled={isDisabled}
                                  className={buttonClass}
                                  title={buttonTitle}
                                >
                                  {buttonText}
                                </button>
                              );
                            })}
                          </div>

                          {/* Légende des créneaux */}
                          <div className="mt-4 flex flex-wrap gap-4 text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-tertiary-600/20 border border-tertiary-500/30 rounded"></div>
                              <span className="text-white/70 font-one">
                                Libre
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-600/30 border border-green-500/50 rounded"></div>
                              <span className="text-white/70 font-one">
                                Sélectionné
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-gray-700/50 border border-gray-600/50 rounded"></div>
                              <span className="text-white/70 font-one">
                                Occupé ❌
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-red-900/50 border border-red-700/50 rounded"></div>
                              <span className="text-white/70 font-one">
                                Bloqué 🚫
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-900/40 border border-blue-700/50 rounded"></div>
                              <span className="text-white/70 font-one">
                                Proposé ⏳
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Message quand le salon est fermé */
                        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg
                                className="w-4 h-4 text-orange-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-orange-300 font-semibold font-one text-sm mb-2">
                                🚫 Salon fermé ce jour
                              </h4>
                              <p className="text-orange-300/80 text-xs font-one mb-3">
                                Le tatoueur{" "}
                                <strong>
                                  {
                                    tatoueurs.find(
                                      (t) => t.id === selectedTatoueur
                                    )?.name
                                  }
                                </strong>{" "}
                                n&apos;est pas disponible le{" "}
                                <strong>
                                  {new Date(selectedDate).toLocaleDateString(
                                    "fr-FR",
                                    {
                                      weekday: "long",
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    }
                                  )}
                                </strong>
                                .
                              </p>
                              <div className="space-y-2">
                                <p className="text-orange-300/70 text-xs font-one">
                                  💡 Suggestions :
                                </p>
                                <ul className="text-orange-300/60 text-xs space-y-1 font-one ml-4">
                                  <li>• Choisissez une autre date</li>
                                  <li>• Sélectionnez un autre tatoueur</li>
                                  <li>
                                    • Vérifiez les horaires d&apos;ouverture du
                                    salon
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Message d'information sur les créneaux sélectionnés */}
                  {selectedSlots.length > 0 && (
                    <div className="bg-tertiary-500/10 border border-tertiary-500/20 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <svg
                          className="w-4 h-4 text-tertiary-400"
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
                        <span className="text-tertiary-400 font-semibold font-one text-sm">
                          {selectedSlots.length} créneau
                          {selectedSlots.length > 1 ? "x" : ""} sélectionné
                          {selectedSlots.length > 1 ? "s" : ""}
                        </span>
                      </div>
                      <p className="text-tertiary-400/80 text-xs font-one">
                        Durée totale :{" "}
                        <strong>{selectedSlots.length * 30} minutes</strong>
                        {selectedSlots.length > 0 && (
                          <>
                            {" • "}
                            De{" "}
                            <strong>
                              {format(
                                new Date(
                                  Math.min(
                                    ...selectedSlots.map((s) =>
                                      new Date(s).getTime()
                                    )
                                  )
                                ),
                                "HH:mm"
                              )}
                            </strong>{" "}
                            à{" "}
                            <strong>
                              {format(
                                addMinutes(
                                  new Date(
                                    Math.max(
                                      ...selectedSlots.map((s) =>
                                        new Date(s).getTime()
                                      )
                                    )
                                  ),
                                  30
                                ),
                                "HH:mm"
                              )}
                            </strong>
                          </>
                        )}
                      </p>
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

            {/* Messages d'erreur and de succès */}
            {error && error === "SAAS_LIMIT_APPOINTMENTS" ? (
              /* Message spécial pour la limite de rendez-vous */
              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-4 h-4 text-orange-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-2-2v6a2 2 0 01-2 2H10a2 2 0 01-2-2v-6"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-orange-300 font-semibold font-one mb-2 text-sm">
                      📅 Limite de rendez-vous atteinte
                    </h3>

                    <p className="text-orange-200 text-xs font-one mb-3">
                      Vous avez atteint la limite de rendez-vous par mois de
                      votre plan actuel.
                    </p>

                    <div className="bg-white/10 rounded-lg p-3 mb-3">
                      <h4 className="text-white font-semibold font-one text-xs mb-2">
                        📈 Solutions disponibles :
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 bg-tertiary-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-tertiary-400 text-[10px] font-bold">
                              1
                            </span>
                          </div>
                          <div className="text-white/90">
                            <span className="font-semibold text-tertiary-400">
                              Plan PRO (29€/mois)
                            </span>
                            <br />
                            <span className="text-white/70">
                              Rendez-vous illimités + fonctionnalités avancées
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 bg-purple-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-purple-400 text-[10px] font-bold">
                              2
                            </span>
                          </div>
                          <div className="text-white/90">
                            <span className="font-semibold text-purple-400">
                              Plan BUSINESS (69€/mois)
                            </span>
                            <br />
                            <span className="text-white/70">
                              Solution complète multi-salons
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          window.location.href = "/parametres";
                        }}
                        className="cursor-pointer px-3 py-1.5 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg text-xs font-one font-medium transition-all duration-300"
                      >
                        📊 Changer de plan
                      </button>

                      <button
                        type="button"
                        onClick={() => setError("")}
                        className="cursor-pointer px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 text-xs font-one font-medium transition-colors"
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : error && error === "SAAS_LIMIT_CLIENTS" ? (
              /* Message spécial pour la limite de clients (lors de création automatique) */
              <div className="bg-gradient-to-r from-red-500/20 to-purple-500/20 border border-red-500/50 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-4 h-4 text-red-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-red-300 font-semibold font-one mb-2 text-sm">
                      👥 Impossible de créer le client
                    </h3>

                    <p className="text-red-200 text-xs font-one mb-3">
                      Ce client n'existe pas dans votre base et vous avez
                      atteint la limite de fiches clients de votre plan.
                    </p>

                    <div className="bg-white/10 rounded-lg p-3 mb-3">
                      <h4 className="text-white font-semibold font-one text-xs mb-2">
                        💡 Options disponibles :
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 bg-blue-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-400 text-[10px] font-bold">
                              1
                            </span>
                          </div>
                          <div className="text-white/90">
                            <span className="font-semibold text-blue-400">
                              Utiliser un client existant
                            </span>
                            <br />
                            <span className="text-white/70">
                              Recherchez le client dans la liste ci-dessus
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 bg-tertiary-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-tertiary-400 text-[10px] font-bold">
                              2
                            </span>
                          </div>
                          <div className="text-white/90">
                            <span className="font-semibold text-tertiary-400">
                              Plan PRO/BUSINESS
                            </span>
                            <br />
                            <span className="text-white/70">
                              Clients et rendez-vous illimités
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          window.location.href = "/parametres";
                        }}
                        className="cursor-pointer px-3 py-1.5 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg text-xs font-one font-medium transition-all duration-300"
                      >
                        📊 Changer de plan
                      </button>

                      <button
                        type="button"
                        onClick={() => setError("")}
                        className="cursor-pointer px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 text-xs font-one font-medium transition-colors"
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : error ? (
              /* Message d'erreur standard */
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
                <p className="text-red-300 text-xs">{error}</p>
              </div>
            ) : null}

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
