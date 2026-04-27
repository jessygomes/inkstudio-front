/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import SalonImageUploader from "@/components/Application/MonCompte/SalonImageUploader";
import { extractKeyFromUrl } from "@/lib/utils/uploadImg/extractKeyFromUrl";
import { createOrUpdateFlashAction } from "@/lib/queries/flash";
import { FlashProps } from "@/lib/type";
import { flashSchema } from "@/lib/zod/validator.schema";

export default function CreateOrUpdateFlash({
  onCreate,
  existingFlash,
  setIsOpen = () => {},
}: {
  onCreate: () => void;
  existingFlash?: FlashProps | null;
  setIsOpen?: (isOpen: boolean) => void;
}) {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [initialImageUrl] = useState(existingFlash?.imageUrl || "");

  const form = useForm<z.infer<typeof flashSchema>>({
    resolver: zodResolver(flashSchema),
    defaultValues: {
      title: existingFlash?.title || "",
      dimension: existingFlash?.dimension || "",
      description: existingFlash?.description || "",
      imageUrl: existingFlash?.imageUrl || "",
      price: existingFlash?.price || 0,
      isAvailable: existingFlash?.isAvailable ?? true,
    },
  });

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
      const result = await createOrUpdateFlashAction(
        data,
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
    <div>
      {isClosing && (
        <div
          data-modal
          className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-[2px] flex items-center justify-center overflow-hidden p-3"
          style={{ height: "100dvh", width: "100vw" }}
        >
          <div className="dashboard-embedded-panel w-full max-w-sm rounded-2xl border border-white/15 bg-[#1a1a1a] p-4 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-tertiary-400"></div>
              <div className="text-white font-one">
                <p className="text-sm font-medium">Nettoyage en cours...</p>
                <p className="text-[11px] text-white/60">
                  Suppression de l'image temporaire
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        data-modal
        className="fixed inset-0 z-[9999] bg-black/65 backdrop-blur-[2px] p-0 sm:p-3 md:p-4 lg:flex lg:items-center lg:justify-center overflow-hidden"
        style={{ height: "100dvh", width: "100vw" }}
      >
        <div className="dashboard-embedded-panel mx-auto flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-none border-0 bg-[#1a1a1a] shadow-none sm:h-auto sm:max-h-[calc(100dvh-1.5rem)] sm:rounded-[28px] sm:border sm:border-white/12 sm:shadow-[0_32px_64px_rgba(0,0,0,0.45)] md:max-h-[90vh]">
          <div className="dashboard-embedded-header px-4 py-3.5 sm:rounded-t-[28px]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-white/50 font-one">
                  Flash
                </p>
                <h2 className="mt-1 truncate text-base font-semibold tracking-wide text-white font-one sm:text-lg">
                  {existingFlash ? "Modifier un flash" : "Ajouter un flash"}
                </h2>
                <p className="mt-0.5 text-xs text-white/65 font-one">
                  {existingFlash
                    ? "Mettez à jour les informations de votre flash"
                    : "Ajoutez un nouveau flash disponible à la réservation"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={isClosing || loading}
                className="shrink-0 rounded-xl p-1.5 text-white/65 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            <form
              id="flash-create-update-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-2.5"
            >
              <div className="dashboard-embedded-section p-3">
                <h3 className="mb-2 text-[12px] font-semibold text-white font-one">
                  Image du flash
                </h3>
                <SalonImageUploader
                  currentImage={
                    form.watch("imageUrl") ||
                    existingFlash?.imageUrl ||
                    undefined
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

              <div className="dashboard-embedded-section p-3 space-y-2.5">
                <h3 className="mb-2 text-[12px] font-semibold text-white font-one">
                  Informations
                </h3>

                <div className="space-y-1">
                  <label className="text-[11px] text-white/60 font-one uppercase tracking-wider">
                    Titre
                  </label>
                  <input
                    {...form.register("title")}
                    placeholder="Nom du flash"
                    className="w-full rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs text-white placeholder:text-white/35 focus:border-tertiary-400/40 focus:outline-none font-one"
                  />
                  {form.formState.errors.title && (
                    <p className="mt-1 text-xs text-red-300 font-one">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-white/60 font-one uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    {...form.register("description")}
                    placeholder="Description (optionnelle)"
                    rows={4}
                    className="h-24 w-full resize-none rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs text-white placeholder:text-white/35 focus:border-tertiary-400/40 focus:outline-none font-one"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-white/60 font-one uppercase tracking-wider">
                    Dimensions
                  </label>
                  <input
                    {...form.register("dimension")}
                    placeholder="Ex: 10x15 cm"
                    className="w-full rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs text-white placeholder:text-white/35 focus:border-tertiary-400/40 focus:outline-none font-one"
                  />
                  {form.formState.errors.dimension && (
                    <p className="mt-1 text-xs text-red-300 font-one">
                      {form.formState.errors.dimension.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-white/60 font-one uppercase tracking-wider">
                    Prix (€)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    {...form.register("price", { valueAsNumber: true })}
                    placeholder="0"
                    className="w-full rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs text-white placeholder:text-white/35 focus:border-tertiary-400/40 focus:outline-none font-one"
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
                <div className="rounded-xl border border-red-500/45 bg-red-500/14 p-3">
                  <p className="text-xs text-red-300 font-one">{error}</p>
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/14 p-3">
                  <p className="text-xs text-emerald-300 font-one">{success}</p>
                </div>
              )}
            </form>
          </div>

          <div className="dashboard-embedded-footer flex items-center justify-end gap-2 px-4 py-2.5 sm:rounded-b-[28px]">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading || isClosing}
              className="cursor-pointer inline-flex h-9 items-center justify-center rounded-[14px] border border-white/12 bg-white/8 px-3.5 text-[11px] font-medium text-white/85 transition-colors hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-50 font-one"
            >
              {isClosing ? "Annulation..." : "Annuler"}
            </button>
            <button
              type="submit"
              form="flash-create-update-form"
              disabled={loading || isClosing}
              className="cursor-pointer inline-flex h-9 items-center justify-center rounded-[14px] bg-gradient-to-r from-tertiary-400 to-tertiary-500 px-4 text-[11px] font-medium text-white transition-all duration-200 hover:from-tertiary-500 hover:to-tertiary-600 disabled:cursor-not-allowed disabled:opacity-50 font-one"
            >
              {loading
                ? "Enregistrement..."
                : existingFlash
                  ? "Modifier le flash"
                  : "Ajouter le flash"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
