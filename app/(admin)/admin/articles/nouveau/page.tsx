"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiChevronLeft, FiFileText } from "react-icons/fi";
import { toast } from "sonner";
import { createAdminArticleAction } from "@/lib/queries/articles.action";
import ArticleImagesUploader from "@/components/Shared/UploadImage/ArticleImagesUploader";

export default function NewAdminArticlePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !author.trim() || !content.trim()) {
      toast.error("Titre, auteur et contenu sont obligatoires");
      return;
    }

    try {
      setSaving(true);

      const result = await createAdminArticleAction({
        title,
        author,
        content,
        imageUrls,
      });

      if (!result.ok) {
        toast.error(result.message || "Erreur lors de la creation");
        return;
      }

      toast.success("Article cree avec succes");
      router.push("/admin/articles");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setSaving(false);
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
                Nouvel Article
              </h1>
              <p className="text-white/70 text-[10px] font-one mt-0.5">
                Creez un article pour la vitrine publique
              </p>
            </div>
          </div>

          <Link
            href="/admin/articles"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/10 font-one text-xs transition-colors"
          >
            <FiChevronLeft size={14} /> Retour aux articles
          </Link>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-4 space-y-3"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-noir-500/60 px-3 py-2 text-sm text-white outline-none focus:border-tertiary-400"
            placeholder="Titre"
          />

          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-noir-500/60 px-3 py-2 text-sm text-white outline-none focus:border-tertiary-400"
            placeholder="Auteur"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full rounded-lg border border-white/15 bg-noir-500/60 px-3 py-2 text-sm text-white outline-none focus:border-tertiary-400"
            placeholder="Contenu"
          />

          <ArticleImagesUploader
            imageUrls={imageUrls}
            onChange={setImageUrls}
            disabled={saving}
          />

          <button
            type="submit"
            disabled={saving}
            className="cursor-pointer rounded-lg bg-gradient-to-r from-tertiary-400 to-tertiary-500 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Creation..." : "Creer l'article"}
          </button>
        </form>
      </div>
    </div>
  );
}
