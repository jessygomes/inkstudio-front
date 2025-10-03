/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

interface AppointmentInfo {
  id: string;
  title: string;
  prestation: string;
  currentDate: string;
  currentStart: string;
  currentEnd: string;
  client: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  currentTatoueur: {
    id: string;
    name: string;
  };
  newTatoueur?: {
    id: string;
    name: string;
  };
  tattooDetail?: {
    description: string;
    estimatedPrice: number;
    price: number;
  };
  salon: {
    id: string;
    salonName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
}

interface RescheduleInfo {
  token: string;
  reason: string;
  requestedAt: string;
  expiresAt: string;
  timeRemaining: {
    days: number;
    hours: number;
    totalHours: number;
  };
}

interface TokenValidation {
  isLoading: boolean;
  isValid: boolean;
  error: string | null;
  appointmentInfo?: AppointmentInfo;
  rescheduleInfo?: RescheduleInfo;
}

function NouveauCreneauContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [tokenValidation, setTokenValidation] = useState<TokenValidation>({
    isLoading: true,
    isValid: false,
    error: null,
  });

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // états pour la gestion des tatoueurs
  const [tatoueurs, setTatoueurs] = useState<any[]>([]);
  const [selectedTatoueur, setSelectedTatoueur] = useState<string | null>(null);
  const [isLoadingTatoueurs, setIsLoadingTatoueurs] = useState(true);

  // État pour le message du client
  const [clientMessage, setClientMessage] = useState<string>("");

  // États pour les créneaux occupés
  const [occupiedSlots, setOccupiedSlots] = useState<any[]>([]);

  // État pour marquer le succès de l'envoi
  const [isSuccessful, setIsSuccessful] = useState(false);

