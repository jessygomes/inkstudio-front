"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/components/Auth/Context/UserContext";
import { useColors } from "@/components/ColorContext/ColorProvider";
import {
  getColorProfileAction,
  updateColorProfileAction,
} from "@/lib/queries/user";
import { generateSecondaryColor, isLightColor } from "@/lib/utils/colorUtils";
import { toast } from "sonner";

const DEFAULT_TERTIARY_400 = "#ff9d00";
const DEFAULT_TERTIARY_500 = "#ff5500";

const colorPalette = [
  { name: "Orange", color: "#ff9d00" },
  { name: "Bleu", color: "#0066cc" },
  { name: "Vert", color: "#008b47" },
  { name: "Rouge", color: "#dc2626" },
  { name: "Violet", color: "#7c3aed" },
  { name: "Rose", color: "#ec4899" },
  { name: "Jaune", color: "#eab308" },
  { name: "Turquoise", color: "#0891b2" },
  { name: "Indigo", color: "#4f46e5" },
  { name: "Emeraude", color: "#059669" },
  { name: "Orange fonce", color: "#ea580c" },
  { name: "Cyan", color: "#06b6d4" },
];

export default function ColorProfile() {
  const user = useUser();
  const { updateColors } = useColors();

  const [loading, setLoading] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [isResettingToSystem, setIsResettingToSystem] = useState(false);
  const [colorProfile, setColorProfile] = useState("default");
  const [initialColor, setInitialColor] = useState("default");

  const colorProfileBis = useMemo(() => {
    if (colorProfile === "default") {
      return DEFAULT_TERTIARY_500;
    }
    return generateSecondaryColor(colorProfile);
  }, [colorProfile]);

  const isDefaultMode = colorProfile === "default";
  const hasChanges = colorProfile !== initialColor;

  useEffect(() => {
    const fetchColors = async () => {
      if (!user.id) return;

      try {
        setLoadingFetch(true);
        const result = await getColorProfileAction();

        if (result.ok && result.data) {
          const userColors = result.data.user || result.data;
          const retrievedColor = userColors.colorProfile || "default";

          setColorProfile(retrievedColor);
          setInitialColor(retrievedColor);
        } else {
          setColorProfile("default");
          setInitialColor("default");
        }
      } catch (error) {
        console.error("Erreur lors de la recuperation des couleurs:", error);
        setColorProfile("default");
        setInitialColor("default");
        toast.error("Erreur lors de la recuperation des couleurs");
      } finally {
        setLoadingFetch(false);
      }
    };

    fetchColors();
  }, [user.id]);

  useEffect(() => {
    if (loadingFetch || isResettingToSystem) return;

    if (colorProfile === "default") {
      updateColors(DEFAULT_TERTIARY_400, DEFAULT_TERTIARY_500);
      return;
    }

    if (isLightColor(colorProfile)) {
      updateColors(colorProfile, colorProfileBis);
    } else {
      updateColors(colorProfileBis, colorProfile);
    }
  }, [
    colorProfile,
    colorProfileBis,
    updateColors,
    loadingFetch,
    isResettingToSystem,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user.id) {
      toast.error("Utilisateur non connecte");
      return;
    }

    if (!hasChanges) {
      toast.message("Aucune modification a sauvegarder");
      return;
    }

    setLoading(true);

    try {
      const result = await updateColorProfileAction({
        colorProfile,
        colorProfileBis,
      });

      if (!result.ok) {
        toast.error(result.message || "Erreur lors de la mise a jour");
        return;
      }

      if (isDefaultMode) {
        updateColors(DEFAULT_TERTIARY_400, DEFAULT_TERTIARY_500);
      } else if (isLightColor(colorProfile)) {
        updateColors(colorProfile, colorProfileBis);
      } else {
        updateColors(colorProfileBis, colorProfile);
      }

      setInitialColor(colorProfile);
      toast.success("Couleurs mises a jour avec succes");
    } catch (error) {
      console.error("Erreur lors de la mise a jour des couleurs:", error);
      toast.error("Erreur lors de la mise a jour des couleurs");
    } finally {
      setLoading(false);
    }
  };

  const resetToDefault = async () => {
    if (!user.id) {
      toast.error("Utilisateur non connecte");
      return;
    }

    setIsResettingToSystem(true);
    setLoading(true);

    try {
      const result = await updateColorProfileAction({
        colorProfile: "default",
        colorProfileBis: "default",
      });

      if (!result.ok) {
        toast.error(result.message || "Erreur lors de la sauvegarde");
        return;
      }

      setColorProfile("default");
      setInitialColor("default");
      updateColors(DEFAULT_TERTIARY_400, DEFAULT_TERTIARY_500);
      toast.success("Couleurs systeme retablies");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des couleurs systeme:", error);
      toast.error("Erreur lors de la sauvegarde des couleurs systeme");
    } finally {
      setLoading(false);
      setIsResettingToSystem(false);
    }
  };

  if (loadingFetch) {
    return (
      <div className="dashboard-embedded-panel rounded-2xl border border-white/10 bg-white/4 p-3 sm:p-4">
        <div className="animate-pulse space-y-2.5">
          <div className="h-4 w-32 rounded bg-white/10" />
          <div className="h-16 rounded-xl bg-white/8" />
          <div className="h-20 rounded-xl bg-white/8" />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-embedded-panel rounded-2xl border border-white/10 bg-white/4 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl border border-tertiary-400/25 bg-tertiary-400/15 flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4 text-tertiary-500"
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
          <div className="min-w-0">
            <p className="text-white/50 font-one text-[10px] uppercase tracking-wider">
              Thème
            </p>
            <h3 className="text-white font-one text-sm sm:text-base font-semibold truncate">
              Couleurs de l&apos;interface
            </h3>
          </div>
        </div>

        <span
          className={`rounded-[10px] px-2 py-1 text-[10px] font-one border ${
            isDefaultMode
              ? "border-white/20 bg-white/10 text-white/70"
              : "border-tertiary-500/30 bg-tertiary-500/15 text-tertiary-300"
          }`}
        >
          {isDefaultMode ? "Systeme" : "Personnalise"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="pt-3 space-y-3">
        <div className="rounded-xl border border-white/10 bg-white/3 p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-white font-one text-xs sm:text-sm font-medium">
              Palette recommandee
            </p>
            <span className="text-[11px] text-white/50 font-two">
              12 couleurs
            </span>
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {colorPalette.map((item) => (
              <button
                key={item.color}
                type="button"
                onClick={() => setColorProfile(item.color)}
                title={item.name}
                disabled={loading}
                className={`h-8 w-full rounded-[10px] border-2 transition-all duration-200 ${
                  colorProfile === item.color
                    ? "border-white ring-2 ring-white/30"
                    : "border-white/20 hover:border-white/45"
                }`}
                style={{ backgroundColor: item.color }}
              >
                {colorProfile === item.color && (
                  <span className="text-white text-xs font-one">✓</span>
                )}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-white/50 font-two">
            La couleur secondaire est générée automatiquement pour garder un bon contraste.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/3 p-3 space-y-2">
          <p className="text-white font-one text-xs sm:text-sm font-medium">Aperçu du thème</p>

          <div className="grid grid-cols-2 gap-2">
            {isDefaultMode ? (
              <>
                <div
                  className="h-8 rounded-[10px] text-white text-xs font-one flex items-center justify-center"
                  style={{ backgroundColor: DEFAULT_TERTIARY_400 }}
                >
                  Tertiary 400
                </div>
                <div
                  className="h-8 rounded-[10px] text-white text-xs font-one flex items-center justify-center"
                  style={{ backgroundColor: DEFAULT_TERTIARY_500 }}
                >
                  Tertiary 500
                </div>
              </>
            ) : isLightColor(colorProfile) ? (
              <>
                <div
                  className="h-8 rounded-[10px] text-white text-xs font-one flex items-center justify-center"
                  style={{ backgroundColor: colorProfile }}
                >
                  Principal
                </div>
                <div
                  className="h-8 rounded-[10px] text-white text-xs font-one flex items-center justify-center"
                  style={{ backgroundColor: colorProfileBis }}
                >
                  Générée
                </div>
              </>
            ) : (
              <>
                <div
                  className="h-8 rounded-[10px] text-white text-xs font-one flex items-center justify-center"
                  style={{ backgroundColor: colorProfileBis }}
                >
                  Générée
                </div>
                <div
                  className="h-8 rounded-[10px] text-white text-xs font-one flex items-center justify-center"
                  style={{ backgroundColor: colorProfile }}
                >
                  Principal
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          {!hasChanges && (
            <span className="text-[11px] text-white/45 font-two mr-auto">
              Thème déjà à jour
            </span>
          )}

          <button
            type="button"
            onClick={resetToDefault}
            disabled={loading || isDefaultMode}
            className="cursor-pointer h-9 px-3 rounded-[14px] border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-colors font-medium font-one text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Système
          </button>

          <button
            type="submit"
            disabled={loading || !hasChanges}
            className="cursor-pointer h-9 min-w-[120px] px-3 rounded-[14px] bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white transition-all duration-300 font-medium font-one text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                Mise a jour...
              </>
            ) : (
              "Sauvegarder"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
