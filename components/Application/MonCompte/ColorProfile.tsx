"use client";
import SettingsSectionHeader from "../Parametres/SettingsSectionHeader";
import { Palette } from "lucide-react";

import styles from "../Parametres/SettingsCard.module.css";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/components/Auth/Context/UserContext";
import { useColors } from "@/components/ColorContext/ColorProvider";
import { getColorProfileAction, updateColorProfileAction } from "@/lib/queries/user";
import { generateSecondaryColor, isLightColor } from "@/lib/utils/colorUtils";
import { toast } from "sonner";
import DashboardButton from "@/components/Shared/DashboardButton";

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
      <div className={styles.card}>
        <div className="animate-pulse space-y-2.5">
          <div className="h-4 w-32 rounded bg-white/10" />
          <div className="h-16 rounded-xl bg-white/8" />
          <div className="h-20 rounded-xl bg-white/8" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <SettingsSectionHeader icon={Palette} title="Couleurs de l’interface" description="Personnalisez votre espace avec la couleur de votre choix." action={<span className="rounded-lg border border-tertiary-400/20 bg-tertiary-400/10 px-2 py-1 text-[9px] text-tertiary-400">{isDefaultMode ? "Système" : "Personnalisé"}</span>} />

      <form onSubmit={handleSubmit} className={styles.body}>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-white font-one text-xs sm:text-xs font-medium">
              Palette recommandée
            </p>
            <span className="text-[11px] text-white/50 font-two">
              12 couleurs
            </span>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {colorPalette.map((item) => (
              <label key={item.color} className="relative cursor-pointer">
                <input type="radio" name="profile-color" value={item.color} checked={colorProfile === item.color}
                  onChange={() => setColorProfile(item.color)} disabled={loading} aria-label={item.name} className="peer sr-only" />
                <span className="flex h-10 w-full items-center justify-center rounded-xl border-2 border-white/15 transition-transform peer-checked:border-white peer-checked:ring-2 peer-checked:ring-white/30 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-white peer-disabled:opacity-50" style={{ backgroundColor: item.color }}>
                  {colorProfile === item.color && <span aria-hidden="true" className="rounded-full bg-black/50 px-1.5 text-white">✓</span>}
                </span>
                <span className="mt-1 block truncate text-center text-[10px] text-white/60">{item.name}</span>
              </label>
            ))}
          </div>

          <p className="text-[11px] text-white/50 font-two">
            La couleur secondaire est générée automatiquement pour garder un bon contraste.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-white font-one text-xs sm:text-xs font-medium">Aperçu du thème</p>

          <div className={styles.preview} aria-label="Aperçu de la couleur sélectionnée"><span className={styles.icon}><Palette className="h-4 w-4" /></span><div className="mr-auto"><p className={styles.label}>Votre espace Inkera</p><p className={styles.note}>Icônes, badges et actions à vos couleurs</p></div><span className={styles.badge}>Votre couleur</span><span aria-hidden="true" className="h-8 w-14 rounded-lg bg-linear-to-r from-tertiary-400 to-tertiary-500" /></div>
        </div>

        <p className="text-xs text-white/55">L’aperçu est appliqué immédiatement. Enregistrez pour conserver votre choix.</p>
        <div className={styles.footer}>
          {hasChanges && <p role="status" className="mr-auto text-xs text-amber-300">Modifications non enregistrées</p>}
          {!hasChanges && (
            <span className="text-[11px] text-white/55 font-two mr-auto">
              Thème déjà à jour
            </span>
          )}

          <DashboardButton
            type="button"
            onClick={resetToDefault}
            disabled={loading || isDefaultMode}
            variant="secondary"
            className="h-9 min-w-0 px-3"
          >
            Système
          </DashboardButton>

          <DashboardButton
            type="submit"
            disabled={loading || !hasChanges}
            className="h-9 min-w-[120px] px-3"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                Mise a jour...
              </>
            ) : (
              "Sauvegarder"
            )}
          </DashboardButton>
        </div>
      </form>
    </div>
  );
}
