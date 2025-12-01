/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState } from "react";
import { StockItemProps } from "@/lib/type";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { stockItemSchema } from "@/lib/zod/validator.schema";
import { createOrUpdateItem } from "@/lib/queries/stocks";

export default function CreateOrUpdateItem({
  userId,
  onCreate,
  existingProduct,
  setIsOpen = () => {},
}: {
  userId: string;
  onCreate: () => void;
  existingProduct?: StockItemProps | null;
  setIsOpen?: (isOpen: boolean) => void;
}) {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof stockItemSchema>>({
    resolver: zodResolver(stockItemSchema),
    defaultValues: {
      name: existingProduct?.name || "",
      category: existingProduct?.category || "",
      quantity: existingProduct?.quantity || 0,
      unit: existingProduct?.unit || "",
      minQuantity: existingProduct?.minQuantity || 0,
      pricePerUnit: existingProduct?.pricePerUnit || undefined,
      userId: userId,
    },
  });

  const handleClose = () => {
    setIsOpen(false);
  };

  const onSubmit = async (data: z.infer<typeof stockItemSchema>) => {
    setLoading(true);
    setError(undefined);
    setSuccess(undefined);

    const url = existingProduct
      ? `${process.env.NEXT_PUBLIC_BACK_URL}/stocks/update/${existingProduct.id}`
      : `${process.env.NEXT_PUBLIC_BACK_URL}/stocks`;

    try {
      const result = await createOrUpdateItem(
        { ...data },
        existingProduct ? "PATCH" : "POST",
        url
      );

      // Vérifier si c'est une erreur de limite SaaS
      if (result.error) {
        if (result.message) {
          setError(result.message);
        } else {
          setError(result.message || "Une erreur est survenue.");
        }
        return;
      }

      if (!result.ok) {
        setError("Une erreur est survenue côté serveur.");
        return;
      }

      setSuccess("Article enregistré avec succès !");
      onCreate();
      setIsOpen(false);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement de l'article :", err);
      setError(
        "Une erreur est survenue lors de l'enregistrement de l'article."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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
                {existingProduct ? "Modifier l'article" : "Ajouter un article"}
              </h2>
              <button
                onClick={handleClose}
                disabled={loading}
                className="p-2 lg:p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="cursor-pointer text-white text-xl lg:text-xl">
                  ×
                </span>
              </button>
            </div>
            <p className="text-white/70 mt-1 text-sm lg:text-sm">
              {existingProduct
                ? "Modifiez les informations de votre article de stock"
                : "Ajoutez un nouvel article à votre stock"}
            </p>
          </div>

          {/* Form Content scrollable */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-4 min-h-0">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 lg:space-y-6"
            >
              {/* Section: Informations générales */}
              <div className="bg-white/5 rounded-xl p-4 lg:p-4 border border-white/10">
                <h3 className="text-sm lg:text-sm font-semibold text-tertiary-400 mb-3 lg:mb-3 font-one uppercase tracking-wide">
                  📦 Informations générales
                </h3>

                <div className="space-y-4 lg:space-y-4">
                  <div className="space-y-1 lg:space-y-1">
                    <label className="text-xs lg:text-xs text-white/70 font-one">
                      Nom de l'article *
                    </label>
                    <input
                      placeholder="Encre noire, Aiguilles, Gants..."
                      {...form.register("name")}
                      className="w-full p-3 lg:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm lg:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                    {form.formState.errors.name && (
                      <p className="text-red-300 text-xs lg:text-xs mt-1">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 lg:space-y-1">
                    <label className="text-xs lg:text-xs text-white/70 font-one">
                      Catégorie (optionnelle)
                    </label>
                    <input
                      placeholder="Consommables, Équipement, Hygiène..."
                      {...form.register("category")}
                      className="w-full p-3 lg:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm lg:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                    {form.formState.errors.category && (
                      <p className="text-red-300 text-xs lg:text-xs mt-1">
                        {form.formState.errors.category.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section: Quantités */}
              <div className="bg-white/5 rounded-xl p-4 lg:p-4 border border-white/10">
                <h3 className="text-sm lg:text-sm font-semibold text-tertiary-400 mb-3 lg:mb-3 font-one uppercase tracking-wide">
                  📊 Gestion des quantités
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-4">
                  <div className="space-y-1 lg:space-y-1">
                    <label className="text-xs lg:text-xs text-white/70 font-one">
                      Quantité actuelle *
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="50"
                      {...form.register("quantity", {
                        valueAsNumber: true,
                        setValueAs: (value) => {
                          const parsed = parseInt(value);
                          return isNaN(parsed) ? 0 : parsed;
                        },
                      })}
                      className="w-full p-3 lg:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm lg:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                    {form.formState.errors.quantity && (
                      <p className="text-red-300 text-xs lg:text-xs mt-1">
                        {form.formState.errors.quantity.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 lg:space-y-1">
                    <label className="text-xs lg:text-xs text-white/70 font-one">
                      Unité (optionnelle)
                    </label>
                    <input
                      placeholder="pièces, litres, boîtes..."
                      {...form.register("unit")}
                      className="w-full p-3 lg:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm lg:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                    {form.formState.errors.unit && (
                      <p className="text-red-300 text-xs lg:text-xs mt-1">
                        {form.formState.errors.unit.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 lg:space-y-1">
                    <label className="text-xs lg:text-xs text-white/70 font-one">
                      Prix unitaire € (optionnel)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="15.50"
                      {...form.register("pricePerUnit", {
                        valueAsNumber: true,
                        setValueAs: (value) => {
                          if (
                            value === "" ||
                            value === null ||
                            value === undefined
                          )
                            return undefined;
                          const parsed = parseFloat(value);
                          return isNaN(parsed) ? undefined : parsed;
                        },
                      })}
                      className="w-full p-3 lg:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm lg:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                    {form.formState.errors.pricePerUnit && (
                      <p className="text-red-300 text-xs lg:text-xs mt-1">
                        {form.formState.errors.pricePerUnit.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 lg:space-y-1">
                    <label className="text-xs lg:text-xs text-white/70 font-one">
                      Quantité minimale d'alerte (optionnelle)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="10"
                      {...form.register("minQuantity", {
                        valueAsNumber: true,
                        setValueAs: (value) => {
                          if (
                            value === "" ||
                            value === null ||
                            value === undefined
                          )
                            return undefined;
                          const parsed = parseInt(value);
                          return isNaN(parsed) ? undefined : parsed;
                        },
                      })}
                      className="w-full p-3 lg:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm lg:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                    <p className="text-white/50 text-xs lg:text-[10px] font-one">
                      Vous recevrez une alerte quand le stock atteint cette
                      quantité
                    </p>
                    {form.formState.errors.minQuantity && (
                      <p className="text-red-300 text-xs lg:text-xs mt-1">
                        {form.formState.errors.minQuantity.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages d'erreur et de succès */}
              {error && (
                <div className="p-3 lg:p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
                  <p className="text-red-300 text-xs lg:text-xs">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 lg:p-3 bg-green-500/20 border border-green-500/50 rounded-xl">
                  <p className="text-green-300 text-xs lg:text-xs">{success}</p>
                </div>
              )}
            </form>
          </div>

          {/* Footer fixe */}
          <div className="p-4 lg:p-4 border-t border-white/10 bg-white/5 flex justify-end gap-3 lg:gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="cursor-pointer px-4 py-2 lg:px-4 lg:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-sm lg:text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={form.handleSubmit(onSubmit)}
              className="cursor-pointer px-6 py-2 lg:px-6 lg:py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-sm lg:text-xs"
            >
              {loading
                ? "Enregistrement..."
                : existingProduct
                ? "Modifier l'article"
                : "Ajouter l'article"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
