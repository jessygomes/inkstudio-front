/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { appointmentSchema } from "@/lib/zod/validator.schema";
import { TatoueurProps, TimeSlotProps } from "@/lib/type";
import { addMinutes, format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { toast } from "sonner";
import CreationWorkspace from "@/components/Shared/CreationWorkspace";
import { Paintbrush, MessageSquare, Sparkles, Gem, Check, Save, LoaderCircle } from "lucide-react";
import DashboardButton from "@/components/Shared/DashboardButton";
import SalonImageUploader from "@/components/Application/MonCompte/SalonImageUploader";
import SkinToneSelect, {
  SkinToneOption,
} from "@/components/Application/RDV/SkinToneSelect";
import { residencyRequest } from "@/lib/residencies-client";
import { createAppointment } from "@/lib/queries/appointment";
import { getPiercingPrice } from "@/lib/queries/piercing";
import DrawingCardSelect from "@/components/Application/SuiviDessin/DrawingCardSelect";
import { searchClientsAction } from "@/lib/queries/client";
import { getAppointmentMoodboardOptions } from "@/lib/queries/moodboard";

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

const PRESTATION_OPTIONS = [
  {
    value: "TATTOO",
    label: "Tatouage",
    description: "Séance de réalisation d'un tatouage",
  },
  {
    value: "PROJET",
    label: "Projet",
    description: "Échange et préparation d'un futur tatouage",
  },
  {
    value: "RETOUCHE",
    label: "Retouche",
    description: "Correction ou finition d'un tatouage existant",
  },
  {
    value: "PIERCING",
    label: "Piercing",
    description: "Pose d'un piercing et choix de la zone",
  },
] as const;

function RdvSectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5 flex flex-col gap-1.5">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35 font-one">
          {eyebrow}
        </p>
        <h3 className="mt-1 text-base font-semibold tracking-tight text-white font-one">
          {title}
        </h3>
      </div>
      {description && (
        <p className="max-w-2xl text-xs leading-5 text-white/40 font-one">
          {description}
        </p>
      )}
    </div>
  );
}

