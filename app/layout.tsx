import type { Metadata } from "next";
import { Didact_Gothic, Exo_2, Montserrat_Alternates } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/Shared/Sonner";
import ModalManager from "@/components/Shared/ModalManager";

export const dynamic = "force-dynamic";

// import Header from "@/components/Shared/Header";

// const geistSans = Didact_Gothic({
//   variable: "--font-didact-gothic",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-didact-gothic",
//   subsets: ["latin"],
// });

const didact_gothic = Didact_Gothic({
  weight: ["400"],
  style: ["normal"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-one",
});

const exo_2 = Exo_2({
  weight: ["400"],
  style: ["normal"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-two",
});

const montserrat_alternates = Montserrat_Alternates({
  weight: ["400"],
  style: ["normal"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-three",
});

export const metadata: Metadata = {
  title: {
    default: "INKERA Studio - Plateforme de Gestion pour Salons de Tatouage",
    template: "%s | INKERA Studio",
  },
  description:
    "Plateforme tout-en-un pour studios de tatouage : gestion rendez-vous, portfolio en ligne, suivi client, planning tatoueur. Essai gratuit 30 jours. ✨ Créé par des passionnés pour les professionnels.",
  keywords: [
    "logiciel salon tatouage",
    "gestion studio tattoo",
    "rendez-vous tatoueur",
    "planning tatouage",
    "portfolio tatoueur en ligne",
    "CRM salon tatouage",
    "plateforme tatoueur",
    "réservation tatouage en ligne",
    "gestion clientèle tatouage",
    "logiciel pour tatoueurs",
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
      "fr-FR": "/fr",
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://inkera-studio.com",
    siteName: "INKERA Studio",
    title: "INKERA Studio - Plateforme de Gestion pour Salons de Tatouage",
    description:
      "Plateforme tout-en-un pour studios de tatouage : gestion rendez-vous, portfolio, suivi client. Essai gratuit 30 jours.",
    images: [
      {
        url: "https://inkera-studio.com/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "INKERA Studio - Gestion salon tatouage",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "INKERA Studio - Gestion pour Salons de Tatouage",
    description:
      "Plateforme complète pour tatoueurs : rendez-vous, portfolio, clients. Essai gratuit 30j.",
    images: ["https://inkera-studio.com/images/twitter-default.jpg"],
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
    // yandex: 'verification-code-here',
    // yahoo: 'verification-code-here',
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,viewport-fit=cover"
        />
        <link rel="canonical" href="https://inkera-studio.com" />
        <meta name="theme-color" content="#1a1a1a" />
        <meta name="msapplication-TileColor" content="#1a1a1a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="INKERA Studio" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="INKERA Studio" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${didact_gothic.variable} ${exo_2.variable} ${montserrat_alternates.variable} antialiased relative`}
      >
        <Toaster />
        <ModalManager />

        {/* <div className="absolute top-0 left-0 w-full h-screen">
          <Header />
        </div> */}
        {children}
      </body>
    </html>
  );
}
