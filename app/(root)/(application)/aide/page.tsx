import type { Metadata } from "next";
import HelpCenter from "@/components/Help/HelpCenter";

export const metadata: Metadata = {
  title: "Aide et guide d’utilisation | Inkera Studio",
  description: "Le guide de votre espace professionnel : rendez-vous, clients, stocks, portfolio, dessins, messagerie, équipe et paramètres.",
  robots: { index: false, follow: false },
};

export default function HelpPage() {
  return <HelpCenter />;
}
