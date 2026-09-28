export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  connexion: "/connexion",
  inscription: "/inscription",
} as const;

// Pages nécessitant une authentification valide (utilisé par le middleware et les watchers client)
export const PROTECTED_PATHS = [
  ROUTES.dashboard,
  "/rdv",
  "/mes-rendez-vous",
  "/clients",
  "/portfolio",
  "/mon-portfolio",
  "/mes-produits",
  "/mes-flashs",
  "/mon-compte",
  "/parametres",
  "/stocks",
  "/factures",
  "/messagerie",
  "/review",
  "/suiviDessin",
  "/admin",
] as const;

