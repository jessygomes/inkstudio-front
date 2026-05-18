"use client";
import React, { useCallback, useEffect, useState } from "react";
import { AppointmentConsumable } from "@/lib/type";
import {
  getAppointmentConsumablesAction,
  addAppointmentConsumableAction,
  updateAppointmentConsumableAction,
  deleteAppointmentConsumableAction,
} from "@/lib/queries/consumables";
import ConsumableRow from "./ConsumableRow";
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-white/35 font-one">
          Consommables utilisés
        </p>
        {uiState === "idle" && (
          <button
            type="button"
            onClick={() => setUiState("adding")}
            className="cursor-pointer inline-flex items-center gap-1 rounded-2xl border border-indigo-400/25 bg-indigo-500/12 px-2.5 py-1 text-[10px] font-medium font-one text-indigo-300 transition-colors hover:bg-indigo-500/20"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter
          </button>
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
            <p className="text-[11px] text-white/30 font-one italic">
              Aucun consommable enregistré pour ce rendez-vous.
            </p>
          )}

          <div className="space-y-1.5">
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
