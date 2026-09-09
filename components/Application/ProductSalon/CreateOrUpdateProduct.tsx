"use client";
import { ImagePlus, FileText, Save, LoaderCircle } from "lucide-react";
import FormSectionHeader from "@/components/Shared/FormSectionHeader";
import DashboardButton from "@/components/Shared/DashboardButton";
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

  const labelClass =
    "mb-1.5 block text-xs font-medium text-white/65 font-one";
  const inputClass =
    "w-full min-w-0 rounded-xl border border-white/10 bg-black/15 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/45 focus:ring-2 focus:ring-tertiary-400/10 font-two";

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
                  Suppression de l&apos;image temporaire
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
          <div className="shrink-0 border-b border-white/10 bg-gradient-to-r from-tertiary-500/10 to-transparent px-4 py-5 sm:px-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.18em] text-tertiary-400 font-one">
                  Produits
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white font-one sm:text-xl">
                  {existingProduct ? "Modifier le produit" : "Ajouter un produit"}
                </h2>
                <p className="mt-2 text-xs leading-5 text-white/50 font-two">
                  {existingProduct
                    ? "Modifiez les informations de votre produit"
                    : "Ajoutez un nouveau produit a votre boutique"}
                </p>
              </div>
              <button
                type="button"
                aria-label="Fermer la fenêtre" onClick={handleClose}
                disabled={isClosing || loading}
                className="flex size-11 items-center justify-center border border-white/10 shrink-0 rounded-xl focus-visible:outline-2 focus-visible:outline-tertiary-400 text-white/65 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-5 sm:py-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            <form
              id="product-create-update-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="create-rdv-form tablet-inputs space-y-4"
            >
              <div className="dashboard-embedded-section min-w-0 rounded-[22px] p-4 sm:p-5">
                <FormSectionHeader eyebrow="01 · Visuel" title="Votre produit en image" description="Choisissez une photo nette qui met en valeur votre produit." icon={<ImagePlus size={18} />} />

                <SalonImageUploader
                  appearance="media"
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
                  <p className="mt-2 text-xs text-red-300 font-one">
                    {form.formState.errors.imageUrl.message}
                  </p>
                )}
              </div>

              <div className="dashboard-embedded-section min-w-0 rounded-[22px] p-4 sm:p-5">
                <FormSectionHeader eyebrow="02 · Présentation" title="Les détails du produit" description="Renseignez son nom, sa description et son prix de vente." icon={<FileText size={18} />} />

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="product-name" className={labelClass}>
                      Nom du produit
                    </label>
                    <input id="product-name" aria-invalid={Boolean(form.formState.errors.name)}
                      placeholder="Boucle d'oreille en argent"
                      {...form.register("name")}
                      className={inputClass}
                    />
                    {form.formState.errors.name && (
                      <p className="mt-1 text-xs text-red-300 font-one">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="product-description" className={labelClass}>
                      Description (optionnelle)
                    </label>
                    <textarea id="product-description" aria-invalid={Boolean(form.formState.errors.description)}
                      placeholder="Décrivez votre produit, ses caractéristiques..."
                      {...form.register("description")}
                      rows={4}
                      className={`${inputClass} resize-y`}
                    />
                    {form.formState.errors.description && (
                      <p className="mt-1 text-xs text-red-300 font-one">
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="product-price" className={labelClass}>
                      Prix (€)
                    </label>
                    <input id="product-price" aria-invalid={Boolean(form.formState.errors.price)}
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
                      className={inputClass}
                    />
                    {form.formState.errors.price && (
                      <p className="mt-1 text-xs text-red-300 font-one">
                        {form.formState.errors.price.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div role="alert" className="rounded-xl border border-red-500/45 bg-red-500/14 p-3">
                  <p className="text-red-300 text-xs font-one">{error}</p>
                </div>
              )}

              {success && (
                <div role="status" className="rounded-xl border border-emerald-500/40 bg-emerald-500/14 p-3">
                  <p className="text-emerald-300 text-xs font-one">{success}</p>
                </div>
              )}
            </form>
          </div>

          <div className="shrink-0 border-t border-white/10 bg-noir-700 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 p-4 sm:px-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <DashboardButton
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading || isClosing}
            >
              {isClosing ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span>Annulation...</span>
                </>
              ) : (
                "Annuler"
              )}
            </DashboardButton>
            <DashboardButton
              type="submit"
              form="product-create-update-form"
              disabled={loading || isClosing}
            >
              {loading ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : <Save size={15} aria-hidden="true" />}
              {loading
                ? "Enregistrement..."
                : existingProduct
                ? "Modifier le produit"
                : "Ajouter le produit"}
            </DashboardButton>
          </div>
        </div>
      </div>
    </div>
  );
}
