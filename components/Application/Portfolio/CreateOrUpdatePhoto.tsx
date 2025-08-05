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

export default function CreateOrUpdatePhoto({
  userId,
  onCreate,
  existingPhoto,
  setIsOpen = () => {},
}: {
  userId: string;
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

  // Fonction pour extraire la clé d'une URL UploadThing
  const extractKeyFromUrl = (url: string): string | null => {
    try {
      // Patterns courants d'UploadThing
      const patterns = [
        /\/f\/([^\/\?]+)/,  // Format: .../f/[key]
        /uploadthing\.com\/([^\/\?]+)/,  // Format: uploadthing.com/[key]
        /utfs\.io\/f\/([^\/\?]+)/,  // Format: utfs.io/f/[key]
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }

      // Fallback: prendre la dernière partie de l'URL
      const urlParts = url.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      if (lastPart && !lastPart.includes('.')) {
        return lastPart;
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de l\'extraction de la clé:', error);
      return null;
    }
  };

  // Fonction pour supprimer une image d'UploadThing
  const deleteFromUploadThing = async (imageUrl: string): Promise<boolean> => {
    try {
      console.log("🗑️ Tentative de suppression de:", imageUrl);
      
      const key = extractKeyFromUrl(imageUrl);
      if (!key) {
        console.warn("⚠️ Impossible d'extraire la clé de l'URL:", imageUrl);
        return false;
      }

      console.log("🔑 Clé extraite:", key);

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
        console.log("🧹 Nettoyage: suppression de l'image temporaire");
        const deleted = await deleteFromUploadThing(currentImageUrl);
        
        if (deleted) {
          console.log("✅ Image temporaire supprimée lors de l'annulation");
          toast.success("Image temporaire supprimée");
        } else {
          console.warn("⚠️ Impossible de supprimer l'image temporaire");
        }
      } catch (error) {
        console.error("❌ Erreur lors de la suppression de l'image temporaire:", error);
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
      const response = await fetch(url, {
        method: existingPhoto ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, userId }),
      });

      const result = await response.json();

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

      if (!response.ok) {
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
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-noir-500 rounded-2xl p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tertiary-400"></div>
              <div className="text-white font-one">
                <p className="text-sm font-medium">Nettoyage en cours...</p>
                <p className="text-xs text-white/60">Suppression de l'image temporaire</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-noir-500 rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col border border-white/20 shadow-2xl">
          {/* Header fixe */}
          <div className="p-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white font-one tracking-wide">
                {existingPhoto ? "Modifier la photo" : "Ajouter une photo"}
              </h2>
              <button
                onClick={handleClose}
                disabled={isClosing || loading}
                className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClosing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <span className="text-white text-xl cursor-pointer">×</span>
                )}
              </button>
            </div>
            <p className="text-white/70 mt-2 text-sm">
              {existingPhoto
                ? "Modifiez les informations de votre photo"
                : "Ajoutez une nouvelle photo à votre portfolio"}
            </p>
          </div>

          {/* Form Content scrollable */}
          <div className="flex-1 overflow-y-auto p-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Section: Image */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
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
                    if (currentImageUrl && currentImageUrl !== initialImageUrl) {
                      try {
                        await deleteFromUploadThing(currentImageUrl);
                        console.log("✅ Image supprimée lors du retrait manuel");
                      } catch (error) {
                        console.error("❌ Erreur lors de la suppression manuelle:", error);
                      }
                    }
                    
                    form.setValue("imageUrl", "");
                  }}
                />

                {form.formState.errors.imageUrl && (
                  <p className="text-red-300 text-xs mt-2">
                    {form.formState.errors.imageUrl.message}
                  </p>
                )}
              </div>

              {/* Section: Informations */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                  ℹ️ Informations
                </h3>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-white/70 font-one">
                      Titre du tatouage
                    </label>
                    <input
                      placeholder="Donnez un titre à votre tatouage"
                      {...form.register("title")}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                    {form.formState.errors.title && (
                      <p className="text-red-300 text-xs mt-1">
                        {form.formState.errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-white/70 font-one">
                      Description (optionnelle)
                    </label>
                    <textarea
                      placeholder="Décrivez votre œuvre, le style, la technique utilisée..."
                      {...form.register("description")}
                      rows={4}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors resize-none placeholder-white/50"
                    />
                    {form.formState.errors.description && (
                      <p className="text-red-300 text-xs mt-1">
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages d'erreur et de succès */}
              {error && error === "SAAS_LIMIT" ? (
                /* Message spécial pour les limites SaaS */
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg
                        className="w-4 h-4 text-orange-300"
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
                      <h3 className="text-orange-300 font-semibold font-one mb-2 text-sm">
                        🖼️ Limite d'images portfolio atteinte
                      </h3>

                      <p className="text-orange-200 text-xs font-one mb-3">
                        Vous avez atteint la limite d'images portfolio de votre
                        plan actuel.
                      </p>

                      <div className="bg-white/10 rounded-lg p-3 mb-3">
                        <h4 className="text-white font-semibold font-one text-xs mb-2">
                          📈 Solutions disponibles :
                        </h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-start gap-2">
                            <div className="w-4 h-4 bg-tertiary-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-tertiary-400 text-[10px] font-bold">
                                1
                              </span>
                            </div>
                            <div className="text-white/90">
                              <span className="font-semibold text-tertiary-400">
                                Plan PRO (29€/mois)
                              </span>
                              <br />
                              <span className="text-white/70">
                                Images portfolio illimitées + fonctionnalités
                                avancées
                              </span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2">
                            <div className="w-4 h-4 bg-purple-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-purple-400 text-[10px] font-bold">
                                2
                              </span>
                            </div>
                            <div className="text-white/90">
                              <span className="font-semibold text-purple-400">
                                Plan BUSINESS (69€/mois)
                              </span>
                              <br />
                              <span className="text-white/70">
                                Solution complète multi-salons
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            window.location.href = "/parametres";
                          }}
                          className="cursor-pointer px-3 py-1.5 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg text-xs font-one font-medium transition-all duration-300"
                        >
                          📊 Changer de plan
                        </button>

                        <button
                          type="button"
                          onClick={() => setError("")}
                          className="cursor-pointer px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 text-xs font-one font-medium transition-colors"
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
          <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading || isClosing}
              className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
              disabled={loading || isClosing}
              onClick={form.handleSubmit(onSubmit)}
              className="cursor-pointer px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs"
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
