/* eslint-disable react/no-unescaped-entities */
"use client";
import { useId, useState, type ReactNode } from "react";
import { PackagePlus, Package, Boxes, ScanLine, Save, LoaderCircle, X } from "lucide-react";
import { StockItemProps } from "@/lib/type";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { stockItemSchema } from "@/lib/zod/validator.schema";
import { createOrUpdateItem } from "@/lib/queries/stocks";
import DashboardButton from "@/components/Shared/DashboardButton";

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
  const formId = useId();
  const titleId = useId();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof stockItemSchema>>({
    resolver: zodResolver(stockItemSchema),
    defaultValues: {
      name: existingProduct?.name || "",
      category: existingProduct?.category || "",
      type: existingProduct?.type || "",
      brand: existingProduct?.brand || "",
      reference: existingProduct?.reference || "",
      pigment: existingProduct?.pigment || "",
      lotNumber: existingProduct?.lotNumber || "",
      expirationDate: existingProduct?.expirationDate ? existingProduct.expirationDate.split("T")[0] : "",
      notes: existingProduct?.notes || "",
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

  const labelClass = "mb-1.5 block text-xs font-medium text-white/65 font-one";
  const inputClass =
    "w-full min-w-0 rounded-xl border border-white/10 bg-black/15 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/45 focus:ring-2 focus:ring-tertiary-400/10 font-two";

  const onSubmit = async (data: z.infer<typeof stockItemSchema>) => {
    if (loading) return;
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
        role="dialog" aria-modal="true" aria-labelledby={titleId}
        className="fixed inset-0 z-[9999] bg-noir-700 lg:bg-black/60 lg:backdrop-blur-sm flex items-end lg:items-center justify-center p-0 lg:p-4 overflow-hidden"
        style={{ height: "100dvh", width: "100vw" }}
      >
        <div className="rounded-none lg:rounded-[28px] w-full h-full lg:h-auto lg:max-w-4xl lg:max-h-[92dvh] overflow-hidden flex flex-col border-0 lg:border lg:border-white/10 bg-noir-700 shadow-2xl min-h-0">
          <div className="shrink-0 border-b border-white/10 bg-gradient-to-r from-tertiary-500/10 to-transparent px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-tertiary-400 font-one">Inventaire · Stock</p>
                <h2 id={titleId} className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-white font-one"><PackagePlus size={20} className="text-tertiary-400" aria-hidden="true" />
                {existingProduct ? "Modifier l'article" : "Ajouter un article"}
                </h2>
                <p className="text-white/50 mt-2 text-xs leading-5 font-two">
                  {existingProduct
                    ? "Modifiez les informations de votre article de stock"
                    : "Ajoutez un nouvel article à votre stock"}
                </p>
              </div>
              <button
                type="button" aria-label="Fermer la fenêtre" onClick={handleClose}
                disabled={loading}
                className="flex size-11 shrink-0 items-center justify-center border border-white/10 text-white/60 hover:bg-white/10 hover:text-white rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-tertiary-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-5 sm:py-5 min-h-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            <form
              id={formId} onSubmit={form.handleSubmit(onSubmit)}
              className="create-rdv-form tablet-inputs space-y-4"
            >
              <div className="dashboard-embedded-section min-w-0 rounded-[22px] p-4 sm:p-5">
                <StockSectionHeader eyebrow="01 · Article" title="Identifiez votre produit" description="Renseignez son nom et ses références pour le retrouver facilement." icon={<Package size={18} />} />

                <div className="space-y-4 lg:space-y-4">
                  <div className="space-y-1 lg:space-y-1">
                    <label htmlFor={formId + "-name"} className={labelClass}>
                      Nom de l'article *
                    </label>
                    <input id={formId + "-name"} aria-invalid={Boolean(form.formState.errors.name)} aria-describedby={form.formState.errors.name ? formId + "-name-error" : undefined}
                      placeholder="BLKout Black, Aiguilles Round Liner 7RL, etc."
                      {...form.register("name")}
                      className={inputClass}
                    />
                    {form.formState.errors.name && (
                      <p id={formId + "-name-error"} role="alert" className="text-red-300 text-xs lg:text-xs mt-1">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>


                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1 lg:space-y-1">
                      <label htmlFor={formId + "-category"} className={labelClass}>
                        Catégorie (optionnelle)
                      </label>
                      <input id={formId + "-category"} aria-invalid={Boolean(form.formState.errors.category)} aria-describedby={form.formState.errors.category ? formId + "-category-error" : undefined}
                        placeholder="Consommables, Équipement, Hygiène..."
                        {...form.register("category")}
                        className={inputClass}
                      />
                      {form.formState.errors.category && (
                        <p id={formId + "-category-error"} role="alert" className="text-red-300 text-xs lg:text-xs mt-1">
                          {form.formState.errors.category.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1 lg:space-y-1">
                      <label htmlFor={formId + "-type"} className={labelClass}>Type</label>
                      <input id={formId + "-type"} aria-invalid={Boolean(form.formState.errors.type)} aria-describedby={form.formState.errors.type ? formId + "-type-error" : undefined}
                        placeholder="Ex : Encre, crème, etc."
                        {...form.register("type")}
                        className={inputClass}
                      />
                      {form.formState.errors.type && (
                        <p id={formId + "-type-error"} role="alert" className="text-red-300 text-xs lg:text-xs mt-1">
                          {form.formState.errors.type.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Champs supplémentaires pour consommables */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label htmlFor={formId + "-brand"} className={labelClass}>Marque</label>
                      <input id={formId + "-brand"} aria-invalid={Boolean(form.formState.errors.brand)} aria-describedby={form.formState.errors.brand ? formId + "-brand-error" : undefined}
                        placeholder="Ex : Dynamic, Kwadron..."
                        {...form.register("brand")}
                        className={inputClass}
                      />
                      {form.formState.errors.brand && (
                        <p id={formId + "-brand-error"} role="alert" className="text-red-300 text-xs mt-1">{form.formState.errors.brand.message}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label htmlFor={formId + "-reference"} className={labelClass}>Référence</label>
                      <input id={formId + "-reference"} aria-invalid={Boolean(form.formState.errors.reference)} aria-describedby={form.formState.errors.reference ? formId + "-reference-error" : undefined}
                        placeholder="Ex : DY-BLK-240, KW-RL7..."
                        {...form.register("reference")}
                        className={inputClass}
                      />
                      {form.formState.errors.reference && (
                        <p id={formId + "-reference-error"} role="alert" className="text-red-300 text-xs mt-1">{form.formState.errors.reference.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="dashboard-embedded-section min-w-0 rounded-[22px] p-4 sm:p-5">
                <StockSectionHeader eyebrow="02 · Traçabilité" title="Les détails à conserver" description="Complétez le lot, la date d’expiration et les informations utiles à l’utilisation. Ces champs sont optionnels." icon={<ScanLine size={18} />} />
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label htmlFor={formId + "-pigment"} className={labelClass}>Pigment</label>
                      <input id={formId + "-pigment"} aria-invalid={Boolean(form.formState.errors.pigment)} aria-describedby={form.formState.errors.pigment ? formId + "-pigment-error" : undefined}
                        placeholder="Ex : Carbon Black..."
                        {...form.register("pigment")}
                        className={inputClass}
                      />
                      {form.formState.errors.pigment && (
                        <p id={formId + "-pigment-error"} role="alert" className="text-red-300 text-xs mt-1">{form.formState.errors.pigment.message}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label htmlFor={formId + "-lotNumber"} className={labelClass}>N° de lot</label>
                      <input id={formId + "-lotNumber"} aria-invalid={Boolean(form.formState.errors.lotNumber)} aria-describedby={form.formState.errors.lotNumber ? formId + "-lotNumber-error" : undefined}
                        placeholder="Ex : LOT-2026-0042..."
                        {...form.register("lotNumber")}
                        className={inputClass}
                      />
                      {form.formState.errors.lotNumber && (
                        <p id={formId + "-lotNumber-error"} role="alert" className="text-red-300 text-xs mt-1">{form.formState.errors.lotNumber.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label htmlFor={formId + "-expirationDate"} className={labelClass}>Date d'expiration</label>
                      <input id={formId + "-expirationDate"} aria-invalid={Boolean(form.formState.errors.expirationDate)} aria-describedby={form.formState.errors.expirationDate ? formId + "-expirationDate-error" : undefined}
                        type="date"
                        {...form.register("expirationDate")}
                        className={inputClass + " [color-scheme:dark]"}
                      />
                      {form.formState.errors.expirationDate && (
                        <p id={formId + "-expirationDate-error"} role="alert" className="text-red-300 text-xs mt-1">{form.formState.errors.expirationDate.message}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label htmlFor={formId + "-notes"} className={labelClass}>Notes</label>
                      <textarea id={formId + "-notes"} aria-invalid={Boolean(form.formState.errors.notes)} aria-describedby={form.formState.errors.notes ? formId + "-notes-error" : undefined}
                        rows={3}
                        placeholder="Remarques, usage, etc."
                        {...form.register("notes")}
                        className={inputClass + " resize-y"}
                      />
                      {form.formState.errors.notes && (
                        <p id={formId + "-notes-error"} role="alert" className="text-red-300 text-xs mt-1">{form.formState.errors.notes.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="dashboard-embedded-section min-w-0 rounded-[22px] p-4 sm:p-5">
                <StockSectionHeader eyebrow="03 · Quantités et budget" title="Préparez le suivi de votre stock" description="Indiquez la quantité disponible, son unité et le seuil d’alerte." icon={<Boxes size={18} />} />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1 lg:space-y-1">
                    <label htmlFor={formId + "-quantity"} className={labelClass}>
                      Quantité actuelle *
                    </label>
                    <input id={formId + "-quantity"} aria-invalid={Boolean(form.formState.errors.quantity)} aria-describedby={form.formState.errors.quantity ? formId + "-quantity-error" : undefined}
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
                      <p id={formId + "-quantity-error"} role="alert" className="text-red-300 text-xs lg:text-xs mt-1">
                        {form.formState.errors.quantity.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 lg:space-y-1">
                    <label htmlFor={formId + "-unit"} className={labelClass}>
                      Unité (optionnelle)
                    </label>
                    <input id={formId + "-unit"} aria-invalid={Boolean(form.formState.errors.unit)} aria-describedby={form.formState.errors.unit ? formId + "-unit-error" : undefined}
                      placeholder="pièces, litres, boîtes..."
                      {...form.register("unit")}
                      className={inputClass}
                    />
                    {form.formState.errors.unit && (
                      <p id={formId + "-unit-error"} role="alert" className="text-red-300 text-xs lg:text-xs mt-1">
                        {form.formState.errors.unit.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 lg:space-y-1">
                    <label htmlFor={formId + "-pricePerUnit"} className={labelClass}>
                      Prix unitaire € (optionnel)
                    </label>
                    <input id={formId + "-pricePerUnit"} aria-invalid={Boolean(form.formState.errors.pricePerUnit)} aria-describedby={form.formState.errors.pricePerUnit ? formId + "-pricePerUnit-error" : undefined}
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
                      <p id={formId + "-pricePerUnit-error"} role="alert" className="text-red-300 text-xs lg:text-xs mt-1">
                        {form.formState.errors.pricePerUnit.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 lg:space-y-1">
                    <label htmlFor={formId + "-minQuantity"} className={labelClass}>
                      Quantité minimale d'alerte (optionnelle)
                    </label>
                    <input id={formId + "-minQuantity"} aria-invalid={Boolean(form.formState.errors.minQuantity)} aria-describedby={form.formState.errors.minQuantity ? formId + "-minQuantity-error" : undefined}
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
                      <p id={formId + "-minQuantity-error"} role="alert" className="text-red-300 text-xs lg:text-xs mt-1">
                        {form.formState.errors.minQuantity.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div role="alert" className="rounded-xl border border-red-500/40 bg-red-500/15 p-3">
                  <p className="text-red-300 text-xs lg:text-xs">{error}</p>
                </div>
              )}

              {success && (
                <div role="status" className="rounded-xl border border-green-500/40 bg-green-500/15 p-3">
                  <p className="text-green-300 text-xs lg:text-xs">{success}</p>
                </div>
              )}
            </form>
          </div>

          <div className="shrink-0 border-t border-white/10 bg-noir-700 p-4 sm:px-6 flex flex-col-reverse sm:flex-row justify-end gap-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <DashboardButton
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Annuler
            </DashboardButton>
            <DashboardButton
              type="submit"
              disabled={loading}
              form={formId}
            >
              {loading ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : <Save size={15} aria-hidden="true" />}
              {loading
                ? "Enregistrement..."
                : existingProduct
                ? "Modifier l'article"
                : "Ajouter l'article"}
            </DashboardButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function StockSectionHeader({ eyebrow, title, description, icon }: { eyebrow: string; title: string; description: string; icon: ReactNode }) {
  return <div className="mb-5 flex items-start gap-3">
    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-tertiary-400/25 bg-tertiary-500/10 text-tertiary-400" aria-hidden="true">{icon}</span>
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-tertiary-400/80 font-one">{eyebrow}</p>
      <h3 className="mt-1 text-base font-semibold text-white font-one">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-white/50 font-two">{description}</p>
    </div>
  </div>;
}
