export const dynamic = "force-dynamic";

// Configuration pour optimiser les performances et SEO
export const revalidate = 3600; // Revalidation toutes les heures
export const runtime = "nodejs";

// Configuration des images pour les performances
export const images = {
  domains: ["inkera-studio.com"],
  formats: ["image/webp", "image/avif"],
};

// Configuration des headers pour le SEO et la sécurité
export const headers = [
  {
    source: "/:path*",
    headers: [
      {
        key: "X-Robots-Tag",
        value: "index, follow",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
      {
        key: "Referrer-Policy",
        value: "origin-when-cross-origin",
      },
    ],
  },
];

// Optimisation pour les moteurs de recherche
export const generateStaticParams = async () => {
  return [
    { slug: "/" },
    { slug: "solutions" },
    { slug: "tarification" },
    { slug: "a-propos-de-inkera" },
  ];
};
