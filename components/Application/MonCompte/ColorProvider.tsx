"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useUser } from "@/components/Auth/Context/UserContext";
import { getColorProfileAction } from "@/lib/queries/user";

interface ColorContextType {
  updateColors: (primary: string, secondary: string) => void;
}

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export function ColorProvider({ children }: { children: React.ReactNode }) {
  const user = useUser();

  // Fonction pour convertir hex en RGB
  const hexToRgb = useCallback((hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `${r} ${g} ${b}`;
    }
    return "255 157 0"; // Fallback RGB pour #ff9d00
  }, []);

  // Fonction pour appliquer les couleurs au DOM
  const applyColorsToDOM = useCallback(
    (primary: string, secondary: string) => {
      const root = document.documentElement;

      // Appliquer les couleurs en format RGB pour Tailwind
      root.style.setProperty("--color-tertiary-400", `${hexToRgb(primary)}`);
      root.style.setProperty("--color-tertiary-500", `${hexToRgb(secondary)}`);

      // Optionnel : garder aussi les valeurs hex
      root.style.setProperty("--color-primary-hex", primary);
      root.style.setProperty("--color-secondary-hex", secondary);
    },
    [hexToRgb]
  );

  // Fonction pour mettre à jour les couleurs
  const updateColors = useCallback(
    (primary: string, secondary: string) => {
      applyColorsToDOM(primary, secondary);
    },
    [applyColorsToDOM]
  );

  // Charger les couleurs de l'utilisateur au démarrage
  useEffect(() => {
    const loadUserColors = async () => {
      if (user.id) {
        try {
          const colorProfile = await getColorProfileAction();
          if (colorProfile.ok && colorProfile.data) {
            const { colorProfile: primary, colorProfileBis: secondary } =
              colorProfile.data;
            applyColorsToDOM(primary, secondary);
          } else {
            // Appliquer les couleurs par défaut si pas de profil couleur
            applyColorsToDOM("#ff9d00", "#ff5500");
          }
        } catch (error) {
          console.error("Erreur lors du chargement des couleurs:", error);
          // Appliquer les couleurs par défaut en cas d'erreur
          applyColorsToDOM("#ff9d00", "#ff5500");
        }
      } else {
        // Utilisateur non connecté, couleurs par défaut
        applyColorsToDOM("#ff9d00", "#ff5500");
      }
    };

    loadUserColors();
  }, [user.id, applyColorsToDOM]);

  return (
    <ColorContext.Provider value={{ updateColors }}>
      {children}
    </ColorContext.Provider>
  );
}

export function useColors() {
  const context = useContext(ColorContext);
  if (context === undefined) {
    throw new Error("useColors doit être utilisé dans un ColorProvider");
  }
  return context;
}
