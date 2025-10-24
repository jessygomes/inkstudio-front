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
          className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center overflow-hidden"
          style={{ height: "100dvh", width: "100vw" }}
        >
          <div className="bg-noir-500 rounded-2xl p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tertiary-400"></div>
              <div className="text-white font-one">
                <p className="text-sm font-medium">Nettoyage en cours...</p>
                <p className="text-xs text-white/60">
                  Suppression de l'image temporaire
                </p>
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
          {/* Header fixe */}
          <div className="p-4 lg:p-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg lg:text-xl font-bold text-white font-one tracking-wide">
                {existingPhoto ? "Modifier la photo" : "Ajouter une photo"}
              </h2>
              <button
                onClick={handleClose}
                disabled={isClosing || loading}
                className="p-2 lg:p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClosing ? (
                  <div className="animate-spin rounded-full h-5 w-5 lg:h-5 lg:w-5 border-b-2 border-white"></div>
                ) : (
                  <span className="text-white text-xl lg:text-xl cursor-pointer">
                    ×
                  </span>
                )}
              </button>
            </div>
            <p className="text-white/70 mt-1 text-sm lg:text-sm">
              {existingPhoto
                ? "Modifiez les informations de votre photo"
                : "Ajoutez une nouvelle photo à votre portfolio"}
            </p>
          </div>

          {/* Form Content scrollable */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-4 min-h-0">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 lg:space-y-6"
            >
              {/* Section: Image */}
              <div className="bg-white/5 rounded-xl p-4 lg:p-4 border border-white/10">
                <h3 className="text-sm lg:text-sm font-semibold text-tertiary-400 mb-3 lg:mb-3 font-one uppercase tracking-wide">
                  📸 Image du portfolio
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
                  <p className="text-red-300 text-xs lg:text-xs mt-2">
                    {form.formState.errors.imageUrl.message}
                  </p>
                )}
              </div>

              {/* Section: Informations */}
              <div className="bg-white/5 rounded-xl p-4 lg:p-4 border border-white/10">
                <h3 className="text-sm lg:text-sm font-semibold text-tertiary-400 mb-3 lg:mb-3 font-one uppercase tracking-wide">
                  ℹ️ Informations
                </h3>

                <div className="space-y-4 lg:space-y-4">
                  <div className="space-y-1 lg:space-y-1">
                    <label className="text-xs lg:text-xs text-white/70 font-one">
                      Titre du tatouage
                    </label>
                    <input
                      placeholder="Donnez un titre à votre tatouage"
                      {...form.register("title")}
                      className="w-full p-3 lg:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm lg:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                    {form.formState.errors.title && (
                      <p className="text-red-300 text-xs lg:text-xs mt-1">
                        {form.formState.errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 lg:space-y-1">
                    <label className="text-xs lg:text-xs text-white/70 font-one">
                      Description (optionnelle)
                    </label>
                    <textarea
                      placeholder="Décrivez votre œuvre, le style, la technique utilisée..."
                      {...form.register("description")}
                      rows={4}
                      className="w-full p-3 lg:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm lg:text-xs focus:outline-none focus:border-tertiary-400 transition-colors resize-none placeholder-white/50"
                    />
                    {form.formState.errors.description && (
                      <p className="text-red-300 text-xs lg:text-xs mt-1">
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages d'erreur et de succès */}
              {error && error === "SAAS_LIMIT" ? (
                /* Message spécial pour les limites SaaS */
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-orange-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
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
                      <h3 className="text-orange-300 font-semibold font-one mb-1 text-xs">
                        🖼️ Limite d'images portfolio atteinte
                      </h3>

                      <p className="text-orange-200 text-xs font-one mb-2">
                        Vous avez atteint la limite d'images portfolio de votre
                        plan actuel.
                      </p>

                      <div className="bg-white/10 rounded-lg p-2 mb-2">
                        <h4 className="text-white font-semibold font-one text-xs mb-1">
                          📈 Solutions disponibles :
                        </h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-start gap-1">
                            <div className="w-3 h-3 bg-tertiary-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
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
                            <div className="w-3 h-3 bg-purple-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
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
                          className="cursor-pointer px-2 py-1 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg text-xs font-one font-medium transition-all duration-300"
                        >
                          📊 Changer de plan
                        </button>

                        <button
                          type="button"
                          onClick={() => setError("")}
                          className="cursor-pointer px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 text-xs font-one font-medium transition-colors"
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
            </form>
          </div>

          {/* Footer fixe */}
          <div className="p-4 lg:p-4 border-t border-white/10 bg-white/5 flex justify-end gap-3 lg:gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading || isClosing}
              className="cursor-pointer px-4 py-2 lg:px-4 lg:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-sm lg:text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isClosing ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 lg:h-3 lg:w-3 border-b-2 border-white"></div>
                  <span>Annulation...</span>
                </>
              ) : (
                "Annuler"
              )}
            </button>
            <button
              type="submit"
              disabled={loading || isClosing}
              onClick={form.handleSubmit(onSubmit)}
              className="cursor-pointer px-6 py-2 lg:px-6 lg:py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-sm lg:text-xs"
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
