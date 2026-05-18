"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { consumableSchema } from "@/lib/zod/validator.schema";
import {
  AppointmentConsumable,
  ConsumableCategory,
  CONSUMABLE_CATEGORY_LABELS,
} from "@/lib/type";
import { getSalonStockAction } from "@/lib/queries/stocks";
import { StockItemProps } from "@/lib/type";

type FormValues = z.infer<typeof consumableSchema>;

interface ConsumableFormProps {
  initialValues?: AppointmentConsumable;
  onSubmit: (values: FormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const CATEGORIES = Object.entries(CONSUMABLE_CATEGORY_LABELS) as [
  ConsumableCategory,
  string,
][];

const inputClass =
  "w-full rounded-2xl border border-white/12 bg-white/6 px-2.5 py-2 text-xs text-white placeholder:text-white/35 focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/15 transition-colors font-one";
const labelClass = "text-[10px] uppercase tracking-wider text-white/40 font-one";

export default function ConsumableForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: ConsumableFormProps) {
  const [linkStock, setLinkStock] = useState(!!initialValues?.stockItemId);
  const [stockItems, setStockItems] = useState<StockItemProps[]>([]);
  const [stockSearch, setStockSearch] = useState("");
  const [stockLoading, setStockLoading] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState<string | null>(
    initialValues?.stockItemId ?? null,
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(consumableSchema),
    defaultValues: {
      stockItemId: initialValues?.stockItemId ?? null,
      category: (initialValues?.category as ConsumableCategory) ?? null,
      productName: initialValues?.productName ?? null,
      brand: initialValues?.brand ?? null,
      reference: initialValues?.reference ?? null,
      pigment: initialValues?.pigment ?? null,
      lotNumber: initialValues?.lotNumber ?? null,
      expirationDate: initialValues?.expirationDate
        ? initialValues.expirationDate.split("T")[0]
        : null,
      quantity: initialValues?.quantity ?? null,
      unit: initialValues?.unit ?? null,
      notes: initialValues?.notes ?? null,
    },
  });

  const { register, handleSubmit, setValue, formState: { errors } } = form;

  // Charger les items du stock quand le toggle est activé
  useEffect(() => {
    if (!linkStock) return;
    setStockLoading(true);
    getSalonStockAction(1, stockSearch)
      .then((res) => {
        if (!res.error && res.stockItems) setStockItems(res.stockItems);
      })
      .finally(() => setStockLoading(false));
  }, [linkStock, stockSearch]);

  const handleStockSelect = (item: StockItemProps) => {
    setValue("stockItemId", item.id);
    setValue("productName", item.name);
    setValue("unit", item.unit ?? null);
    setValue("brand", item.brand ?? null);
    setValue("reference", item.reference ?? null);
    setValue("pigment", item.pigment ?? null);
    setValue("lotNumber", item.lotNumber ?? null);
    setValue(
      "expirationDate",
      item.expirationDate ? item.expirationDate.split("T")[0] : null,
    );
    setValue("notes", item.notes ?? null);
    setSelectedStockId(item.id);
  };

