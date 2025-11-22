import HeroSection from "@/components/Home/HeroSection";
import Section2 from "@/components/Home/Section2";
import Section3 from "@/components/Home/Section3";
import Section4 from "@/components/Home/Section4";
import Section5 from "@/components/Home/Section5";
import Section6 from "@/components/Home/Section6";
import Footer from "@/components/Shared/Footer/Footer";
import Header from "@/components/Shared/Header";
import type { Metadata } from "next";
import Script from "next/script";
// import Image from "next/image";

export const metadata: Metadata = {
  title:
    "INKERA Studio - Plateforme de Gestion pour Studios de Tatouage | Logiciel Professionnel",
  description:
    "🏆 Plateforme #1 pour la gestion de salons de tatouage en France. Rendez-vous, portfolio, clients, stock - tout en un..",
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
    title: "INKERA Studio - Plateforme #1 Studios Tatouage",
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
        foundingDate: "2024",
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
              price: "29",
              priceCurrency: "EUR",
              description: "Fonctionnalités avancées pour professionnels",
            },
            {
              "@type": "Offer",
              name: "Plan Business",
              price: "69",
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
    <>
      <Script
        id="schema-homepage"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="fixed top-0 left-0 w-full z-[9999]">
        <Header />
      </div>
      <div
        className="hidden lg:flex h-screen w-full bg-cover bg-center items-center justify-center"
        style={{
          backgroundImage: "url('/images/bv.png')",
          backgroundSize: "cover",
        }}
      >
        <HeroSection />
      </div>

      <div
        className="lg:hidden h-screen w-full bg-cover bg-center flex items-center justify-center relative"
        style={{
          backgroundImage: "url('/images/bvp.png')",
          backgroundSize: "cover",
          backgroundPosition: "right center", // Décale l'image vers la droite
        }}
      >
        {/* Overlay semi-transparent */}
        <div className="absolute inset-0 bg-noir-700/80"></div>

        {/* Contenu par-dessus l'overlay */}
        <div className="relative z-10">
          <HeroSection />
        </div>
      </div>
      {/* <div className="relative w-full h-screen sm:hidden">
        <Image
          src="/images/bvp.png"
          alt="Background"
          fill
          className="object-cover sm:hidden w-full"
          style={{
            objectPosition: "right center", // Décale l'image vers la droite
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <HeroSection />
        </div>
      </div> */}
      <Section2 />
      <Section3 />
      <Section4 />
      <Section5 />
      <Section6 />
      <Footer />
    </>
  );
}
