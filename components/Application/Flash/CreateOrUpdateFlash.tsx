/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { ImagePlus, FileText, Save, LoaderCircle, CalendarClock } from "lucide-react";
import FormSectionHeader from "@/components/Shared/FormSectionHeader";
import SideFormDrawer from "@/components/Shared/SideFormDrawer";
import DashboardButton from "@/components/Shared/DashboardButton";
import SalonImageUploader from "@/components/Application/MonCompte/SalonImageUploader";
import { extractKeyFromUrl } from "@/lib/utils/uploadImg/extractKeyFromUrl";
import { createOrUpdateFlashAction } from "@/lib/queries/flash";
import { FlashProps } from "@/lib/type";
import { flashSchema } from "@/lib/zod/validator.schema";
import { PortfolioTatoueurDto } from "@/lib/queries/portfolio";

export default function CreateOrUpdateFlash({
  onCreate,
  tatoueurs,
  existingFlash,
  setIsOpen = () => {},
}: {
  onCreate: () => void;
  tatoueurs: PortfolioTatoueurDto[];
  existingFlash?: FlashProps | null;
  setIsOpen?: (isOpen: boolean) => void;
}) {
  const { data: session } = useSession();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [initialImageUrl] = useState(existingFlash?.imageUrl || "");
  const [styleInput, setStyleInput] = useState("");

  const isUserTatoueur = session?.user?.role?.toLowerCase() === "user_tatoueur";
  const uniqueTatoueur = useMemo(
    () => (tatoueurs.length === 1 ? tatoueurs[0] : undefined),
    [tatoueurs],
  );

  const getTatoueurDisplayName = (tatoueur?: {
    name?: string | null;
    salonName?: string | null;
    role?: string | null;
  } | null) => {
    if (!tatoueur) return "";

    const isUserSalon = tatoueur.role?.toLowerCase() === "user_salon";
    if (isUserSalon && tatoueur.salonName?.trim()) {
      return tatoueur.salonName;
    }

    return tatoueur.name || tatoueur.salonName || "";
  };

  const normalizeStyles = (styles: string[]): string[] => {
    return Array.from(
      new Set(
        styles
          .map((style) => style.trim())
          .filter((style) => style.length > 0),
      ),
    );
  };

  const addStylesFromInput = () => {
    const parsedStyles = styleInput
      .split(",")
      .map((style) => style.trim())
      .filter((style) => style.length > 0);

    if (parsedStyles.length === 0) {
      return;
    }

    const mergedStyles = normalizeStyles([
      ...(form.getValues("style") || []),
      ...parsedStyles,
    ]);

    form.setValue("style", mergedStyles, { shouldValidate: true });
    setStyleInput("");
  };

  const removeStyle = (styleToRemove: string) => {
    const nextStyles = (form.getValues("style") || []).filter(
      (style) => style !== styleToRemove,
    );
    form.setValue("style", nextStyles, { shouldValidate: true });
  };

  const form = useForm<z.infer<typeof flashSchema>>({
    resolver: zodResolver(flashSchema),
    defaultValues: {
      title: existingFlash?.title || "",
      dimension: existingFlash?.dimension || "",
      appointmentDurationMinutes: existingFlash?.appointmentDurationMinutes || 60,
      description: existingFlash?.description || "",
      imageUrl: existingFlash?.imageUrl || "",
      price: existingFlash?.price || 0,
      isAvailable: existingFlash?.isAvailable ?? true,
      tatoueurId: existingFlash?.tatoueurId || "",
      style: existingFlash?.style || [],
    },
  });

  useEffect(() => {
    if (!existingFlash && isUserTatoueur && uniqueTatoueur?.id) {
      form.setValue("tatoueurId", uniqueTatoueur.id, {
        shouldValidate: true,
        shouldDirty: false,
      });
    }
  }, [existingFlash, form, isUserTatoueur, uniqueTatoueur?.id]);

  const deleteFromUploadThing = async (imageUrl: string): Promise<boolean> => {
    try {
      const key = extractKeyFromUrl(imageUrl);
      if (!key) return false;

      const response = await fetch("/api/uploadthing/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      const result = await response.json();
      return response.ok && result.success;
    } catch (uploadError) {
      console.error("Erreur suppression UploadThing:", uploadError);
      return false;
    }
  };

  const handleClose = async () => {
    const currentImageUrl = form.watch("imageUrl");

    if (currentImageUrl && currentImageUrl !== initialImageUrl) {
      setIsClosing(true);
      try {
        await deleteFromUploadThing(currentImageUrl);
      } finally {
        setIsClosing(false);
      }
    }

    setIsOpen(false);
  };

  const onSubmit = async (data: z.infer<typeof flashSchema>) => {
    setLoading(true);
    setError("");
    setSuccess("");

    const url = existingFlash
      ? `${process.env.NEXT_PUBLIC_BACK_URL}/flash/${existingFlash.id}`
      : `${process.env.NEXT_PUBLIC_BACK_URL}/flash`;

    try {
      const resolvedTatoueurId = isUserTatoueur
        ? data.tatoueurId || uniqueTatoueur?.id
        : data.tatoueurId;

      const result = await createOrUpdateFlashAction(
        {
          ...data,
          tatoueurId: resolvedTatoueurId ? resolvedTatoueurId : undefined,
          style: normalizeStyles(data.style || []),
        },
        existingFlash ? "PATCH" : "POST",
        url,
      );

      if (!result.ok) {
        setError(result.message || "Une erreur est survenue côté serveur.");
        return;
      }

      setSuccess("Flash enregistré avec succès !");
      toast.success("Flash enregistré avec succès !");
      form.reset();
      onCreate();
      setIsOpen(false);
    } catch (submitError) {
      console.error("Erreur:", submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Une erreur est survenue.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SideFormDrawer category="Flashs" title={existingFlash ? "Modifier un flash" : "Ajouter un flash"} description="Présentez votre dessin, puis précisez les conditions de réservation de la séance." onClose={handleClose} busy={loading || isClosing} footer={<>

            <DashboardButton className="!min-w-0 !rounded-xl !shadow-none"
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading || isClosing}
            >
              {isClosing ? "Annulation..." : "Annuler"}
            </DashboardButton>
            <DashboardButton className="!min-w-0 !rounded-xl !shadow-none"
              type="submit"
              form="flash-create-update-form"
              disabled={loading || isClosing}
            >
              {loading ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : <Save size={15} aria-hidden="true" />}
              {loading
                ? "Enregistrement..."
                : existingFlash
                  ? "Modifier le flash"
                  : "Ajouter le flash"}
            </DashboardButton>
          
    </>}>
<form
              id="flash-create-update-form"
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate className="space-y-4"
            >
              <div className="min-w-0 rounded-2xl border border-white/10 bg-noir-600 p-3.5">
                <FormSectionHeader compact eyebrow="01 · Visuel" title="Le visuel de votre flash" description="Présentez votre dessin avec une image nette et bien cadrée." icon={<ImagePlus size={18} />} />
                <SalonImageUploader compact
                  appearance="media"
                  currentImage={
                    form.watch("imageUrl") || undefined
                  }
                  onImageUpload={(imageUrl) =>
                    form.setValue("imageUrl", imageUrl)
                  }
                  onImageRemove={() => form.setValue("imageUrl", "")}
                />
                {form.formState.errors.imageUrl && (
                  <p className="mt-2 text-xs text-red-300 font-one">
                    {form.formState.errors.imageUrl.message}
                  </p>
                )}
              </div>

              <div className="min-w-0 rounded-2xl border border-white/10 bg-noir-600 p-3.5 space-y-4">
                <FormSectionHeader compact eyebrow="02 · Présentation" title="Décrivez votre création" description="Précisez le titre, l’artiste et les styles de votre flash." icon={<FileText size={18} />} />

                <div className="space-y-1">
                  <label htmlFor="flash-title" className="mb-1.5 block text-xs font-medium text-white/65 font-one">
                    Titre
                  </label>
                  <input id="flash-title" aria-invalid={Boolean(form.formState.errors.title)}
                    {...form.register("title")}
                    placeholder="Nom du flash"
                    className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/45 focus:ring-2 focus:ring-tertiary-400/10 font-two"
                  />
                  {form.formState.errors.title && (
                    <p className="mt-1 text-xs text-red-300 font-one">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                {!isUserTatoueur && (
                  <div className="space-y-1">
                    <label className="mb-1.5 block text-xs font-medium text-white/65 font-one">
                      Tatoueur (optionnel)
                    </label>
                    <select
                      {...form.register("tatoueurId")}
                      className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3 py-2.5 text-sm text-white outline-none transition focus:border-tertiary-400/45 focus:ring-2 focus:ring-tertiary-400/10 font-two"
                    >
                      <option value="" className="bg-noir-500">
                        Aucun tatoueur assigné
                      </option>
                      {tatoueurs.map((tatoueur) => (
                        <option
                          key={tatoueur.id}
                          value={tatoueur.id}
                          className="bg-noir-500"
                        >
                          {getTatoueurDisplayName(tatoueur)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="mb-1.5 block text-xs font-medium text-white/65 font-one">
                    Styles (optionnel)
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      aria-label="Ajouter un style" value={styleInput}
                      onChange={(event) => setStyleInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === ",") {
                          event.preventDefault();
                          addStylesFromInput();
                        }
                      }}
                      onBlur={addStylesFromInput}
                      placeholder="Ex: Fine Line, Old School, Néo-trad"
                      className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/45 focus:ring-2 focus:ring-tertiary-400/10 font-two"
                    />
                    <button
                      type="button"
                      onClick={addStylesFromInput}
                      className="cursor-pointer inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-white/12 bg-white/8 px-3 text-[11px] font-medium text-white/85 transition-colors hover:bg-white/12 font-one"
                    >
                      Ajouter
                    </button>
                  </div>

                  {(form.watch("style") || []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(form.watch("style") || []).map((style) => (
                        <span
                          key={style}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white font-one"
                        >
                          {style}
                          <button
                            type="button"
                            onClick={() => removeStyle(style)}
                            className="cursor-pointer text-tertiary-200/75 hover:text-tertiary-100"
                            aria-label={`Retirer le style ${style}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {form.formState.errors.style && (
                    <p className="mt-1 text-xs text-red-300 font-one">
                      {form.formState.errors.style.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="flash-description" className="mb-1.5 block text-xs font-medium text-white/65 font-one">
                    Description
                  </label>
                  <textarea id="flash-description" aria-invalid={Boolean(form.formState.errors.description)}
                    {...form.register("description")}
                    placeholder="Description (optionnelle)"
                    rows={3}
                    className="h-24 w-full resize-y rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs text-white placeholder:text-white/35 focus:border-tertiary-400/40 focus:outline-none font-one"
                  />
                </div>

                </div>
              <div className="min-w-0 rounded-2xl border border-white/10 bg-noir-600 p-3.5 space-y-4">
                <FormSectionHeader compact eyebrow="03 · Réservation" title="Préparez la séance" description="Définissez les dimensions, la durée et le tarif de ce flash." icon={<CalendarClock size={18} />} />
                <div className="space-y-1">
                  <label htmlFor="flash-dimension" className="mb-1.5 block text-xs font-medium text-white/65 font-one">
                    Dimensions
                  </label>
                  <input id="flash-dimension" aria-invalid={Boolean(form.formState.errors.dimension)}
                    {...form.register("dimension")}
                    placeholder="Ex: 10x15 cm"
                    className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/45 focus:ring-2 focus:ring-tertiary-400/10 font-two"
                  />
                  {form.formState.errors.dimension && (
                    <p className="mt-1 text-xs text-red-300 font-one">
                      {form.formState.errors.dimension.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="flash-appointmentDurationMinutes" className="mb-1.5 block text-xs font-medium text-white/65 font-one">
                    Durée du rendez-vous (30 min)
                  </label>
                  <select id="flash-appointmentDurationMinutes" aria-invalid={Boolean(form.formState.errors.appointmentDurationMinutes)}
                    {...form.register("appointmentDurationMinutes", {
                      setValueAs: (value) => Number(value),
                    })}
                    className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3 py-2.5 text-sm text-white outline-none transition focus:border-tertiary-400/45 focus:ring-2 focus:ring-tertiary-400/10 font-two"
                  >
                    {[30, 60, 90, 120, 150, 180, 210, 240].map((duration) => (
                      <option key={duration} value={duration} className="bg-noir-500">
                        {duration < 60
                          ? `${duration} min`
                          : duration % 60 === 0
                            ? `${duration / 60} h`
                            : `${Math.floor(duration / 60)} h ${duration % 60}`}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.appointmentDurationMinutes && (
                    <p className="mt-1 text-xs text-red-300 font-one">
                      {form.formState.errors.appointmentDurationMinutes.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="flash-price" className="mb-1.5 block text-xs font-medium text-white/65 font-one">
                    Prix (€)
                  </label>
                  <input id="flash-price" aria-invalid={Boolean(form.formState.errors.price)}
                    type="number"
                    min={0}
                    step="0.01"
                    {...form.register("price", { valueAsNumber: true })}
                    placeholder="0"
                    className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/45 focus:ring-2 focus:ring-tertiary-400/10 font-two"
                  />
                  {form.formState.errors.price && (
                    <p className="mt-1 text-xs text-red-300 font-one">
                      {form.formState.errors.price.message}
                    </p>
                  )}
                </div>

                <label className="dashboard-list-item flex cursor-pointer items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-2.5 py-2">
                  <input
                    type="checkbox"
                    checked={form.watch("isAvailable")}
                    onChange={(e) =>
                      form.setValue("isAvailable", e.target.checked)
                    }
                    className="w-4 h-4 accent-tertiary-400"
                  />
                  <span className="text-xs text-white/80 font-one">
                    Flash disponible à la vente
                  </span>
                </label>
              </div>

              {error && (
                <div role="alert" className="rounded-xl border border-red-500/45 bg-red-500/14 p-3">
                  <p className="text-xs text-red-300 font-one">{error}</p>
                </div>
              )}

              {success && (
                <div role="status" className="rounded-xl border border-emerald-500/40 bg-emerald-500/14 p-3">
                  <p className="text-xs text-emerald-300 font-one">{success}</p>
                </div>
              )}
            </form>
    </SideFormDrawer>
  );
}
