"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiChevronLeft, FiFileText } from "react-icons/fi";
import { toast } from "sonner";
import PageHeader from "@/components/Shared/PageHeader";
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
    <div className="wrapper-global">
      <section className="w-full space-y-3 pt-4">
        <PageHeader icon={<FiFileText size={18} />} title="Nouvel Article">
          <Link
            href="/admin/articles"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/10 font-one text-xs transition-colors"
          >
            <FiChevronLeft size={14} /> Retour aux articles
          </Link>
        </PageHeader>

        <form
          onSubmit={onSubmit}
          className="bg-noir-500 p-4 rounded-2xl space-y-3 font-one"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-2xl border border-white/15 bg-noir-500/60 px-3 py-2 text-sm text-white outline-none focus:border-tertiary-400"
            placeholder="Titre"
          />

          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full rounded-2xl border border-white/15 bg-noir-500/60 px-3 py-2 text-sm text-white outline-none focus:border-tertiary-400"
            placeholder="Auteur"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full rounded-2xl border border-white/15 bg-noir-500/60 px-3 py-2 text-sm text-white outline-none focus:border-tertiary-400"
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
            className="cursor-pointer rounded-2xl bg-gradient-to-r from-tertiary-400 to-tertiary-500 px-4 py-2 text-xs text-white disabled:opacity-50 font-one"
          >
            {saving ? "Création..." : "Créer l'article"}
          </button>
        </form>
      </section>
    </div>
  );
}
