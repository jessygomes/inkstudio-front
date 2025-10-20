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

  // Fonction pour appliquer les couleurs au DOM
  const applyColorsToDOM = React.useCallback(
    (primary: string, secondary: string) => {
      const root = document.documentElement;
      root.style.setProperty("--color-tertiary-400", primary);
      root.style.setProperty("--color-tertiary-500", secondary);

      // Optionnel : créer des versions avec opacité
      root.style.setProperty("--color-tertiary-400-rgb", hexToRgb(primary));
      root.style.setProperty("--color-tertiary-500-rgb", hexToRgb(secondary));
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
          const primary = result.data.colorProfile || "#ff9d00";
          const secondary = result.data.colorProfileBis || "#ff5500";

          setColorProfile(primary);
          setColorProfileBis(secondary);

          // Appliquer les couleurs aux variables CSS
          applyColorsToDOM(primary, secondary);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des couleurs:", error);
        // En cas d'erreur, garder les couleurs par défaut
        applyColorsToDOM("#ff9d00", "#ff5500");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserColors();
  }, [applyColorsToDOM]);

  // Fonction pour mettre à jour les couleurs
  const updateColors = (primary: string, secondary: string) => {
    setColorProfile(primary);
    setColorProfileBis(secondary);
    applyColorsToDOM(primary, secondary);
  };

  const value = {
    colorProfile,
    colorProfileBis,
    updateColors,
    isLoading,
  };

  return (
    <ColorContext.Provider value={value}>{children}</ColorContext.Provider>
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
