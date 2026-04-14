"use client";
import { useState, useEffect, useMemo } from "react";
import { useUser } from "@/components/Auth/Context/UserContext";
import { useColors } from "@/components/ColorContext/ColorProvider";
import {
  getColorProfileAction,
  updateColorProfileAction,
} from "@/lib/queries/user";
import {
  generateSecondaryColor,
  isLightColor,
  // getLuminance,
} from "@/lib/utils/colorUtils";
import { toast } from "sonner";

// Couleurs par défaut du système (valeurs de base de tertiary-400 et tertiary-500)
const DEFAULT_TERTIARY_400 = "#ff9d00";
const DEFAULT_TERTIARY_500 = "#ff5500";

// Palette de couleurs présélectionnées pour garantir une bonne visibilité
const colorPalette = [
  { name: "Orange", color: "#ff9d00", category: "claire" },
  { name: "Bleu", color: "#0066cc", category: "foncée" },
  { name: "Vert", color: "#008b47", category: "foncée" },
  { name: "Rouge", color: "#dc2626", category: "foncée" },
  { name: "Violet", color: "#7c3aed", category: "foncée" },
  { name: "Rose", color: "#ec4899", category: "foncée" },
  { name: "Jaune", color: "#eab308", category: "claire" },
  { name: "Turquoise", color: "#0891b2", category: "foncée" },
  { name: "Indigo", color: "#4f46e5", category: "foncée" },
  { name: "Emeraude", color: "#059669", category: "foncée" },
  { name: "Orange foncé", color: "#ea580c", category: "foncée" },
  { name: "Cyan", color: "#06b6d4", category: "claire" },
];