  //! Validation du token au chargement
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValidation({
          isLoading: false,
          isValid: false,
          error: "Token manquant dans l'URL",
        });
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/validate-reschedule-token/${token}`
        );

        const data = await response.json();

        if (data.error) {
          let errorMessage = data.message || "Token invalide";

          // Messages d'erreur personnalisés selon le code
          switch (data.code) {
            case "INVALID_TOKEN":
              errorMessage = "Lien invalide ou expiré";
              break;
            case "APPOINTMENT_NOT_FOUND":
              errorMessage = "Rendez-vous introuvable";
              break;
            case "APPOINTMENT_NOT_RESCHEDULING":
              errorMessage =
                "Ce rendez-vous n'est plus en cours de reprogrammation";
              break;
            default:
              errorMessage = data.message || "Erreur de validation";
          }

          setTokenValidation({
            isLoading: false,
            isValid: false,
            error: errorMessage,
          });
        } else {
          setTokenValidation({
            isLoading: false,
            isValid: true,
            error: null,
            appointmentInfo: data.appointmentInfo,
            rescheduleInfo: data.rescheduleInfo,
          });
        }
      } catch (error) {
        console.error("Erreur lors de la validation du token:", error);
        setTokenValidation({
          isLoading: false,
          isValid: false,
          error: "Erreur de connexion",
        });
      }
    };

    validateToken();
  }, [token]);

  //! Récupérer la liste des tatoueurs du salon
  useEffect(() => {
    const fetchTatoueurs = async () => {
      if (!tokenValidation.appointmentInfo?.salon?.id) return;

      console.log(
        "Récupération des tatoueurs pour le salon:",
        tokenValidation.appointmentInfo.salon.id
      );

      setIsLoadingTatoueurs(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs/user/${tokenValidation.appointmentInfo.salon.id}`
        );
        const data = await response.json();
        setTatoueurs(data || []);

        // Présélectionner le tatoueur actuel (ou le nouveau s'il y en a un)
        const currentTatoueurId =
          tokenValidation.appointmentInfo.newTatoueur?.id ||
          tokenValidation.appointmentInfo.currentTatoueur.id;
        setSelectedTatoueur(currentTatoueurId);
      } catch (error) {
        console.error("Erreur lors du chargement des tatoueurs:", error);
        setTatoueurs([]);
        // En cas d'erreur, présélectionner quand même le tatoueur actuel
        const currentTatoueurId =
          tokenValidation.appointmentInfo.newTatoueur?.id ||
          tokenValidation.appointmentInfo.currentTatoueur.id;
        setSelectedTatoueur(currentTatoueurId);
      } finally {
        setIsLoadingTatoueurs(false);
      }
    };

    if (tokenValidation.appointmentInfo) {
      fetchTatoueurs();
    }
  }, [tokenValidation.appointmentInfo]);

  //! Charger les créneaux disponibles quand une date ou un tatoueur est sélectionné
  useEffect(() => {
    if (selectedDate && selectedTatoueur) {
      fetchAvailableSlots();
    }
  }, [selectedDate, selectedTatoueur]);

  const fetchAvailableSlots = async () => {
    if (!selectedTatoueur || !selectedDate) return;

    setIsLoadingSlots(true);
    try {
      // Récupérer les créneaux disponibles
      const slotsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/timeslots/tatoueur?date=${selectedDate}&tatoueurId=${selectedTatoueur}`
      );
      const slotsData = await slotsResponse.json();
      setAvailableSlots(slotsData || []);

      // Récupérer les créneaux occupés pour cette date et ce tatoueur
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const occupiedResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACK_URL
        }/appointments/tatoueur-range?tatoueurId=${selectedTatoueur}&start=${startOfDay.toISOString()}&end=${endOfDay.toISOString()}`
      );
      const occupiedData = await occupiedResponse.json();
      setOccupiedSlots(occupiedData || []);
    } catch (error) {
      console.error("Erreur lors du chargement des créneaux:", error);
      setAvailableSlots([]);
      setOccupiedSlots([]);
      toast.error("Erreur lors du chargement des créneaux");
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Fonction pour vérifier si un créneau est occupé
  const isSlotOccupied = (slotStart: string) => {
    const slotStartDate = new Date(slotStart);
    const slotEndDate = new Date(slotStartDate.getTime() + 30 * 60 * 1000); // 30 minutes après

    return occupiedSlots.some((occupied) => {
      const occupiedStart = new Date(occupied.start);
      const occupiedEnd = new Date(occupied.end);

      // Vérifier s'il y a chevauchement
      return slotStartDate < occupiedEnd && slotEndDate > occupiedStart;
    });
  };

  const handleTatoueurChange = (tatoueurId: string) => {
    setSelectedTatoueur(tatoueurId);
    // Reset des créneaux sélectionnés quand on change de tatoueur
    setSelectedSlots([]);
    setAvailableSlots([]);
  };

  const handleSlotSelection = (slotStart: string) => {
    // Vérifier si le créneau est occupé
    if (isSlotOccupied(slotStart)) {
      toast.error("Ce créneau est déjà occupé");
      return;
    }

    if (selectedSlots.includes(slotStart)) {
      // Déselectionner
      setSelectedSlots((prev) => prev.filter((s) => s !== slotStart));
    } else {
      // Sélectionner (vérifier la consécutivité)
      const newSelection = [...selectedSlots, slotStart].sort();

      // Vérifier que tous les créneaux sont consécutifs
      const timestamps = newSelection.map((s) => new Date(s).getTime());
      const areConsecutive = timestamps.every((time, i) => {
        if (i === 0) return true;
        return time - timestamps[i - 1] === 30 * 60 * 1000; // 30 minutes
      });

      if (areConsecutive) {
        setSelectedSlots(newSelection);
      } else {
        toast.error("Les créneaux doivent être consécutifs");
      }
    }
  };

  //! SOUMETTRE LA REPROGRAMMATION
  const handleSubmitReschedule = async () => {
    if (selectedSlots.length === 0) {
      toast.error("Veuillez sélectionner au moins un créneau");
      return;
    }

    if (!tokenValidation.appointmentInfo || !token || !selectedTatoueur) return;

    setIsSubmitting(true);

    try {
      // Calculer les dates de début et fin au format ISO
      const sortedSlots = selectedSlots.sort();
      const newStart = sortedSlots[0];
      const newEnd = new Date(
        new Date(sortedSlots[sortedSlots.length - 1]).getTime() + 30 * 60 * 1000
      ).toISOString();

      console.log("Données envoyées:", {
        token,
        appointmentId: tokenValidation.appointmentInfo.id,
        newStart,
        newEnd,
        tatoueurId: selectedTatoueur,
        clientMessage: clientMessage.trim() || undefined,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/client-reschedule-response`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            appointmentId: tokenValidation.appointmentInfo.id,
            newStart,
            newEnd,
            tatoueurId: selectedTatoueur,
            clientMessage: clientMessage.trim() || undefined,
          }),
        }
      );

      const result = await response.json();

      if (result.error) {
        toast.error(result.message || "Erreur lors de la reprogrammation");
      } else {
        toast.success("Rendez-vous reprogrammé avec succès !");
        setIsSuccessful(true); // Marquer comme réussi
      }
    } catch (error) {
      console.error("Erreur lors de la reprogrammation:", error);
      toast.error("Erreur lors de la reprogrammation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state
  if (tokenValidation.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-noir-700 to-noir-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tertiary-400 mx-auto mb-4"></div>
          <p className="text-white font-one">Vérification du lien...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!tokenValidation.isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-noir-700 to-noir-500 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white/5 rounded-2xl p-8 border border-red-500/30">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white font-one mb-4">
            Accès refusé
          </h1>
          <p className="text-red-300 font-one mb-6">{tokenValidation.error}</p>
          <div className="text-white/70 text-sm font-one">
            <p>Ce lien de reprogrammation n'est plus valide.</p>
            <p className="mt-2">
              Contactez le salon pour obtenir un nouveau lien.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { appointmentInfo, rescheduleInfo } = tokenValidation;

  // Success state - Afficher le message de confirmation
  if (isSuccessful) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-noir-700 to-noir-500 flex items-center justify-center">
        <div className="my-8 max-w-2xl mx-auto text-center bg-gradient-to-br from-noir-500/20 to-noir-500/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
          {/* Icône de succès */}
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-400"
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
          </div>

          {/* Message principal */}
          <h1 className="text-xl font-bold text-white font-one tracking-wide mb-4">
            🎉 Rendez-vous reprogrammé avec succès !
          </h1>

          <div className="space-y-4 text-white/80 font-one text-sm">
            <p className="text-base">
              Merci d'avoir choisi vos nouveaux créneaux. Votre demande de
              reprogrammation a été envoyée au salon.
            </p>

            {/* Récapitulatif */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4">
                📋 Récapitulatif de votre nouveau rendez-vous
              </h2>
              <div className="space-y-3 text-sm text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/60 text-xs font-one">Date</p>
                    <p className="text-white font-one">
                      {new Date(selectedSlots[0]).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-one">Heure</p>
                    <p className="text-white font-one">
                      {formatTime(selectedSlots[0])} à{" "}
                      {formatTime(
                        new Date(
                          new Date(
                            selectedSlots[selectedSlots.length - 1]
                          ).getTime() +
                            30 * 60 * 1000
                        ).toISOString()
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-one">Durée</p>
                    <p className="text-white font-one">
                      {selectedSlots.length * 30} minutes
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-one">Tatoueur</p>
                    <p className="text-white font-one">
                      {tatoueurs.find((t) => t.id === selectedTatoueur)?.name}
                    </p>
                  </div>
                </div>

                {clientMessage && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-white/60 text-xs font-one mb-2">
                      Votre message
                    </p>
                    <div className="bg-white/10 p-3 rounded-lg">
                      <p className="text-white/90 text-xs font-one italic">
                        "{clientMessage}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-3">
                📬 Prochaines étapes
              </h2>
              <div className="space-y-3 text-sm text-left">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-tertiary-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-tertiary-400 text-xs font-bold">
                      1
                    </span>
                  </div>
                  <p>Le salon va examiner votre demande de reprogrammation</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-tertiary-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-tertiary-400 text-xs font-bold">
                      2
                    </span>
                  </div>
                  <p>
                    Vous recevrez un email de confirmation avec les nouveaux
                    détails
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-tertiary-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-tertiary-400 text-xs font-bold">
                      3
                    </span>
                  </div>
                  <p>Votre rendez-vous sera automatiquement confirmé</p>
                </div>
              </div>
            </div>

            <div className="bg-tertiary-500/10 border border-tertiary-500/20 rounded-2xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-tertiary-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-3 h-3 text-tertiary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-white font-medium mb-2 text-sm">
                    💡 Informations importantes
                  </h3>
                  <ul className="text-white/70 text-xs space-y-1">
                    <li>
                      • Votre ancien rendez-vous a été automatiquement annulé
                    </li>
                    <li>• Vous recevrez un email de confirmation sous peu</li>
                    <li>
                      • En cas de question, contactez directement le salon
                    </li>
                    <li>• Notez bien vos nouveaux horaires</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-sm text-white/60 mt-6">
              Merci pour votre confiance et à bientôt pour votre nouveau
              rendez-vous ! 🎨
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-noir-700 to-noir-500">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white font-one tracking-wide mb-4">
              🔄 Reprogrammer votre rendez-vous
            </h1>
            <p className="text-white/70 text-base font-one">
              Choisissez un nouveau créneau pour votre rendez-vous
            </p>
          </div>

          {/* Informations du rendez-vous actuel */}
          {appointmentInfo && (
            <div className="bg-gradient-to-br from-noir-500/20 to-noir-500/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl mb-8">
              <h2 className="text-lg font-semibold text-white font-one mb-4">
                📅 Rendez-vous à reprogrammer
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Infos du RDV */}
                <div className="space-y-3">
                  <div>
                    <p className="text-white/60 text-xs font-one">Client</p>
                    <p className="text-white font-one">
                      {appointmentInfo.client.firstName}{" "}
                      {appointmentInfo.client.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-one">
                      Rendez-vous
                    </p>
                    <p className="text-white font-one">
                      {appointmentInfo.title}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-one">Type</p>
                    <p className="text-white font-one">
                      {appointmentInfo.prestation}
                    </p>
                  </div>
                </div>

                {/* Infos temporelles */}
                <div className="space-y-3">
                  <div>
                    <p className="text-white/60 text-xs font-one">
                      Date actuelle
                    </p>
                    <p className="text-white font-one">
                      {appointmentInfo.currentDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-one">
                      Tatoueur actuel
                    </p>
                    <p className="text-white font-one">
                      {appointmentInfo.newTatoueur?.name ||
                        appointmentInfo.currentTatoueur.name}
                      {appointmentInfo.newTatoueur && (
                        <span className="text-tertiary-400 text-xs ml-2">
                          (changé précédemment)
                        </span>
                      )}
                    </p>
                  </div>
                  {rescheduleInfo && (
                    <div>
                      <p className="text-white/60 text-xs font-one">
                        Temps restant
                      </p>
                      <p className="text-orange-400 font-one text-sm">
                        {rescheduleInfo.timeRemaining.days > 0 &&
                          `${rescheduleInfo.timeRemaining.days}j `}
                        {rescheduleInfo.timeRemaining.hours}h restantes
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Raison du changement */}
              {rescheduleInfo?.reason && (
                <div className="mt-4 bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-white/60 text-xs font-one mb-1">
                    Raison du changement
                  </p>
                  <p className="text-white/80 text-sm font-one italic">
                    "{rescheduleInfo.reason}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Sélection de nouveau créneau */}
          <div className="bg-gradient-to-br from-noir-500/20 to-noir-500/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
            <h2 className="text-lg font-semibold text-white font-one mb-6">
              🗓️ Choisir un nouveau créneau
            </h2>

            {/* Sélection du tatoueur */}
            <div className="mb-6">
              <label className="block text-sm text-white/70 font-one mb-2">
                Tatoueur
              </label>
              {isLoadingTatoueurs ? (
                <div className="flex items-center gap-2 p-3 bg-white/10 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-tertiary-400"></div>
                  <span className="text-white/70 text-sm">
                    Chargement des tatoueurs...
                  </span>
                </div>
              ) : (
                <select
                  value={selectedTatoueur || ""}
                  onChange={(e) => handleTatoueurChange(e.target.value)}
                  className="w-full max-w-md p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-tertiary-400 transition-colors"
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
                      {/* Indiquer le tatoueur actuel */}
                      {tatoueur.id ===
                        (appointmentInfo?.newTatoueur?.id ||
                          appointmentInfo?.currentTatoueur.id) && " (actuel)"}
                    </option>
                  ))}
                </select>
              )}

              {/* Indicateur de changement de tatoueur */}
              {selectedTatoueur &&
                selectedTatoueur !==
                  (appointmentInfo?.newTatoueur?.id ||
                    appointmentInfo?.currentTatoueur.id) && (
                  <div className="mt-2 bg-blue-500/10 border border-blue-500/30 rounded-lg p-2">
                    <p className="text-blue-300 text-xs font-one">
                      ℹ️ Vous avez choisi un tatoueur différent de celui
                      initialement prévu
                    </p>
                  </div>
                )}
            </div>

            {/* Sélection de date */}
            <div className="mb-6">
              <label className="block text-sm text-white/70 font-one mb-2">
                Date souhaitée
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                disabled={!selectedTatoueur}
                className="w-full max-w-xs p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-tertiary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {!selectedTatoueur && (
                <p className="text-white/50 text-xs mt-1">
                  Sélectionnez d'abord un tatoueur
                </p>
              )}
            </div>

            {/* Créneaux disponibles */}
            {selectedDate && selectedTatoueur && (
              <div className="space-y-4">
                <h3 className="text-white font-one font-semibold">
                  Créneaux disponibles pour{" "}
                  {tatoueurs.find((t) => t.id === selectedTatoueur)?.name}
                </h3>

                {isLoadingSlots ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tertiary-400"></div>
                    <span className="ml-3 text-white font-one">
                      Chargement des créneaux...
                    </span>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <>
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                      {availableSlots.map((slot, index) => {
                        const startTime = formatTime(slot.start);
                        const isSelected = selectedSlots.includes(slot.start);
                        const isOccupied = isSlotOccupied(slot.start);

                        return (
                          <button
                            key={index}
                            onClick={() => handleSlotSelection(slot.start)}
                            disabled={isOccupied}
                            className={`px-3 py-2 rounded-lg text-xs text-white font-one transition-all duration-200 border ${
                              isOccupied
                                ? "bg-red-500/20 text-red-300 border-red-500/30 cursor-not-allowed opacity-50"
                                : isSelected
                                ? "bg-tertiary-500/30 text-tertiary-300 border-tertiary-500/50"
                                : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20 hover:text-white cursor-pointer"
                            }`}
                            title={
                              isOccupied
                                ? "Créneau occupé"
                                : "Cliquer pour sélectionner/désélectionner"
                            }
                          >
                            {startTime}
                            {isOccupied && (
                              <span className="block text-[8px] mt-0.5">
                                Occupé
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Récapitulatif de la sélection */}
                    {selectedSlots.length > 0 && (
                      <div className="bg-tertiary-500/10 border border-tertiary-500/20 rounded-lg p-4">
                        <h4 className="text-tertiary-400 font-semibold font-one mb-2 text-sm">
                          ✅ Créneaux sélectionnés
                        </h4>
                        <p className="text-white font-one text-sm">
                          {selectedSlots.length} créneau
                          {selectedSlots.length > 1 ? "x" : ""} • Durée:{" "}
                          {selectedSlots.length * 30} minutes
                        </p>
                        <p className="text-white/70 font-one text-xs mt-1">
                          De {formatTime(selectedSlots[0])} à{" "}
                          {formatTime(
                            new Date(
                              new Date(
                                selectedSlots[selectedSlots.length - 1]
                              ).getTime() +
                                30 * 60 * 1000
                            ).toISOString()
                          )}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                    <p className="text-orange-300 text-sm font-one">
                      ⚠️ Aucun créneau disponible pour cette date
                    </p>
                    <p className="text-orange-300/80 text-xs font-one mt-1">
                      Essayez une autre date ou un autre tatoueur
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Message du client */}
            {selectedSlots.length > 0 && (
              <div className="mt-6 bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-white font-one font-semibold mb-3 text-sm">
                  💬 Message pour le salon (optionnel)
                </h3>
                <div className="space-y-3">
                  <textarea
                    value={clientMessage}
                    onChange={(e) => setClientMessage(e.target.value)}
                    placeholder="Ajoutez un message pour expliquer votre choix de nouveau créneau ou toute information utile..."
                    className="w-full h-20 p-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-tertiary-400 focus:border-transparent resize-none transition-colors"
                    maxLength={300}
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-white/50 font-one">
                      Ce message sera envoyé au salon avec votre demande
                    </p>
                    <p className="text-xs text-white/50 font-one">
                      {clientMessage.length}/300
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Bouton de confirmation */}
            {selectedSlots.length > 0 && selectedTatoueur && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleSubmitReschedule}
                  disabled={isSubmitting}
                  className="cursor-pointer px-6 py-3 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Reprogrammation...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
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
                      <span>Confirmer le nouveau créneau</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Informations importantes */}
          <div className="mt-8 bg-tertiary-500/10 border border-tertiary-500/20 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-tertiary-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold font-one mb-3">
                  📋 Informations importantes
                </h3>
                <ul className="text-white/70 text-sm space-y-2 font-one">
                  <li>
                    • Vous pouvez choisir le même tatoueur ou en sélectionner un
                    autre
                  </li>
                  <li>
                    • Sélectionnez des créneaux consécutifs pour la durée
                    souhaitée
                  </li>
                  <li>
                    • Votre nouveau rendez-vous sera automatiquement confirmé
                  </li>
                  <li>
                    • Vous recevrez un email de confirmation avec les nouveaux
                    détails
                  </li>
                  <li>• En cas de problème, contactez directement le salon</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NouveauCreneauPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-noir-700 to-noir-500 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tertiary-400 mx-auto mb-4"></div>
            <p className="text-white font-one">Chargement...</p>
          </div>
        </div>
      }
    >
      <NouveauCreneauContent />
    </Suspense>
  );
}