export default function CreateRdvForm({ userId }: { userId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [loading, setLoading] = useState(false);

  const userRole = session?.user?.role;
  const agendaMode = session?.user?.agendaMode;
  const isUserTatoueur = userRole === "user_tatoueur";
  const isSalonGlobal =
    userRole === "user_salon" &&
    String(agendaMode || "").toUpperCase() === "GLOBAL";
  const shouldUseGlobalAgenda = isSalonGlobal; // user_tatoueur ne doit PAS utiliser la vue globale

  const [residencies, setResidencies] = useState<any[]>([]);
  const [venueSalonId, setVenueSalonId] = useState("");
  const [residenciesReady, setResidenciesReady] = useState(false);
  useEffect(() => { if (!isUserTatoueur) { setResidenciesReady(true); return; } let active = true; residencyRequest().then(data => { if (active) { setResidencies(data.residencies); setResidenciesReady(true); } }).catch(() => { if (active) setError("Impossible de charger les salons. Rechargez la page."); }); return () => { active = false; }; }, [isUserTatoueur]);
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
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

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
      if (isUserTatoueur) {
        setTatoueurs([
          {
            id: userId,
            name:
              session?.user?.salonName || session?.user?.name || "Mon agenda",
            description: null,
            style: [],
            skills: [],
          },
        ]);
        setSelectedTatoueur(userId);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs/for-appointment/${userId}`,
      );
      const data = await response.json();
      setTatoueurs(data);
    };
    fetchTatoueurs();
  }, [userId, isUserTatoueur, session?.user?.salonName, session?.user?.name]);

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
          throw new Error(
            "Format de réponse invalide pour les teintes de peau",
          );
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
    if (!selectedDate || (!selectedTatoueur && !isUserTatoueur)) return;
    if (!residenciesReady || (isUserTatoueur && residencies.length > 0 && !venueSalonId)) { setTimeSlots([]); return; }

    const tatoueurScopeId = isUserTatoueur ? userId : selectedTatoueur;
    if (!tatoueurScopeId) return;

    let active = true;
    const fetchTimeSlots = async () => {
      try {
        const res = await fetch(
          (isUserTatoueur && venueSalonId) || (!isUserTatoueur && selectedTatoueur?.startsWith("linked_")) ? `${process.env.NEXT_PUBLIC_BACK_URL}/residencies/my-availability?date=${selectedDate}&artistId=${String(tatoueurScopeId).replace(/^linked_/, "")}&salonId=${isUserTatoueur ? venueSalonId : userId}` : isUserTatoueur ? `${process.env.NEXT_PUBLIC_BACK_URL}/timeslots/salon/${userId}?date=${selectedDate}&includeUnavailable=true` : `${process.env.NEXT_PUBLIC_BACK_URL}/timeslots/tatoueur?date=${selectedDate}&tatoueurId=${tatoueurScopeId}&includeUnavailable=true`,
          { headers: { Authorization: `Bearer ${session?.accessToken}` } },
        );
        if (!res.ok) throw new Error("Disponibilités indisponibles");
        const data = await res.json();
        if (active) setTimeSlots(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) setTimeSlots([]);
        console.error("Erreur lors du fetch des créneaux :", err);
      }
    };

    const fetchOccupied = async () => {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const occupiedUrl = shouldUseGlobalAgenda
        ? `${
            process.env.NEXT_PUBLIC_BACK_URL
          }/appointments/range?userId=${userId}&start=${startOfDay.toISOString()}&end=${endOfDay.toISOString()}`
        : `${
            process.env.NEXT_PUBLIC_BACK_URL
          }/appointments/tatoueur-range?tatoueurId=${tatoueurScopeId}&start=${startOfDay.toISOString()}&end=${endOfDay.toISOString()}`;

      const res = await fetch(occupiedUrl);
      const data = await res.json();
      if (active) setOccupiedSlots(Array.isArray(data) ? data : data?.appointments || []);
    };

    const fetchBlockedSlots = async () => {
      try {
        const blockedUrl = shouldUseGlobalAgenda
          ? `${process.env.NEXT_PUBLIC_BACK_URL}/blocked-slots/salon/${userId}`
          : `${process.env.NEXT_PUBLIC_BACK_URL}/blocked-slots/tatoueur/${tatoueurScopeId}`;

        const res = await fetch(blockedUrl);
        const data = await res.json();
        if (!data.error) {
          if (active) setBlockedSlots(data.blockedSlots || []);
        }
      } catch (err) {
        console.error("Erreur lors du fetch des créneaux bloqués :", err);
        if (active) setBlockedSlots([]);
      }
    };

    const fetchAllSlotsData = async () => {
      setIsLoadingSlots(true);
      try {
        if ((isUserTatoueur && venueSalonId) || selectedTatoueur?.startsWith("linked_")) { setOccupiedSlots([]); setBlockedSlots([]); await fetchTimeSlots(); }
        else await Promise.allSettled([fetchTimeSlots(), fetchOccupied(), fetchBlockedSlots()]);
      } finally {
        if (active) setIsLoadingSlots(false);
      }
    };

    fetchAllSlotsData();
    return () => { active = false; };
  }, [
    selectedDate,
    venueSalonId, residenciesReady, residencies.length, session?.accessToken,
    selectedTatoueur,
    isUserTatoueur,
    shouldUseGlobalAgenda,
    userId,
  ]);

  // Fonction pour vérifier si un créneau chevauche une période bloquée
  const isSlotBlocked = (slotStart: string, slotEnd?: string) => {
    if (!selectedTatoueur && !isUserTatoueur) return false;

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

      const concernsTatoueur = shouldUseGlobalAgenda
        ? blocked.tatoueurId == null
        : blocked.tatoueurId === selectedTatoueur ||
          blocked.tatoueurId === null;

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

    const selectedDateStart = new Date(selectedDate);
    selectedDateStart.setHours(0, 0, 0, 0);
    const selectedDateEnd = new Date(selectedDate);
    selectedDateEnd.setHours(23, 59, 59, 999);

    const pushSlot = (startMs: number, endMs: number) => {
      const clampedStart = Math.max(startMs, selectedDateStart.getTime());
      const clampedEnd = Math.min(endMs, selectedDateEnd.getTime() + 1);
      if (clampedStart >= clampedEnd) return;

      for (let ts = clampedStart; ts < clampedEnd; ts += SLOT_STEP_MS) {
        if (!map.has(ts)) {
          map.set(ts, {
            start: new Date(ts).toISOString(),
            end: new Date(ts + SLOT_STEP_MS).toISOString(),
          });
        }
      }
    };

    timeSlots.forEach((slot) => {
      map.set(new Date(slot.start).getTime(), slot);
    });

    occupiedSlots.forEach((slot) => {
      pushSlot(new Date(slot.start).getTime(), new Date(slot.end).getTime());
    });

    blockedSlots.forEach((blocked) => {
      const startValue = blocked?.startDate;
      const endValue = blocked?.endDate;
      if (!startValue || !endValue) return;

      pushSlot(new Date(startValue).getTime(), new Date(endValue).getTime());
    });

    return map;
  }, [timeSlots, occupiedSlots, blockedSlots, selectedDate, SLOT_STEP_MS]);

  const displayedTimeSlots = useMemo(
    () =>
      Array.from(slotsByTimestamp.values()).sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      ),
    [slotsByTimestamp],
  );

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

  const handleClientSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setClientResults([]);
      setUserClientResults([]);
      return;
    }

    try {
      const results = await searchClientsAction(query);

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
  }, []);

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
      drawingCardId: undefined,
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
  const [selectedMoodboardId, setSelectedMoodboardId] = useState("");
  const [moodboardOptions, setMoodboardOptions] = useState<{ id: string; name: string }[]>([]);
  const [moodboardError, setMoodboardError] = useState("");
  const clientMoodboardEmail = form.watch("clientEmail");
  useEffect(() => {
    let cancelled = false;
    setSelectedMoodboardId(""); setMoodboardOptions([]); setMoodboardError("");
    if (!clientMoodboardEmail?.includes("@")) return;
    const timer = setTimeout(() => {
      getAppointmentMoodboardOptions(clientMoodboardEmail).then(data => { if (!cancelled) setMoodboardOptions(data); })
        .catch(() => { if (!cancelled) setMoodboardError("Impossible de charger les moodboards du client."); });
    }, 400);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [clientMoodboardEmail]);

  useEffect(() => {
    if (!isUserTatoueur) return;
    form.setValue("tatoueurId", userId, {
      shouldDirty: false,
      shouldValidate: true,
    });
  }, [isUserTatoueur, userId, form]);

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

    if (isUserTatoueur && (!residenciesReady || (residencies.length > 0 && !venueSalonId))) { setError("Choisissez le salon du rendez-vous."); setLoading(false); return; }
    const rdvBody = {
      ...data,
      venueSalonId: isUserTatoueur ? venueSalonId || undefined : userId,
      ...(selectedMoodboardId && { moodboardId: selectedMoodboardId }),
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
    <CreationWorkspace sections={[
      { id: "rdv-service", label: "Prestation", hint: "Le type de rendez-vous" },
      { id: "rdv-client", label: "Client", hint: "Retrouver ou renseigner ses coordonnées", disabled: !selectedPrestation },
      { id: "rdv-appointment", label: "Organisation", hint: "Le titre et l’artiste", disabled: !selectedPrestation },
      { id: "rdv-details", label: "Détails de la séance", hint: "Le projet, les références et le tarif", disabled: !selectedPrestation },
      ...(isSkinRequired ? [{ id: "rdv-skin", label: "Carnation", hint: "Préparer la séance" }] : []),
      { id: "rdv-schedule", label: "Date & créneau", hint: "Les disponibilités de l’artiste", disabled: !selectedPrestation || !selectedTatoueur },
    ]} summary={<div className="space-y-4 text-[11px]">
      <div><p className="text-white/35">Prestation</p><p className="mt-1 font-medium text-white/80">{PRESTATION_OPTIONS.find((option) => option.value === selectedPrestation)?.label || "À choisir"}</p></div>
      <div><p className="text-white/35">Client</p><p className="mt-1 break-words text-white/80">{[form.watch("clientFirstname"), form.watch("clientLastname")].filter(Boolean).join(" ") || "À renseigner"}</p></div>
      <div><p className="text-white/35">Artiste</p><p className="mt-1 break-words text-white/80">{tatoueurs.find((artist) => artist.id === selectedTatoueur)?.name || "À sélectionner"}</p></div>
      <div className="border-t border-white/[0.07] pt-4"><p className="text-white/35">Votre sélection</p>{selectedSlots.length > 0 ? <><p className="mt-1 text-white/80">{format(new Date([...selectedSlots].sort()[0]), "EEEE d MMMM", { locale: fr })}</p><p className="mt-1 text-emerald-400">{format(new Date([...selectedSlots].sort()[0]), "HH:mm")} – {format(addMinutes(new Date([...selectedSlots].sort().at(-1)!), 30), "HH:mm")} · {selectedSlots.length * 30} min</p></> : <p className="mt-1 leading-5 text-white/40">Choisissez une date et des créneaux consécutifs dans l’agenda.</p>}</div>
    </div>}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              setError("Merci de compléter les champs obligatoires signalés dans le formulaire.");
              const field = Object.keys(errors)[0];
              requestAnimationFrame(() => {
                const element = document.querySelector<HTMLElement>(field === "skin" ? '#rdv-skin [role="radio"]' : '[name="' + field + '"]');
                element?.scrollIntoView({ block: "center", behavior: "smooth" });
                element?.focus();
              });
            })}
            noValidate className="grid min-w-0 grid-cols-12 gap-4"
          >
            {/* Étape 1 : la prestation pilote les champs affichés ensuite. */}
            <section id="rdv-service" className="order-1 col-span-12 scroll-mt-5 rounded-2xl border border-white/10 bg-noir-600 p-4 sm:p-6">
              <RdvSectionHeader
                eyebrow="Étape 1 · Prestation"
                title="Quel rendez-vous souhaitez-vous créer ?"
                description="Un choix est nécessaire pour continuer."
              />

              <input type="hidden" {...form.register("prestation")} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                {PRESTATION_OPTIONS.map((option) => {
                  const isSelected = selectedPrestation === option.value;
                  const Icon = { TATTOO: Paintbrush, PROJET: MessageSquare, RETOUCHE: Sparkles, PIERCING: Gem }[option.value];

                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        form.setValue("prestation", option.value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                        setSelectedPrestation(option.value);

                        if (!SKIN_REQUIRED_PRESTATIONS.has(option.value)) {
                          form.clearErrors("skin");
                        }

                        if (option.value !== "PROJET") {
                          form.setValue("visio", false);
                        }
                      }}
                      className={`group flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 text-left transition-all duration-200 ${
                        isSelected
                          ? "border-tertiary-400/45 bg-tertiary-400/[0.06]"
                          : "border-white/10 bg-black/10 hover:border-white/20 hover:bg-white/[0.03]"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-semibold font-one ${
                          isSelected
                            ? "border-tertiary-400/45 bg-tertiary-500/20 text-tertiary-400"
                            : "border-white/10 bg-black/20 text-white/45 group-hover:text-white/70"
                        }`}
                      >
                        {isSelected ? <Check size={16} aria-hidden="true" /> : <Icon size={16} aria-hidden="true" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-white font-one">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-[11px] leading-relaxed text-white/45 font-one">
                          {option.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
              {form.formState.errors.prestation && (
                <p className="mt-3 text-xs text-red-300 font-one">
                  {form.formState.errors.prestation.message}
                </p>
              )}
            </section>

            {/* Étape 2 : recherche et coordonnées sont réunies dans un seul bloc. */}
            <div
              id="rdv-client" className={`scroll-mt-5 border border-white/10 bg-noir-600 order-2 col-span-12 rounded-2xl p-4 sm:p-6 ${
                selectedPrestation ? "" : "hidden"
              }`}
            >
              <RdvSectionHeader
                eyebrow="Étape 2 · Client"
                title="Qui recevra cette prestation ?"
                description="Les champs marqués d’un * sont obligatoires."
              />

              <div className="rounded-2xl border border-white/8 bg-black/15 p-3 sm:p-4">
                <div className="space-y-1.5">
                  <label htmlFor="rdv-field-1" className="text-xs font-medium text-white/65 font-one">
                    Retrouver un client existant
                  </label>
                  <input id="rdv-field-1"
                    type="text"
                    value={searchClientQuery}
                    onChange={(e) => setSearchClientQuery(e.target.value)}
                    className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50 [color-scheme:dark]"
                    placeholder="Saisissez au moins 2 caractères : nom, prénom ou email"
                  />
                  <p className="text-[10px] text-white/35 font-one">
                    Sélectionner un résultat remplira automatiquement les
                    coordonnées ci-dessous.
                  </p>
                </div>

                {(clientResults.length > 0 || userClientResults.length > 0) && (
                  <div className="mt-2 max-h-56 overflow-auto rounded-xl border border-white/12 bg-noir-700 shadow-2xl">
                    {/* Clients existants du salon */}
                    {clientResults.map((client) => (
                      <button type="button"
                        key={`salon-${client.id}`}
                        className="block w-full text-left cursor-pointer px-3 py-3 sm:py-2 text-white text-sm sm:text-xs hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
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
                                Client salon
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:gap-2 text-xs">
                              <span className="text-white/60 truncate">
                                {client.email}
                              </span>
                              {client.phone && (
                                <span className="text-white/50">
                                  {client.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}

                    {/* UserClients (clients avec compte plateforme) */}
                    {userClientResults.map((userClient) => {
                      // Vérifier si cet email existe déjà dans les clients du salon
                      const existsInSalon = clientResults.some(
                        (salonClient) => salonClient.email === userClient.email,
                      );

                      return (
                        <button type="button"
                          key={`user-${userClient.id}`}
                          className="block w-full text-left cursor-pointer px-3 py-3 sm:py-2 text-white text-sm sm:text-xs hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
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
                                  Compte plateforme
                                </span>
                                {existsInSalon && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 whitespace-nowrap">
                                    Déjà client
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col sm:flex-row sm:gap-2 text-xs">
                                <span className="text-white/60 truncate">
                                  {userClient.email}
                                </span>
                                {userClient.phone && (
                                  <span className="text-white/50">
                                    {userClient.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="my-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-white/8" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35 font-one">
                  Coordonnées du client
                </span>
                <span className="h-px flex-1 bg-white/8" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                <div className="space-y-1">
                  <label htmlFor="rdv-field-2" className="text-xs text-white/70 font-one">
                    Nom *
                  </label>
                  <input id="rdv-field-2" aria-invalid={!!form.formState.errors.clientLastname} aria-required="true"
                    placeholder="Nom du client"
                    {...form.register("clientLastname")}
                    className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50 [color-scheme:dark]"
                  />
                  {form.formState.errors.clientLastname && (
                    <p className="text-red-300 text-xs">
                      {form.formState.errors.clientLastname.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="rdv-field-3" className="text-xs text-white/70 font-one">
                    Prénom *
                  </label>
                  <input id="rdv-field-3" aria-invalid={!!form.formState.errors.clientFirstname} aria-required="true"
                    placeholder="Prénom du client"
                    {...form.register("clientFirstname")}
                    className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50 [color-scheme:dark]"
                  />
                  {form.formState.errors.clientFirstname && (
                    <p className="text-red-300 text-xs">
                      {form.formState.errors.clientFirstname.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="rdv-field-4" className="text-xs text-white/70 font-one">
                    Email *
                  </label>
                  <input id="rdv-field-4" aria-invalid={!!form.formState.errors.clientEmail} aria-required="true" type="email" autoComplete="email"
                    placeholder="Email du client"
                    {...form.register("clientEmail")}
                    className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50 [color-scheme:dark]"
                  />
                  {form.formState.errors.clientEmail && (
                    <p className="text-red-300 text-xs">
                      {form.formState.errors.clientEmail.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="rdv-field-5" className="text-xs text-white/70 font-one">
                    Téléphone *
                  </label>
                  <input id="rdv-field-5" aria-invalid={!!form.formState.errors.clientPhone} aria-required="true" type="tel" autoComplete="tel"
                    placeholder="Téléphone du client"
                    {...form.register("clientPhone")}
                    className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50 [color-scheme:dark]"
                  />
                  {form.formState.errors.clientPhone && (
                    <p className="text-red-300 text-xs">
                      {form.formState.errors.clientPhone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="rdv-field-6" className="text-xs text-white/70 font-one">
                    Date de naissance *
                  </label>
                  <input id="rdv-field-6" aria-invalid={!!form.formState.errors.clientBirthdate} aria-required="true"
                    type="date"
                    placeholder="Date de naissance"
                    {...form.register("clientBirthdate")}
                    className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50 [color-scheme:dark]"
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
            <div
              id="rdv-appointment" className={`scroll-mt-5 border border-white/10 bg-noir-600 order-4 col-span-12 rounded-2xl p-4 sm:p-6 ${
                selectedPrestation ? "" : "hidden"
              }`}
            >
              <RdvSectionHeader
                eyebrow="Étape 3 · Rendez-vous"
                title="Organiser le rendez-vous"
                description="Donnez-lui un titre clair et attribuez-le au bon artiste."
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="space-y-1">
                  <label htmlFor="rdv-field-7" className="text-xs text-white/70 font-one">
                    Titre *
                  </label>
                  <input id="rdv-field-7" aria-invalid={!!form.formState.errors.title} aria-required="true"
                    placeholder="Titre du rendez-vous"
                    {...form.register("title")}
                    className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50 [color-scheme:dark]"
                  />
                  {form.formState.errors.title && (
                    <p className="text-red-300 text-xs">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="rdv-field-8" className="text-xs text-white/70 font-one">
                    Artiste *
                  </label>
                  <select id="rdv-field-8" aria-invalid={!!form.formState.errors.tatoueurId} aria-required="true"
                    {...form.register("tatoueurId")}
                    disabled={isUserTatoueur}
                    onChange={(e) => {
                      form.setValue("tatoueurId", e.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setSelectedTatoueur(e.target.value);
                    }}
                    className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50 [color-scheme:dark]"
                  >
                    {isUserTatoueur ? (
                      <option value={userId} className="bg-noir-500">
                        {session?.user?.salonName ||
                          session?.user?.name ||
                          "Mon agenda"}
                      </option>
                    ) : (
                      <option value="" className="bg-noir-500">
                        -- Choisissez un tatoueur --
                      </option>
                    )}
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

              {/* La visioconférence concerne uniquement les rendez-vous Projet. */}
              {selectedPrestation === "PROJET" && (
                <div className="mt-4 rounded-2xl border border-white/8 bg-black/15 p-3.5">
                  <label className="flex cursor-pointer items-center justify-between gap-4">
                    <span>
                      <span className="block text-xs font-medium text-white/75 font-one">
                        Rendez-vous en visioconférence
                      </span>
                      <span className="mt-1 block text-[10px] text-white/35 font-one">
                        Activez cette option si l’échange se déroule en ligne.
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      {...form.register("visio")}
                      className="h-5 w-5 shrink-0 cursor-pointer rounded border border-white/20 bg-white/10 accent-tertiary-400"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Sections conditionnelles selon le type de prestation - responsive */}
            {selectedPrestation === "PROJET" && (
              <div id="rdv-details" className="scroll-mt-5 border border-white/10 bg-noir-600 order-5 col-span-12 rounded-2xl p-4 sm:p-6">
                <RdvSectionHeader
                  eyebrow="Détails de la prestation"
                  title="Préparer le projet"
                  description="Décrivez l’idée et ajoutez les références utiles à l’artiste."
                />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="rdv-field-9" className="text-xs text-white/70 font-one">
                      Description du projet
                    </label>
                    <textarea id="rdv-field-9" aria-invalid={!!form.formState.errors.description}
                      placeholder="Description du projet"
                      {...form.register("description")}
                      rows={3}
                      className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50 [color-scheme:dark] resize-y"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="rdv-field-10" className="text-xs text-white/70 font-one">
                        Zone du corps
                      </label>
                      <input id="rdv-field-10" aria-invalid={!!form.formState.errors.zone}
                        placeholder="Bras avant droit"
                        {...form.register("zone")}
                        className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50 [color-scheme:dark]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="rdv-field-11" className="text-xs text-white/70 font-one">
                        Taille (cm)
                      </label>
                      <input id="rdv-field-11" aria-invalid={!!form.formState.errors.size}
                        placeholder="20cm x 30cm"
                        {...form.register("size")}
                        className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50 [color-scheme:dark]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="rdv-field-12" className="text-xs text-white/70 font-one">
                        Style/Couleur
                      </label>
                      <input id="rdv-field-12" aria-invalid={!!form.formState.errors.colorStyle}
                        placeholder="Style gothique, rouge et noir"
                        {...form.register("colorStyle")}
                        className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50 [color-scheme:dark]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="rdv-field-13" className="text-xs text-white/70 font-one">
                        Prix estimé (€)
                      </label>
                      <input id="rdv-field-13" aria-invalid={!!form.formState.errors.estimatedPrice}
                        type="number"
                        min={0}
                        placeholder="Prix estimé"
                        {...form.register("estimatedPrice", {
                          valueAsNumber: true,
                        })}
                        className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50 [color-scheme:dark]"
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

            {isSkinRequired && <div className="order-5 col-span-12 rounded-2xl border border-white/10 bg-noir-600 p-4 sm:p-6"><label className="block text-sm text-white">Moodboard du client (facultatif)<select value={selectedMoodboardId} onChange={e => setSelectedMoodboardId(e.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-white/15 bg-noir-700 px-3"><option value="">Aucun moodboard lié</option>{moodboardOptions.map(board => <option key={board.id} value={board.id}>{board.name}</option>)}</select></label><p className="mt-2 text-xs text-white/50">Les projets partagés ou déjà accessibles pour ce client sont proposés ici. Le client peut aussi joindre un moodboard privé lors de sa réservation.</p>{moodboardError && <p role="alert" className="mt-2 text-xs text-red-300">{moodboardError}</p>}</div>}
            {selectedPrestation === "TATTOO" && (
              <div id="rdv-details" className="scroll-mt-5 border border-white/10 bg-noir-600 order-5 col-span-12 rounded-2xl p-4 sm:p-6">
                <RdvSectionHeader
                  eyebrow="Détails de la prestation"
                  title="Préparer le tatouage"
                  description="Associez éventuellement un dessin approuvé puis précisez la séance."
                />
                <div className="space-y-4">
                  <DrawingCardSelect
                    value={form.watch("drawingCardId")}
                    clientEmail={form.watch("clientEmail")}
                    onChange={(value) => form.setValue("drawingCardId", value)}
                  />
                  <div className="space-y-1">
                    <label htmlFor="rdv-field-14" className="text-xs text-white/70 font-one">
                      Description
                    </label>
                    <input id="rdv-field-14" aria-invalid={!!form.formState.errors.description}
                      placeholder="Description du tatouage"
                      {...form.register("description")}
                      className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50 [color-scheme:dark]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="rdv-field-15" className="text-xs text-white/70 font-one">
                        Zone du corps
                      </label>
                      <input id="rdv-field-15" aria-invalid={!!form.formState.errors.zone}
                        placeholder="Avant bras droit"
                        {...form.register("zone")}
                        className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50 [color-scheme:dark]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="rdv-field-16" className="text-xs text-white/70 font-one">
                        Taille
                      </label>
                      <input id="rdv-field-16" aria-invalid={!!form.formState.errors.size}
                        placeholder="30cm x 20cm"
                        {...form.register("size")}
                        className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50 [color-scheme:dark]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="rdv-field-17" className="text-xs text-white/70 font-one">
                        Style/Couleur
                      </label>
                      <input id="rdv-field-17" aria-invalid={!!form.formState.errors.colorStyle}
                        placeholder="Style gothique, rouge et noir"
                        {...form.register("colorStyle")}
                        className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50 [color-scheme:dark]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="rdv-field-18" className="text-xs text-white/70 font-one">
                        Prix (€)
                      </label>
                      <input id="rdv-field-18" aria-invalid={!!form.formState.errors.price}
                        type="number"
                        min={0}
                        placeholder="Prix"
                        {...form.register("price", {
                          valueAsNumber: true,
                        })}
                        className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50 [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedPrestation === "PIERCING" && (
              <div id="rdv-details" className="scroll-mt-5 border border-white/10 bg-noir-600 order-5 col-span-12 rounded-2xl p-4 sm:p-6">
                <RdvSectionHeader
                  eyebrow="Détails de la prestation"
                  title="Configurer le piercing"
                  description="Choisissez la zone et le service correspondant."
                />
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
                        className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50 [color-scheme:dark]"
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
              <div id="rdv-details" className="scroll-mt-5 border border-white/10 bg-noir-600 order-5 col-span-12 rounded-2xl p-4 sm:p-6">
                <RdvSectionHeader
                  eyebrow="Détails de la prestation"
                  title="Préparer la retouche"
                  description="Précisez le travail attendu, la zone concernée et le tarif."
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="rdv-field-19" className="text-xs text-white/70 font-one">
                      Description de la retouche
                    </label>
                    <input id="rdv-field-19" aria-invalid={!!form.formState.errors.description}
                      placeholder="Description de la retouche"
                      {...form.register("description")}
                      className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50 [color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="rdv-field-20" className="text-xs text-white/70 font-one">
                      Zone du tatouage
                    </label>
                    <input id="rdv-field-20" aria-invalid={!!form.formState.errors.zone}
                      placeholder="Mollet gauche"
                      {...form.register("zone")}
                      className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50 [color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="rdv-field-21" className="text-xs text-white/70 font-one">
                      Prix (€)
                    </label>
                    <input id="rdv-field-21" aria-invalid={!!form.formState.errors.price}
                      type="number"
                      placeholder="Prix"
                      {...form.register("price")}
                      className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50 [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>
            )}

            {isSkinRequired && (
              <div id="rdv-skin" className="scroll-mt-5 border border-white/10 bg-noir-600 order-6 col-span-12 w-full rounded-2xl p-4 sm:p-6">
                <RdvSectionHeader
                  eyebrow="Informations complémentaires"
                  title="Carnation du client"
                  description="Cette information aide l’artiste à préparer la séance."
                />
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
                  Obligatoire pour les rendez-vous de tatouage, retouche et
                  projet.
                </p>
              </div>
            )}

            {/* Section: Créneaux horaires */}
            {isUserTatoueur && residencies.length > 0 && <div className="mb-5 space-y-2"><label htmlFor="rdv-venue" className="block text-sm">Salon du rendez-vous</label><select id="rdv-venue" required className="w-full rounded-lg border border-white/20 bg-noir-500 p-3" value={venueSalonId} onChange={e => { setVenueSalonId(e.target.value); setIsLoadingSlots(false); setSelectedSlots([]); setTimeSlots([]); setSelectedDate(""); }}><option value="">Choisir un salon</option>{residencies.filter(r => r.salonAllowsArtistCreate).map(r => <option key={r.id} value={r.salonId}>{r.salon.salonName} · {r.salon.city}</option>)}</select><p className="text-xs text-white/60">Vos horaires personnels sont proposés uniquement aux jours ou dates de présence dans ce salon.</p></div>}
            {selectedPrestation && selectedTatoueur && (
              <div id="rdv-schedule" className="scroll-mt-5 border border-white/10 bg-noir-600 order-7 col-span-12 rounded-2xl p-4 sm:p-6">
                <RdvSectionHeader
                  eyebrow="Étape 4 · Planification"
                  title="Choisir la date et le créneau"
                  description="Les disponibilités correspondent à l’agenda de l’artiste sélectionné."
                />
                <div className="space-y-4">
                  <div className="mb-1 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                    <div>
                      <label htmlFor="rdv-field-22" className="text-xs text-white/80 font-one mb-2 block uppercase tracking-wide">
                        Date souhaitée
                      </label>
                      <input id="rdv-field-22"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().slice(0, 10)}
                        className="w-full max-w-xs p-2.5 bg-white/2 border border-white/10 rounded-2xl font-one text-white text-sm focus:outline-none focus:border-tertiary-400 focus:ring-1 focus:ring-tertiary-400/30 transition-all"
                      />
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/3 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-wide text-white/60 font-one">
                        Agenda affiché
                      </p>
                      <p className="text-white font-one text-sm mt-0.5">
                        {tatoueurs.find((t) => t.id === selectedTatoueur)
                          ?.name || "Tatoueur"}
                      </p>
                    </div>
                  </div>

                  {selectedDate && selectedTatoueur && (
                    <div className="space-y-4">
                      <div className=" rounded-2xl py-3">
                        <h4 className="text-white/80 font-one font-semibold text-xs mb-2 uppercase tracking-wide">
                          Légende
                        </h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px]">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border border-white/20 rounded" />
                            <span className="text-white/70 font-one">
                              Disponible
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-linear-to-br from-tertiary-500/30 to-tertiary-400/20 border border-tertiary-400/60 rounded" />
                            <span className="text-white/70 font-one">
                              Sélectionné
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-linear-to-br from-gray-500/20 to-gray-600/10 border border-gray-500/40 rounded" />
                            <span className="text-white/70 font-one">
                              Occupé
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-linear-to-br from-red-500/20 to-red-600/10 border border-red-500/40 rounded" />
                            <span className="text-white/70 font-one">
                              Bloqué
                            </span>
                          </div>
                        </div>
                      </div>

                      {isLoadingSlots ? (
                        <div className="flex flex-col items-center justify-center p-8 bg-white/3 rounded-2xl border border-white/10">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-tertiary-400 border-t-transparent mb-3" />
                          <span className="text-white font-one text-sm">
                            Chargement des créneaux...
                          </span>
                        </div>
                      ) : displayedTimeSlots.length > 0 ? (
                        <>
                          <div className="space-y-3">
                            <p className="text-xs text-white/50 font-one">
                              Cliquez sur les créneaux pour les sélectionner
                              (ils doivent être consécutifs).
                            </p>

                            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 2xl:grid-cols-6">
                              {displayedTimeSlots.map((slot) => {
                                const isSelected = selectedSlots.includes(
                                  slot.start,
                                );
                                const isTaken = isSlotOccupied(
                                  slot.start,
                                  slot.end,
                                );
                                const isBlocked = isSlotBlocked(
                                  slot.start,
                                  slot.end,
                                );
                                const isAvailable = timeSlots.some(
                                  (availableSlot) =>
                                    availableSlot.start === slot.start,
                                );
                                const isDisabled =
                                  !isAvailable || isTaken || isBlocked;

                                const startTime = format(
                                  new Date(slot.start),
                                  "HH:mm",
                                  {
                                    locale: fr,
                                  },
                                );
                                const endTime = format(
                                  new Date(slot.end),
                                  "HH:mm",
                                  {
                                    locale: fr,
                                  },
                                );

                                return (
                                  <button
                                    key={`${slot.start}-${slot.end}`}
                                    type="button"
                                    onClick={() =>
                                      !isDisabled && handleSlotClick(slot.start)
                                    }
                                    disabled={isDisabled}
                                    aria-pressed={isSelected} className={`px-2 py-2.5 rounded-xl text-xs font-one font-medium transition-all duration-200 border ${
                                      isSelected
                                        ? "bg-linear-to-br from-tertiary-500/30 to-tertiary-400/20 border-tertiary-400/60 text-white shadow-lg cursor-pointer"
                                        : !isDisabled
                                          ? "bg-linear-to-br border-white/20 text-white/80 hover:bg-white/12 cursor-pointer"
                                          : "cursor-not-allowed"
                                    } ${
                                      isTaken
                                        ? "bg-linear-to-br from-gray-500/20 to-gray-600/10 border-gray-500/40 text-gray-400"
                                        : ""
                                    } ${
                                      isBlocked
                                        ? "bg-linear-to-br from-red-500/20 to-red-600/10 border-red-500/40 text-red-400"
                                        : ""
                                    }`}
                                  >
                                    <div className="flex flex-col items-center gap-1">
                                      <span>{startTime}</span>
                                      <span className="text-[10px] opacity-70">
                                        {endTime}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>

                            <div className="flex flex-wrap gap-3 text-xs text-white/70 font-one">
                              <div className="flex items-center gap-1.5">
                                <span>Total :</span>
                                <span>{displayedTimeSlots.length}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span>Sélectionnés :</span>
                                <span className="text-tertiary-400">
                                  {selectedSlots.length}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span>Durée :</span>
                                <span className="text-tertiary-400">
                                  {selectedSlots.length * 30} min
                                </span>
                              </div>
                              {selectedSlots.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedSlots([])}
                                  className="cursor-pointer ml-auto px-3 py-1 rounded-2xl border border-white/20 text-white/80 hover:bg-white/12 transition-colors"
                                >
                                  Tout désélectionner
                                </button>
                              )}
                            </div>
                          </div>

                          {selectedSlots.length > 0 && (
                            <div className="bg-tertiary-500/10 border border-tertiary-500/30 rounded-2xl p-4">
                              <div className="flex items-start gap-3">
                                <div className="shrink-0 w-8 h-8 rounded-2xl bg-tertiary-500/20 flex items-center justify-center">
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
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div>
                                    <h4 className="text-white font-one text-sm">
                                      Créneaux sélectionnés
                                    </h4>
                                    <p className="text-xs text-white/60 font-one">
                                      Vérifiez votre sélection
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="bg-white/5 rounded-2xl p-2 border border-white/10">
                                      <p className="text-xs text-white/60 mb-0.5">
                                        Date
                                      </p>
                                      <p className="text-white font-one text-sm">
                                        {new Date(
                                          selectedDate,
                                        ).toLocaleDateString("fr-FR", {
                                          day: "2-digit",
                                          month: "2-digit",
                                          year: "numeric",
                                        })}
                                      </p>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-2 border border-white/10">
                                      <p className="text-xs text-white/60 mb-0.5">
                                        Horaire
                                      </p>
                                      <p className="text-white font-one text-sm">
                                        {format(
                                          new Date(
                                            Math.min(
                                              ...selectedSlots.map((s) =>
                                                new Date(s).getTime(),
                                              ),
                                            ),
                                          ),
                                          "HH:mm",
                                        )}{" "}
                                        -{" "}
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
                                      </p>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-2 border border-white/10">
                                      <p className="text-xs text-white/60 mb-0.5">
                                        Durée
                                      </p>
                                      <p className="text-white font-one text-sm">
                                        {selectedSlots.length * 30} min
                                      </p>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-2 border border-white/10">
                                      <p className="text-xs text-white/60 mb-0.5">
                                        Créneaux
                                      </p>
                                      <p className="text-white font-one text-sm">
                                        {selectedSlots.length} x 30min
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 text-center">
                          <div className="w-10 h-10 bg-tertiary-400/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg
                              className="w-5 h-5 text-orange-400"
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
                          <h3 className="text-orange-300 font-one mb-1">
                            Aucun créneau disponible
                          </h3>
                          <p className="text-orange-300/80 text-sm font-one">
                            Essayez une autre date ou un autre tatoueur
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && <div role="alert" className="order-8 col-span-12 rounded-xl border border-red-400/20 bg-red-400/10 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><h4 className="text-sm font-medium text-red-200">Le rendez-vous n’a pas pu être créé</h4><p className="mt-1 text-xs leading-5 text-red-200/75">{error === "SAAS_LIMIT_APPOINTMENTS" ? "La limite de rendez-vous de votre abonnement est atteinte." : error === "SAAS_LIMIT_CLIENTS" ? "La limite de fiches clients est atteinte. Sélectionnez un client existant ou consultez votre abonnement." : error}</p></div>{error.startsWith("SAAS_LIMIT") && <DashboardButton href="/parametres" variant="secondary" className="!min-w-0 !rounded-xl">Voir mon abonnement</DashboardButton>}</div>
            </div>}
            {success && <div role="status" className="order-8 col-span-12 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs text-emerald-300">{success}</div>}

            {/* Actions de création */}
            <div className="sticky bottom-4 z-20 order-9 col-span-12 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-noir-600/95 p-4 shadow-xl shadow-black/20 backdrop-blur-xl">
              <p className="text-[11px] text-white/40">{selectedSlots.length ? selectedSlots.length * 30 + " min sélectionnées" : "Choisissez un créneau pour finaliser le rendez-vous."}</p>
              <div className="ml-auto flex flex-wrap gap-2">
              <DashboardButton
                href="/mes-rendez-vous"
                variant="secondary"
                className="!min-w-0 !rounded-xl !shadow-none"
              >
                Annuler
              </DashboardButton>
              <DashboardButton
                type="submit"
                disabled={loading || !selectedPrestation}
                className="!min-w-0 !rounded-xl !shadow-none"
              >
                {loading ? <LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> : <Save size={14} aria-hidden="true" />}
                {loading
                  ? "Création..."
                  : selectedPrestation
                    ? "Créer le rendez-vous"
                    : "Choisir une prestation"}
              </DashboardButton>
              </div>
            </div>
          </form>
    </CreationWorkspace>
  );
}
