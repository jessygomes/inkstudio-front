/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { appointmentSchema } from "@/lib/zod/validator.schema";
import { TatoueurProps, TimeSlotProps } from "@/lib/type";
import { addMinutes, format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { toast } from "sonner";
import Link from "next/link";
import SalonImageUploader from "@/components/Application/MonCompte/SalonImageUploader";
import SkinToneSelect, { SkinToneOption } from "@/components/Application/RDV/SkinToneSelect";
import { createAppointment } from "@/lib/queries/appointment";
import { getPiercingPrice } from "@/lib/queries/piercing";

type PiercingZone = {
  id: string;
  piercingZone: string;
  isActive: boolean;
  servicesCount: number;
  services: PiercingService[];
};

type PiercingService = {
  id: string;
  specificZone: boolean;
  price: number;
  description: string | null;
  piercingZoneOreille?: string | null;
  piercingZoneVisage?: string | null;
  piercingZoneBouche?: string | null;
  piercingZoneCorps?: string | null;
  piercingZoneMicrodermal?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const SKIN_REQUIRED_PRESTATIONS = new Set(["TATTOO", "RETOUCHE", "PROJET"]);

export default function CreateRdvForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [loading, setLoading] = useState(false);

  //! Date sélectionnée pour le rendez-vous
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>(
    [],
  );

  //! stocke les créneaux horaires disponibles
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]); // stocke les start ISO
  const [occupiedSlots, setOccupiedSlots] = useState<TimeSlotProps[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<any[]>([]);
  const SLOT_STEP_MS = 30 * 60 * 1000;
  // const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  //! Selection de la prestation change les inputs à afficher
  const [selectedPrestation, setSelectedPrestation] = useState("");
  const [selectedTatoueur, setSelectedTatoueur] = useState<string | null>(null);
  const [skinToneOptions, setSkinToneOptions] = useState<SkinToneOption[]>([]);
  const [isLoadingSkinTones, setIsLoadingSkinTones] = useState(false);
  const [skinTonesError, setSkinTonesError] = useState<string | null>(null);

  //! Récupérer les tatoueurs
  const [tatoueurs, setTatoueurs] = useState<TatoueurProps[]>([]);

  useEffect(() => {
    const fetchTatoueurs = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs/for-appointment/${userId}`,
      );
      const data = await response.json();
      setTatoueurs(data);
    };
    fetchTatoueurs();
  }, [userId]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchSkinTones = async () => {
      try {
        setIsLoadingSkinTones(true);
        setSkinTonesError(null);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/skin-tones`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des teintes de peau");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Format de réponse invalide pour les teintes de peau");
        }

        setSkinToneOptions(data);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Erreur lors du fetch des teintes de peau :", err);
        setSkinToneOptions([]);
        setSkinTonesError("Impossible de charger les teintes de peau.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSkinTones(false);
        }
      }
    };

    fetchSkinTones();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedDate || !selectedTatoueur) return;

    const fetchTimeSlots = async () => {
      try {
        // setIsLoadingSlots(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/timeslots/tatoueur?date=${selectedDate}&tatoueurId=${selectedTatoueur}&includeUnavailable=true`,
        );
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
        }/appointments/tatoueur-range?tatoueurId=${selectedTatoueur}&start=${startOfDay.toISOString()}&end=${endOfDay.toISOString()}`,
      );
      const data = await res.json();
      setOccupiedSlots(data);
    };

    const fetchBlockedSlots = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/blocked-slots/tatoueur/${selectedTatoueur}`,
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

    fetchTimeSlots();
    fetchOccupied();
    fetchBlockedSlots();
  }, [selectedDate, selectedTatoueur]);

  // Fonction pour vérifier si un créneau chevauche une période bloquée
  const isSlotBlocked = (slotStart: string, slotEnd?: string) => {
    if (!selectedTatoueur) return false;

    const slotStartDate = new Date(slotStart);
    const slotEndDate = slotEnd
      ? new Date(slotEnd)
      : new Date(slotStartDate.getTime() + 30 * 60 * 1000);

    const isBlocked = blockedSlots.some((blocked) => {
      const blockedStart = new Date(blocked.startDate);
      const blockedEnd = new Date(blocked.endDate);

      const slotStartUTC = slotStartDate.getTime();
      const slotEndUTC = slotEndDate.getTime();
      const blockedStartUTC = blockedStart.getTime();
      const blockedEndUTC = blockedEnd.getTime();

      const hasOverlap =
        slotStartUTC < blockedEndUTC && slotEndUTC > blockedStartUTC;

      const concernsTatoueur =
        blocked.tatoueurId === selectedTatoueur || blocked.tatoueurId === null;

      return hasOverlap && concernsTatoueur;
    });
    return isBlocked;
  };

  const isSlotOccupied = (slotStart: string, slotEnd?: string) => {
    const slotStartDate = new Date(slotStart);
    const slotEndDate = slotEnd
      ? new Date(slotEnd)
      : new Date(slotStartDate.getTime() + SLOT_STEP_MS);

    const slotStartUTC = slotStartDate.getTime();
    const slotEndUTC = slotEndDate.getTime();

    return occupiedSlots.some((slot) => {
      const occupiedStartUTC = new Date(slot.start).getTime();
      const occupiedEndUTC = new Date(slot.end).getTime();

      return slotStartUTC < occupiedEndUTC && slotEndUTC > occupiedStartUTC;
    });
  };

  const slotsByTimestamp = useMemo(() => {
    const map = new Map<number, { start: string; end: string }>();

    timeSlots.forEach((slot) => {
      map.set(new Date(slot.start).getTime(), slot);
    });

    return map;
  }, [timeSlots]);

  // ! Fonction pour gérer le clic sur un créneau horaire
  // Clic sur un slot déjà sélectionné: retire ce slot et tous les suivants.
  // Clic sur un slot libre: sélectionne toute la plage entre la borne existante et ce slot.
  const handleSlotClick = (slotStart: string) => {
    const clickedTs = new Date(slotStart).getTime();

    // Vérifier si le créneau est bloqué avant de permettre la sélection
    const isBlockedResult = isSlotBlocked(slotStart);

    if (isBlockedResult) {
      toast.error("Ce créneau est indisponible (période bloquée)");
      return;
    }

    // Vérifier si le créneau est occupé
    const isOccupiedResult = isSlotOccupied(slotStart);

    if (isOccupiedResult) {
      toast.error("Ce créneau est déjà occupé");
      return;
    }

    if (selectedSlots.includes(slotStart)) {
      const newSelection = selectedSlots
        .filter((s) => new Date(s).getTime() < clickedTs)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      setSelectedSlots(newSelection);

      return;
    }

    if (selectedSlots.length === 0) {
      setSelectedSlots([slotStart]);
      return;
    }

    const selectedTs = selectedSlots
      .map((s) => new Date(s).getTime())
      .sort((a, b) => a - b);

    const minSelectedTs = selectedTs[0];
    const maxSelectedTs = selectedTs[selectedTs.length - 1];

    const rangeStartTs = Math.min(clickedTs, minSelectedTs);
    const rangeEndTs = Math.max(clickedTs, maxSelectedTs);

    const rangeSelection: string[] = [];

    for (let ts = rangeStartTs; ts <= rangeEndTs; ts += SLOT_STEP_MS) {
      const slot = slotsByTimestamp.get(ts);

      if (!slot) {
        toast.error("Impossible de sélectionner une plage discontinue.");
        return;
      }

      if (isSlotBlocked(slot.start, slot.end)) {
        toast.error("Un créneau bloqué est présent dans la plage.");
        return;
      }

      if (isSlotOccupied(slot.start, slot.end)) {
        toast.error("Un créneau occupé est présent dans la plage.");
        return;
      }

      rangeSelection.push(slot.start);
    }

    setSelectedSlots(rangeSelection);
  };

  //! Fonction pour rechercher un client par email
  const [searchClientQuery, setSearchClientQuery] = useState("");
  const [clientResults, setClientResults] = useState<any[]>([]);
  const [userClientResults, setUserClientResults] = useState<any[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClientSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setClientResults([]);
        setUserClientResults([]);
        return;
      }

      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_BACK_URL
          }/clients/search?query=${encodeURIComponent(query)}&userId=${userId}`,
        );
        if (!res.ok) {
          setClientResults([]);
          setUserClientResults([]);
          throw new Error("Erreur lors de la recherche de clients");
        }
        const results = await res.json();

        console.log("Résultats de la recherche client :", results);

        // Gérer la structure de réponse du backend
        if (results.error) {
          setClientResults([]);
          setUserClientResults([]);
        } else {
          setClientResults(results.clients || []);
          setUserClientResults(results.userClients || []);
        }
      } catch (error) {
        console.error("Erreur recherche client :", error);
        setClientResults([]);
        setUserClientResults([]);
      }
    },
    [userId],
  );

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (searchClientQuery.length < 2) {
      setClientResults([]);
      setUserClientResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      handleClientSearch(searchClientQuery);
    }, 400); // délai de 400ms

    searchTimeoutRef.current = timeout;
  }, [searchClientQuery, handleClientSearch]);

  //! États pour la gestion des zones de piercing
  const [piercingZones, setPiercingZones] = useState<PiercingZone[]>([]);
  const [selectedPiercingZone, setSelectedPiercingZone] = useState<string>("");
  const [selectedPiercingService, setSelectedPiercingService] =
    useState<string>("");
  const [isLoadingPiercingZones, setIsLoadingPiercingZones] = useState(false);

  // Charger les zones de piercing quand la prestation PIERCING est sélectionnée
  useEffect(() => {
    if (selectedPrestation === "PIERCING") {
      const fetchPiercingZones = async () => {
        try {
          setIsLoadingPiercingZones(true);
          console.log("Fetching piercing zones for salon:", userId);

          // Utiliser le server action pour récupérer toutes les configurations
          const result = await getPiercingPrice({ salonId: userId });
          console.log("Piercing zones result received:", result);

          if (result.ok && result.data) {
            // Si on a des données, les utiliser
            const zones = Array.isArray(result.data) ? result.data : [];
            console.log("Setting piercing zones:", zones);
            setPiercingZones(zones);
          } else {
            // Gestion des erreurs
            console.error(
              "Erreur lors du fetch des zones de piercing:",
              result.message || "Erreur inconnue",
            );
            setPiercingZones([]);

            // Optionnel: afficher un toast d'erreur pour informer l'utilisateur
            // toast.error(`Impossible de charger les zones de piercing: ${result.message}`);
          }
        } catch (err) {
          console.error(
            "Erreur catch lors du fetch des zones de piercing:",
            err,
          );
          setPiercingZones([]);

          // Optionnel: toast d'erreur réseau
          // toast.error("Erreur réseau lors du chargement des zones de piercing");
        } finally {
          setIsLoadingPiercingZones(false);
        }
      };

      fetchPiercingZones();
    } else {
      // Reset quand on change de prestation
      setPiercingZones([]);
      setSelectedPiercingZone("");
      setSelectedPiercingService("");
    }
  }, [selectedPrestation, userId]);

  const selectedZoneServices = useMemo(() => {
    const zone = piercingZones.find((z) => z.id === selectedPiercingZone);
    return zone?.services || [];
  }, [piercingZones, selectedPiercingZone]);

  const selectedServicePrice = useMemo(() => {
    const service = selectedZoneServices.find(
      (s) => s.id === selectedPiercingService,
    );
    return service?.price || 0;
  }, [selectedZoneServices, selectedPiercingService]);

  // Fonction pour extraire le nom détaillé de la zone selon les champs de service
  const getServiceZoneName = (service: PiercingService): string => {
    if (service.piercingZoneOreille) return service.piercingZoneOreille;
    if (service.piercingZoneVisage) return service.piercingZoneVisage;
    if (service.piercingZoneBouche) return service.piercingZoneBouche;
    if (service.piercingZoneCorps) return service.piercingZoneCorps;
    if (service.piercingZoneMicrodermal) return service.piercingZoneMicrodermal;
    return service.description || "Zone non spécifiée";
  };

  //! Formulaire de création de rendez-vous
  const form = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      title: "",
      clientFirstname: "",
      clientLastname: "",
      clientEmail: "",
      clientPhone: "",
      clientBirthdate: "",
      prestation: "",
      skin: undefined,
      allDay: false,
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      tatoueurId: "",
      status: "PENDING",
      visio: false,
      zone: "",
      description: "",
      colorStyle: "",
      size: "",
      reference: "",
      sketch: "",
      price: 1,
      estimatedPrice: 1,
      // Champs spécifiques aux piercings
      piercingZone: "",
      piercingZoneOreille: null,
      piercingZoneVisage: null,
      piercingZoneBouche: null,
      piercingZoneCorps: null,
      piercingZoneMicrodermal: null,
    },
  });

  const isSkinRequired = SKIN_REQUIRED_PRESTATIONS.has(selectedPrestation);

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

    // Ajouter les champs spécifiques aux piercings si c'est une prestation PIERCING
    if (data.prestation === "PIERCING" && selectedPiercingService) {
      const selectedService = selectedZoneServices.find(
        (s) => s.id === selectedPiercingService,
      );
      const selectedZone = piercingZones.find(
        (z) => z.id === selectedPiercingZone,
      );

      if (selectedService && selectedZone) {
        // Définir le prix du piercing
        rdvBody.estimatedPrice = selectedService.price;
        rdvBody.price = selectedService.price;

        // Ajouter la zone principale
        rdvBody.piercingZone = selectedZone.piercingZone;

        // Mapper les zones spécifiques selon la logique backend
        const zoneLower = selectedZone.piercingZone?.toLowerCase();

        // Réinitialiser tous les champs de zone à null
        rdvBody.piercingZoneOreille = null;
        rdvBody.piercingZoneVisage = null;
        rdvBody.piercingZoneBouche = null;
        rdvBody.piercingZoneCorps = null;
        rdvBody.piercingZoneMicrodermal = null;

        // Assigner le bon champ selon la zone
        switch (zoneLower) {
          case "oreille":
          case "oreilles":
            rdvBody.piercingZoneOreille = selectedService.id;
            break;
          case "visage":
            rdvBody.piercingZoneVisage = selectedService.id;
            break;
          case "bouche":
          case "langue":
          case "lèvre":
          case "lèvres":
            rdvBody.piercingZoneBouche = selectedService.id;
            break;
          case "corps":
          case "torse":
          case "ventre":
          case "nombril":
            rdvBody.piercingZoneCorps = selectedService.id;
            break;
          case "microdermal":
          case "micro-dermal":
          case "implant":
            rdvBody.piercingZoneMicrodermal = selectedService.id;
            break;
          default:
            // Par défaut, considérer comme piercing corps
            rdvBody.piercingZoneCorps = selectedService.id;
            break;
        }
      }
    }

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

  //! Affichage du formulaire de création de rendez-vous
  return (
    <div className="min-h-screen bg-noir-700 pb-8">
      <div className="container mx-auto w-full">
        {/* Form Content */}
        <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-xl p-4 sm:p-8 border border-white/20 shadow-2xl">
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.log("❌ Erreurs de validation", errors);
            })}
            className="tablet-inputs space-y-4 sm:space-y-6"
          >
            {/* Section: Recherche client */}
            <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                🔍 Recherche client
              </h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm text-white/70 font-one">
                    Rechercher un client existant
                  </label>
                  <input
                    type="text"
                    value={searchClientQuery}
                    onChange={(e) => setSearchClientQuery(e.target.value)}
                    className="w-full p-3 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    placeholder="Rechercher par nom ou email..."
                  />
                </div>

                {(clientResults.length > 0 || userClientResults.length > 0) && (
                  <div className="bg-white/10 border border-white/20 rounded-lg max-h-48 sm:max-h-40 overflow-auto">
                    {/* Clients existants du salon */}
                    {clientResults.map((client) => (
                      <div
                        key={`salon-${client.id}`}
                        className="cursor-pointer px-3 py-3 sm:py-2 text-white text-sm sm:text-xs hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
                        onClick={() => {
                          form.setValue("clientLastname", client.lastName);
                          form.setValue("clientFirstname", client.firstName);
                          form.setValue("clientEmail", client.email);
                          form.setValue("clientPhone", client.phone || "");
                          if (client.birthDate) {
                            form.setValue(
                              "clientBirthdate",
                              new Date(client.birthDate)
                                .toISOString()
                                .slice(0, 10),
                            );
                          }
                          setSearchClientQuery("");
                          setClientResults([]);
                          setUserClientResults([]);
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium truncate">
                                {client.firstName} {client.lastName}
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30 whitespace-nowrap">
                                📋 Client salon
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:gap-2 text-xs">
                              <span className="text-white/60 truncate">
                                {client.email}
                              </span>
                              {client.phone && (
                                <span className="text-white/50">
                                  📞 {client.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* UserClients (clients avec compte plateforme) */}
                    {userClientResults.map((userClient) => {
                      // Vérifier si cet email existe déjà dans les clients du salon
                      const existsInSalon = clientResults.some(
                        (salonClient) => salonClient.email === userClient.email,
                      );

                      return (
                        <div
                          key={`user-${userClient.id}`}
                          className="cursor-pointer px-3 py-3 sm:py-2 text-white text-sm sm:text-xs hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
                          onClick={() => {
                            form.setValue(
                              "clientLastname",
                              userClient.lastName,
                            );
                            form.setValue(
                              "clientFirstname",
                              userClient.firstName,
                            );
                            form.setValue("clientEmail", userClient.email);
                            form.setValue(
                              "clientPhone",
                              userClient.phone || "",
                            );
                            if (userClient.birthDate) {
                              form.setValue(
                                "clientBirthdate",
                                new Date(userClient.birthDate)
                                  .toISOString()
                                  .slice(0, 10),
                              );
                            }
                            setSearchClientQuery("");
                            setClientResults([]);
                            setUserClientResults([]);
                          }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-medium truncate">
                                  {userClient.firstName} {userClient.lastName}
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 whitespace-nowrap">
                                  👤 Compte plateforme
                                </span>
                                {existsInSalon && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 whitespace-nowrap">
                                    ⚠️ Déjà client
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col sm:flex-row sm:gap-2 text-xs">
                                <span className="text-white/60 truncate">
                                  {userClient.email}
                                </span>
                                {userClient.phone && (
                                  <span className="text-white/50">
                                    📞 {userClient.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Section: Informations client */}
            <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                👤 Informations client
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    Nom *
                  </label>
                  <input
                    placeholder="Nom du client"
                    {...form.register("clientLastname")}
                    className="w-full p-3 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                  {form.formState.errors.clientLastname && (
                    <p className="text-red-300 text-xs">
                      {form.formState.errors.clientLastname.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    Prénom *
                  </label>
                  <input
                    placeholder="Prénom du client"
                    {...form.register("clientFirstname")}
                    className="w-full p-3 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                  {form.formState.errors.clientFirstname && (
                    <p className="text-red-300 text-xs">
                      {form.formState.errors.clientFirstname.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    Email *
                  </label>
                  <input
                    placeholder="Email du client"
                    {...form.register("clientEmail")}
                    className="w-full p-3 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                  {form.formState.errors.clientEmail && (
                    <p className="text-red-300 text-xs">
                      {form.formState.errors.clientEmail.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    Téléphone *
                  </label>
                  <input
                    placeholder="Téléphone du client"
                    {...form.register("clientPhone")}
                    className="w-full p-3 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                  {form.formState.errors.clientPhone && (
                    <p className="text-red-300 text-xs">
                      {form.formState.errors.clientPhone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    Date de naissance *
                  </label>
                  <input
                    type="date"
                    placeholder="Date de naissance"
                    {...form.register("clientBirthdate")}
                    className="w-full p-3 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                  {form.formState.errors.clientBirthdate && (
                    <p className="text-red-300 text-xs">
                      {form.formState.errors.clientBirthdate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section: Informations générales */}
            <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                📋 Détails du rendez-vous
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    Titre
                  </label>
                  <input
                    placeholder="Titre du rendez-vous"
                    {...form.register("title")}
                    className="w-full p-3 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
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
                      form.setValue("tatoueurId", e.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setSelectedTatoueur(e.target.value);
                    }}
                    className="w-full p-3 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
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
                    form.setValue("prestation", e.target.value as z.infer<typeof appointmentSchema>["prestation"], {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setSelectedPrestation(e.target.value);

                    if (!SKIN_REQUIRED_PRESTATIONS.has(e.target.value)) {
                      form.clearErrors("skin");
                    }
                  }}
                  className="w-full p-3 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
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

               {/* Champ Visio */}
              <div className="space-y-1 mt-6 bg-white/10 p-3 rounded-lg border border-white/20">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...form.register("visio")}
                    className="w-4 h-4 bg-white/10 border border-white/20 rounded focus:outline-none focus:border-tertiary-400 transition-colors accent-tertiary-400"
                  />
                  <span className="text-xs text-white/70 font-one">
                    Rendez-vous en visioconférence
                  </span>
                </label>
              </div>
              <p className="text-xs text-white/50 mt-2 font-one">
                Cochez cette case si le rendez-vous se déroulera en ligne via
                visioconférence
              </p>
            </div>

              {isSkinRequired && (
                <div className="mt-4 w-fit mx-auto rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
                  <SkinToneSelect
                    options={skinToneOptions}
                    value={form.watch("skin")}
                    loading={isLoadingSkinTones}
                    required={isSkinRequired}
                    error={
                      form.formState.errors.skin?.message ||
                      skinTonesError ||
                      undefined
                    }
                    onChange={(value) => {
                      form.setValue("skin", value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  />
                  <p className="mt-2 text-xs text-white/45 font-one">
                    Obligatoire pour les rendez-vous de tatouage, retouche et projet.
                  </p>
                </div>
              )}

             

            {/* Section: Créneaux horaires */}
            {selectedTatoueur && (
              <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
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
                      className="w-full p-3 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                    />
                  </div>

                  {/* Affichage conditionnel des créneaux ou message de fermeture */}
                  {selectedDate && selectedTatoueur && (
                    <>
                      {timeSlots.length > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <label className="text-xs text-white/70 font-one">
                              Sélectionnez les créneaux (30 min chacun)
                            </label>
                            {selectedSlots.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setSelectedSlots([])}
                                className="px-2 py-1 rounded border border-white/20 text-white/80 text-xs font-one hover:bg-white/10 transition-colors"
                              >
                                Désélectionner tout
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-white/50 mb-3">
                            Cliquez sur les créneaux pour les sélectionner. Ils
                            doivent être consécutifs.
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {timeSlots.map((slot) => {
                              const isOccupied = (start: string) => {
                                return occupiedSlots.some((occupiedSlot) => {
                                  const slotStart = new Date(start);
                                  const slotEnd = new Date(
                                    slotStart.getTime() + 30 * 60 * 1000,
                                  );
                                  const occupiedStart = new Date(
                                    occupiedSlot.start,
                                  );
                                  const occupiedEnd = new Date(
                                    occupiedSlot.end,
                                  );

                                  return (
                                    slotStart < occupiedEnd &&
                                    slotEnd > occupiedStart
                                  );
                                });
                              };

                              const isSelected = selectedSlots.includes(
                                slot.start,
                              );
                              const startTime = format(
                                new Date(slot.start),
                                "HH:mm",
                                { locale: fr },
                              );
                              const endTime = format(
                                new Date(slot.end),
                                "HH:mm",
                                { locale: fr },
                              );
                              const isTaken = isOccupied(slot.start);
                              const isBlocked = isSlotBlocked(
                                slot.start,
                                slot.end,
                              );

                              // Déterminer la couleur et l'état du bouton
                              let buttonClass =
                                "cursor-pointer px-2 py-2 sm:py-1 rounded text-xs text-white font-one transition-all duration-200 border text-center ";
                              let buttonText = `${startTime}-${endTime}`;
                              let isDisabled = false;

                              if (isBlocked) {
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
                              if (isBlocked) {
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

                          {/* Légende des créneaux - responsive */}
                          <div className="mt-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 text-xs">
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
                              {/* <h4 className="text-orange-300 font-semibold font-one text-sm mb-2">
                                🚫 Salon fermé ce jour
                              </h4> */}
                              <p className="text-orange-300/80 text-xs sm:text-sm font-one mb-3">
                                Le tatoueur{" "}
                                <strong>
                                  {
                                    tatoueurs.find(
                                      (t) => t.id === selectedTatoueur,
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
                                    },
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
                          className="w-4 h-4 text-tertiary-400 flex-shrink-0"
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
                      <div className="text-tertiary-400/80 text-xs font-one">
                        <p className="mb-1">
                          Durée totale :{" "}
                          <strong>{selectedSlots.length * 30} minutes</strong>
                        </p>
                        {selectedSlots.length > 0 && (
                          <p>
                            De{" "}
                            <strong>
                              {format(
                                new Date(
                                  Math.min(
                                    ...selectedSlots.map((s) =>
                                      new Date(s).getTime(),
                                    ),
                                  ),
                                ),
                                "HH:mm",
                              )}
                            </strong>{" "}
                            à{" "}
                            <strong>
                              {format(
                                addMinutes(
                                  new Date(
                                    Math.max(
                                      ...selectedSlots.map((s) =>
                                        new Date(s).getTime(),
                                      ),
                                    ),
                                  ),
                                  30,
                                ),
                                "HH:mm",
                              )}
                            </strong>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sections conditionnelles selon le type de prestation - responsive */}
            {selectedPrestation === "PROJET" && (
              <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
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
                      className="w-full p-3 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors resize-none placeholder-white/50"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-white/70 font-one">
                        Zone du corps
                      </label>
                      <input
                        placeholder="Bras avant droit"
                        {...form.register("zone")}
                        className="w-full p-3 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-white/70 font-one">
                        Taille (cm)
                      </label>
                      <input
                        placeholder="20cm x 30cm"
                        {...form.register("size")}
                        className="w-full p-3 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-white/70 font-one">
                        Style/Couleur
                      </label>
                      <input
                        placeholder="Style gothique, rouge et noir"
                        {...form.register("colorStyle")}
                        className="w-full p-3 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
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
                        className="w-full p-3 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                      />
                    </div>
                  </div>

                  {/* Section Upload des images de référence - responsive */}
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
              <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
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
                      className="w-full p-3 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-white/70 font-one">
                        Zone du corps
                      </label>
                      <input
                        placeholder="Avant bras droit"
                        {...form.register("zone")}
                        className="w-full p-3 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-white/70 font-one">
                        Taille
                      </label>
                      <input
                        placeholder="30cm x 20cm"
                        {...form.register("size")}
                        className="w-full p-3 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-white/70 font-one">
                        Style/Couleur
                      </label>
                      <input
                        placeholder="Style gothique, rouge et noir"
                        {...form.register("colorStyle")}
                        className="w-full p-3 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
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
                        className="w-full p-3 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedPrestation === "PIERCING" && (
              <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
                <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                  💎 Détails du piercing
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-white/70 font-one">
                      Zone de piercing
                    </label>
                    {isLoadingPiercingZones ? (
                      <div className="flex items-center justify-center p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-tertiary-400 border-t-transparent mr-2"></div>
                        <span className="text-white/70 text-xs">
                          Chargement des zones...
                        </span>
                      </div>
                    ) : piercingZones.length > 0 ? (
                      <select
                        className="w-full p-3 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                        value={selectedPiercingZone}
                        onChange={(e) => {
                          setSelectedPiercingZone(e.target.value);
                          setSelectedPiercingService(""); // Reset service selection
                          form.setValue(
                            "zone",
                            e.target.value
                              ? piercingZones.find(
                                  (z) => z.id === e.target.value,
                                )?.piercingZone || ""
                              : "",
                          );
                        }}
                      >
                        <option value="" className="bg-noir-500">
                          -- Choisissez une zone --
                        </option>
                        {piercingZones.map((zone) => (
                          <option
                            key={zone.id}
                            value={zone.id}
                            className="bg-noir-500"
                          >
                            {zone.piercingZone} ({zone.servicesCount} option
                            {zone.servicesCount > 1 ? "s" : ""})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                        <p className="text-orange-300 text-xs font-one">
                          Aucune zone de piercing configurée pour ce salon.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Sélection du service spécifique */}
                  {selectedPiercingZone && selectedZoneServices.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-xs text-white/70 font-one">
                        Zone détaillée et prix
                      </label>
                      <div className="space-y-2">
                        {selectedZoneServices.map((service) => (
                          <label
                            key={service.id}
                            className={`cursor-pointer p-3 rounded-lg border transition-all duration-200 block ${
                              selectedPiercingService === service.id
                                ? "border-tertiary-500/70 bg-tertiary-500/10"
                                : "border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/8"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="piercingService"
                                value={service.id}
                                checked={selectedPiercingService === service.id}
                                onChange={(e) => {
                                  setSelectedPiercingService(e.target.value);
                                  // Mettre à jour le prix dans le formulaire
                                  form.setValue("price", service.price);
                                  form.setValue(
                                    "estimatedPrice",
                                    service.price,
                                  );
                                }}
                                className="w-3 h-3 text-tertiary-500 focus:ring-tertiary-400 bg-transparent border-white/30"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="text-white font-one font-medium text-sm">
                                      {getServiceZoneName(service)}
                                    </span>
                                    {service.description && (
                                      <span className="text-xs text-white/60 font-one mt-1">
                                        {service.description}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-tertiary-400 font-one font-bold">
                                    {service.price}€
                                  </span>
                                </div>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prix total affiché */}
                  {selectedServicePrice > 0 && (
                    <div className="bg-tertiary-500/10 border border-tertiary-500/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-tertiary-400 font-semibold font-one text-sm">
                            Prix du piercing
                          </h4>
                          <p className="text-white/70 text-xs font-one">
                            Prix indicatif, peut varier selon les bijoux choisis
                          </p>
                        </div>
                        <div className="text-xl font-bold text-tertiary-400 font-one">
                          {selectedServicePrice}€
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedPrestation === "RETOUCHE" && (
              <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
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
                      className="w-full p-3 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-white/70 font-one">
                      Zone du tatouage
                    </label>
                    <input
                      placeholder="Mollet gauche"
                      {...form.register("zone")}
                      className="w-full p-3 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
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
                      className="w-full p-3 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Messages d'erreur and de succès - responsive */}
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

            {/* Footer avec boutons d'action - responsive */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-white/10">
              <Link
                href={"/mes-rendez-vous"}
                className="cursor-pointer px-6 py-3 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-sm sm:text-xs text-center"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer px-8 py-3 sm:py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-sm sm:text-xs"
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
