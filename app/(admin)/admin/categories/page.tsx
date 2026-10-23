"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { FiChevronLeft, FiEdit2, FiPlus, FiTag, FiTrash2 } from "react-icons/fi";
import { toast } from "sonner";
import PageHeader from "@/components/Shared/PageHeader";
import {
  AdminTattooCategory,
  createAdminTattooCategoryAction,
  deleteAdminTattooCategoryAction,
  getAdminTattooCategoriesAction,
  updateAdminTattooCategoryAction,
} from "@/lib/queries/tattooCategories.action";

interface FormState {
  name: string;
  slug: string;
  sortOrder: string;
  isActive: boolean;
}

const emptyForm: FormState = { name: "", slug: "", sortOrder: "0", isActive: true };

const inputClass =
  "w-full rounded-2xl border border-white/15 bg-noir-500/60 px-3 py-2 text-xs text-white outline-none focus:border-tertiary-400";

const photosCount = (c: AdminTattooCategory) =>
  c.photosCount ?? c._count?.portfolios ?? c._count?.photos ?? 0;

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminTattooCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getAdminTattooCategoriesAction();
    if (!result.ok || !result.data) {
      setError(result.message);
      setCategories([]);
    } else {
      setCategories(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startCreate = () => {
    setForm({
      ...emptyForm,
      sortOrder: String(
        categories.reduce((max, c) => Math.max(max, c.sortOrder), 0) + 1
      ),
    });
    setEditingId("new");
  };

  const startEdit = (category: AdminTattooCategory) => {
    setForm({
      name: category.name,
      slug: category.slug,
      sortOrder: String(category.sortOrder),
      isActive: category.isActive,
    });
    setEditingId(category.id);
  };

  const cancel = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const save = async () => {
    const name = form.name.trim();
    if (!name) {
      toast.error("Le nom est requis.");
      return;
    }

    const sortOrder = Number.parseInt(form.sortOrder, 10);
    const payload = {
      name,
      slug: form.slug.trim() || undefined,
      sortOrder: Number.isNaN(sortOrder) ? 0 : sortOrder,
      isActive: form.isActive,
    };

    setSaving(true);
    const result =
      editingId === "new"
        ? await createAdminTattooCategoryAction(payload)
        : await updateAdminTattooCategoryAction(editingId!, payload);
    setSaving(false);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(editingId === "new" ? "Catégorie créée" : "Catégorie mise à jour");
    cancel();
    load();
  };

  const remove = async (category: AdminTattooCategory) => {
    const count = photosCount(category);
    const confirmed = window.confirm(
      count > 0
        ? `Supprimer « ${category.name} » ? Elle sera retirée de ${count} photo(s).`
        : `Supprimer « ${category.name} » ?`
    );
    if (!confirmed) return;

    setDeletingId(category.id);
    const result = await deleteAdminTattooCategoryAction(category.id);
    setDeletingId(null);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    setCategories((prev) => prev.filter((c) => c.id !== category.id));
    toast.success("Catégorie supprimée");
  };

  const renderForm = () => (
    <div className="space-y-3 rounded-2xl border border-tertiary-400/30 bg-white/5 p-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <label htmlFor="cat-name" className="text-[11px] text-white/60 font-one">Nom</label>
          <input
            id="cat-name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className={inputClass}
            placeholder="Ex: Walk-ins"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="cat-slug" className="text-[11px] text-white/60 font-one">Slug (auto si vide)</label>
          <input
            id="cat-slug"
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            className={inputClass}
            placeholder="walk-ins"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="cat-order" className="text-[11px] text-white/60 font-one">Ordre</label>
          <input
            id="cat-order"
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
            className={inputClass}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-xs text-white/80 font-one">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
        />
        Active (visible pour les tatoueurs et dans les filtres)
      </label>
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="cursor-pointer rounded-2xl bg-gradient-to-r from-tertiary-400 to-tertiary-500 px-3 py-1.5 text-xs text-white font-one disabled:opacity-60"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button
          onClick={cancel}
          disabled={saving}
          className="cursor-pointer rounded-2xl border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white font-one hover:bg-white/20"
        >
          Annuler
        </button>
      </div>
    </div>
  );

  return (
    <div className="wrapper-global">
      <section className="w-full space-y-3 pt-4">
        <PageHeader icon={<FiTag size={18} />} title="Catégories de tatouages">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/10 font-one text-xs transition-colors"
          >
            <FiChevronLeft size={14} /> Retour
          </Link>
          <button
            onClick={startCreate}
            disabled={editingId !== null}
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white rounded-2xl font-one text-xs disabled:opacity-60"
          >
            <FiPlus size={14} /> Nouvelle catégorie
          </button>
        </PageHeader>

        {loading && (
          <p className="text-sm text-white/60 font-one">Chargement des catégories...</p>
        )}

        {!loading && error && (
          <div className="space-y-2">
            <p className="text-sm text-red-300 font-one">{error}</p>
            <button
              onClick={load}
              className="cursor-pointer rounded-2xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-one text-white hover:bg-white/20"
            >
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-3">
            {editingId === "new" && renderForm()}

            {categories.length === 0 && editingId !== "new" && (
              <p className="text-sm text-white/60 font-one">Aucune catégorie pour le moment.</p>
            )}

            {categories.map((category) =>
              editingId === category.id ? (
                <div key={category.id}>{renderForm()}</div>
              ) : (
                <div
                  key={category.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white font-one">
                      {category.name}
                      {!category.isActive && (
                        <span className="ml-2 rounded-full border border-white/20 px-2 py-0.5 text-[10px] text-white/60">
                          Inactive
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-white/55 font-one">
                      {category.slug} · ordre {category.sortOrder} · {photosCount(category)} photo(s)
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => startEdit(category)}
                      disabled={editingId !== null}
                      aria-label={`Modifier ${category.name}`}
                      className="cursor-pointer rounded-xl border border-white/15 bg-white/10 p-2 text-white hover:bg-white/20 disabled:opacity-50"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={() => remove(category)}
                      disabled={deletingId === category.id}
                      aria-label={`Supprimer ${category.name}`}
                      className="cursor-pointer rounded-xl border border-red-400/30 bg-red-500/10 p-2 text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}
