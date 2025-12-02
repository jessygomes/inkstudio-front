"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { getColorProfileAction } from "@/lib/queries/user";

interface ColorContextType {
  colorProfile: string;
  colorProfileBis: string;
  updateColors: (primary: string, secondary: string) => void;
  isLoading: boolean;
}

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export function ColorProvider({ children }: { children: React.ReactNode }) {
  const [colorProfile, setColorProfile] = useState("#ff9d00"); // Défaut tertiary-400
  const [colorProfileBis, setColorProfileBis] = useState("#ff5500"); // Défaut tertiary-500
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Convertir hex vers RGB pour les opacités
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `${r}, ${g}, ${b}`;
    }
    return "255, 157, 0"; // Fallback RGB pour #ff9d00
  };

  // Fonction pour appliquer les couleurs au conteneur de l'application uniquement
  const applyColorsToDOM = React.useCallback(
    (primary: string, secondary: string) => {
      if (containerRef.current) {
        containerRef.current.style.setProperty("--color-tertiary-400", primary);
        containerRef.current.style.setProperty(
          "--color-tertiary-500",
          secondary
        );

        // Optionnel : créer des versions avec opacité
        containerRef.current.style.setProperty(
          "--color-tertiary-400-rgb",
          hexToRgb(primary)
        );
        containerRef.current.style.setProperty(
          "--color-tertiary-500-rgb",
          hexToRgb(secondary)
        );
      }
    },
    []
  );

  // Récupérer les couleurs utilisateur au chargement
  useEffect(() => {
    const fetchUserColors = async () => {
      try {
        setIsLoading(true);
        const result = await getColorProfileAction();

        if (result.ok && result.data) {
          // Les données arrivent avec la structure: { user: { colorProfile, colorProfileBis } }
          const userColors = result.data.user || result.data;
          const userColorProfile = userColors.colorProfile || "default";
          const userColorProfileBis = userColors.colorProfileBis || "default";

          // console.log("ColorProvider - Couleurs récupérées:", {
          //   userColorProfile,
          //   userColorProfileBis,
          //   isDefault: userColorProfile === "default",
          // });

          // Si l'utilisateur utilise les couleurs par défaut, appliquer les couleurs système
          if (userColorProfile === "default") {
            setColorProfile("#ff9d00");
            setColorProfileBis("#ff5500");
            applyColorsToDOM("#ff9d00", "#ff5500");
          } else {
            setColorProfile(userColorProfile);
            setColorProfileBis(userColorProfileBis);
            applyColorsToDOM(userColorProfile, userColorProfileBis);
          }
        } else {
          // Pas de données utilisateur, utiliser les couleurs par défaut (système)
          // console.log(
          //   "ColorProvider - Aucune couleur utilisateur, utilisation des couleurs système"
          // );
          setColorProfile("#ff9d00");
          setColorProfileBis("#ff5500");
          applyColorsToDOM("#ff9d00", "#ff5500");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des couleurs:", error);
        // En cas d'erreur, garder les couleurs système
        // console.log("ColorProvider - Erreur, utilisation des couleurs système");
        setColorProfile("#ff9d00");
        setColorProfileBis("#ff5500");
        applyColorsToDOM("#ff9d00", "#ff5500");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserColors();
  }, [applyColorsToDOM]);

  // Effet pour appliquer les couleurs initiales quand le conteneur est monté
  React.useEffect(() => {
    if (containerRef.current && !isLoading) {
      applyColorsToDOM(colorProfile, colorProfileBis);
    }
  }, [colorProfile, colorProfileBis, isLoading, applyColorsToDOM]);

  // Fonction pour mettre à jour les couleurs
  const updateColors = React.useCallback(
    (primary: string, secondary: string) => {
      setColorProfile(primary);
      setColorProfileBis(secondary);
      applyColorsToDOM(primary, secondary);
    },
    [applyColorsToDOM]
  );

  const value = {
    colorProfile,
    colorProfileBis,
    updateColors,
    isLoading,
  };

  return (
    <ColorContext.Provider value={value}>
      <div ref={containerRef} className="app-colors-container">
        {children}
      </div>
    </ColorContext.Provider>
  );
}

export function useColors() {
  const context = useContext(ColorContext);
  if (context === undefined) {
    throw new Error("useColors must be used within a ColorProvider");
  }
  return context;
}

// Hook pour obtenir les styles inline avec les couleurs actuelles
export function useColorStyles() {
  const { colorProfile, colorProfileBis } = useColors();

  return {
    primaryBackground: { backgroundColor: colorProfile },
    secondaryBackground: { backgroundColor: colorProfileBis },
    primaryText: { color: colorProfile },
    secondaryText: { color: colorProfileBis },
    primaryBorder: { borderColor: colorProfile },
    secondaryBorder: { borderColor: colorProfileBis },
    primaryGradient: {
      background: `linear-gradient(90deg, ${colorProfile}, ${colorProfileBis})`,
    },
  };
}