  const handleToggleStock = (checked: boolean) => {
    setLinkStock(checked);
    if (!checked) {
      setValue("stockItemId", null);
      setSelectedStockId(null);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-3 rounded-2xl border border-indigo-400/20 bg-indigo-500/6 p-3"
    >
      {/* Toggle lier au stock */}
      <label className="flex cursor-pointer items-center justify-between">
        <span className="text-xs font-medium font-one text-white/70">
          Lier à un article du stock
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={linkStock}
          onClick={() => handleToggleStock(!linkStock)}
          className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border transition-colors duration-200 ${
            linkStock
              ? "border-indigo-400/40 bg-indigo-500/40"
              : "border-white/15 bg-white/8"
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
              linkStock ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </label>

      {/* Sélecteur stock */}

      {linkStock && (
        <div className="space-y-1.5">
          <p className={labelClass}>Rechercher dans le stock</p>
          <input
            type="text"
            value={stockSearch}
            onChange={(e) => setStockSearch(e.target.value)}
            placeholder="Nom du produit..."
            className={inputClass}
            disabled={!!selectedStockId}
          />
          {stockLoading && (
            <p className="text-[10px] text-white/40 font-one">Chargement...</p>
          )}
          {!stockLoading && stockItems.length > 0 && !selectedStockId && (
            <div className="max-h-32 overflow-y-auto rounded-xl border border-white/10 bg-noir-700">
              {stockItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleStockSelect(item)}
                  className={`w-full px-3 py-2 text-left text-xs font-one transition-colors hover:bg-white/8 ${
                    selectedStockId === item.id
                      ? "bg-indigo-500/15 text-indigo-200"
                      : "text-white/75"
                  }`}
                >
                  <div className="font-semibold truncate">
                    {item.name}
                    {item.unit && (
                      <span className="ml-1.5 text-white/40">({item.unit})</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5 text-[10px] text-white/50">
                    {item.type && <span>Type: {item.type}</span>}
                    {item.brand && <span>Marque: {item.brand}</span>}
                    {item.reference && <span>Réf: {item.reference}</span>}
                    {item.pigment && <span>Pigment: {item.pigment}</span>}
                    {item.lotNumber && <span>Lot: {item.lotNumber}</span>}
                    {item.expirationDate && (
                      <span>Exp: {new Date(item.expirationDate).toLocaleDateString("fr-FR")}</span>
                    )}
                    {item.notes && <span>Notes: {item.notes.slice(0, 30)}{item.notes.length > 30 ? "…" : ""}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
          {selectedStockId && (
            <div className="rounded-xl border border-indigo-400/15 bg-indigo-500/10 p-3 mt-2">
              {/* <p className="text-[10px] text-indigo-300 font-one mb-1">
                ✓ Article lié (id: {selectedStockId.slice(0, 8)}…)
              </p> */}
              {(() => {
                const item = stockItems.find((i) => i.id === selectedStockId);
                if (!item) return null;
                return (
                  <div className="space-y-1 text-xs text-white/80 font-one">
                    <div><span className="font-semibold">{item.name}</span> {item.unit && <span className="text-white/40">({item.unit})</span>}</div>
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-white/50">
                      {item.type && <span>Type: {item.type}</span>}
                      {item.brand && <span>Marque: {item.brand}</span>}
                      {item.reference && <span>Réf: {item.reference}</span>}
                      {item.pigment && <span>Pigment: {item.pigment}</span>}
                      {item.lotNumber && <span>Lot: {item.lotNumber}</span>}
                      {item.expirationDate && (
                        <span>Exp: {new Date(item.expirationDate).toLocaleDateString("fr-FR")}</span>
                      )}
                      {item.notes && <span>Notes: {item.notes.slice(0, 30)}{item.notes.length > 30 ? "…" : ""}</span>}
                    </div>
                  </div>
                );
              })()}
              <button
                type="button"
                onClick={() => {
                  setValue("stockItemId", null);
                  setSelectedStockId(null);
                }}
                className="mt-2 text-xs text-indigo-300 underline hover:text-indigo-200"
              >
                Détacher cet article
              </button>
            </div>
          )}
        </div>
      )}


      {/* Champs du formulaire consommable : affichés seulement si pas en mode stock OU si mode stock mais aucun item sélectionné */}
      {(!linkStock || !selectedStockId) && (
        <>
          {/* Catégorie + Nom */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <p className={labelClass}>Catégorie</p>
              <select
                {...register("category")}
                className={`${inputClass} appearance-none`}
              >
                <option value="">—</option>
                {CATEGORIES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <p className={labelClass}>Nom produit</p>
              <input
                {...register("productName")}
                placeholder="Ex : Dynamic Black"
                className={inputClass}
              />
              {errors.productName && (
                <p className="text-[10px] text-red-400 font-one">{errors.productName.message}</p>
              )}
            </div>
          </div>

          {/* Marque + Référence */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <p className={labelClass}>Marque</p>
              <input
                {...register("brand")}
                placeholder="Ex : Kwadron"
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <p className={labelClass}>Référence</p>
              <input
                {...register("reference")}
                placeholder="Ex : KW-RL7"
                className={inputClass}
              />
            </div>
          </div>

          {/* Quantité + Unité */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <p className={labelClass}>Quantité</p>
              <input
                type="number"
                step="any"
                min="0"
                {...register("quantity", { valueAsNumber: true })}
                placeholder="Ex : 3"
                className={inputClass}
              />
              {errors.quantity && (
                <p className="text-[10px] text-red-400 font-one">{errors.quantity.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <p className={labelClass}>Unité</p>
              <input
                {...register("unit")}
                placeholder="ml, pièce..."
                className={inputClass}
              />
            </div>
          </div>

          {/* N° lot + Expiration */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <p className={labelClass}>N° de lot</p>
              <input
                {...register("lotNumber")}
                placeholder="Ex : LOT-2026-042"
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <p className={labelClass}>Date d&apos;expiration</p>
              <input
                type="date"
                {...register("expirationDate")}
                className={`${inputClass} [color-scheme:dark]`}
              />
            </div>
          </div>

          {/* Pigment (INK seulement, mais on l'affiche toujours pour flexibilité) */}
          <div className="space-y-1">
            <p className={labelClass}>Pigment / Colorant</p>
            <input
              {...register("pigment")}
              placeholder="Ex : Carbon Black"
              className={inputClass}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <p className={labelClass}>Notes</p>
            <textarea
              {...register("notes")}
              placeholder="Remarques, usage spécifique..."
              rows={2}
              className={`${inputClass} resize-none`}
            />
            {errors.notes && (
              <p className="text-[10px] text-red-400 font-one">{errors.notes.message}</p>
            )}
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer flex-1 rounded-xl border border-white/10 bg-white/5 py-1.5 text-xs font-medium font-one text-white/60 transition-colors hover:bg-white/10"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer flex-1 rounded-xl border border-indigo-400/30 bg-indigo-500/20 py-1.5 text-xs font-medium font-one text-indigo-200 transition-colors hover:bg-indigo-500/30 disabled:opacity-50"
        >
          {isSubmitting ? "Enregistrement..." : initialValues ? "Mettre à jour" : "Ajouter"}
        </button>
      </div>
    </form>
  );
}
