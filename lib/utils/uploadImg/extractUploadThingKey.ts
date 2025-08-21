export const extractUploadThingKey = (url: string): string | null => {
  try {
    // Format UploadThing: https://utfs.io/f/[key]
    const match = url.match(/\/f\/([^\/\?]+)/);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Erreur lors de l'extraction de la clé UploadThing:", error);
    return null;
  }
};
