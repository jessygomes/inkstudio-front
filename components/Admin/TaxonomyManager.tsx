"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Edit3,
  ImageIcon,
  Palette,
  Plus,
  Search,
  Shapes,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import AdminPageHeader from "./AdminPageHeader";
import styles from "./AdminShell.module.css";
import {
  createAdminStyle,
  deleteAdminStyle,
  getAdminStyles,
  updateAdminStyle,
  type AdminStyle,
} from "@/lib/queries/admin-styles";
import {
  createAdminTattooCategoryAction,
  deleteAdminTattooCategoryAction,
  getAdminTattooCategoriesAction,
  updateAdminTattooCategoryAction,
  type AdminTattooCategory,
} from "@/lib/queries/tattooCategories.action";

type Item = {
  id: string;
  name: string;
  count: number;
  slug?: string;
  sortOrder?: number;
  isActive?: boolean;
};
const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
const fromStyle = (item: AdminStyle): Item => ({
  ...item,
  count: item.photoCount || 0,
});
const fromCategory = (item: AdminTattooCategory): Item => ({
  ...item,
  count:
    item.photosCount ?? item._count?.portfolios ?? item._count?.photos ?? 0,
});

export default function TaxonomyManager({
  kind,
}: {
  kind: "styles" | "categories";
}) {
  const isStyle = kind === "styles";
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [editor, setEditor] = useState<Item | "new" | null>(null);
  const [deleting, setDeleting] = useState<Item | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    sortOrder: "0",
    isActive: true,
  });
  const editorRef = useRef<HTMLDialogElement>(null);
  const deleteRef = useRef<HTMLDialogElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (isStyle) {
        const result = await getAdminStyles();
        if (!result.ok || !result.data) throw new Error(result.message);
        setItems(result.data.map(fromStyle));
      } else {
        const result = await getAdminTattooCategoriesAction();
        if (!result.ok || !result.data) throw new Error(result.message);
        setItems(result.data.map(fromCategory));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Le chargement a échoué.");
    } finally {
      setLoading(false);
    }
  }, [isStyle]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (editor !== null) editorRef.current?.showModal();
    else editorRef.current?.close();
  }, [editor]);
  useEffect(() => {
    if (deleting) deleteRef.current?.showModal();
    else deleteRef.current?.close();
  }, [deleting]);

  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          `${item.name} ${item.slug || ""}`
            .toLocaleLowerCase("fr")
            .includes(query.toLocaleLowerCase("fr").trim()) &&
          (isStyle ||
            status === "all" ||
            item.isActive === (status === "active")),
      ),
    [items, query, status, isStyle],
  );
  const openEditor = (item: Item | "new") => {
    setForm(
      item === "new"
        ? {
            name: "",
            slug: "",
            sortOrder: String(
              items.reduce(
                (max, row) => Math.max(max, row.sortOrder || 0),
                -1,
              ) + 1,
            ),
            isActive: true,
          }
        : {
            name: item.name,
            slug: item.slug || "",
            sortOrder: String(item.sortOrder || 0),
            isActive: item.isActive ?? true,
          },
    );
    setEditor(item);
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (editor === null || busy) return;
    const name = form.name.trim();
    const order = Number(form.sortOrder);
    if (!name || name.length > (isStyle ? 80 : 120)) {
      toast.error("Vérifiez le nom saisi.");
      return;
    }
    if (
      !isStyle &&
      (!Number.isSafeInteger(order) ||
        order < 0 ||
        order > 2147483647 ||
        !slugify(form.slug || name))
    ) {
      toast.error(
        "Renseignez un identifiant valide et un ordre entier positif ou nul.",
      );
      return;
    }
    setBusy(true);
    try {
      const payload = {
        name,
        slug: slugify(form.slug || name),
        sortOrder: order,
        isActive: form.isActive,
      };
      const result = isStyle
        ? editor === "new"
          ? await createAdminStyle(name)
          : await updateAdminStyle(editor.id, name)
        : editor === "new"
          ? await createAdminTattooCategoryAction(payload)
          : await updateAdminTattooCategoryAction(editor.id, payload);
      if (!result.ok) throw new Error(result.message);
      toast.success(
        `${isStyle ? "Style" : "Catégorie"} ${editor === "new" ? (isStyle ? "créé" : "créée") : isStyle ? "mis à jour" : "mise à jour"}`,
      );
      setEditor(null);
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "L’enregistrement a échoué.",
      );
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!deleting || busy) return;
    setBusy(true);
    try {
      const result = isStyle
        ? await deleteAdminStyle(deleting.id)
        : await deleteAdminTattooCategoryAction(deleting.id);
      if (!result.ok) throw new Error(result.message);
      setItems((previous) =>
        previous.filter((item) => item.id !== deleting.id),
      );
      setDeleting(null);
      toast.success(isStyle ? "Style supprimé" : "Catégorie supprimée");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "La suppression a échoué.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-page">
      <AdminPageHeader
        icon={isStyle ? <Palette size={16} /> : <Shapes size={16} />}
        title={isStyle ? "Styles de tatouage" : "Catégories de tatouage"}
        description={
          isStyle
            ? "Gérez les styles utilisés dans les portfolios. Un renommage est répercuté sur les photos associées."
            : "Organisez les photos et les filtres de recherche : nom, identifiant, ordre et visibilité."
        }
      >
        <button
          type="button"
          className="admin-button admin-button-primary"
          onClick={() => openEditor("new")}
        >
          <Plus size={16} />
          {isStyle ? "Ajouter un style" : "Ajouter une catégorie"}
        </button>
      </AdminPageHeader>
      <div className="admin-grid mb-6">
        <div className="admin-stat">
          <p className="admin-stat-label">
            {isStyle ? "Styles enregistrés" : "Catégories enregistrées"}
            {isStyle ? <Palette size={16} /> : <Shapes size={16} />}
          </p>
          <p className="admin-stat-number">
            {loading || error ? "—" : items.length}
          </p>
          <p className="admin-stat-note">Dans le catalogue Inkera</p>
        </div>
        <div className="admin-stat">
          <p className="admin-stat-label">
            {isStyle ? "Styles utilisés" : "Catégories visibles"}
            <ImageIcon size={16} />
          </p>
          <p className="admin-stat-number">
            {loading || error
              ? "—"
              : items.filter((item) =>
                  isStyle ? item.count > 0 : item.isActive,
                ).length}
          </p>
          <p className="admin-stat-note">
            {isStyle
              ? "Associés à au moins une photo"
              : "Disponibles dans les filtres"}
          </p>
        </div>
      </div>
      <section
        className="admin-panel"
        aria-label={isStyle ? "Liste des styles" : "Liste des catégories"}
      >
        <div className="admin-toolbar">
          <label className="flex min-w-0 flex-1 items-center gap-3">
            <Search size={17} className="shrink-0 text-white/40" />
            <input
              className="admin-field"
              aria-label={
                isStyle ? "Rechercher un style" : "Rechercher une catégorie"
              }
              placeholder={
                isStyle ? "Rechercher un style…" : "Rechercher une catégorie…"
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          {!isStyle && (
            <select
              aria-label="Filtrer par visibilité"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">Toutes les visibilités</option>
              <option value="active">Visibles</option>
              <option value="inactive">Masquées</option>
            </select>
          )}
        </div>
        {loading ? (
          <div className="admin-empty" role="status">
            Chargement du catalogue…
          </div>
        ) : error ? (
          <div className="admin-error" role="alert">
            <p>{error}</p>
            <button className="admin-button mt-3" onClick={() => void load()}>
              Réessayer
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">
            {items.length
              ? "Aucun résultat pour ces filtres."
              : `Aucun ${isStyle ? "style" : "élément"} pour le moment. Ajoutez le premier avec le bouton ci-dessus.`}
          </div>
        ) : (
          <>
            <p className="admin-muted mb-4">
              {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
            </p>
            <div className="admin-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Nom</th>
                    {!isStyle && (
                      <>
                        <th scope="col">Ordre</th>
                        <th scope="col">Visibilité</th>
                      </>
                    )}
                    <th scope="col">Photos associées</th>
                    <th scope="col" className="text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong className="font-medium text-white">
                          {item.name}
                        </strong>
                        {item.slug && (
                          <p className="mt-1 text-xs text-white/40">
                            {item.slug}
                          </p>
                        )}
                      </td>
                      {!isStyle && (
                        <>
                          <td>{item.sortOrder}</td>
                          <td>
                            <span
                              className={`admin-badge ${item.isActive ? "admin-badge-active" : ""}`}
                            >
                              {item.isActive ? "Visible" : "Masquée"}
                            </span>
                          </td>
                        </>
                      )}
                      <td className="text-white/65">
                        {item.count.toLocaleString("fr-FR")}
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button
                            className="admin-button"
                            onClick={() => openEditor(item)}
                            aria-label={`Modifier ${item.name}`}
                          >
                            <Edit3 size={14} />
                            <span className="hidden sm:inline">Modifier</span>
                          </button>
                          <button
                            className="admin-button admin-button-danger"
                            onClick={() => setDeleting(item)}
                            aria-label={`Supprimer ${item.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
      <dialog
        ref={editorRef}
        className={styles.dialog}
        aria-labelledby="taxonomy-editor-title"
        onCancel={(event) => {
          event.preventDefault();
          if (!busy) setEditor(null);
        }}
      >
        <div className={styles.dialogHeader}>
          <div>
            <h2 id="taxonomy-editor-title">
              {editor === "new" ? "Ajouter" : "Modifier"}{" "}
              {isStyle ? "un style" : "une catégorie"}
            </h2>
            <p>
              {isStyle
                ? "Les styles identiques ou très proches sont refusés pour garder un catalogue propre."
                : "Une catégorie masquée reste enregistrée et conserve ses associations."}
            </p>
          </div>
          <button
            type="button"
            className="admin-button"
            disabled={busy}
            onClick={() => setEditor(null)}
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>
        <form onSubmit={save}>
          <label>
            <span className="admin-label">Nom *</span>
            <input
              autoFocus
              required
              maxLength={isStyle ? 80 : 120}
              disabled={busy}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={
                isStyle ? "Ex. Fine line" : "Ex. Tatouages cicatrisés"
              }
            />
          </label>
          {!isStyle && (
            <>
              <label>
                <span className="admin-label">
                  Identifiant dans les filtres
                </span>
                <input
                  maxLength={120}
                  disabled={busy}
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder={slugify(form.name) || "Généré depuis le nom"}
                />
              </label>
              <label>
                <span className="admin-label">Ordre d’affichage</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  disabled={busy}
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm({ ...form, sortOrder: e.target.value })
                  }
                />
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  disabled={busy}
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />
                Visible dans les filtres
              </label>
            </>
          )}
          <div className={styles.dialogActions}>
            <button
              type="button"
              className="admin-button"
              disabled={busy}
              onClick={() => setEditor(null)}
            >
              Annuler
            </button>
            <button
              className="admin-button admin-button-primary"
              disabled={busy}
            >
              {busy ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </dialog>
      <dialog
        ref={deleteRef}
        className={styles.dialog}
        aria-labelledby="taxonomy-delete-title"
        onCancel={(event) => {
          event.preventDefault();
          if (!busy) setDeleting(null);
        }}
      >
        <h2 id="taxonomy-delete-title">
          Supprimer {isStyle ? "ce style" : "cette catégorie"} ?
        </h2>
        <p className="mt-4">
          « {deleting?.name} » sera {isStyle ? "retiré" : "retirée"} du
          catalogue.
          {!!deleting?.count &&
            ` ${deleting.count} photo${deleting.count > 1 ? "s" : ""} perdront cette association.`}{" "}
          Les photos seront conservées. Cette suppression est définitive.
        </p>
        <div className={styles.dialogActions}>
          <button
            className="admin-button"
            disabled={busy}
            onClick={() => setDeleting(null)}
          >
            Conserver
          </button>
          <button
            className="admin-button admin-button-danger"
            disabled={busy}
            onClick={() => void remove()}
          >
            {busy ? "Suppression…" : "Supprimer"}
          </button>
        </div>
      </dialog>
    </div>
  );
}
