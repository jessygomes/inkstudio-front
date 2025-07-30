"use client";

import { FormError } from "@/components/Shared/FormError";
import { FormSuccess } from "@/components/Shared/FormSuccess";
import SalonImageUploader from "@/components/Application/MonCompte/SalonImageUploader";
import { ProductSalonProps } from "@/lib/type";
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

  const form = useForm<z.infer<typeof productSalonSchema>>({
    resolver: zodResolver(productSalonSchema),
    defaultValues: {
      name: existingProduct?.name || "",
      description: existingProduct?.description || "",
      price: existingProduct?.price || 0,
      imageUrl: existingProduct?.imageUrl || "",
      userId: userId, // Ajout du userId dans les valeurs par défaut
    },
  });

  const onSubmit = async (data: z.infer<typeof productSalonSchema>) => {
    setLoading(true);
    setError(undefined);
    setSuccess(undefined);

    const url = existingProduct
      ? `${process.env.NEXT_PUBLIC_BACK_URL}/product-salon/${existingProduct.id}`
      : `${process.env.NEXT_PUBLIC_BACK_URL}/product-salon`;

    try {
      const response = await fetch(url, {
        method: existingProduct ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data), // Utiliser directement data au lieu de { ...data, userId }
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error data:", errorData);
        setError(errorData.message || "Une erreur est survenue.");
        return;
      }

      await response.json();
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
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-primary-500 rounded-lg p-6 w-full max-w-[80%] max-h-[80%] overflow-y-auto shadow-lg relative">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Section: Image */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-white/30 pb-2">
                Image du portfolio
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
                onImageRemove={() => {
                  form.setValue("imageUrl", "");
                }}
              />

              {form.formState.errors.imageUrl && (
                <p className="text-red-400 text-sm">
                  {form.formState.errors.imageUrl.message}
                </p>
              )}
            </div>

            {/* Section: Informations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-white/30 pb-2">
                Informations
              </h3>

              <div>
                <label className="block text-sm font-one font-medium text-white mb-2">
                  Nom du produit
                </label>
                <input
                  placeholder="Boucle d'oreille en argent"
                  {...form.register("name")}
                  className="w-full mt-1 rounded-4xl border border-gray-300 px-3 py-2 text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                />
                {form.formState.errors.name && (
                  <p className="text-red-400 text-xs mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-one font-medium text-white mb-2">
                  Description (optionnelle)
                </label>
                <textarea
                  placeholder="Décrivez votre œuvre, le style, la technique utilisée..."
                  {...form.register("description")}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-[15px] text-xs text-white focus:outline-none focus:border-tertiary-400 transition-colors resize-none"
                />
                {form.formState.errors.description && (
                  <p className="text-red-400 text-sm mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-one font-medium text-white mb-2">
                  Prix
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
                  className="w-full mt-1 rounded-4xl border border-gray-300 px-3 py-2 text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                />
                {form.formState.errors.price && (
                  <p className="text-red-400 text-xs mt-1">
                    {form.formState.errors.price.message}
                  </p>
                )}
              </div>
            </div>

            {/* Messages d'erreur et de succès */}
            <FormError message={error} />
            <FormSuccess message={success} />

            {/* Boutons d'action */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="relative text-xs cursor-pointer bg-secondary-500 w-[150px] text-center text-white font-one py-2 px-4 rounded-[20px] hover:bg-secondary-600 transition-all ease-in-out duration-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="relative text-xs cursor-pointer bg-gradient-to-l from-tertiary-400 to-tertiary-500 w-full text-center text-white font-one py-2 px-4 rounded-[20px] hover:bg-tertiary-500 transition-all ease-in-out duration-300"
              >
                {loading
                  ? "Enregistrement..."
                  : existingProduct
                  ? "Modifier"
                  : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
