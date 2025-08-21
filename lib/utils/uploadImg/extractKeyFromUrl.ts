export const extractKeyFromUrl = (url: string): string | null => {
  try {
    const patterns = [
      /\/f\/([^\/\?]+)/,
      /uploadthing\.com\/([^\/\?]+)/,
      /utfs\.io\/f\/([^\/\?]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    const urlParts = url.split("/");
    const lastPart = urlParts[urlParts.length - 1];
    if (lastPart && !lastPart.includes(".")) {
      return lastPart;
    }

    return null;
  } catch (error) {
    console.error("Erreur lors de l'extraction de la clé:", error);
    return null;
  }
};
