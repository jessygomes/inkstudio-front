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
          className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center overflow-hidden"
          style={{ height: "100dvh", width: "100vw" }}
        >
          <div className="bg-noir-500 rounded-2xl p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tertiary-400"></div>
              <div className="text-white font-one text-sm">
                Nettoyage en cours...
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        data-modal
        className="fixed inset-0 z-[9999] lg:bg-black/60 lg:backdrop-blur-sm bg-noir-700 flex items-end lg:items-center justify-center p-0 lg:p-4 overflow-hidden"
        style={{ height: "100dvh", width: "100vw" }}
      >
        <div className="bg-noir-500 rounded-none lg:rounded-3xl w-full h-full lg:h-auto lg:max-w-4xl lg:max-h-[95vh] overflow-hidden flex flex-col border-0 lg:border lg:border-white/20 lg:shadow-2xl min-h-0">
          <div className="p-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg lg:text-xl font-bold text-white font-one tracking-wide">
                {existingFlash ? "Modifier le flash" : "Ajouter un flash"}
              </h2>
              <button
                onClick={handleClose}
                disabled={isClosing || loading}
                className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
              >
                <span className="text-white text-xl cursor-pointer">×</span>
              </button>
            </div>
            <p className="text-white/70 mt-1 text-sm">
              {existingFlash
                ? "Modifiez votre flash"
                : "Ajoutez un nouveau flash disponible"}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 lg:space-y-6"
            >
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                  📸 Image du flash
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
                  <p className="text-red-300 text-xs mt-2">
                    {form.formState.errors.imageUrl.message}
                  </p>
                )}
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
                <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                  ℹ️ Informations
                </h3>

                <div>
                  <label className="text-xs text-white/70 font-one">
                    Titre
                  </label>
                  <input
                    {...form.register("title")}
                    placeholder="Nom du flash"
                    className="mt-1 w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400"
                  />
                  {form.formState.errors.title && (
                    <p className="text-red-300 text-xs mt-1">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-white/70 font-one">
                    Description
                  </label>
                  <textarea
                    {...form.register("description")}
                    placeholder="Description (optionnelle)"
                    rows={4}
                    className="mt-1 w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/70 font-one">
                    Dimensions
                  </label>
                  <input
                    {...form.register("dimension")}
                    placeholder="Ex: 10x15 cm"
                    className="mt-1 w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400"
                  />
                  {form.formState.errors.dimension && (
                    <p className="text-red-300 text-xs mt-1">
                      {form.formState.errors.dimension.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-white/70 font-one">
                    Prix (€)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    {...form.register("price", { valueAsNumber: true })}
                    placeholder="0"
                    className="mt-1 w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400"
                  />
                  {form.formState.errors.price && (
                    <p className="text-red-300 text-xs mt-1">
                      {form.formState.errors.price.message}
                    </p>
                  )}
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
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
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
                  <p className="text-red-300 text-xs">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-xl">
                  <p className="text-green-300 text-xs">{success}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading || isClosing}
                  className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 font-one text-xs disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading || isClosing}
                  className="cursor-pointer px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg font-one text-xs disabled:opacity-50"
                >
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
