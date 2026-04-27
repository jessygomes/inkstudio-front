/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PortfolioProps } from "@/lib/type";
import { portfolioSchema } from "@/lib/zod/validator.schema";
import SalonImageUploader from "@/components/Application/MonCompte/SalonImageUploader";
import { extractKeyFromUrl } from "@/lib/utils/uploadImg/extractKeyFromUrl";
import { createOrUpdatePortfolioAction } from "@/lib/queries/portfolio";

export default function CreateOrUpdatePhoto({
  onCreate,
  existingPhoto,
  setIsOpen = () => {},
}: {
  onCreate: () => void;
  existingPhoto?: PortfolioProps | null;
  setIsOpen?: (isOpen: boolean) => void;
}) {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false); // Nouvel état pour le loader d'annulation
  const [initialImageUrl] = useState(existingPhoto?.imageUrl || ""); // Stocker l'URL initiale

  const form = useForm<z.infer<typeof portfolioSchema>>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      title: existingPhoto?.title || "",
      description: existingPhoto?.description || "",
      imageUrl: existingPhoto?.imageUrl || "",
    },
  });

  // Fonction pour supprimer une image d'UploadThing
  const deleteFromUploadThing = async (imageUrl: string): Promise<boolean> => {
    try {
      const key = extractKeyFromUrl(imageUrl);
      if (!key) {
        console.warn("⚠️ Impossible d'extraire la clé de l'URL:", imageUrl);
        return false;
      }

      const response = await fetch("/api/uploadthing/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log("✅ Image supprimée avec succès d'UploadThing");
        return true;
      } else {
        console.error("❌ Erreur lors de la suppression:", result);
        return false;
      }
    } catch (error) {
      console.error("❌ Erreur lors de la suppression d'UploadThing:", error);
      return false;
    }
  };

  // Fonction de fermeture avec nettoyage
  const handleClose = async () => {
    const currentImageUrl = form.watch("imageUrl");

    // Si une nouvelle image a été uploadée (différente de l'image initiale), la supprimer
    if (currentImageUrl && currentImageUrl !== initialImageUrl) {
      setIsClosing(true); // Activer le loader

      try {
        const deleted = await deleteFromUploadThing(currentImageUrl);

        if (deleted) {
          toast.success("Image temporaire supprimée");
        } else {
          console.warn("⚠️ Impossible de supprimer l'image temporaire");
        }
      } catch (error) {
        console.error(
          "❌ Erreur lors de la suppression de l'image temporaire:",
          error
        );
      } finally {
        setIsClosing(false); // Désactiver le loader
      }
    }

    setIsOpen(false);
  };

  const onSubmit = async (data: z.infer<typeof portfolioSchema>) => {
    setLoading(true);
    setError("");
    setSuccess("");

    const url = existingPhoto
      ? `${process.env.NEXT_PUBLIC_BACK_URL}/portfolio/${existingPhoto.id}`
      : `${process.env.NEXT_PUBLIC_BACK_URL}/portfolio`;

    try {
      const result = await createOrUpdatePortfolioAction(
        { ...data },
        existingPhoto ? "PUT" : "POST",
        url
      );

      // Vérifier si c'est une erreur de limite SaaS
      if (result.error) {
        if (
          result.message &&
          result.message.includes("Limite d'images portfolio atteinte")
        ) {
          setError("SAAS_LIMIT");
        } else {
          setError(result.message || "Une erreur est survenue.");
        }
        return;
      }

      if (!result.ok) {
        setError("Une erreur est survenue côté serveur.");
        return;
      }

      setSuccess(result.message || "Photo enregistrée avec succès !");
      toast.success("Photo enregistrée avec succès !");
      form.reset();
      onCreate();
      setIsOpen(false);
    } catch (error) {
      console.error("Erreur:", error);
      setError(
        error instanceof Error ? error.message : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Overlay de chargement pour l'annulation */}
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
                  Portfolio
                </p>
                <h2 className="mt-1 truncate text-base font-semibold tracking-wide text-white font-one sm:text-lg">
                  {existingPhoto ? "Modifier une photo" : "Ajouter une photo"}
                </h2>
                <p className="mt-0.5 text-xs text-white/65 font-one">
                  {existingPhoto
                    ? "Mettez à jour les informations de votre visuel"
                    : "Ajoutez un nouveau visuel dans votre portfolio"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={isClosing || loading}
                className="shrink-0 rounded-xl p-1.5 text-white/65 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isClosing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
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
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            <form
              id="portfolio-create-update-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-2.5"
            >
              <div className="dashboard-embedded-section p-3">
                <h3 className="mb-2 text-[12px] font-semibold text-white font-one">
                  Image du portfolio
                </h3>

                <SalonImageUploader
                  currentImage={
                    form.watch("imageUrl") ||
                    existingPhoto?.imageUrl ||
                    undefined
                  }
                  onImageUpload={(imageUrl) => {
                    form.setValue("imageUrl", imageUrl);
                  }}
                  onImageRemove={async () => {
                    const currentImageUrl = form.watch("imageUrl");

                    // Si ce n'est pas l'image initiale, essayer de la supprimer d'UploadThing
                    if (
                      currentImageUrl &&
                      currentImageUrl !== initialImageUrl
                    ) {
                      try {
                        await deleteFromUploadThing(currentImageUrl);
                        // console.log(
                        //   "✅ Image supprimée lors du retrait manuel"
                        // );
                      } catch (error) {
                        console.error(
                          "❌ Erreur lors de la suppression manuelle:",
                          error
                        );
                      }
                    }

                    form.setValue("imageUrl", "");
                  }}
                />

                {form.formState.errors.imageUrl && (
                  <p className="mt-2 text-xs text-red-300 font-one">
                    {form.formState.errors.imageUrl.message}
                  </p>
                )}
              </div>

              <div className="dashboard-embedded-section p-3">
                <h3 className="mb-2 text-[12px] font-semibold text-white font-one">
                  Informations
                </h3>

                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] text-white/60 font-one uppercase tracking-wider">
                      Titre du tatouage
                    </label>
                    <input
                      placeholder="Donnez un titre à votre tatouage"
                      {...form.register("title")}
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
                      Description (optionnelle)
                    </label>
                    <textarea
                      placeholder="Décrivez votre œuvre, le style, la technique utilisée..."
                      {...form.register("description")}
                      rows={4}
                      className="h-24 w-full resize-none rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs text-white placeholder:text-white/35 focus:border-tertiary-400/40 focus:outline-none font-one"
                    />
                    {form.formState.errors.description && (
                      <p className="mt-1 text-xs text-red-300 font-one">
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {error && error === "SAAS_LIMIT" ? (
                <div className="dashboard-embedded-section border-orange-500/35 bg-gradient-to-r from-orange-500/12 to-red-500/12 p-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/30">
                      <svg
                        className="w-3 h-3 text-orange-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 text-xs font-semibold text-orange-300 font-one">
                        Limite d'images portfolio atteinte
                      </h3>

                      <p className="mb-2 text-xs text-orange-200 font-one">
                        Vous avez atteint la limite d'images portfolio de votre
                        plan actuel.
                      </p>

                      <div className="mb-2 rounded-lg border border-white/10 bg-white/6 p-2">
                        <h4 className="mb-1 text-xs font-semibold text-white font-one">
                          Solutions disponibles
                        </h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-start gap-1">
                            <div className="mt-0.5 flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full bg-tertiary-500/30">
                              <span className="text-tertiary-400 text-[8px] font-bold">
                                1
                              </span>
                            </div>
                            <div className="text-white/90">
                              <span className="font-semibold text-tertiary-400">
                                Plan PRO (29€/mois)
                              </span>
                              <br />
                              <span className="text-white/70 text-[10px]">
                                Images portfolio illimitées + fonctionnalités
                                avancées
                              </span>
                            </div>
                          </div>

                          <div className="flex items-start gap-1">
                            <div className="mt-0.5 flex h-3 w-3 flex-shrink-0 items-center justify-center rounded-full bg-fuchsia-500/30">
                              <span className="text-purple-400 text-[8px] font-bold">
                                2
                              </span>
                            </div>
                            <div className="text-white/90">
                              <span className="font-semibold text-purple-400">
                                Plan BUSINESS (69€/mois)
                              </span>
                              <br />
                              <span className="text-white/70 text-[10px]">
                                Solution complète multi-salons
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            window.location.href = "/parametres";
                          }}
                          className="cursor-pointer inline-flex items-center justify-center rounded-[10px] bg-gradient-to-r from-tertiary-400 to-tertiary-500 px-2.5 py-1 text-xs font-medium text-white transition-all duration-200 hover:from-tertiary-500 hover:to-tertiary-600 font-one"
                        >
                          Changer de plan
                        </button>

                        <button
                          type="button"
                          onClick={() => setError("")}
                          className="cursor-pointer inline-flex items-center justify-center rounded-[10px] border border-white/15 bg-white/8 px-2.5 py-1 text-xs font-medium text-white/85 transition-colors hover:bg-white/12 font-one"
                        >
                          Fermer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="rounded-xl border border-red-500/45 bg-red-500/14 p-3">
                  <p className="text-xs text-red-300 font-one">{error}</p>
                </div>
              ) : null}

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
              className="cursor-pointer inline-flex h-9 items-center justify-center gap-2 rounded-[14px] border border-white/12 bg-white/8 px-3.5 text-[11px] font-medium text-white/85 transition-colors hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-50 font-one"
            >
              {isClosing ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span>Annulation...</span>
                </>
              ) : (
                "Annuler"
              )}
            </button>
            <button
              type="submit"
              form="portfolio-create-update-form"
              disabled={loading || isClosing}
              className="cursor-pointer inline-flex h-9 items-center justify-center rounded-[14px] bg-gradient-to-r from-tertiary-400 to-tertiary-500 px-4 text-[11px] font-medium text-white transition-all duration-200 hover:from-tertiary-500 hover:to-tertiary-600 disabled:cursor-not-allowed disabled:opacity-50 font-one"
            >
              {loading
                ? "Enregistrement..."
                : existingPhoto
                ? "Modifier la photo"
                : "Ajouter la photo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
