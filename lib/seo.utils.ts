import { Metadata } from "next";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
}

export function generateSEOMetadata({
  title,
  description,
  path,
  keywords = [],
  image = "/images/og-default.jpg",
  type = "website",
  publishedTime,
  modifiedTime,
}: SEOProps): Metadata {
  const url = `https://inkera-studio.com${path}`;
  const fullTitle = title.includes("INKERA Studio")
    ? title
    : `${title} | INKERA Studio`;

  return {
    title: fullTitle,
    description,
    keywords: [
      ...keywords,
      "logiciel salon tatouage",
      "gestion studio tattoo",
      "plateforme tatoueur",
      "INKERA Studio",
    ],
    authors: [{ name: "INKERA Studio", url: "https://inkera-studio.com" }],
    creator: "INKERA Studio",
    publisher: "InTheGleam",
    metadataBase: new URL("https://inkera-studio.com"),
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: "INKERA Studio",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "fr_FR",
      type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
      creator: "@inkera_studio",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

// Métadonnées par défaut pour les pages communes
export const defaultKeywords = [
  "logiciel salon tatouage",
  "gestion studio tattoo",
  "rendez-vous tatoueur",
  "planning tatouage",
  "portfolio tatoueur",
  "CRM salon tatouage",
  "plateforme tatoueur",
  "réservation tatouage",
  "gestion clientèle tatouage",
];

// Templates de métadonnées pour différents types de pages
export const seoTemplates = {
  landing: {
    solutions: {
      title: "Solutions de Gestion pour Studios de Tatouage",
      description:
        "Découvrez nos solutions complètes pour gérer votre salon de tatouage : gestion des rendez-vous, portfolio en ligne, suivi client et bien plus.",
      keywords: ["solutions tatouage", "gestion salon", "outils tatoueur"],
    },
    tarification: {
      title: "Tarifs INKERA Studio | Plans Abonnement Salon Tatouage",
      description:
        "Découvrez nos tarifs transparents pour la gestion de votre salon de tatouage. Plan Gratuit, Pro à 29€/mois, Business à 69€/mois.",
      keywords: ["prix logiciel tatouage", "tarif gestion salon", "abonnement"],
    },
    about: {
      title: "À Propos de INKERA Studio | Innovation pour Studios de Tatouage",
      description:
        "Découvrez INKERA Studio : notre mission de révolutionner la gestion des salons de tatouage avec des outils innovants.",
      keywords: ["à propos INKERA", "mission tatouage", "équipe"],
    },
  },
};

// Fonction pour générer le schema JSON-LD
export function generateJSONLD(data: Record<string, unknown>) {
  return {
    __html: JSON.stringify(data),
  };
}

// Schema par défaut pour l'organisation
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "INKERA Studio",
  url: "https://inkera-studio.com",
  logo: "https://inkera-studio.com/images/Logo13.png",
  description:
    "Plateforme de gestion complète pour studios de tatouage et artistes tatoueurs professionnels",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    areaServed: "FR",
    availableLanguage: "French",
  },
  areaServed: {
    "@type": "Country",
    name: "France",
  },
  sameAs: [
    "https://www.instagram.com/inkera.studio",
    "https://www.linkedin.com/company/inkera-studio",
  ],
};
