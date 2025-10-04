"use client";
import SalonImageUploader from "@/components/Application/MonCompte/SalonImageUploader";
import { createOrUpdateProductAction } from "@/lib/queries/productSalon";
import { ProductSalonProps } from "@/lib/type";
import { extractKeyFromUrl } from "@/lib/utils/uploadImg/extractKeyFromUrl";
import { productSalonSchema } from "@/lib/zod/validator.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function CreateOrUpdateProduct({
  userId,
  onCreate,
  existingProduct,
  setIsOpen = () => {},
}: {
  userId: string;
  onCreate: () => void;
  existingProduct?: ProductSalonProps | null;
  setIsOpen?: (isOpen: boolean) => void;
}) {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false); // Nouvel état pour le loader d'annulation
  const [initialImageUrl] = useState(existingProduct?.imageUrl || ""); // Stocker l'URL initiale

  const form = useForm<z.infer<typeof productSalonSchema>>({
    resolver: zodResolver(productSalonSchema),
    defaultValues: {
      name: existingProduct?.name || "",
      description: existingProduct?.description || "",
      price: existingProduct?.price || 0,
      imageUrl: existingProduct?.imageUrl || "",
      userId: userId,
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

  const onSubmit = async (data: z.infer<typeof productSalonSchema>) => {
    setLoading(true);
    setError(undefined);
    setSuccess(undefined);

    const url = existingProduct
      ? `${process.env.NEXT_PUBLIC_BACK_URL}/product-salon/${existingProduct.id}`
      : `${process.env.NEXT_PUBLIC_BACK_URL}/product-salon`;

    try {
      const result = await createOrUpdateProductAction(
        { ...data },
        existingProduct ? "PATCH" : "POST",
        url
      );

      // Vérifier si c'est une erreur de limite SaaS
      if (result.error) {
        if (
          result.message &&
          result.message.includes("Limite de produits atteinte")
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

      setSuccess("Produit enregistré avec succès !");
      onCreate();
      setIsOpen(false);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement du produit :", err);
      setError("Une erreur est survenue lors de l'enregistrement du produit.");
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
                <p className="text-xs text-white/60">
                  Suppression de l&apos;image temporaire
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 z-[9999] sm:bg-black/60 sm:backdrop-blur-sm bg-noir-700 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-noir-500 rounded-none sm:rounded-3xl w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[95vh] overflow-hidden flex flex-col border-0 sm:border sm:border-white/20 sm:shadow-2xl">
          {/* Header fixe */}
          <div className="p-6 sm:p-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl sm:text-xl font-bold text-white font-one tracking-wide">
                {existingProduct ? "Modifier le produit" : "Ajouter un produit"}
              </h2>
              <button
                onClick={handleClose}
                disabled={isClosing || loading}
                className="p-3 sm:p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClosing ? (
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                ) : (
                  <span className="cursor-pointer text-white text-2xl sm:text-xl">
                    ×
                  </span>
                )}
              </button>
            </div>
            <p className="text-white/70 mt-2 text-base sm:text-sm">
              {existingProduct
                ? "Modifiez les informations de votre produit"
                : "Ajoutez un nouveau produit à votre boutique"}
            </p>
          </div>

          {/* Form Content scrollable */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-4">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 sm:space-y-6"
            >
              {/* Section: Image */}
              <div className="bg-white/5 rounded-2xl p-6 sm:p-4 border border-white/10">
                <h3 className="text-base sm:text-sm font-semibold text-tertiary-400 mb-4 sm:mb-3 font-one uppercase tracking-wide">
                  📸 Image du produit
                </h3>

                <SalonImageUploader
                  currentImage={
                    form.watch("imageUrl") ||
                    existingProduct?.imageUrl ||
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
                        console.log(
                          "✅ Image supprimée lors du retrait manuel"
                        );
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
                  <p className="text-red-300 text-sm sm:text-xs mt-2">
                    {form.formState.errors.imageUrl.message}
                  </p>
                )}
              </div>

              {/* Section: Informations */}
              <div className="bg-white/5 rounded-2xl p-6 sm:p-4 border border-white/10">
                <h3 className="text-base sm:text-sm font-semibold text-tertiary-400 mb-4 sm:mb-3 font-one uppercase tracking-wide">
                  ℹ️ Informations
                </h3>

                <div className="space-y-6 sm:space-y-4">
                  <div className="space-y-2 sm:space-y-1">
                    <label className="text-sm sm:text-xs text-white/70 font-one">
                      Nom du produit
                    </label>
                    <input
                      placeholder="Boucle d'oreille en argent"
                      {...form.register("name")}
                      className="w-full p-4 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-base sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                    {form.formState.errors.name && (
                      <p className="text-red-300 text-sm sm:text-xs mt-1">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 sm:space-y-1">
                    <label className="text-sm sm:text-xs text-white/70 font-one">
                      Description (optionnelle)
                    </label>
                    <textarea
                      placeholder="Décrivez votre produit, ses caractéristiques..."
                      {...form.register("description")}
                      rows={5}
                      className="w-full p-4 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-base sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors resize-none placeholder-white/50"
                    />
                    {form.formState.errors.description && (
                      <p className="text-red-300 text-sm sm:text-xs mt-1">
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 sm:space-y-1">
                    <label className="text-sm sm:text-xs text-white/70 font-one">
                      Prix (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Prix en euros (ex: 25.50)"
                      {...form.register("price", {
                        valueAsNumber: true,
                        setValueAs: (value) => {
                          const parsed = parseFloat(value);
                          return isNaN(parsed) ? 0 : parsed;
                        },
                      })}
                      className="w-full p-4 sm:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-base sm:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                    {form.formState.errors.price && (
                      <p className="text-red-300 text-sm sm:text-xs mt-1">
                        {form.formState.errors.price.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages d'erreur et de succès */}
              {error && (
                <div className="p-4 sm:p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
                  <p className="text-red-300 text-sm sm:text-xs">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 sm:p-3 bg-green-500/20 border border-green-500/50 rounded-xl">
                  <p className="text-green-300 text-sm sm:text-xs">{success}</p>
                </div>
              )}
            </form>
          </div>

          {/* Footer fixe */}
          <div className="p-6 sm:p-4 border-t border-white/10 bg-white/5 flex justify-end gap-4 sm:gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading || isClosing}
              className="cursor-pointer px-6 py-3 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-base sm:text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isClosing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-3 sm:w-3 border-b-2 border-white"></div>
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
              className="cursor-pointer px-8 py-3 sm:px-6 sm:py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-base sm:text-xs"
            >
              {loading
                ? "Enregistrement..."
                : existingProduct
                ? "Modifier le produit"
                : "Ajouter le produit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
