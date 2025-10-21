/**
 * Convertit une couleur hexadécimale en RGB
 */
export function hexToRgb(
  hex: string
): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convertit RGB en hexadécimal
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Calcule la luminosité d'une couleur (0-255)
 * Utilise la formule de luminosité perçue
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  // Formule de luminosité perçue
  return 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
}

/**
 * Détermine si une couleur est claire (luminosité > 128)
 */
export function isLightColor(hex: string): boolean {
  return getLuminance(hex) > 128;
}

/**
 * Assombrit une couleur en réduisant ses composantes RGB
 */
export function darkenColor(hex: string, amount: number = 0.3): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = 1 - amount;
  return rgbToHex(
    Math.round(rgb.r * factor),
    Math.round(rgb.g * factor),
    Math.round(rgb.b * factor)
  );
}

/**
 * Éclaircit une couleur en augmentant ses composantes RGB
 */
export function lightenColor(hex: string, amount: number = 0.3): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  return rgbToHex(
    Math.min(255, Math.round(rgb.r + (255 - rgb.r) * amount)),
    Math.min(255, Math.round(rgb.g + (255 - rgb.g) * amount)),
    Math.min(255, Math.round(rgb.b + (255 - rgb.b) * amount))
  );
}

/**
 * Génère automatiquement une couleur secondaire basée sur la couleur principale
 * Si la couleur est claire, génère une version plus foncée (1.5x plus contrastée)
 * Si la couleur est foncée, génère une version plus claire (1.5x plus contrastée)
 */
export function generateSecondaryColor(primaryColor: string): string {
  if (isLightColor(primaryColor)) {
    // Si couleur claire, on la rend plus foncée (1.5x - comme tertiary-500 vs tertiary-400)
    return darkenColor(primaryColor, 0.33);
  } else {
    // Si couleur foncée, on la rend plus claire (1.5x)
    return lightenColor(primaryColor, 0.33);
  }
}
