"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiChevronLeft, FiEdit2, FiFileText, FiPlus, FiTrash2 } from "react-icons/fi";
import { toast } from "sonner";
import ArticleImagesUploader from "@/components/Shared/UploadImage/ArticleImagesUploader";
import {
  AdminArticle,
  deleteAdminArticleAction,
  getAdminArticlesAction,
  updateAdminArticleAction,
} from "@/lib/queries/articles.action";

interface EditFormState {
  title: string;
  content: string;
  author: string;
  imageUrls: string[];
}

const toEditFormState = (article: AdminArticle): EditFormState => ({
  title: article.title,
  content: article.content,
  author: article.author,
  imageUrls: article.imageUrls,
});

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({
    title: "",
    content: "",
    author: "",
    imageUrls: [],
  });

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAdminArticlesAction();

      if (!result.ok || !result.data) {
        setError(result.message || "Erreur lors du chargement des articles");
        setArticles([]);
        return;
      }

      setArticles(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const startEdit = (article: AdminArticle) => {
    setEditingId(article.id);
    setEditForm(toEditFormState(article));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      title: "",
      content: "",
      author: "",
      imageUrls: [],
    });
  };

  const saveEdit = async (id: string) => {
    if (!editForm.title.trim() || !editForm.content.trim() || !editForm.author.trim()) {
      toast.error("Titre, contenu et auteur sont obligatoires");
      return;
    }

    try {
      setSavingId(id);
      const result = await updateAdminArticleAction(id, {
        title: editForm.title,
        content: editForm.content,
        author: editForm.author,
        imageUrls: editForm.imageUrls,
      });

      if (!result.ok || !result.data) {
        toast.error(result.message || "Erreur lors de la mise a jour");
        return;
      }

      setArticles((prev) =>
        prev.map((article) =>
          article.id === id ? result.data! : article,
        ),
      );
      toast.success("Article mis a jour");
      cancelEdit();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSavingId(null);
    }
  };

  const removeArticle = async (id: string) => {
    const confirmed = window.confirm("Supprimer cet article ?");
    if (!confirmed) return;

    try {
      setDeletingId(id);
      const result = await deleteAdminArticleAction(id);

      if (!result.ok) {
        toast.error(result.message || "Erreur lors de la suppression");
        return;
      }

      setArticles((prev) => prev.filter((article) => article.id !== id));
      toast.success("Article supprime");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-noir-700 flex flex-col gap-4 px-3 lg:px-20 pb-10 min-h-screen">
      <div className="flex flex-col relative gap-6 w-full mt-2 lg:mt-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-3 rounded-xl shadow-xl border border-white/10 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-tertiary-500/30 rounded-full flex items-center justify-center">
              <FiFileText size={20} className="text-tertiary-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white font-one tracking-wide uppercase">
                Gestion des Articles
              </h1>
              <p className="text-white/70 text-[10px] font-one mt-0.5">
                Creez, modifiez et supprimez vos articles publics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/10 font-one text-xs transition-colors"
            >
              <FiChevronLeft size={14} /> Retour
            </Link>
            <Link
              href="/admin/articles/nouveau"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg font-one text-xs transition-all"
            >
              <FiPlus size={14} /> Nouvel article
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-4">
          {loading && (
            <p className="text-sm text-white/60 font-one">Chargement des articles...</p>
          )}

          {!loading && error && (
            <div className="space-y-2">
              <p className="text-sm text-red-300 font-one">{error}</p>
              <button
                onClick={loadArticles}
                className="cursor-pointer rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-one text-white hover:bg-white/20"
              >
                Reessayer
              </button>
            </div>
          )}

          {!loading && !error && articles.length === 0 && (
            <p className="text-sm text-white/60 font-one">Aucun article pour le moment.</p>
          )}

          {!loading && !error && articles.length > 0 && (
            <div className="space-y-3">
              {articles.map((article) => {
                const isEditing = editingId === article.id;
                const isSaving = savingId === article.id;
                const isDeleting = deletingId === article.id;

                return (
                  <div
                    key={article.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, title: e.target.value }))
                          }
                          className="w-full rounded-lg border border-white/15 bg-noir-500/60 px-3 py-2 text-sm text-white outline-none focus:border-tertiary-400"
                          placeholder="Titre"
                        />

                        <input
                          value={editForm.author}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, author: e.target.value }))
                          }
                          className="w-full rounded-lg border border-white/15 bg-noir-500/60 px-3 py-2 text-sm text-white outline-none focus:border-tertiary-400"
                          placeholder="Auteur"
                        />

                        <textarea
                          value={editForm.content}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, content: e.target.value }))
                          }
                          rows={6}
                          className="w-full rounded-lg border border-white/15 bg-noir-500/60 px-3 py-2 text-sm text-white outline-none focus:border-tertiary-400"
                          placeholder="Contenu"
                        />

                        <ArticleImagesUploader
                          imageUrls={editForm.imageUrls}
                          onChange={(next) =>
                            setEditForm((prev) => ({ ...prev, imageUrls: next }))
                          }
                          disabled={isSaving}
                        />

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveEdit(article.id)}
                            disabled={isSaving}
                            className="cursor-pointer rounded-lg bg-gradient-to-r from-tertiary-400 to-tertiary-500 px-3 py-1.5 text-xs text-white disabled:opacity-50"
                          >
                            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="cursor-pointer rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="text-sm font-semibold text-white font-one truncate">
                              {article.title}
                            </h2>
                            <p className="text-[11px] text-white/60 font-one">
                              Par {article.author} • {new Date(article.createdAt).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => startEdit(article)}
                              className="cursor-pointer rounded-lg border border-white/20 bg-white/10 p-2 text-white hover:bg-white/20"
                              aria-label="Modifier l'article"
                            >
                              <FiEdit2 size={14} />
                            </button>
                            <button
                              onClick={() => removeArticle(article.id)}
                              disabled={isDeleting}
                              className="cursor-pointer rounded-lg border border-red-400/30 bg-red-400/10 p-2 text-red-300 hover:bg-red-400/20 disabled:opacity-50"
                              aria-label="Supprimer l'article"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-white/70 font-one line-clamp-3">
                          {article.content}
                        </p>

                        {article.imageUrls?.length > 0 && (
                          <p className="text-[11px] text-white/50 font-one">
                            {article.imageUrls.length} image{article.imageUrls.length > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
