import Footer from "@/components/Shared/Footer/Footer";
// import Header from "@/components/Shared/Header";

export default async function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "INKERA Studio",
    alternateName: ["InkEra Studio", "Inkera"],
    url: "https://inkera-studio.com",
    logo: "https://inkera-studio.com/images/Logo13.png",
    description:
      "Plateforme de gestion complète pour studios de tatouage et artistes tatoueurs professionnels",
    foundingDate: "2024",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+33-1-23-45-67-89",
      contactType: "customer service",
      areaServed: "FR",
      availableLanguage: "French",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "FR",
      addressRegion: "France",
    },
    sameAs: [
      "https://www.instagram.com/inkera.studio",
      "https://www.linkedin.com/company/inkera-studio",
      "https://twitter.com/inkera_studio",
    ],
    areaServed: {
      "@type": "Country",
      name: "France",
    },
    knowsAbout: [
      "Gestion de salon de tatouage",
      "Logiciel pour tatoueurs",
      "Planning rendez-vous tatouage",
      "Portfolio tatouage en ligne",
      "CRM pour studios de tatouage",
      "Réservation tatouage en ligne",
    ],
    offers: {
      "@type": "Offer",
      description: "Solutions de gestion pour salons de tatouage",
      itemOffered: {
        "@type": "SoftwareApplication",
        name: "INKERA Studio Platform",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <div>
        {/* <div className="absolute top-0 left-0 w-full h-screen">
          <Header />
        </div> */}
        {children}
        <Footer />
      </div>
    </>
  );
}
