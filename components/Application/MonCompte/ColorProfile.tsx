"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/components/Auth/Context/UserContext";
import { useColors } from "@/components/ColorContext/ColorProvider";
import {
  getColorProfileAction,
  updateColorProfileAction,
} from "@/lib/queries/user";
import { toast } from "sonner";

export default function ColorProfile() {
  const user = useUser();
  const { updateColors } = useColors();
  const [loading, setLoading] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [colorProfile, setColorProfile] = useState("#ff9d00"); // Couleur principale par défaut (tertiary-400)
  const [colorProfileBis, setColorProfileBis] = useState("#ff5500"); // Couleur secondaire par défaut (tertiary-500)

  // Récupérer les couleurs actuelles au chargement
  useEffect(() => {
    const fetchColors = async () => {
      if (!user.id) return;

      try {
        setLoadingFetch(true);
        const result = await getColorProfileAction();

        if (result.ok && result.data) {
          setColorProfile(result.data.colorProfile || "#ff9d00");
          setColorProfileBis(result.data.colorProfileBis || "#ff5500");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des couleurs:", error);
        toast.error("Erreur lors de la récupération des couleurs");
      } finally {
        setLoadingFetch(false);
      }
    };

    fetchColors();
  }, [user.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user.id) {
      toast.error("Utilisateur non connecté");
      return;
    }

    setLoading(true);

    try {
      const result = await updateColorProfileAction({
        colorProfile,
        colorProfileBis,
      });

      if (result.ok) {
        // Appliquer les nouvelles couleurs immédiatement
        updateColors(colorProfile, colorProfileBis);
        toast.success("Couleurs mises à jour avec succès !");
      } else {
        toast.error(result.message || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des couleurs:", error);
      toast.error("Erreur lors de la mise à jour des couleurs");
    } finally {
      setLoading(false);
    }
  };

  const resetToDefault = () => {
    setColorProfile("#ff9d00");
    setColorProfileBis("#ff5500");
  };

  if (loadingFetch) {
    return (
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-10 bg-white/10 rounded"></div>
            <div className="h-10 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V5z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white font-one">
            Couleurs de l&apos;interface
          </h3>
          <p className="text-white/60 text-sm">
            Personnalisez les couleurs principales de votre interface
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Couleur principale */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-white/80 font-one">
            Couleur principale
          </label>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="color"
                value={colorProfile}
                onChange={(e) => setColorProfile(e.target.value)}
                className="w-16 h-12 rounded-lg border-2 border-white/20 cursor-pointer bg-transparent"
                disabled={loading}
              />
              <div
                className="absolute inset-1 rounded-md pointer-events-none"
                style={{ backgroundColor: colorProfile }}
              ></div>
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={colorProfile}
                onChange={(e) => setColorProfile(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-tertiary-400 transition-colors font-mono"
                placeholder="#ff9d00"
                disabled={loading}
              />
            </div>
          </div>
          <p className="text-white/50 text-xs">
            Cette couleur sera utilisée pour les éléments principaux de
            l&apos;interface
          </p>
        </div>

        {/* Couleur secondaire */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-white/80 font-one">
            Couleur secondaire
          </label>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="color"
                value={colorProfileBis}
                onChange={(e) => setColorProfileBis(e.target.value)}
                className="w-16 h-12 rounded-lg border-2 border-white/20 cursor-pointer bg-transparent"
                disabled={loading}
              />
              <div
                className="absolute inset-1 rounded-md pointer-events-none"
                style={{ backgroundColor: colorProfileBis }}
              ></div>
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={colorProfileBis}
                onChange={(e) => setColorProfileBis(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-tertiary-400 transition-colors font-mono"
                placeholder="#ff5500"
                disabled={loading}
              />
            </div>
          </div>
          <p className="text-white/50 text-xs">
            Cette couleur sera utilisée pour les accents et éléments secondaires
          </p>
        </div>

        {/* Aperçu */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-white/80 font-one">
            Aperçu
          </label>
          <div className="flex gap-4">
            <div className="flex-1 p-4 rounded-lg border border-white/20">
              <div
                className="w-full h-8 rounded-md mb-2 flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: colorProfile }}
              >
                Couleur principale
              </div>
              <div
                className="w-full h-8 rounded-md flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: colorProfileBis }}
              >
                Couleur secondaire
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={resetToDefault}
            disabled={loading}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Réinitialiser
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Mise à jour...
              </>
            ) : (
              "Sauvegarder les couleurs"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
