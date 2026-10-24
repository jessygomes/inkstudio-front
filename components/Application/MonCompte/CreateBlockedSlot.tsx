"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardButton from "@/components/Shared/DashboardButton";
import { CalendarOff, Clock3, LockKeyhole, X, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { createBlockedTimeSlotAction } from "@/lib/queries/blocked-time-slots";

const localDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

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
      startDate: localDate(new Date()),
      startTime: "09:00",
      endDate: localDate(new Date()),
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
    if (loading) return;
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
          const nextDay = new Date(`${startDate}T12:00:00`);
          nextDay.setDate(nextDay.getDate() + 1);
          form.setValue("endDate", localDate(nextDay));
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
            const nextDay = new Date(`${startDate}T12:00:00`);
            nextDay.setDate(nextDay.getDate() + 1);
            form.setValue("endDate", localDate(nextDay));
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
          const nextDay = new Date(`${startDate}T12:00:00`);
          nextDay.setDate(nextDay.getDate() + 1);
          form.setValue("endDate", localDate(nextDay));
          form.setValue("endTime", "09:00");
        }
      }
    }
  };

  const values = form.watch();
  const start = new Date(`${values.startDate}T${values.startTime}:00`);
  const end = new Date(`${values.endDate}T${values.endTime}:00`);
  const minutes = (end.getTime() - start.getTime()) / 60000;
  const validDuration = Number.isFinite(minutes) && minutes >= 15 && minutes <= 30 * 24 * 60;
  const duration = validDuration
    ? [Math.floor(minutes / 1440) ? `${Math.floor(minutes / 1440)} j` : "", Math.floor(minutes % 1440 / 60) ? `${Math.floor(minutes % 1440 / 60)} h` : "", minutes % 60 ? `${minutes % 60} min` : ""].filter(Boolean).join(" ")
    : "Choisissez une période de 15 minutes à 30 jours.";
  const scope = tatoueurs.find(t => t.id === values.tatoueurId)?.name || "Salon complet";
  const inputClass = "w-full min-w-0 min-h-9 rounded-lg border border-white/10 bg-noir-700/80 px-2.5 py-2 text-xs text-white outline-none transition-colors focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-400/15 disabled:opacity-50 [color-scheme:dark]";

  return (
    <section aria-labelledby="create-blocked-title" className="@container overflow-hidden rounded-xl border border-white/10 bg-black/10 font-one [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed [&_select]:cursor-pointer [&_input[type=date]]:cursor-pointer [&_input[type=time]]:cursor-pointer [&_button:focus-visible]:outline-none [&_button:focus-visible]:ring-2 [&_button:focus-visible]:ring-tertiary-400">
      <header className="flex items-start gap-2.5 border-b border-white/[0.07] px-4 py-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-tertiary-400/10 text-tertiary-400"><CalendarOff size={16} aria-hidden="true" /></span>
        <div className="flex-1">
          <h3 id="create-blocked-title" className="text-sm font-medium text-white">Nouvelle indisponibilité</h3>
          <p className="mt-1 text-[11px] leading-4 text-white/40">Réservez une période pour une absence, une pause ou des congés.</p>
        </div>
        <button type="button" onClick={onClose} disabled={loading} aria-label="Fermer le formulaire" className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-xl text-white/50 hover:bg-tertiary-400/15 hover:text-white disabled:opacity-50"><X size={18} /></button>
      </header>

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <fieldset disabled={loading} className="min-w-0 space-y-4 p-4 disabled:opacity-70">
          <legend className="sr-only">Détails du créneau à bloquer</legend>
          <div className="grid gap-3 @min-[480px]:grid-cols-2 @min-[480px]:items-end">
            <div>
              <label htmlFor="blocked-scope" className="mb-1.5 block text-xs font-medium text-white/75">Qui est concerné ?</label>
              <select id="blocked-scope" {...form.register("tatoueurId")} className={inputClass} aria-describedby="blocked-scope-help">
                <option value="">Salon complet</option>
                {tatoueurs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <p id="blocked-scope-help" className="mt-1.5 text-[10px] leading-4 text-white/35">Choisissez le salon entier ou un artiste en particulier.</p>
            </div>
            <p className="pb-1 text-[11px] leading-5 text-white/40">La réservation sera bloquée pour <span className="text-white/65">{scope}</span> sur cette période.</p>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-medium text-white/75">Quelle période bloquer ?</h4>
            <div className="grid gap-3 @min-[640px]:grid-cols-2">
              {([
                { title: "Début", date: "startDate", time: "startTime" },
                { title: "Fin", date: "endDate", time: "endTime" },
              ] as const).map(({ title, date, time }) => (
                <fieldset key={date} className="min-w-0 rounded-xl border border-white/[0.07] px-3 pb-3 pt-1">
                  <legend className="px-1 text-[11px] text-white/60">{title}</legend>
                  <div className="grid min-w-0 grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-2">
                    <div className="min-w-0">
                      <label htmlFor={`blocked-${date}`} className="mb-1.5 block text-[10px] text-white/45">Date de {title.toLowerCase()}</label>
                      <input id={`blocked-${date}`} type="date" {...form.register(date)} min={date === "startDate" ? localDate(new Date()) : values.startDate || localDate(new Date())} aria-invalid={Boolean(form.formState.errors[date])} aria-describedby={form.formState.errors[date] ? `error-${date}` : undefined} onChange={e => {
                        form.setValue(date, e.target.value, { shouldDirty: true, shouldValidate: true });
                        if (date === "startDate") handleStartDateChange(e.target.value, values.startTime);
                        else handleEndDateChange(e.target.value);
                        setError(null);
                      }} className={inputClass} />
                      {form.formState.errors[date] && <p id={`error-${date}`} className="mt-2 text-xs text-red-300">{form.formState.errors[date]?.message}</p>}
                    </div>
                    <div className="min-w-0">
                      <label htmlFor={`blocked-${time}`} className="mb-1.5 block text-[10px] text-white/45">Heure de {title.toLowerCase()}</label>
                      <input id={`blocked-${time}`} type="time" {...form.register(time)} aria-invalid={Boolean(form.formState.errors[time])} aria-describedby={form.formState.errors[time] ? `error-${time}` : undefined} onChange={e => {
                        form.setValue(time, e.target.value, { shouldDirty: true, shouldValidate: true });
                        if (time === "startTime") handleStartDateChange(values.startDate, e.target.value);
                        else handleEndTimeChange(e.target.value);
                        setError(null);
                      }} className={inputClass} />
                      {form.formState.errors[time] && <p id={`error-${time}`} className="mt-2 text-xs text-red-300">{form.formState.errors[time]?.message}</p>}
                    </div>
                  </div>
                </fieldset>
              ))}
            </div>
            <div role="status" className={`mt-2 flex flex-wrap items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] ${validDuration ? "bg-emerald-400/5 text-emerald-400" : "bg-white/5 text-white/60"}`}>
              <Clock3 size={16} aria-hidden="true" /><span>{validDuration ? `Durée du blocage : ${duration}` : duration}</span>
              {validDuration && <span className="ml-auto text-[10px] text-white/35">Minimum 15 min · Maximum 30 jours</span>}
            </div>
          </div>

          <div>
            <label htmlFor="blocked-reason" className="mb-1.5 block text-xs font-medium text-white/75">Motif <span className="ml-1 font-normal text-white/45">(facultatif)</span></label>
            <textarea id="blocked-reason" {...form.register("reason")} rows={1} placeholder="Ajoutez une précision utile à votre équipe…" className={`${inputClass} resize-y placeholder:text-white/35`} />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[10px] text-white/35">Suggestions :</span>
              {["Congés", "Formation", "Maladie", "Pause déjeuner"].map(reason => <button key={reason} type="button" aria-pressed={values.reason === reason} onClick={() => form.setValue("reason", reason, { shouldDirty: true })} className={`cursor-pointer rounded-md border px-2 py-1 text-[10px] transition-colors ${values.reason === reason ? "border-tertiary-400/30 bg-tertiary-400/10 text-tertiary-400" : "border-white/10 text-white/60 hover:bg-white/5 hover:text-white"}`}>{reason}</button>)}
            </div>
          </div>
        </fieldset>
        {error && <div role="alert" className="mx-4 mb-4 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-xs text-red-200">{error}</div>}
        <footer className="flex flex-wrap justify-end gap-2 border-t border-white/[0.07] bg-white/[0.02] px-4 py-3">
          <DashboardButton className="!min-h-9 !min-w-0 !rounded-lg !px-3 !py-2 !text-[11px] !shadow-none" variant="secondary" onClick={onClose} disabled={loading}>Annuler</DashboardButton>
          <DashboardButton className="!min-h-9 !min-w-0 !rounded-lg !px-3 !py-2 !text-[11px] !shadow-none" type="submit" disabled={loading}>
            {loading ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <LockKeyhole size={16} aria-hidden="true" />}
            {loading ? "Blocage en cours…" : "Bloquer le créneau"}
          </DashboardButton>
        </footer>
      </form>
    </section>
  );
}
