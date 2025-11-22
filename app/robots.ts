import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/mes-rendez-vous/",
          "/mon-compte/",
          "/parametres/",
          "/nouveau-creneau/",
          "/suivi/",
          "/meeting/",
          "/reset-password/",
          "/verifier-email/",
          "/_next/",
          "/static/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/mes-rendez-vous/",
          "/mon-compte/",
          "/parametres/",
          "/nouveau-creneau/",
          "/suivi/",
          "/meeting/",
          "/reset-password/",
          "/verifier-email/",
        ],
      },
    ],
    sitemap: "https://inkera-studio.com/sitemap.xml",
  };
}
