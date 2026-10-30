import HeroSection from "@/components/Home/HeroSection";
import HomeSections from "@/components/Home/HomeSections";
import s from "@/components/Home/Home.module.css";
import Footer from "@/components/Shared/Footer/Footer";
import Header from "@/components/Shared/Header";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title:
    "INKERA Studio - Plateforme de Gestion pour Studios de Tatouage et Tatoueurs Indépendants | Logiciel Professionnel & Vitrine en ligne",
  description:
    "🏆 Plateforme pour la gestion de salons de tatouage et tatoueurs indépendants en France. Vitrine en ligne, rendez-vous, portfolio, clients, stock - tout en un..",
  keywords: [
    "logiciel salon tatouage",
    "gestion studio tattoo",
    "plateforme tatoueur professionnel",
    "rendez-vous tatouage en ligne",
    "CRM salon tatouage",
    "planning tatoueur",
    "portfolio tatouage",
    "réservation tattoo",
    "gestion clientèle tatouage",
    "logiciel pour tatoueurs",
    "studio management tattoo",
    "INKERA Studio",
    "vitrine en ligne tatouage",
    "gestion stock tatouage",
    "suivi client salon tatouage",
    "fiche client tatouage",
    "gestion rendez-vous tatouage",
    "logiciel de gestion pour tatoueurs",
    "fiche de consentement tatouage",
    "gestion des artistes tatoueurs",
    "gestion des clients salon tatouage",
    "gestion des rendez-vous en ligne pour tatoueurs",
    "logiciel de gestion de salon de tatouage",
    "vitrine en ligne pour tatoueurs indépendants",
  ],
  authors: [{ name: "INKERA Studio", url: "https://inkera-studio.com" }],
  creator: "INKERA Studio",
  publisher: "InTheGleam",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://inkera-studio.com"),
  alternates: {
    canonical: "/",
    languages: {
      "fr-FR": "/",
    },
  },
  openGraph: {
    title: "INKERA Studio - Plateforme #1 pour Studios de Tatouage",
    description:
      "Gérez votre salon de tatouage comme un pro : rendez-vous, clients, portfolio, stock.",
    url: "https://inkera-studio.com",
    siteName: "INKERA Studio",
    images: [
      {
        url: "https://inkera-studio.com/images/og-homepage.jpg",
        width: 1200,
        height: 630,
        alt: "INKERA Studio - Gestion complète pour salons de tatouage",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "INKERA Studio - Solution Studios Tatouage",
    description: "Gérez votre salon comme un pro : RDV, clients, portfolio.",
    images: ["https://inkera-studio.com/images/twitter-homepage.jpg"],
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
  verification: {
    google: "verification-code-here",
  },
  category: "technology",
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://inkera-studio.com/#organization",
        name: "INKERA Studio",
        alternateName: ["InkEra Studio", "Inkera"],
        url: "https://inkera-studio.com",
        logo: {
          "@type": "ImageObject",
          url: "https://inkera-studio.com/images/Logo13.png",
          width: 200,
          height: 200,
        },
        description:
          "Plateforme de gestion complète pour studios de tatouage et artistes tatoueurs professionnels en France",
        foundingDate: "2026",
        slogan: "Votre partenaire tatouage pour une gestion professionnelle",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          areaServed: "FR",
          availableLanguage: ["French"],
        },
        areaServed: {
          "@type": "Country",
          name: "France",
        },
        sameAs: [
          "https://www.instagram.com/inkera.studio",
          "https://www.linkedin.com/company/inkera-studio",
          "https://twitter.com/inkera_studio",
        ],
        knowsAbout: [
          "Gestion de salon de tatouage",
          "Logiciel pour tatoueurs",
          "Planning rendez-vous tatouage",
          "Portfolio tatouage en ligne",
          "CRM pour studios de tatouage",
          "Réservation tatouage en ligne",
          "Gestion des stocks tatouage",
          "Suivi clientèle salon",
          "Fiche client tatouage",
          "Fiche de consentement tatouage",
          "Gestion des artistes tatoueurs",
          "Vitrine en ligne pour tatoueurs indépendants",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://inkera-studio.com/#website",
        url: "https://inkera-studio.com",
        name: "INKERA Studio",
        description: "Plateforme de gestion pour studios de tatouage",
        publisher: {
          "@id": "https://inkera-studio.com/#organization",
        },
        inLanguage: "fr-FR",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://inkera-studio.com/recherche?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "WebPage",
        "@id": "https://inkera-studio.com/#webpage",
        url: "https://inkera-studio.com",
        name: "INKERA Studio - Plateforme de Gestion pour Studios de Tatouage",
        isPartOf: {
          "@id": "https://inkera-studio.com/#website",
        },
        about: {
          "@id": "https://inkera-studio.com/#organization",
        },
        description:
          "Plateforme tout-en-un pour la gestion professionnelle de votre salon de tatouage : rendez-vous, clients, portfolio, stock.",
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Accueil",
              item: "https://inkera-studio.com",
            },
          ],
        },
        mainEntity: {
          "@type": "SoftwareApplication",
          name: "INKERA Studio Platform",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description: "Solution complète de gestion pour salons de tatouage",
          offers: [
            {
              "@type": "Offer",
              name: "Plan Gratuit",
              price: "0",
              priceCurrency: "EUR",
              description: "Fonctionnalités de base pour débuter",
            },
            {
              "@type": "Offer",
              name: "Plan Pro",
              price: "29.99",
              priceCurrency: "EUR",
              description: "Fonctionnalités avancées pour professionnels",
            },
            {
              "@type": "Offer",
              name: "Plan Business",
              price: "59.99",
              priceCurrency: "EUR",
              description: "Solution complète pour studios",
            },
          ],
          featureList: [
            "Gestion des rendez-vous",
            "Portfolio en ligne professionnel",
            "Suivi client avancé",
            "Gestion des stocks",
            "Notifications automatiques",
            "Planning multi-tatoueurs",
            "Facturation intégrée",
            "Statistiques détaillées",
            "Support client dédié",
            "Vitrine en ligne pour attirer de nouveaux clients",
            "Fiche de consentement numérique",
          ],
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            reviewCount: "127",
            bestRating: "5",
            worstRating: "1",
          },
        },
      },
    ],
  };

  return (
    <div className={s.page}>
      <Script id="schema-homepage" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="fixed top-0 left-0 z-50 w-full"><Header /></div>
      <main>
        <HeroSection />
        <HomeSections />
      </main>
      <Footer />
    </div>
  );
}
