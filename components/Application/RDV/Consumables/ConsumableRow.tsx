import { LoaderCircle, Package, Pencil, Trash2 } from "lucide-react";
import { AppointmentConsumable, CONSUMABLE_CATEGORY_LABELS } from "@/lib/type";

interface ConsumableRowProps {
  consumable: AppointmentConsumable;
  onEdit: (consumable: AppointmentConsumable) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  disabled?: boolean;
}
const actionClass = "grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg border border-transparent text-white/40 transition hover:border-white/10 hover:bg-tertiary-400/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400 disabled:cursor-not-allowed disabled:opacity-40";
export default function ConsumableRow({ consumable, onEdit, onDelete, isDeleting, disabled }: ConsumableRowProps) {
  const category = consumable.category ? CONSUMABLE_CATEGORY_LABELS[consumable.category] : null;
  const expiration = consumable.expirationDate ? new Date(consumable.expirationDate) : null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const expired = expiration && expiration < today;
  const facts = [
    { label: "Réf.", value: consumable.reference },
    { label: "Lot", value: consumable.lotNumber },
    { label: "Pigment", value: consumable.pigment },
  ].filter(item => item.value);
  return <article aria-busy={isDeleting} className="rounded-xl bg-white/[0.04] p-3 font-one transition hover:bg-white/[0.065]">
    <div className="flex items-start gap-2.5"><div className="grid size-9 shrink-0 place-items-center rounded-xl bg-tertiary-400/10 text-tertiary-400"><Package size={15} /></div><div className="min-w-0 flex-1"><h4 className="break-words text-xs font-medium text-white/85">{consumable.productName || "Consommable sans nom"}</h4><div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-white/45">{category && <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-white/60">{category}</span>}{consumable.brand && <span>{consumable.brand}</span>}{consumable.quantity != null && <span className="rounded-md bg-tertiary-400/10 px-1.5 py-0.5 font-semibold tabular-nums text-tertiary-400">{consumable.quantity}{consumable.unit ? " " + consumable.unit : ""}</span>}</div></div><div className="flex shrink-0 gap-0.5"><button type="button" onClick={() => onEdit(consumable)} disabled={disabled || isDeleting} className={actionClass} aria-label="Modifier le consommable" title="Modifier"><Pencil size={14} /></button><button type="button" onClick={() => onDelete(consumable.id)} disabled={disabled || isDeleting} className={actionClass + " hover:text-red-300"} aria-label="Supprimer le consommable" title="Supprimer">{isDeleting ? <LoaderCircle size={14} className="animate-spin" /> : <Trash2 size={14} />}</button></div></div>
    {(facts.length > 0 || expiration) && <dl className="mt-2.5 flex flex-wrap gap-1.5 text-[10px]">{facts.map(item => <div key={item.label} className="flex min-w-0 gap-1.5 rounded-md bg-white/[0.05] px-2 py-1"><dt className="text-white/35">{item.label}</dt><dd className="break-all text-white/60">{item.value}</dd></div>)}{expiration && <div className={"flex gap-1.5 rounded-md px-2 py-1 " + (expired ? "bg-red-400/10 text-red-300" : "bg-white/[0.05] text-white/60")}><dt className={expired ? "text-red-300/70" : "text-white/35"}>{expired ? "Expiré le" : "Expiration"}</dt><dd>{expiration.toLocaleDateString("fr-FR")}</dd></div>}</dl>}
    {consumable.notes && <p className="mt-2 whitespace-pre-wrap break-words text-[11px] leading-5 text-white/45">{consumable.notes}</p>}
  </article>;
}
