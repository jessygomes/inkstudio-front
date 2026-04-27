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
    <div className="rounded-2xl border border-white/10 bg-white/3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/10 bg-white/5">
        <div>
          <p className="text-white font-one font-semibold text-md">Bloquer un créneau</p>
          <p className="text-white/50 font-one text-[11px] mt-0.5">Indisponibilité ou congé</p>
        </div>
        <button
          onClick={onClose}
          className="cursor-pointer p-1.5 hover:bg-white/10 rounded-[10px] transition-colors"
        >
          <span className="text-white/60 hover:text-white text-lg leading-none">×</span>
        </button>
      </div>

      {/* Contenu */}
      <div className="p-3 sm:p-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Portée */}
          <div className="space-y-1.5">
            <label className="text-white/50 font-one text-[10px] uppercase tracking-wider">Portée du blocage</label>
            <select
              {...form.register("tatoueurId")}
              className="w-full px-3 py-2 bg-white/6 border border-white/10 rounded-[12px] text-white text-xs font-one focus:outline-none focus:border-tertiary-400/60 transition-colors"
            >
              <option value="" className="bg-noir-500">Salon complet</option>
              {tatoueurs.map((t) => (
                <option key={t.id} value={t.id} className="bg-noir-500">{t.name}</option>
              ))}
            </select>
          </div>

          {/* Période */}
          <div className="space-y-1.5">
            <label className="text-white/50 font-one text-[10px] uppercase tracking-wider">Période de blocage</label>
            <div className="grid grid-cols-2 gap-3">
              {/* Début */}
              <div className="space-y-1.5">
                <p className="text-white/40 font-one text-[10px]">Début</p>
                <input
                  type="date"
                  {...form.register("startDate")}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    form.setValue("startDate", e.target.value);
                    handleStartDateChange(e.target.value, form.watch("startTime"));
                  }}
                  className="w-full px-2.5 py-1.5 bg-white/6 border border-white/10 rounded-[12px] text-white text-[11px] font-one focus:outline-none focus:border-tertiary-400/60 transition-colors"
                />
                <input
                  type="time"
                  {...form.register("startTime")}
                  onChange={(e) => {
                    form.setValue("startTime", e.target.value);
                    handleStartDateChange(form.watch("startDate"), e.target.value);
                  }}
                  className="w-full px-2.5 py-1.5 bg-white/6 border border-white/10 rounded-[12px] text-white text-[11px] font-one focus:outline-none focus:border-tertiary-400/60 transition-colors"
                />
                {form.formState.errors.startDate && (
                  <p className="text-red-300 text-[10px]">{form.formState.errors.startDate.message}</p>
                )}
                {form.formState.errors.startTime && (
                  <p className="text-red-300 text-[10px]">{form.formState.errors.startTime.message}</p>
                )}
              </div>
              {/* Fin */}
              <div className="space-y-1.5">
                <p className="text-white/40 font-one text-[10px]">Fin</p>
                <input
                  type="date"
                  {...form.register("endDate")}
                  min={form.watch("startDate") || new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    form.setValue("endDate", e.target.value);
                    handleEndDateChange(e.target.value);
                  }}
                  className="w-full px-2.5 py-1.5 bg-white/6 border border-white/10 rounded-[12px] text-white text-[11px] font-one focus:outline-none focus:border-tertiary-400/60 transition-colors"
                />
                <input
                  type="time"
                  {...form.register("endTime")}
                  onChange={(e) => {
                    form.setValue("endTime", e.target.value);
                    handleEndTimeChange(e.target.value);
                  }}
                  className="w-full px-2.5 py-1.5 bg-white/6 border border-white/10 rounded-[12px] text-white text-[11px] font-one focus:outline-none focus:border-tertiary-400/60 transition-colors"
                />
                {form.formState.errors.endDate && (
                  <p className="text-red-300 text-[10px]">{form.formState.errors.endDate.message}</p>
                )}
                {form.formState.errors.endTime && (
                  <p className="text-red-300 text-[10px]">{form.formState.errors.endTime.message}</p>
                )}
              </div>
            </div>

            {/* Indicateur de durée */}
            {form.watch("startDate") &&
              form.watch("startTime") &&
              form.watch("endDate") &&
              form.watch("endTime") && (
                <div className="px-3 py-2 bg-white/4 border border-white/8 rounded-[12px]">
                  <div className="text-xs text-white/60 font-one">
                    <span className="font-medium text-white/50">Durée : </span>
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

          {/* Motif */}
          <div className="space-y-1.5">
            <label className="text-white/50 font-one text-[10px] uppercase tracking-wider">Motif (optionnel)</label>
            <input
              type="text"
              {...form.register("reason")}
              placeholder="Ex: Congés, formation, pause..."
              className="w-full px-3 py-2 bg-white/6 border border-white/10 rounded-[12px] text-white placeholder-white/25 text-xs font-one focus:outline-none focus:border-tertiary-400/60 transition-colors"
            />
          </div>

          {/* Raccourcis */}
          <div className="space-y-1.5">
            <label className="text-white/50 font-one text-[10px] uppercase tracking-wider">Raccourcis</label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  form.setValue("startDate", today.toISOString().split("T")[0]);
                  form.setValue("endDate", today.toISOString().split("T")[0]);
                  form.setValue("startTime", "12:00");
                  form.setValue("endTime", "14:00");
                  form.setValue("reason", "Pause déjeuner");
                }}
                className="cursor-pointer px-3 py-2 bg-white/4 hover:bg-white/8 border border-white/8 rounded-[12px] text-white/70 hover:text-white/90 text-[11px] font-one transition-colors text-left"
              >
                Maladie
              </button>
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  const nextWeek = new Date(today);
                  nextWeek.setDate(today.getDate() + 7);
                  form.setValue("startDate", today.toISOString().split("T")[0]);
                  form.setValue("endDate", nextWeek.toISOString().split("T")[0]);
                  form.setValue("startTime", "09:00");
                  form.setValue("endTime", "18:00");
                  form.setValue("reason", "Congés");
                }}
                className="cursor-pointer px-3 py-2 bg-white/4 hover:bg-white/8 border border-white/8 rounded-[12px] text-white/70 hover:text-white/90 text-[11px] font-one transition-colors text-left"
              >
                Congés 1 semaine
              </button>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-[12px]">
              <svg className="w-4 h-4 text-red-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-300 text-xs font-one">{error}</p>
            </div>
          )}
          {/* Footer */}
          <div className=" flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="cursor-pointer rounded-[14px] border border-white/20 bg-white/10 px-4 py-2 text-xs text-white transition-colors hover:bg-white/20 font-medium font-one disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={form.handleSubmit(onSubmit)}
              className="cursor-pointer rounded-[14px] px-5 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                  <span>Blocage...</span>
                </>
              ) : (
                <span>Bloquer le créneau</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
