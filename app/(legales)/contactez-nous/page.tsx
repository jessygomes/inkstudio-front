import React from "react";
import {
  FaEnvelope,
  // FaPhone,
  FaClock,
  FaHeadset,
  FaQuestionCircle,
  FaHandshake,
  FaLifeRing,
} from "react-icons/fa";
import type { Metadata } from "next";
import Header from "@/components/Shared/Header";
import Footer from "@/components/Shared/Footer/Footer";

export const metadata: Metadata = {
  title: "Contactez-nous | InkStudio",
  description:
    "Contactez l'équipe InkStudio pour toute question, support technique ou demande commerciale. Plusieurs moyens de contact disponibles pour vous accompagner dans l'utilisation de notre plateforme.",
  keywords: [
    "contact InkStudio",
    "support technique",
    "service client",
    "aide tatoueurs",
    "assistance plateforme",
  ],
};

export default function ContactezNous() {
  return (
    <>
      <div className="fixed backdrop-blur-2xl top-0 left-0 w-full z-50">
        <Header />
      </div>
      <div className="min-h-screen bg-gradient-to-b from-noir-700 to-noir-700">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-noir-700 to-noir-800 py-20 sm:pt-28 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-tertiary-400/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-tertiary-500/3 rounded-full blur-3xl"></div>

          <div className="container mx-auto px-4 sm:px-8 max-w-4xl relative z-10">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-tertiary-500/10 border border-tertiary-400/20 rounded-full px-4 py-2 mb-6">
                <FaHeadset size={16} className="text-tertiary-400" />
                <span className="text-tertiary-400 font-one text-sm font-semibold">
                  Support & Contact
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-two uppercase text-white font-bold leading-tight mb-6">
                <span
                  style={{
                    background: "linear-gradient(90deg, #ff9d00, #ff4d41)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Contactez-nous
                </span>
              </h1>

              <div className="w-24 h-1 bg-gradient-to-r from-tertiary-400 to-tertiary-500 rounded-full mx-auto mb-8"></div>

              <p className="text-xl text-white/70 font-one leading-relaxed max-w-3xl mx-auto">
                Notre équipe est à votre disposition pour vous accompagner dans
                l&apos;utilisation d&apos;{" "}
                <span className="text-tertiary-400 font-semibold">
                  Inkera Studio
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* Contenu principal */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
            <div className="space-y-12">
              {/* Moyens de contact principaux */}
              {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> */}
              {/* Email */}
              {/* <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20 hover:border-tertiary-400/40 transition-all duration-300 hover:transform hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                    <FaEnvelope size={24} className="text-tertiary-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white font-two">
                    Email
                  </h3>
                </div>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <div className="bg-white/5 rounded-2xl p-4">
                    <h4 className="font-semibold text-white mb-2">
                      Support général
                    </h4>
                    <p className="text-sm">contact@inkstudio.fr</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4">
                    <h4 className="font-semibold text-white mb-2">
                      Support technique
                    </h4>
                    <p className="text-sm">support@inkstudio.fr</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4">
                    <h4 className="font-semibold text-white mb-2">
                      Commercial
                    </h4>
                    <p className="text-sm">commercial@inkstudio.fr</p>
                  </div>
                </div>
              </div> */}

              {/* Téléphone */}
              {/* <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-tertiary-400/20 transition-all duration-300 hover:transform hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                    <FaPhone size={24} className="text-tertiary-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white font-two">
                    Téléphone
                  </h3>
                </div>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <div className="bg-white/5 rounded-2xl p-4">
                    <h4 className="font-semibold text-white mb-2">
                      Support client
                    </h4>
                    <p className="text-sm">+33 1 23 45 67 89</p>
                    <p className="text-xs text-white/60 mt-1">Lun-Ven 9h-18h</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4">
                    <h4 className="font-semibold text-white mb-2">
                      Urgences techniques
                    </h4>
                    <p className="text-sm">+33 1 23 45 67 90</p>
                    <p className="text-xs text-white/60 mt-1">24h/24 - 7j/7</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4">
                    <h4 className="font-semibold text-white mb-2">
                      Équipe commerciale
                    </h4>
                    <p className="text-sm">+33 1 23 45 67 91</p>
                    <p className="text-xs text-white/60 mt-1">Lun-Ven 9h-19h</p>
                  </div>
                </div>
              </div> */}

              {/* Adresse */}
              {/* <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-tertiary-400/20 transition-all duration-300 hover:transform hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                    <FaMapMarkerAlt size={24} className="text-tertiary-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white font-two">
                    Siège social
                  </h3>
                </div>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <div className="bg-white/5 rounded-2xl p-4">
                    <h4 className="font-semibold text-white mb-2">
                      InkStudio SAS
                    </h4>
                    <p className="text-sm">
                      123 Rue de l&apos;Innovation
                      <br />
                      75001 Paris
                      <br />
                      France
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4">
                    <h4 className="font-semibold text-white mb-2">Accès</h4>
                    <p className="text-sm">
                      Métro : Châtelet-Les Halles
                      <br />
                      RER : A, B, D<br />
                      Bus : 21, 67, 74, 85
                    </p>
                  </div>
                </div>
              </div>
            </div> */}

              {/* Formulaire de contact */}
              <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                    <FaEnvelope size={24} className="text-tertiary-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-two">
                    Moyens de contact
                  </h2>
                </div>

                <div className="space-y-6 text-white/80 font-one leading-relaxed">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-tertiary-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <FaLifeRing className="w-4 h-4 text-tertiary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        Support technique
                      </h3>
                      <a
                        href="mailto:contact@inkera-studio.com"
                        className="text-tertiary-400 hover:text-tertiary-300 transition-colors font-semibold underline"
                      >
                        contact@inkera-studio.com
                      </a>
                      <p className="text-sm text-white/60 mt-1">
                        Pour les problèmes techniques
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-tertiary-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <FaHandshake className="w-4 h-4 text-tertiary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        Partenariats
                      </h3>
                      <a
                        href="mailto:contact@inkera-studio.com"
                        className="text-tertiary-400 hover:text-tertiary-300 transition-colors font-semibold underline"
                      >
                        contact@inkera-studio.com
                      </a>
                      <p className="text-sm text-white/60 mt-1">
                        Collaborations et partenariats
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Horaires d'ouverture */}
              <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                    <FaClock size={24} className="text-tertiary-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-two">
                    Horaires de disponibilité
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-2xl p-6">
                    <h3 className="font-semibold text-white mb-4">
                      Support général
                    </h3>
                    <div className="space-y-2 text-sm text-white/80">
                      <div className="flex justify-between">
                        <span>Lundi - Vendredi</span>
                        <span>9h00 - 18h00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Samedi</span>
                        <span>10h00 - 16h00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dimanche</span>
                        <span>Fermé</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-6">
                    <h3 className="font-semibold text-white mb-4">
                      Support technique
                    </h3>
                    <div className="space-y-2 text-sm text-white/80">
                      <div className="flex justify-between">
                        <span>Urgences critiques</span>
                        <span>24h/24</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Support standard</span>
                        <span>8h00 - 20h00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Weekend</span>
                        <span>10h00 - 18h00</span>
                      </div>
                    </div>
                  </div>

                  {/* <div className="bg-white/5 rounded-2xl p-6">
                    <h3 className="font-semibold text-white mb-4">
                      Équipe commerciale
                    </h3>
                    <div className="space-y-2 text-sm text-white/80">
                      <div className="flex justify-between">
                        <span>Lundi - Vendredi</span>
                        <span>9h00 - 19h00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Samedi</span>
                        <span>Sur rendez-vous</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dimanche</span>
                        <span>Fermé</span>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>

              {/* Types de demandes */}
              <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                    <FaQuestionCircle size={24} className="text-tertiary-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-two">
                    Types de demandes
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Support technique
                      </h3>
                      <ul className="space-y-2 text-sm text-white/80">
                        <li>• Problèmes de connexion</li>
                        <li>• Bugs et dysfonctionnements</li>
                        <li>• Questions sur les fonctionnalités</li>
                        <li>• Aide à la configuration</li>
                        <li>• Formation à l&apos;utilisation</li>
                      </ul>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Questions commerciales
                      </h3>
                      <ul className="space-y-2 text-sm text-white/80">
                        <li>• Présentation des offres</li>
                        <li>• Devis personnalisé</li>
                        <li>• Conditions tarifaires</li>
                        <li>• Partenariats</li>
                        <li>• Démonstration produit</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Gestion de compte
                      </h3>
                      <ul className="space-y-2 text-sm text-white/80">
                        <li>• Modification d&apos;informations</li>
                        <li>• Problèmes de facturation</li>
                        <li>• Résiliation ou suspension</li>
                        <li>• Récupération de données</li>
                        <li>• Questions RGPD</li>
                      </ul>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Questions juridiques
                      </h3>
                      <ul className="space-y-2 text-sm text-white/80">
                        <li>• Conditions d&apos;utilisation</li>
                        <li>• Protection des données</li>
                        <li>• Propriété intellectuelle</li>
                        <li>• Conformité réglementaire</li>
                        <li>• Litiges et réclamations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Temps de réponse */}
              {/* <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white font-two mb-6">
                  Temps de réponse
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/5 rounded-2xl p-6 text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaEnvelope size={20} className="text-green-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">Email</h3>
                    <p className="text-white/70 text-sm">
                      Réponse sous 24h ouvrées
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-6 text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaPhone size={20} className="text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">Téléphone</h3>
                    <p className="text-white/70 text-sm">
                      Réponse immédiate aux heures d&apos;ouverture
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-6 text-center">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaHeadset size={20} className="text-red-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">Urgences</h3>
                    <p className="text-white/70 text-sm">
                      Support 24/7 pour les incidents critiques
                    </p>
                  </div>
                </div>
              </div> */}

              {/* FAQ rapide */}
              {/* <div className="text-center py-8">
                <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20 max-w-3xl mx-auto">
                  <h3 className="text-xl font-bold text-white font-two mb-4">
                    Besoin d&apos;une aide immédiate ?
                  </h3>
                  <p className="text-white/80 font-one leading-relaxed mb-6">
                    Consultez notre centre d&apos;aide en ligne pour trouver des
                    réponses rapides aux questions les plus fréquentes et
                    accéder à nos guides d&apos;utilisation.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="/faq"
                      className="bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white font-one font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Consulter la FAQ
                    </a>
                    <a
                      href="/guides"
                      className="border border-tertiary-400 text-tertiary-400 hover:bg-tertiary-400 hover:text-white font-one font-semibold px-6 py-3 rounded-xl transition-all duration-300"
                    >
                      Guides d&apos;utilisation
                    </a>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
