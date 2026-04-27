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

  const sectionTitleClass =
    "mb-2.5 text-[9px] font-medium uppercase tracking-[0.14em] text-white/35 font-one";
  const labelClass = "text-[11px] text-white/65 font-one";
  const inputClass =
    "w-full rounded-xl border border-white/12 bg-white/6 p-2.5 text-xs text-white placeholder:text-white/40 focus:border-tertiary-400/50 focus:outline-none focus:ring-2 focus:ring-tertiary-400/20 transition-colors font-one";

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
        className="fixed inset-0 z-[9999] bg-noir-700 lg:bg-black/60 lg:backdrop-blur-sm flex items-end lg:items-center justify-center p-0 lg:p-4 overflow-hidden"
        style={{ height: "100dvh", width: "100vw" }}
      >
        <div className="dashboard-embedded-panel rounded-none lg:rounded-[28px] w-full h-full lg:h-auto lg:max-w-4xl lg:max-h-[95vh] overflow-hidden flex flex-col border-0 lg:border min-h-0">
          <div className="dashboard-embedded-header px-4 py-3.5 lg:rounded-t-[28px]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg lg:text-xl font-bold text-white font-one tracking-wide">
                {existingProduct ? "Modifier l'article" : "Ajouter un article"}
                </h2>
                <p className="text-white/70 mt-1 text-sm lg:text-sm font-one">
                  {existingProduct
                    ? "Modifiez les informations de votre article de stock"
                    : "Ajoutez un nouvel article à votre stock"}
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="p-1.5 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="cursor-pointer text-white text-xl lg:text-xl">×</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 lg:px-4 lg:py-4 min-h-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-3 lg:space-y-4"
            >
              <div className="dashboard-embedded-section p-3 lg:p-4">
                <h3 className={sectionTitleClass}>Informations générales</h3>

                <div className="space-y-4 lg:space-y-4">
                  <div className="space-y-1 lg:space-y-1">
                    <label className={labelClass}>
                      Nom de l'article *
                    </label>
                    <input
                      placeholder="Encre noire, Aiguilles, Gants..."
                      {...form.register("name")}
                      className={inputClass}
                    />
                    {form.formState.errors.name && (
                      <p className="text-red-300 text-xs lg:text-xs mt-1">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 lg:space-y-1">
                    <label className={labelClass}>
                      Catégorie (optionnelle)
                    </label>
                    <input
                      placeholder="Consommables, Équipement, Hygiène..."
                      {...form.register("category")}
                      className={inputClass}
                    />
                    {form.formState.errors.category && (
                      <p className="text-red-300 text-xs lg:text-xs mt-1">
                        {form.formState.errors.category.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="dashboard-embedded-section p-3 lg:p-4">
                <h3 className={sectionTitleClass}>Gestion des quantités</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-4">
                  <div className="space-y-1 lg:space-y-1">
                    <label className={labelClass}>
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
                      className={inputClass}
                    />
                    {form.formState.errors.quantity && (
                      <p className="text-red-300 text-xs lg:text-xs mt-1">
                        {form.formState.errors.quantity.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 lg:space-y-1">
                    <label className={labelClass}>
                      Unité (optionnelle)
                    </label>
                    <input
                      placeholder="pièces, litres, boîtes..."
                      {...form.register("unit")}
                      className={inputClass}
                    />
                    {form.formState.errors.unit && (
                      <p className="text-red-300 text-xs lg:text-xs mt-1">
                        {form.formState.errors.unit.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 lg:space-y-1">
                    <label className={labelClass}>
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
                      className={inputClass}
                    />
                    {form.formState.errors.pricePerUnit && (
                      <p className="text-red-300 text-xs lg:text-xs mt-1">
                        {form.formState.errors.pricePerUnit.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 lg:space-y-1">
                    <label className={labelClass}>
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
                      className={inputClass}
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

              {error && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/15 p-3">
                  <p className="text-red-300 text-xs lg:text-xs">{error}</p>
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-green-500/40 bg-green-500/15 p-3">
                  <p className="text-green-300 text-xs lg:text-xs">{success}</p>
                </div>
              )}
            </form>
          </div>

          <div className="dashboard-embedded-footer p-4 lg:p-4 flex justify-end gap-3 lg:gap-3 lg:rounded-b-[28px]">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-[14px] border border-white/20 transition-colors font-medium font-one text-sm lg:text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={form.handleSubmit(onSubmit)}
              className="cursor-pointer px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-[14px] transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-sm lg:text-xs"
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
