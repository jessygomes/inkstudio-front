"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createBlockedTimeSlotAction } from "@/lib/queries/blocked-time-slots";

const createBlockedSlotSchema = z.object({
  startDate: z.string().min(1, "Date de début requise"),
  startTime: z.string().min(1, "Heure de début requise"),
  endDate: z.string().min(1, "Date de fin requise"),
  endTime: z.string().min(1, "Heure de fin requise"),
  tatoueurId: z.string().optional(),
  reason: z.string().optional(),
});

interface Tatoueur {
  id: string;
  name: string;
}

interface CreateBlockedSlotProps {
  userId: string;
  tatoueurs: Tatoueur[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateBlockedSlot({
  userId,
  tatoueurs,
  onClose,
  onSuccess,
}: CreateBlockedSlotProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof createBlockedSlotSchema>>({
    resolver: zodResolver(createBlockedSlotSchema),
    defaultValues: {
      startDate: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endDate: new Date().toISOString().split("T")[0],
      endTime: "18:00",
      tatoueurId: "",
      reason: "",
    },
  });

  // Fonction de validation des dates améliorée
  const validateAndFormatDates = (
    data: z.infer<typeof createBlockedSlotSchema>
  ) => {
    // Vérifications strictes
    if (
      !data.startDate?.trim() ||
      !data.startTime?.trim() ||
      !data.endDate?.trim() ||
      !data.endTime?.trim()
    ) {
      return {
        isValid: false,
        error: "Tous les champs de date et heure sont requis",
      };
    }

    if (!userId?.trim()) {
      return { isValid: false, error: "Identifiant utilisateur requis" };
    }

    try {
      // ❌ ANCIEN : Force le fuseau UTC avec .000Z
      // const startDateTimeString = `${data.startDate.trim()}T${data.startTime.trim()}:00.000Z`;
      // const endDateTimeString = `${data.endDate.trim()}T${data.endTime.trim()}:00.000Z`;

      // ✅ NOUVEAU : Conserver l'heure locale sans forcer UTC
      const startDateTimeString = `${data.startDate.trim()}T${data.startTime.trim()}:00`;
      const endDateTimeString = `${data.endDate.trim()}T${data.endTime.trim()}:00`;

      // Création des objets Date avec validation (en heure locale)
      const startDateTime = new Date(startDateTimeString);
      const endDateTime = new Date(endDateTimeString);

      // Vérification de la validité des dates
      if (isNaN(startDateTime.getTime())) {
        return { isValid: false, error: "Date/heure de début invalide" };
      }

      if (isNaN(endDateTime.getTime())) {
        return { isValid: false, error: "Date/heure de fin invalide" };
      }

      // Vérifications logiques
      if (startDateTime >= endDateTime) {
        return {
          isValid: false,
          error: "La date/heure de fin doit être postérieure au début",
        };
      }

      const now = new Date();
      if (startDateTime < now) {
        return {
          isValid: false,
          error: "Impossible de bloquer un créneau dans le passé",
        };
      }

      const diffMinutes =
        (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60);
      if (diffMinutes < 15) {
        return {
          isValid: false,
          error: "La durée minimale de blocage est de 15 minutes",
        };
      }

      const diffDays =
        (endDateTime.getTime() - startDateTime.getTime()) /
        (1000 * 60 * 60 * 24);
      if (diffDays > 30) {
        return {
          isValid: false,
          error: "La durée maximale de blocage est de 30 jours",
        };
      }

      // Retourner les ISO strings des objets Date créés en local
      return {
        isValid: true,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
      };
    } catch (parseError) {
      console.error("❌ Erreur de parsing des dates:", parseError);
      return { isValid: false, error: "Format de date invalide" };
    }
  };

  const onSubmit = async (data: z.infer<typeof createBlockedSlotSchema>) => {
    setLoading(true);
    setError(null);

    try {
      // Validation côté frontend
      const validation = validateAndFormatDates(data);

      if (!validation.isValid) {
        setError(validation.error || "Données invalides");
        return;
      }

      // Construction du payload avec des clés explicites qui matchent le DTO backend
      const payload = {
        startDate: validation.startDateTime,
        endDate: validation.endDateTime,
        reason: data.reason?.trim() || null, // Envoyer null au lieu d'undefined
        tatoueurId: data.tatoueurId?.trim() || null, // Envoyer null au lieu d'undefined
        userId: userId.trim(),
      };

      console.log(
        "📤 Payload final à envoyer:",
        JSON.stringify(payload, null, 2)
      );

      // Validation finale du payload
      if (!payload.userId) {
        setError("Identifiant utilisateur manquant");
        return;
      }

      if (!payload.startDate || !payload.endDate) {
        setError("Dates manquantes dans le payload");
        return;
      }

      // Test de validité des dates dans le payload
      const testStartDate = new Date(payload.startDate);
      const testEndDate = new Date(payload.endDate);

      if (isNaN(testStartDate.getTime()) || isNaN(testEndDate.getTime())) {
        setError("Dates invalides dans le payload final");
        return;
      }

      const result = await createBlockedTimeSlotAction(payload);

      if (result.error) {
        setError(result.message || "Erreur lors de la création du blocage");
        return;
      }

      if (!result.ok) {
        setError(
          `Erreur serveur: ${result.status} - ${
            result.message || "Erreur inconnue"
          }`
        );
        return;
      }

      toast.success("Créneau bloqué avec succès");
      onSuccess();
    } catch (err) {
      console.error("❌ Erreur lors de la création:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour remplir automatiquement la date de fin
  const handleStartDateChange = (startDate: string, startTime: string) => {
    if (startDate && startTime) {
      const currentEndDate = form.watch("endDate");
      const currentEndTime = form.watch("endTime");

      // ✅ NOUVELLE LOGIQUE : S'assurer que la date de fin n'est jamais antérieure
      if (!currentEndDate || currentEndDate < startDate) {
        // Si pas de date de fin ou date de fin antérieure, ajuster à la date de début
        form.setValue("endDate", startDate);

        // Ajuster l'heure de fin pour qu'elle soit après l'heure de début
        const [startHours, startMinutes] = startTime.split(":").map(Number);
        const endHours = startHours + 1;

        if (endHours < 24) {
          form.setValue(
            "endTime",
            `${endHours.toString().padStart(2, "0")}:${startMinutes
              .toString()
              .padStart(2, "0")}`
          );
        } else {
          // Si on dépasse 23h59, passer au jour suivant
          const nextDay = new Date(startDate);
          nextDay.setDate(nextDay.getDate() + 1);
          form.setValue("endDate", nextDay.toISOString().split("T")[0]);
          form.setValue("endTime", "09:00"); // Commencer le lendemain à 9h
        }
      } else if (currentEndDate === startDate) {
        // Si même jour, vérifier que l'heure de fin est après l'heure de début
        const [startHours, startMinutes] = startTime.split(":").map(Number);
        const [endHours, endMinutes] = currentEndTime.split(":").map(Number);

        const startTimeInMinutes = startHours * 60 + startMinutes;
        const endTimeInMinutes = endHours * 60 + endMinutes;

        // Si l'heure de fin est antérieure ou égale à l'heure de début
        if (endTimeInMinutes <= startTimeInMinutes) {
          const newEndHours = startHours + 1;

          if (newEndHours < 24) {
            form.setValue(
              "endTime",
              `${newEndHours.toString().padStart(2, "0")}:${startMinutes
                .toString()
                .padStart(2, "0")}`
            );
          } else {
            // Passer au jour suivant si on dépasse minuit
            const nextDay = new Date(startDate);
            nextDay.setDate(nextDay.getDate() + 1);
            form.setValue("endDate", nextDay.toISOString().split("T")[0]);
            form.setValue("endTime", "09:00");
          }
        }
      }
    }
  };

  // Nouvelle fonction pour gérer les changements de date de fin
  const handleEndDateChange = (endDate: string) => {
    const startDate = form.watch("startDate");

    // Si la date de fin devient antérieure à la date de début, l'ajuster
    if (startDate && endDate < startDate) {
      form.setValue("endDate", startDate);

      // Ajuster aussi l'heure si nécessaire
      const startTime = form.watch("startTime");
      const endTime = form.watch("endTime");

      if (startTime && endTime) {
        const [startHours, startMinutes] = startTime.split(":").map(Number);
        const [endHours, endMinutes] = endTime.split(":").map(Number);

        const startTimeInMinutes = startHours * 60 + startMinutes;
        const endTimeInMinutes = endHours * 60 + endMinutes;

        if (endTimeInMinutes <= startTimeInMinutes) {
          const newEndHours = startHours + 1;
          if (newEndHours < 24) {
            form.setValue(
              "endTime",
              `${newEndHours.toString().padStart(2, "0")}:${startMinutes
                .toString()
                .padStart(2, "0")}`
            );
          }
        }
      }
    }
  };

  // Nouvelle fonction pour gérer les changements d'heure de fin
  const handleEndTimeChange = (endTime: string) => {
    const startDate = form.watch("startDate");
    const endDate = form.watch("endDate");
    const startTime = form.watch("startTime");

    // Si même jour, vérifier que l'heure de fin est après l'heure de début
    if (startDate && endDate && startTime && startDate === endDate) {
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);

      const startTimeInMinutes = startHours * 60 + startMinutes;
      const endTimeInMinutes = endHours * 60 + endMinutes;

      if (endTimeInMinutes <= startTimeInMinutes) {
        const newEndHours = startHours + 1;
        if (newEndHours < 24) {
          form.setValue(
            "endTime",
            `${newEndHours.toString().padStart(2, "0")}:${startMinutes
              .toString()
              .padStart(2, "0")}`
          );
        } else {
          // Passer au jour suivant
          const nextDay = new Date(startDate);
          nextDay.setDate(nextDay.getDate() + 1);
          form.setValue("endDate", nextDay.toISOString().split("T")[0]);
          form.setValue("endTime", "09:00");
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-noir-500 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white font-one tracking-wide">
              🚫 Bloquer un créneau
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <span className="cursor-pointer text-white text-xl">×</span>
            </button>
          </div>
          <p className="text-white/70 mt-2 text-sm">
            Rendez indisponible une période pour un tatoueur ou le salon complet
          </p>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Sélection du tatoueur */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                👤 Portée du blocage
              </h3>

              <div className="space-y-2">
                <label className="text-xs text-white/70 font-one">
                  Qui est concerné ?
                </label>
                <select
                  {...form.register("tatoueurId")}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                >
                  <option value="" className="bg-noir-500">
                    🏢 Salon complet (tous les tatoueurs)
                  </option>
                  {tatoueurs.map((tatoueur) => (
                    <option
                      key={tatoueur.id}
                      value={tatoueur.id}
                      className="bg-noir-500"
                    >
                      👤 {tatoueur.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Période de blocage avec validation améliorée */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                📅 Période de blocage
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date et heure de début */}
                <div className="space-y-2">
                  <label className="text-xs text-white/70 font-one">
                    Début
                  </label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      {...form.register("startDate")}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        form.setValue("startDate", e.target.value);
                        handleStartDateChange(
                          e.target.value,
                          form.watch("startTime")
                        );
                      }}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                    />
                    <input
                      type="time"
                      {...form.register("startTime")}
                      onChange={(e) => {
                        form.setValue("startTime", e.target.value);
                        handleStartDateChange(
                          form.watch("startDate"),
                          e.target.value
                        );
                      }}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                    />
                  </div>
                  {form.formState.errors.startDate && (
                    <p className="text-red-300 text-xs">
                      {form.formState.errors.startDate.message}
                    </p>
                  )}
                  {form.formState.errors.startTime && (
                    <p className="text-red-300 text-xs">
                      {form.formState.errors.startTime.message}
                    </p>
                  )}
                </div>

                {/* Date et heure de fin */}
                <div className="space-y-2">
                  <label className="text-xs text-white/70 font-one">Fin</label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      {...form.register("endDate")}
                      min={
                        form.watch("startDate") ||
                        new Date().toISOString().split("T")[0]
                      }
                      onChange={(e) => {
                        form.setValue("endDate", e.target.value);
                        handleEndDateChange(e.target.value);
                      }}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                    />
                    <input
                      type="time"
                      {...form.register("endTime")}
                      onChange={(e) => {
                        form.setValue("endTime", e.target.value);
                        handleEndTimeChange(e.target.value);
                      }}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                    />
                  </div>
                  {form.formState.errors.endDate && (
                    <p className="text-red-300 text-xs">
                      {form.formState.errors.endDate.message}
                    </p>
                  )}
                  {form.formState.errors.endTime && (
                    <p className="text-red-300 text-xs">
                      {form.formState.errors.endTime.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Indicateur de durée avec validation visuelle */}
              {form.watch("startDate") &&
                form.watch("startTime") &&
                form.watch("endDate") &&
                form.watch("endTime") && (
                  <div className="mt-3 p-2 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-xs text-white/70">
                      <span className="font-medium">Durée : </span>
                      {(() => {
                        try {
                          const start = new Date(
                            `${form.watch("startDate")}T${form.watch(
                              "startTime"
                            )}:00`
                          );
                          const end = new Date(
                            `${form.watch("endDate")}T${form.watch(
                              "endTime"
                            )}:00`
                          );

                          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                            return "⚠️ Dates invalides";
                          }

                          const diffMs = end.getTime() - start.getTime();
                          if (diffMs <= 0) {
                            return "⚠️ La fin doit être après le début";
                          }

                          const diffMinutes = Math.floor(diffMs / (1000 * 60));
                          const diffHours = Math.floor(diffMinutes / 60);
                          const diffDays = Math.floor(diffHours / 24);

                          let durationText = "";
                          if (diffDays > 0) {
                            durationText = `${diffDays} jour${
                              diffDays > 1 ? "s" : ""
                            } ${diffHours % 24}h ${diffMinutes % 60}min`;
                          } else if (diffHours > 0) {
                            durationText = `${diffHours}h ${
                              diffMinutes % 60
                            }min`;
                          } else {
                            durationText = `${diffMinutes}min`;
                          }

                          if (diffMinutes < 15) {
                            return `⚠️ ${durationText} (minimum 15 min)`;
                          } else if (diffDays > 30) {
                            return `⚠️ ${durationText} (maximum 30 jours)`;
                          } else {
                            return `✅ ${durationText}`;
                          }
                        } catch {
                          return "⚠️ Erreur de calcul";
                        }
                      })()}
                    </div>
                  </div>
                )}
            </div>

            {/* Raison du blocage */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                💬 Raison (optionnelle)
              </h3>

              <div className="space-y-2">
                <textarea
                  {...form.register("reason")}
                  placeholder="Ex: Congés, formation, maintenance, événement spécial..."
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-tertiary-400 transition-colors resize-none placeholder-white/50"
                  rows={3}
                />
              </div>
            </div>

            {/* Messages d'erreur améliorés */}
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-red-300 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-red-300 text-xs font-medium">
                      Erreur de validation
                    </p>
                    <p className="text-red-300/80 text-xs mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Raccourcis */}
            <div className="bg-tertiary-500/10 border border-tertiary-500/20 rounded-xl p-4">
              <h4 className="text-tertiary-400 font-semibold text-sm font-one mb-3">
                ⚡ Raccourcis courants
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    form.setValue(
                      "startDate",
                      today.toISOString().split("T")[0]
                    );
                    form.setValue("endDate", today.toISOString().split("T")[0]);
                    form.setValue("startTime", "12:00");
                    form.setValue("endTime", "14:00");
                    form.setValue("reason", "Pause déjeuner");
                  }}
                  className="cursor-pointer p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 text-xs transition-colors text-left"
                >
                  🍽️ Pause déjeuner aujourd&apos;hui
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const nextWeek = new Date(today);
                    nextWeek.setDate(today.getDate() + 7);

                    form.setValue(
                      "startDate",
                      today.toISOString().split("T")[0]
                    );
                    form.setValue(
                      "endDate",
                      nextWeek.toISOString().split("T")[0]
                    );
                    form.setValue("startTime", "09:00");
                    form.setValue("endTime", "18:00");
                    form.setValue("reason", "Congés");
                  }}
                  className="cursor-pointer p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 text-xs transition-colors text-left"
                >
                  🏖️ Congés d&apos;une semaine
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            onClick={form.handleSubmit(onSubmit)}
            className="cursor-pointer px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span>Blocage...</span>
              </>
            ) : (
              <>
                <span>🚫</span>
                <span>Bloquer le créneau</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
