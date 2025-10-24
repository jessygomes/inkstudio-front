import { useEffect } from "react";

/**
 * Hook personnalisé pour bloquer/débloquer le scroll du body
 * @param isLocked - Boolean indiquant si le scroll doit être bloqué
 */
export const useScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (isLocked) {
      // Sauvegarder le style original
      const originalStyle = window.getComputedStyle(document.body).overflow;

      // Bloquer le scroll
      document.body.style.overflow = "hidden";

      // Nettoyer au démontage ou quand isLocked devient false
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isLocked]);
};
