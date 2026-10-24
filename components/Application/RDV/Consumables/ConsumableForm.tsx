"use client";

import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, LoaderCircle, Package, Search, X } from "lucide-react";
import { consumableSchema } from "@/lib/zod/validator.schema";
import { AppointmentConsumable, ConsumableCategory, CONSUMABLE_CATEGORY_LABELS, StockItemProps } from "@/lib/type";
import { getSalonStockAction } from "@/lib/queries/stocks";

type FormValues = z.infer<typeof consumableSchema>;
interface ConsumableFormProps {
  initialValues?: AppointmentConsumable;
  onSubmit: (values: FormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}
const inputClass = "min-h-10 w-full rounded-xl border border-white/10 bg-noir-700 px-3 py-2 text-xs text-white placeholder:text-white/30 transition focus:border-tertiary-400/50 focus:outline-none focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50";
const labelClass = "mb-1.5 block text-[11px] font-medium text-white/60";
const buttonClass = "inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs transition hover:bg-tertiary-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400 disabled:cursor-not-allowed disabled:opacity-50";
const categories = Object.entries(CONSUMABLE_CATEGORY_LABELS) as [ConsumableCategory, string][];

export default function ConsumableForm({ initialValues, onSubmit, onCancel, isSubmitting }: ConsumableFormProps) {
  const id = useId();
  const [linkStock, setLinkStock] = useState(initialValues ? !!initialValues.stockItemId : true);
  const [stockItems, setStockItems] = useState<StockItemProps[]>([]);
  const [stockSearch, setStockSearch] = useState("");
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);
  const [selectedStockId, setSelectedStockId] = useState(initialValues?.stockItemId ?? null);
  const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(consumableSchema),
    defaultValues: {
      stockItemId: initialValues?.stockItemId ?? null,
      category: (initialValues?.category as ConsumableCategory) ?? null,
      productName: initialValues?.productName ?? null, brand: initialValues?.brand ?? null,
      reference: initialValues?.reference ?? null, pigment: initialValues?.pigment ?? null,
      lotNumber: initialValues?.lotNumber ?? null,
      expirationDate: initialValues?.expirationDate?.split("T")[0] ?? null,
      quantity: initialValues?.quantity ?? null, unit: initialValues?.unit ?? null, notes: initialValues?.notes ?? null,
    },
  });
  useEffect(() => {
    if (!linkStock || selectedStockId) return;
    let active = true;
    setStockLoading(true);
    setStockError(null);
    const timeout = setTimeout(async () => {
      try {
        const response = await getSalonStockAction(1, stockSearch);
        if (!active) return;
        if (response.error) { setStockError("Impossible de charger le stock."); setStockItems([]); }
        else setStockItems(response.stockItems ?? []);
      } catch { if (active) setStockError("Impossible de charger le stock."); }
      finally { if (active) setStockLoading(false); }
    }, 200);
    return () => { active = false; clearTimeout(timeout); };
  }, [linkStock, stockSearch, selectedStockId]);

  const selectStock = (item: StockItemProps) => {
    setValue("stockItemId", item.id);
    setValue("productName", item.name);
    for (const key of ["unit", "brand", "reference", "pigment", "lotNumber", "notes"] as const) setValue(key, item[key] ?? null);
    setValue("expirationDate", item.expirationDate?.split("T")[0] ?? null);
    setSelectedStockId(item.id);
  };
  const setMode = (stock: boolean) => {
    setLinkStock(stock);
    if (!stock) { setValue("stockItemId", null); setSelectedStockId(null); }
  };
  const field = (name: "productName" | "brand" | "reference" | "pigment" | "lotNumber" | "expirationDate" | "unit", label: string, placeholder?: string, type = "text") => <div className="min-w-0"><label htmlFor={id + name} className={labelClass}>{label}</label><input id={id + name} type={type} {...register(name)} placeholder={placeholder} className={inputClass + (type === "date" ? " [color-scheme:dark]" : "")} />{errors[name] && <p role="alert" className="mt-1 text-[10px] text-red-300">{errors[name]?.message}</p>}</div>;
  return <form onSubmit={handleSubmit(onSubmit)} className="@container rounded-2xl border border-white/15 bg-white/[0.025] p-3 font-one sm:p-4">
    <div className="mb-4 flex items-start gap-3"><div className="grid size-8 shrink-0 place-items-center rounded-lg border border-tertiary-400/20 bg-tertiary-400/10 text-tertiary-400"><Package size={15} /></div><div className="min-w-0 flex-1"><h4 className="text-xs font-semibold text-white">{initialValues ? "Modifier le consommable" : "Ajouter un consommable"}</h4><p className="mt-1 text-[11px] leading-5 text-white/45">Renseignez le produit utilisé et sa traçabilité.</p></div></div>
    <fieldset disabled={isSubmitting} className="min-w-0 space-y-4 disabled:opacity-60">
      <div role="group" aria-label="Origine du consommable" className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-noir-700 p-1">{[{ stock: true, label: "Depuis le stock" }, { stock: false, label: "Saisie manuelle" }].map(mode => <button key={mode.label} type="button" aria-pressed={linkStock === mode.stock} onClick={() => setMode(mode.stock)} className={"min-h-9 cursor-pointer rounded-lg px-2 py-2 text-[11px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400 " + (linkStock === mode.stock ? "bg-white/10 text-white" : "text-white/45 hover:text-white/80")}>{mode.label}</button>)}</div>
      {linkStock && <div>{selectedStockId ? <div className="flex items-center gap-3 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.025] p-3"><Check size={16} className="shrink-0 text-emerald-300" /><div className="min-w-0 flex-1"><p className="text-[10px] text-emerald-300/70">Article lié au stock</p><p className="mt-1 break-words text-xs font-medium text-white/85">{getValues("productName") || "Article sélectionné"}</p><p className="mt-1.5 break-words text-[10px] leading-5 text-white/45">{[getValues("brand"), getValues("reference"), getValues("lotNumber") && "Lot : " + getValues("lotNumber"), getValues("pigment"), getValues("expirationDate") && "Expiration : " + new Date(getValues("expirationDate")!).toLocaleDateString("fr-FR")].filter(Boolean).join(" · ")}</p></div><button type="button" onClick={() => { setValue("stockItemId", null); setSelectedStockId(null); }} className={buttonClass + " text-white/60"} aria-label="Changer l’article du stock" title="Changer l’article"><X size={14} /></button></div> : <><label htmlFor={id + "stock"} className={labelClass}>Rechercher un article</label><div className="relative"><Search size={14} className="pointer-events-none absolute left-3 top-3 text-white/35" /><input id={id + "stock"} value={stockSearch} onChange={event => setStockSearch(event.target.value)} placeholder="Nom du produit…" className={inputClass + " pl-9"} /></div><div aria-live="polite" className="mt-2 max-h-44 overflow-y-auto rounded-xl border border-white/10 bg-noir-700">{stockLoading ? <p className="flex items-center gap-2 p-3 text-[11px] text-white/45"><LoaderCircle size={13} className="animate-spin" />Recherche en cours…</p> : stockError ? <p className="p-3 text-[11px] text-red-300">{stockError}</p> : stockItems.length ? stockItems.map(item => <button type="button" key={item.id} onClick={() => selectStock(item)} className="flex min-h-12 w-full cursor-pointer items-center gap-2 border-b border-white/5 px-3 py-2.5 text-left transition last:border-0 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-tertiary-400"><Package size={14} className="shrink-0 text-white/30" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-white/80">{item.name}</p><p className="mt-1 truncate text-[10px] text-white/40">{[item.brand, item.reference, item.lotNumber && "Lot : " + item.lotNumber].filter(Boolean).join(" · ")}</p></div>{item.unit && <span className="text-[10px] text-white/40">{item.unit}</span>}</button>) : <p className="p-3 text-[11px] text-white/45">Aucun article trouvé.</p>}</div></>}</div>}
      {!linkStock && <div className="space-y-3"><p className="border-b border-white/10 pb-2 text-[10px] font-medium uppercase tracking-wider text-white/45">Le produit</p><div className="grid grid-cols-1 gap-3 @xs:grid-cols-2">{field("productName", "Nom du produit", "Ex. Dynamic Black")}<div><label htmlFor={id + "category"} className={labelClass}>Catégorie</label><select id={id + "category"} {...register("category", { setValueAs: value => value || null })} className={inputClass + " cursor-pointer"}><option value="">Non précisée</option>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>{field("brand", "Marque", "Ex. Kwadron")}{field("reference", "Référence", "Ex. KW-RL7")}</div><p className="border-b border-white/10 pb-2 pt-1 text-[10px] font-medium uppercase tracking-wider text-white/45">Traçabilité</p><div className="grid grid-cols-1 gap-3 @xs:grid-cols-2">{field("lotNumber", "Numéro de lot", "Ex. LOT-2026-042")}{field("expirationDate", "Date d’expiration", undefined, "date")}</div>{field("pigment", "Pigment / colorant", "Ex. Carbon Black")}</div>}
      <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-3"><div><label htmlFor={id + "quantity"} className={labelClass}>Quantité utilisée</label><input id={id + "quantity"} type="number" step="any" min="0" {...register("quantity", { setValueAs: value => value === "" ? null : Number(value) })} placeholder="Ex. 3" className={inputClass} />{errors.quantity && <p role="alert" className="mt-1 text-[10px] text-red-300">{errors.quantity.message}</p>}</div>{field("unit", "Unité", "ml, pièce…")}</div>
      <div><label htmlFor={id + "notes"} className={labelClass}>Notes <span className="font-normal text-white/30">(facultatif)</span></label><textarea id={id + "notes"} {...register("notes")} maxLength={500} rows={2} placeholder="Précisions sur l’utilisation…" className={inputClass + " resize-y"} />{errors.notes && <p role="alert" className="mt-1 text-[10px] text-red-300">{errors.notes.message}</p>}</div>
    </fieldset>
    <div className="mt-4 flex items-center justify-end gap-2 border-t border-white/10 pt-3"><button type="button" onClick={onCancel} disabled={isSubmitting} className={buttonClass + " text-white/60"}>Annuler</button><button type="submit" disabled={isSubmitting || (linkStock && !selectedStockId)} className={buttonClass + " bg-white/90 font-medium text-noir-700 hover:bg-white"}>{isSubmitting && <LoaderCircle size={13} className="animate-spin" />}{isSubmitting ? "Enregistrement…" : initialValues ? "Enregistrer" : "Ajouter"}</button></div>
  </form>;
}
