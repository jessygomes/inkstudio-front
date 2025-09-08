/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { FaBuilding, FaGavel, FaServer, FaShieldAlt } from "react-icons/fa";
import type { Metadata } from "next";
import Header from "@/components/Shared/Header";
import Footer from "@/components/Shared/Footer/Footer";

export const metadata: Metadata = {
  title: "Mentions Légales | InkStudio",
  description:
    "Consultez les mentions légales d'InkStudio, plateforme de gestion pour salons de tatouage. Informations légales, conditions d'utilisation et données de l'entreprise.",
  keywords: [
    "mentions légales",
    "InkStudio",
    "informations légales",
    "conditions utilisation",
    "RGPD",
  ],
};

export default function MentionsLegales() {
  return (
    <>
      <div className="fixed backdrop-blur-2xl top-0 left-0 w-full z-50">
        <Header />
      </div>
      <div className="min-h-screen bg-gradient-to-b from-noir-700 via-noir-600 to-noir-700">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-noir-700 to-noir-800 py-20 sm:pt-28 relative overflow-hidden">
          {/* <div className="absolute top-0 right-0 w-80 h-80 bg-tertiary-400/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-tertiary-500/3 rounded-full blur-3xl"></div> */}

          <div className="container mx-auto px-4 sm:px-8 max-w-4xl relative z-10">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-tertiary-500/10 border border-tertiary-400/20 rounded-full px-4 py-2 mb-6">
                <FaGavel size={16} className="text-tertiary-400" />
                <span className="text-tertiary-400 font-one text-sm font-semibold">
                  Informations Légales
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-two uppercase text-white font-bold leading-tight mb-6">
                Mentions{" "}
                <span
                  style={{
                    background: "linear-gradient(90deg, #ff9d00, #ff4d41)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Légales
                </span>
              </h1>

              <div className="w-24 h-1 bg-gradient-to-r from-tertiary-400 to-tertiary-500 rounded-full mx-auto mb-8"></div>

              <p className="text-xl text-white/70 font-one leading-relaxed max-w-3xl mx-auto">
                Informations légales et conditions d&apos;utilisation de la
                plateforme{" "}
                <span className="text-tertiary-400 font-semibold">
                  InkStudio
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* Contenu principal */}
        <section className="py-16 sm:py-16">
          <div className="container mx-auto px-4 sm:px-8 max-w-5xl">
            <div className="space-y-12">
              {/* Identité de l'entreprise */}
              <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                    <FaBuilding size={24} className="text-tertiary-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-two">
                    Identité de l&apos;entreprise
                  </h2>
                </div>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        Dénomination sociale
                      </h3>
                      <p>InkStudio SAS</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        Forme juridique
                      </h3>
                      <p>Société par Actions Simplifiée (SAS)</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        Capital social
                      </h3>
                      <p>50 000 €</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">RCS</h3>
                      <p>Paris B 123 456 789</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">SIRET</h3>
                      <p>123 456 789 00012</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        TVA Intracommunautaire
                      </h3>
                      <p>FR12 123456789</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-semibold text-white mb-2">
                      Siège social
                    </h3>
                    <p>
                      123 Rue de l&apos;Innovation
                      <br />
                      75001 Paris, France
                    </p>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-semibold text-white mb-2">Contact</h3>
                    <p>
                      Email : contact@inkstudio.fr
                      <br />
                      Téléphone : +33 1 23 45 67 89
                    </p>
                  </div>
                </div>
              </div>

              {/* Directeur de publication */}
              <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                    <FaShieldAlt size={24} className="text-tertiary-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-two">
                    Direction et responsabilité
                  </h2>
                </div>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Directeur de la publication
                    </h3>
                    <p>John Doe, Président de InkStudio SAS</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Responsable de la rédaction
                    </h3>
                    <p>Équipe InkStudio</p>
                  </div>
                </div>
              </div>

              {/* Hébergement */}
              <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                    <FaServer size={24} className="text-tertiary-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-two">
                    Hébergement et infrastructure
                  </h2>
                </div>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Hébergeur principal
                    </h3>
                    <p>
                      OVH SAS
                      <br />
                      2 rue Kellermann
                      <br />
                      59100 Roubaix, France
                      <br />
                      Téléphone : +33 9 72 10 10 07
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Services cloud
                    </h3>
                    <p>
                      Amazon Web Services (AWS)
                      <br />
                      Services de stockage et de calcul distribué
                    </p>
                  </div>
                </div>
              </div>

              {/* Propriété intellectuelle */}
              <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20">
                <h2 className="text-2xl font-bold text-white font-two mb-6">
                  Propriété intellectuelle
                </h2>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <p>
                    L&apos;ensemble du contenu de ce site web (textes, images,
                    vidéos, logos, icônes, sons, logiciels, etc.) est la
                    propriété exclusive d&apos;InkStudio SAS ou de ses
                    partenaires et est protégé par les lois françaises et
                    internationales relatives à la propriété intellectuelle.
                  </p>

                  <p>
                    Toute reproduction, représentation, modification,
                    publication, adaptation, ou exploitation totale ou partielle
                    du contenu, par quelque procédé que ce soit, est strictement
                    interdite sans l&apos;autorisation écrite préalable
                    d&apos;InkStudio SAS.
                  </p>

                  <div className="bg-white/5 rounded-2xl p-6 mt-6">
                    <h3 className="font-semibold text-tertiary-400 mb-3">
                      Marques et logos
                    </h3>
                    <p>
                      La marque &quot;InkStudio&quot; ainsi que tous les logos
                      et éléments graphiques associés sont des marques déposées
                      d&apos;InkStudio SAS. Leur utilisation est strictement
                      réglementée.
                    </p>
                  </div>
                </div>
              </div>

              {/* Responsabilité */}
              <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white font-two mb-6">
                  Limitation de responsabilité
                </h2>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <p>
                    InkStudio SAS met tout en œuvre pour fournir des
                    informations exactes et à jour sur son site web. Cependant,
                    nous ne pouvons garantir l&apos;exactitude, la précision ou
                    l&apos;exhaustivité des informations mises à disposition.
                  </p>

                  <p>
                    L&apos;utilisation des informations et services proposés sur
                    ce site se fait sous l&apos;entière responsabilité de
                    l&apos;utilisateur. InkStudio SAS ne saurait être tenue
                    responsable des dommages directs ou indirects résultant de
                    l&apos;utilisation du site ou de l&apos;impossibilité
                    d&apos;y accéder.
                  </p>

                  <div className="bg-white/5 rounded-2xl p-6 mt-6">
                    <h3 className="font-semibold text-tertiary-400 mb-3">
                      Disponibilité du service
                    </h3>
                    <p>
                      Nous nous efforçons de maintenir notre service accessible
                      24h/24 et 7j/7, mais nous ne pouvons garantir une
                      disponibilité continue en raison de maintenances
                      techniques ou de circonstances indépendantes de notre
                      volonté.
                    </p>
                  </div>
                </div>
              </div>

              {/* Données personnelles */}
              <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20">
                <h2 className="text-2xl font-bold text-white font-two mb-6">
                  Protection des données personnelles
                </h2>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <p>
                    Conformément au Règlement Général sur la Protection des
                    Données (RGPD) et à la loi &quot;Informatique et
                    Libertés&quot;, vous disposez de droits sur vos données
                    personnelles.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Responsable de traitement
                      </h3>
                      <p>InkStudio SAS</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Contact DPO
                      </h3>
                      <p>dpo@inkstudio.fr</p>
                    </div>
                  </div>

                  <p className="mt-6">
                    Pour exercer vos droits (accès, rectification, effacement,
                    portabilité, limitation du traitement, opposition), vous
                    pouvez nous contacter à l'adresse : contact@inkstudio.fr
                  </p>
                </div>
              </div>

              {/* Droit applicable */}
              <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white font-two mb-6">
                  Droit applicable et juridiction
                </h2>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <p>
                    Les présentes mentions légales et l'utilisation du site
                    InkStudio sont régies par le droit français. En cas de
                    litige, et à défaut de résolution amiable, les tribunaux
                    français seront seuls compétents.
                  </p>

                  <div className="bg-white/5 rounded-2xl p-6 mt-6">
                    <h3 className="font-semibold text-tertiary-400 mb-3">
                      Médiation
                    </h3>
                    <p>
                      Conformément à l'article L. 616-1 du Code de la
                      consommation, nous proposons un dispositif de médiation de
                      la consommation. Le médiateur peut être saisi sur le site
                      : www.mediation-conso.fr
                    </p>
                  </div>
                </div>
              </div>

              {/* Dernière mise à jour */}
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 bg-tertiary-500/10 border border-tertiary-400/20 rounded-full px-6 py-3">
                  <span className="text-white/70 font-one text-sm">
                    Dernière mise à jour :{" "}
                    {new Date().toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
