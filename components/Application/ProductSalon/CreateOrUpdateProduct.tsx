"use client";
import { ImagePlus, FileText, Save, LoaderCircle } from "lucide-react";
import FormSectionHeader from "@/components/Shared/FormSectionHeader";
import SideFormDrawer from "@/components/Shared/SideFormDrawer";
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
    <SideFormDrawer category="Produits" title={existingProduct ? "Modifier un produit" : "Ajouter un produit"} description="Ajoutez une photo, une présentation claire et le prix de vente de votre produit." onClose={handleClose} busy={loading || isClosing} footer={<>

            <DashboardButton className="!min-w-0 !rounded-xl !shadow-none"
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
            <DashboardButton className="!min-w-0 !rounded-xl !shadow-none"
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
          
    </>}>
<form
              id="product-create-update-form"
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate className="space-y-4"
            >
              <div className="min-w-0 rounded-2xl border border-white/10 bg-noir-600 p-3.5">
                <FormSectionHeader compact eyebrow="01 · Visuel" title="Votre produit en image" description="Choisissez une photo nette qui met en valeur votre produit." icon={<ImagePlus size={18} />} />

                <SalonImageUploader compact
                  appearance="media"
                  currentImage={
                    form.watch("imageUrl") || undefined
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

              <div className="min-w-0 rounded-2xl border border-white/10 bg-noir-600 p-3.5">
                <FormSectionHeader compact eyebrow="02 · Présentation" title="Les détails du produit" description="Renseignez son nom, sa description et son prix de vente." icon={<FileText size={18} />} />

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
                      rows={3}
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
    </SideFormDrawer>
  );
}
