"use client";
import { Package, Plus } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { AppointmentConsumable } from "@/lib/type";
import {
  getAppointmentConsumablesAction,
  addAppointmentConsumableAction,
  updateAppointmentConsumableAction,
  deleteAppointmentConsumableAction,
} from "@/lib/queries/consumables";
import ConsumableRow from "./ConsumableRow";
import RdvActionButton from "../RdvActionButton";
import ConsumableForm from "./ConsumableForm";
import { z } from "zod";
import { consumableSchema } from "@/lib/zod/validator.schema";

type FormValues = z.infer<typeof consumableSchema>;

interface ConsumablesListProps {
  appointmentId: string;
}

type UIState = "idle" | "adding" | "editing";

export default function ConsumablesList({ appointmentId }: ConsumablesListProps) {
  const [consumables, setConsumables] = useState<AppointmentConsumable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uiState, setUiState] = useState<UIState>("idle");
  const [editingItem, setEditingItem] = useState<AppointmentConsumable | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadConsumables = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await getAppointmentConsumablesAction(appointmentId);
    if (res.ok) {
      setConsumables(res.data ?? []);
    } else {
      setError(res.message ?? "Erreur de chargement.");
    }
    setLoading(false);
  }, [appointmentId]);

  useEffect(() => {
    loadConsumables();
  }, [loadConsumables]);

  const handleAdd = async (values: FormValues) => {
    setError(null);
    setSubmitting(true);
    const res = await addAppointmentConsumableAction(appointmentId, values);
    if (res.ok && res.data) {
      setConsumables((prev) => [...prev, res.data!]);
      setUiState("idle");
    } else {
      setError(res.message ?? "Erreur lors de l'ajout.");
    }
    setSubmitting(false);
  };

  const handleUpdate = async (values: FormValues) => {
    if (!editingItem) return;
    setSubmitting(true);
    const res = await updateAppointmentConsumableAction(appointmentId, editingItem.id, values);
    if (res.ok && res.data) {
      setConsumables((prev) =>
        prev.map((c) => (c.id === editingItem.id ? { ...c, ...res.data! } : c)),
      );
      setUiState("idle");
      setEditingItem(null);
    } else {
      setError(res.message ?? "Erreur lors de la mise à jour.");
    }
    setSubmitting(false);
  };

  const handleDelete = async (consumableId: string) => {
    setError(null);
    setDeletingId(consumableId);
    const res = await deleteAppointmentConsumableAction(appointmentId, consumableId);
    if (res.ok) {
      setConsumables((prev) => prev.filter((c) => c.id !== consumableId));
    } else {
      setError(res.message ?? "Erreur lors de la suppression.");
    }
    setDeletingId(null);
  };

  const handleEdit = (item: AppointmentConsumable) => {
    setEditingItem(item);
    setUiState("editing");
  };

  const handleCancel = () => {
    setUiState("idle");
    setEditingItem(null);
  };

  return (
    <div className="space-y-3 font-one">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-tertiary-400/10 text-tertiary-400"><Package size={14} /></span><h3 className="text-[13px] font-medium text-white/90">Consommables utilisés</h3><span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] tabular-nums text-white/45">{consumables.length}</span></div>
        {uiState === "idle" && (
          <RdvActionButton tone="neutral" icon={Plus} size="sm" iconOnly onClick={() => setUiState("adding")}>Ajouter un consommable</RdvActionButton>
        )}
      </div>

      {error && (
        <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-[11px] text-red-300 font-one">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-[11px] text-white/35 font-one italic">Chargement...</p>
      ) : (
        <>
          {consumables.length === 0 && uiState === "idle" && (
            <p className="rounded-xl bg-white/[0.03] px-4 py-5 text-center text-[11px] leading-5 text-white/40">
              Aucun consommable enregistré pour ce rendez-vous.
            </p>
          )}

          <div className="space-y-2">
            {consumables.map((c) =>
              uiState === "editing" && editingItem?.id === c.id ? (
                <ConsumableForm
                  key={c.id}
                  initialValues={editingItem}
                  onSubmit={handleUpdate}
                  onCancel={handleCancel}
                  isSubmitting={submitting}
                />
              ) : (
                <ConsumableRow
                  key={c.id}
                  consumable={c}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isDeleting={deletingId === c.id}
                  disabled={submitting || !!deletingId}
                />
              ),
            )}
          </div>

          {uiState === "adding" && (
            <ConsumableForm
              onSubmit={handleAdd}
              onCancel={handleCancel}
              isSubmitting={submitting}
            />
          )}
        </>
      )}
    </div>
  );
}
