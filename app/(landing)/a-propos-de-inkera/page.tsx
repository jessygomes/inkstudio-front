import Image from "next/image";
import {
  FaArrowDown,
  FaRocket,
  FaUsers,
  FaLightbulb,
  FaShieldAlt,
  FaHeart,
  FaChartLine,
  FaHandshake,
} from "react-icons/fa";
import type { Metadata } from "next";
import Header from "@/components/Shared/Header";
import Script from "next/script";

export const metadata: Metadata = {
  title: "À Propos de INKERA Studio | Innovation pour Salons de Tatouage",
  description:
    "Découvrez INKERA Studio : notre mission de révolutionner la gestion des salons de tatouage avec des outils innovants. Créé par des passionnés pour les artistes tatoueurs professionnels.",
  keywords: [
    "à propos INKERA Studio",
    "mission tatouage",
    "équipe INKERA",
    "histoire plateforme tatouage",
    "innovation tatoueurs",
    "startup tatouage",
    "technologie salon tattoo",
    "vision INKERA",
  ],
  authors: [{ name: "INKERA Studio" }],
  creator: "INKERA Studio",
  publisher: "InTheGleam",
  metadataBase: new URL("https://inkera-studio.com"),
  alternates: {
    canonical: "/a-propos-de-inkera",
  },
  openGraph: {
    title: "À Propos de INKERA Studio | Innovation pour Studios de Tatouage",
    description:
      "Notre mission : révolutionner la gestion des salons de tatouage avec des outils innovants créés par et pour les professionnels du tatouage.",
    url: "https://inkera-studio.com/a-propos-de-inkera",
    siteName: "INKERA Studio",
    images: [
      {
        url: "https://inkera-studio.com/images/og-about.jpg",
        width: 1200,
        height: 630,
        alt: "Équipe INKERA Studio - Innovation pour salons de tatouage",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "À Propos de INKERA Studio",
    description:
      "Innovation et passion au service des studios de tatouage. Découvrez notre mission et notre équipe.",
    images: ["https://inkera-studio.com/images/twitter-about.jpg"],
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

const heroMosaicPhotos = [
  "/photo/aakaaaaaa.jpg",
  "/photo/AI Art.jpg",
  "/photo/Instagram.jpg",
  "/photo/Luka Sabbat.jpg",
  "/photo/téléchargement (3).jpg",
  "/photo/téléchargement (4).jpg",
  "/photo/téléchargement (5).jpg",
  "/photo/téléchargement (10).jpg",
  "/photo/téléchargement (12).jpg",
];

const missionPillars = [
  {
    icon: <FaLightbulb size={22} className="text-tertiary-400" />,
    title: "Innovation utile",
    description:
      "Des outils pensés pour le quotidien d'un studio, pas des features gadgets.",
  },
  {
    icon: <FaUsers size={22} className="text-tertiary-400" />,
    title: "Communauté d'abord",
    description:
      "Une plateforme co-construite avec des artistes tatoueurs et leurs retours terrain.",
  },
  {
    icon: <FaShieldAlt size={22} className="text-tertiary-400" />,
    title: "Fiabilité et sécurité",
    description:
      "Des standards élevés de protection, de stabilité et de qualité de service.",
  },
];

const values = [
  {
    icon: <FaHeart size={22} className="text-tertiary-400" />,
    title: "Passion",
    description:
      "Nous partageons la culture tattoo et respectons la singularité de chaque artiste.",
  },
  {
    icon: <FaHandshake size={22} className="text-tertiary-400" />,
    title: "Transparence",
    description:
      "Communication claire, roadmap lisible et relation honnête avec nos utilisateurs.",
  },
  {
    icon: <FaUsers size={22} className="text-tertiary-400" />,
    title: "Écoute active",
    description:
      "Chaque amélioration part de besoins observés dans les studios partenaires.",
  },
  {
    icon: <FaChartLine size={22} className="text-tertiary-400" />,
    title: "Excellence continue",
    description:
      "Nous améliorons en permanence la plateforme pour garder une vraie avance.",
  },
];

export default function AproposPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "À Propos de INKERA Studio",
    description:
      "Découvrez INKERA Studio, notre mission et notre équipe dédiée à l'innovation dans la gestion des salons de tatouage",
    url: "https://inkera-studio.com/a-propos-de-inkera",
    mainEntity: {
      "@type": "Organization",
      name: "INKERA Studio",
      foundingDate: "2024",
      description: "Plateforme innovante pour la gestion des studios de tatouage",
      url: "https://inkera-studio.com",
      logo: "https://inkera-studio.com/images/Logo13.png",
      sameAs: [
        "https://www.instagram.com/inkera.studio",
        "https://www.linkedin.com/company/inkera-studio",
      ],
      founder: {
        "@type": "Person",
        name: "InTheGleam Team",
      },
      areaServed: {
        "@type": "Country",
        name: "France",
      },
      knowsAbout: [
        "Gestion de salon de tatouage",
        "Logiciel pour tatoueurs",
        "Planning rendez-vous tatouage",
        "Portfolio tatouage en ligne",
      ],
    },
  };

  return (
    <>
      <Script
        id="schema-aboutpage"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="fixed left-0 top-0 z-50 w-full backdrop-blur-2xl bg-noir-700">
        <Header />
      </div>

      <div className="min-h-screen bg-noir-700">
        <section className="relative isolate mt-[3.80rem] min-h-[calc(100vh-4.25rem)] overflow-hidden bg-noir-700 lg:mt-[5.25rem] lg:min-h-[calc(100vh-5.25rem)]">
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-2 p-2">
            {heroMosaicPhotos.map((photo, index) => (
              <div key={`${photo}-${index}`} className="relative overflow-hidden rounded-xl">
                <Image
                  src={photo}
                  alt={`Inspiration tatouage ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 33vw"
                  priority={index < 3}
                />
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-noir-700/70 to-noir-700/85" />

          <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4.75rem)] w-full max-w-7xl items-center px-4 py-10 text-center lg:min-h-[calc(100vh-5.25rem)] lg:px-8">
            <div className="mx-auto max-w-4xl space-y-6">
              <h1 className="text-2xl font-bold uppercase leading-tight tracking-widest text-white font-two sm:text-3xl lg:text-4xl">
                <span className="block bg-gradient-to-r from-tertiary-400 to-tertiary-500 bg-clip-text text-transparent">
                  Notre vision
                </span>
                <span className="block">et notre mission</span>
              </h1>

              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/80 font-one sm:text-xl">
                Découvrez l&apos;histoire et la philosophie derrière cette
                plateforme dédiée à la
                <span className="text-tertiary-400 font-semibold">
                  {" "}communauté du tatouage
                </span>
                .
              </p>

              <div className="mt-8 flex flex-col items-center gap-4">
                <div className="text-md text-white/60 font-one">
                  Découvrez notre histoire
                </div>
                <FaArrowDown size={24} className="animate-bounce text-tertiary-400" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto w-full max-w-7xl space-y-14 px-4 sm:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-tertiary-400/25 bg-tertiary-500/10 px-4 py-2">
                  <FaRocket size={15} className="text-tertiary-400" />
                  <span className="text-sm font-semibold text-tertiary-400 font-one">
                    Notre mission
                  </span>
                </div>

                <h2 className="text-3xl font-bold uppercase leading-tight text-white font-two sm:text-4xl lg:text-5xl">
                  Simplifier la gestion,
                  <br />
                  <span
                    style={{
                      background: "linear-gradient(90deg, #ff9d00, #ff4d41)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    amplifier votre art
                  </span>
                </h2>

                <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/72 font-one sm:text-lg">
                  Démocratiser l&apos;accès aux outils de gestion professionnels
                  pour tous les artistes tatoueurs, des indépendants aux studios
                  multi-artistes, avec une solution complète, intuitive et
                  abordable.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-2.5">
                  <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs text-white/80 font-one">
                    Pensé pour les studios
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs text-white/80 font-one">
                    Fluide au quotidien
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs text-white/80 font-one">
                    Évolutif par design
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="group relative mx-auto max-w-xl">


                  <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-noir-800/60 p-3 backdrop-blur-sm">
                    <div className="grid grid-cols-2 gap-2 rounded-2xl">
                      {[
                        "/photo/girls night out.jpg",
                        "/photo/s e n s i t i v e 不同.jpg",
                        "/photo/téléchargement (25).jpg",
                        "/photo/téléchargement (4).jpg",
                      ].map((photo, index) => (
                        <div
                          key={`mini-${index}`}
                          className="relative aspect-square overflow-hidden rounded-xl"
                        >
                          <Image
                            src={photo}
                            alt={`INKERA studio ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-center">
                <p className="text-xl font-bold text-white font-two">2026</p>
                <p className="text-[11px] text-white/55 font-one">Lancement</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-center">
                <p className="text-xl font-bold text-white font-two">100%</p>
                <p className="text-[11px] text-white/55 font-one">Focus tattoo</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-center">
                <p className="text-xl font-bold text-white font-two">FR</p>
                <p className="text-[11px] text-white/55 font-one">Marché initial</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-center">
                <p className="text-xl font-bold text-white font-two">SaaS</p>
                <p className="text-[11px] text-white/55 font-one">Solution métier</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {missionPillars.map((pillar, index) => (
                <article
                  key={index}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-noir-600/35 to-noir-800/30 p-5 transition-all duration-300 hover:border-tertiary-400/30 hover:bg-noir-600/45"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-tertiary-400/6 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative z-10 flex items-start gap-3">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-tertiary-400/20 bg-tertiary-500/15">
                      {pillar.icon}
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-semibold text-white font-two group-hover:text-tertiary-300">
                        {pillar.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-white/62 font-one group-hover:text-white/78">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-noir-600/40 to-noir-800/35 p-6 sm:p-8">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-white font-two">Nos Valeurs</h2>
                <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-white/72 font-one sm:text-lg">
                  Les principes qui guident nos décisions produit et notre
                  relation avec la communauté des tatoueurs.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {values.map((value, index) => (
                  <article
                    key={index}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:border-tertiary-400/30 hover:bg-white/10"
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-tertiary-400/6 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative z-10">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-tertiary-400/20 bg-tertiary-500/15">
                        {value.icon}
                      </div>
                      <h3 className="mb-2 text-base font-semibold text-white font-two group-hover:text-tertiary-300">
                        {value.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-white/62 font-one group-hover:text-white/78">
                        {value.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-tertiary-400/20 bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/15 p-8 sm:p-12">
              <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left">
                  <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-tertiary-500/30 to-tertiary-600/30">
                    <FaRocket size={34} className="text-tertiary-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white font-two">Notre Engagement</h2>
                    <p className="mt-2 text-base leading-relaxed text-white/80 font-one sm:text-lg">
                      Faire évoluer INKERA Studio en continu pour rester la
                      solution de référence des professionnels du tatouage.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/6 p-6">
                    <h3 className="mb-3 text-base font-semibold text-white font-two">
                      Développement continu
                    </h3>
                    <ul className="space-y-2 text-sm text-white/78 font-one">
                      <li>• Améliorations basées sur vos retours</li>
                      <li>• Veille technologique permanente</li>
                    </ul>
                  </div>

                  <div className="rounded-2xl bg-white/6 p-6">
                    <h3 className="mb-3 text-base font-semibold text-white font-two">
                      Support premium
                    </h3>
                    <ul className="space-y-2 text-sm text-white/78 font-one">
                      <li>• Formation gratuite à l&apos;utilisation</li>
                      <li>• Support technique réactif</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-white/6 p-6 text-center">
                  <h3 className="mb-3 text-base font-semibold text-tertiary-400 font-two">
                    Rejoignez l&apos;aventure
                  </h3>
                  <p className="mb-6 text-sm leading-relaxed text-white/80 font-one sm:text-base">
                    Vous partagez notre vision ? Parlons de votre studio et de
                    vos objectifs pour construire ensemble la meilleure
                    expérience métier.
                  </p>
                  <a
                    href="/contactez-nous"
                    className="inline-flex rounded-3xl bg-gradient-to-r from-tertiary-400 to-tertiary-500 px-6 py-2 font-semibold text-white transition-all duration-300 hover:from-tertiary-500 hover:to-tertiary-600 font-one"
                  >
                    Nous contacter
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