export default function ColorProfile() {
  const user = useUser();
  const { updateColors } = useColors();
  const [loading, setLoading] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [isResettingToSystem, setIsResettingToSystem] = useState(false);
  const [colorProfile, setColorProfile] = useState("default"); // "default" ou couleur hexadécimale

  // Génère automatiquement la couleur secondaire basée sur la couleur principale
  const colorProfileBis = useMemo(() => {
    // Si c'est "default", retourner les couleurs système
    if (colorProfile === "default") {
      return DEFAULT_TERTIARY_500;
    }

    const secondary = generateSecondaryColor(colorProfile);
    const isLight = isLightColor(colorProfile);
    console.log(
      `Couleur principale: ${colorProfile} (${
        isLight ? "claire" : "foncée"
      }), Couleur secondaire générée: ${secondary}`,
    );
    return secondary;
  }, [colorProfile]);

  // Vérifie si on utilise les couleurs système par défaut
  // const isUsingSystemColors = useMemo(() => {
  //   return colorProfile === "default";
  // }, [colorProfile]);

  // Vérifie si la couleur choisie pourrait poser des problèmes de visibilité
  // const getColorWarning = useMemo(() => {
  //   const luminance = getLuminance(colorProfile);
  //   const isInPalette = colorPalette.some(
  //     (item) => item.color === colorProfile
  //   );

  //   if (isInPalette) return null; // Couleur de la palette = pas de warning

  //   if (luminance < 30) {
  //     return {
  //       type: "danger",
  //       message: "Couleur très foncée - risque de faible visibilité",
  //     };
  //   } else if (luminance > 220) {
  //     return {
  //       type: "danger",
  //       message: "Couleur très claire - risque de faible contraste",
  //     };
  //   } else if (luminance < 60 || luminance > 190) {
  //     return {
  //       type: "warning",
  //       message: "Couleur limite - vérifiez la visibilité",
  //     };
  //   }

  //   return null;
  // }, [colorProfile]);

  // Récupérer les couleurs actuelles au chargement
  useEffect(() => {
    const fetchColors = async () => {
      if (!user.id) return;

      try {
        setLoadingFetch(true);
        const result = await getColorProfileAction();

        if (result.ok && result.data) {
          // Les données arrivent avec la structure: { user: { colorProfile, colorProfileBis } }
          const userColors = result.data.user || result.data;
          const retrievedColor = userColors.colorProfile || "default";

          setColorProfile(retrievedColor);
          // colorProfileBis sera automatiquement généré via useMemo
        } else {
          // Pas de données utilisateur, utiliser "default"

          setColorProfile("default");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des couleurs:", error);

        setColorProfile("default");
        toast.error("Erreur lors de la récupération des couleurs");
      } finally {
        setLoadingFetch(false);
      }
    };

    fetchColors();
  }, [user.id]);

  // Effet pour mettre à jour les couleurs en temps réel lors de la sélection
  useEffect(() => {
    if (!loadingFetch && !isResettingToSystem) {
      // Cas spécial : si utilise les couleurs par défaut
      if (colorProfile === "default") {
        // Applique directement les couleurs système
        updateColors(DEFAULT_TERTIARY_400, DEFAULT_TERTIARY_500);
      } else if (isLightColor(colorProfile)) {
        // Couleur claire : elle devient tertiary-400, la version foncée devient tertiary-500
        updateColors(colorProfile, colorProfileBis);
      } else {
        // Couleur foncée : la version claire devient tertiary-400, elle devient tertiary-500
        updateColors(colorProfileBis, colorProfile);
      }
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
        // Appliquer les nouvelles couleurs immédiatement selon la logique
        if (colorProfile === "default") {
          updateColors(DEFAULT_TERTIARY_400, DEFAULT_TERTIARY_500);
        } else if (isLightColor(colorProfile)) {
          // Couleur claire : elle devient tertiary-400, la version foncée devient tertiary-500
          updateColors(colorProfile, colorProfileBis);
        } else {
          // Couleur foncée : la version claire devient tertiary-400, elle devient tertiary-500
          updateColors(colorProfileBis, colorProfile);
        }
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

  const resetToDefault = async () => {
    if (!user.id) {
      toast.error("Utilisateur non connecté");
      return;
    }

    // Indique qu'on est en train de reset aux couleurs système
    setIsResettingToSystem(true);
    setLoading(true);

    try {
      // Sauvegarde "default" en base de données pour revenir aux couleurs système
      const result = await updateColorProfileAction({
        colorProfile: "default",
        colorProfileBis: "default",
      });

      if (result.ok) {
        // Réinitialise avec "default"
        setColorProfile("default");

        // Applique immédiatement les couleurs système
        updateColors(DEFAULT_TERTIARY_400, DEFAULT_TERTIARY_500);

        // Message de confirmation
        toast.success("Couleurs système rétablies avec succès !");
      } else {
        toast.error(result.message || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde des couleurs système:",
        error,
      );
      toast.error("Erreur lors de la sauvegarde des couleurs système");
    } finally {
      setLoading(false);
      setIsResettingToSystem(false);
    }
  };

  if (loadingFetch) {
    return (
      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
        <div className="animate-pulse space-y-2">
          <div className="h-5 bg-white/10 rounded w-1/3"></div>
          <div className="space-y-1.5">
            <div className="h-8 bg-white/10 rounded"></div>
            <div className="h-8 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-2xl p-4 sm:p-5 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
          <svg
            className="w-3 h-3 text-white"
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
          <h3 className="text-sm font-semibold text-white font-one">
            Couleurs
          </h3>
          <p className="text-white/60 text-xs">
            Personnalisez les couleurs de l&apos;interface
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Couleur principale */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-white/80 font-one">
            Couleur principale
          </label>

          {/* Palette de couleurs présélectionnées */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <p className="text-white/70 text-xs">Palette :</p>
              <div className="flex items-center gap-0.5">
                <svg
                  className="w-2.5 h-2.5 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-green-400 text-xs">Optimale</span>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {colorPalette.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setColorProfile(item.color)}
                  className={`w-full h-8 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                    colorProfile === item.color
                      ? "border-white shadow-lg ring-2 ring-white/30"
                      : "border-white/20 hover:border-white/40"
                  }`}
                  style={{ backgroundColor: item.color }}
                  title={`${item.name} (${item.category})`}
                  disabled={loading}
                >
                  {colorProfile === item.color && (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white drop-shadow-lg"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sélecteur manuel */}
          {/* <div className="space-y-2">
            <p className="text-white/70 text-xs">
              Ou choisir une couleur personnalisée :
            </p>
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
                  placeholder={DEFAULT_TERTIARY_400}
                  disabled={loading}
                />
              </div>
            </div>
          </div> */}

          {/* Message d'avertissement pour les couleurs personnalisées */}
          {/* {getColorWarning && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                getColorWarning.type === "danger"
                  ? "bg-red-500/20 border border-red-500/30"
                  : "bg-yellow-500/20 border border-yellow-500/30"
              }`}
            >
              <svg
                className={`w-4 h-4 flex-shrink-0 ${
                  getColorWarning.type === "danger"
                    ? "text-red-400"
                    : "text-yellow-400"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span
                className={`text-xs ${
                  getColorWarning.type === "danger"
                    ? "text-red-300"
                    : "text-yellow-300"
                }`}
              >
                {getColorWarning.message}
              </span>
            </div>
          )} */}

          {/* <p className="text-white/50 text-xs">
            Cette couleur sera utilisée pour les éléments principaux. La couleur
            secondaire sera générée automatiquement.
          </p> */}
        </div>

        {/* Aperçu */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-white/80 font-one">
            Aperçu
          </label>
          <div className="flex gap-3">
            <div className="grid grid-cols-2 gap-2 p-3 rounded-lg border border-white/20 flex-1">
              {colorProfile === "default" ? (
                <>
                  <div
                    className="p-1.5 h-6 rounded-md flex items-center justify-center text-white text-xs font-medium"
                    style={{ backgroundColor: DEFAULT_TERTIARY_400 }}
                  >
                    Système
                  </div>
                  <div
                    className="p-1.5 h-6 rounded-md flex items-center justify-center text-white text-xs font-medium"
                    style={{ backgroundColor: DEFAULT_TERTIARY_500 }}
                  >
                    Système
                  </div>
                </>
              ) : isLightColor(colorProfile) ? (
                <>
                  <div
                    className="p-1.5 h-6 rounded-md flex items-center justify-center text-white text-xs font-medium"
                    style={{ backgroundColor: colorProfile }}
                  >
                    Principal
                  </div>
                  <div
                    className="p-1.5 h-6 rounded-md flex items-center justify-center text-white text-xs font-medium"
                    style={{ backgroundColor: colorProfileBis }}
                  >
                    Généré
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="p-1.5 h-6 rounded-md flex items-center justify-center text-white text-xs font-medium"
                    style={{ backgroundColor: colorProfileBis }}
                  >
                    Généré
                  </div>
                  <div
                    className="p-1.5 h-6 rounded-md flex items-center justify-center text-white text-xs font-medium"
                    style={{ backgroundColor: colorProfile }}
                  >
                    Principal
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        {/* <p className="text-white/50 text-xs">
            {isUsingSystemColors ? (
              <>
                <span className="text-green-400 font-medium">
                  ✓ Utilise les couleurs système par défaut
                </span>{" "}
                - Configuration originale du thème avec tertiary-400 et
                tertiary-500
              </>
            ) : isLightColor(colorProfile) ? (
              "Couleur claire détectée : elle devient tertiary-400, la version foncée devient tertiary-500"
            ) : (
              "Couleur foncée détectée : elle devient tertiary-500, la version claire devient tertiary-400"
            )}
          </p> */}

        {/* Boutons d'action */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={resetToDefault}
            disabled={loading}
            className="cursor-pointer px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Système
          </button>
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer flex justify-center items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs shadow-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                Mise à jour...
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
