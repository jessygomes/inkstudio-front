import React from "react";
import {
  FaShieldAlt,
  FaDatabase,
  FaCookieBite,
  FaUserShield,
  FaEye,
  FaLock,
} from "react-icons/fa";
import type { Metadata } from "next";
import Header from "@/components/Shared/Header";
import Footer from "@/components/Shared/Footer/Footer";

export const metadata: Metadata = {
  title: "Politique de Confidentialité & Cookies | INKERA Studio",
  description:
    "Découvrez comment INKERA Studio protège vos données personnelles. Politique complète sur les cookies, Google Analytics, RGPD et traitement des données pour salons de tatouage.",
  keywords: [
    "politique confidentialité",
    "cookies INKERA",
    "Google Analytics consentement",
    "RGPD tatouage",
    "protection données salon",
    "vie privée studio tattoo",
    "sécurité INKERA Studio",
  ],
};

export default function PolitiqueDeConfidentialite() {
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
                <FaShieldAlt size={16} className="text-tertiary-400" />
                <span className="text-tertiary-400 font-one text-sm font-semibold">
                  Protection des Données
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-two uppercase text-white font-bold leading-tight mb-6">
                Politique de{" "}
                <span
                  style={{
                    background: "linear-gradient(90deg, #ff9d00, #ff4d41)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Confidentialité
                </span>
              </h1>

              <div className="w-24 h-1 bg-gradient-to-r from-tertiary-400 to-tertiary-500 rounded-full mx-auto mb-8"></div>

              <p className="text-xl text-white/70 font-one leading-relaxed max-w-3xl mx-auto">
                Votre vie privée est notre priorité. Découvrez comment{" "}
                <span className="text-tertiary-400 font-semibold">
                  InkStudio
                </span>{" "}
                protège et traite vos données personnelles
              </p>
            </div>
          </div>
        </section>

        {/* Contenu principal */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-8 max-w-5xl">
            <div className="space-y-12">
              {/* Introduction */}
              <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20">
                <h2 className="text-2xl font-bold text-white font-two mb-6">
                  Introduction
                </h2>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <p>
                    InkStudio SAS, en tant que responsable de traitement,
                    s&apos;engage à protéger la vie privée et les données
                    personnelles de ses utilisateurs. Cette politique de
                    confidentialité vous informe sur la façon dont nous
                    collectons, utilisons, stockons et protégeons vos
                    informations personnelles dans le cadre de
                    l&apos;utilisation de notre plateforme.
                  </p>

                  <p>
                    Cette politique est conforme au Règlement Général sur la
                    Protection des Données (RGPD) et à la loi &quot;Informatique
                    et Libertés&quot; modifiée.
                  </p>

                  <div className="bg-white/5 rounded-2xl p-6 mt-6">
                    <h3 className="font-semibold text-tertiary-400 mb-3">
                      Dernière mise à jour
                    </h3>
                    <p>{new Date().toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
              </div>

              {/* Responsable de traitement */}
              <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                    <FaUserShield size={24} className="text-tertiary-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-two">
                    Responsable de traitement
                  </h2>
                </div>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        Entreprise
                      </h3>
                      <p>InkStudio SAS</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Adresse</h3>
                      <p>
                        123 Rue de l&apos;Innovation
                        <br />
                        75001 Paris, France
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        Contact DPO
                      </h3>
                      <p>dpo@inkstudio.fr</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        Contact général
                      </h3>
                      <p>contact@inkstudio.fr</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Données collectées */}
              <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                    <FaDatabase size={24} className="text-tertiary-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-two">
                    Données collectées
                  </h2>
                </div>

                <div className="space-y-6 text-white/80 font-one leading-relaxed">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Données d&apos;identification
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Nom et prénom</li>
                        <li>• Adresse email</li>
                        <li>• Numéro de téléphone</li>
                        <li>• Adresse postale</li>
                        <li>• Date de naissance (si applicable)</li>
                      </ul>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Données professionnelles
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Nom du salon de tatouage</li>
                        <li>• Adresse du salon</li>
                        <li>• Numéro SIRET</li>
                        <li>• Spécialités artistiques</li>
                        <li>• Portfolio et réalisations</li>
                      </ul>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Données de connexion
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Adresse IP</li>
                        <li>• Type de navigateur</li>
                        <li>• Système d&apos;exploitation</li>
                        <li>• Pages visitées</li>
                        <li>• Horodatage des connexions</li>
                      </ul>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Données médicales (clients)
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Allergies connues</li>
                        <li>• Traitements médicaux</li>
                        <li>• Contre-indications</li>
                        <li>• Photos de cicatrisation</li>
                        <li>• Historique des soins</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Finalités du traitement */}
              <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                    <FaEye size={24} className="text-tertiary-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-two">
                    Finalités du traitement
                  </h2>
                </div>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <p>
                    Nous utilisons vos données personnelles pour les finalités
                    suivantes :
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-white mb-3">
                        Gestion de compte
                      </h3>
                      <p className="text-sm">
                        Création, authentification et gestion de votre compte
                        utilisateur sur la plateforme InkStudio.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-white mb-3">
                        Réservations
                      </h3>
                      <p className="text-sm">
                        Traitement des demandes de rendez-vous, confirmations et
                        suivi des prestations.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-white mb-3">
                        Communication
                      </h3>
                      <p className="text-sm">
                        Envoi d&apos;emails de confirmation, notifications et
                        informations relatives au service.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-white mb-3">
                        Amélioration du service
                      </h3>
                      <p className="text-sm">
                        Analyse des usages pour améliorer la qualité et les
                        fonctionnalités de notre plateforme.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-white mb-3">
                        Obligations légales
                      </h3>
                      <p className="text-sm">
                        Respect des obligations comptables, fiscales et
                        réglementaires du secteur.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-white mb-3">
                        Sécurité
                      </h3>
                      <p className="text-sm">
                        Prévention de la fraude, détection des activités
                        suspectes et sécurisation de la plateforme.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bases légales */}
              <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white font-two mb-6">
                  Bases légales du traitement
                </h2>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Exécution du contrat
                      </h3>
                      <p className="text-sm">
                        Traitement nécessaire à l&apos;exécution des services
                        InkStudio et à la gestion des rendez-vous.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Consentement
                      </h3>
                      <p className="text-sm">
                        Pour l&apos;envoi de communications marketing et la
                        personnalisation de l&apos;expérience utilisateur.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Intérêt légitime
                      </h3>
                      <p className="text-sm">
                        Amélioration de nos services, sécurité de la plateforme
                        et prévention de la fraude.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Obligation légale
                      </h3>
                      <p className="text-sm">
                        Respect des obligations comptables, fiscales et de
                        conservation des données.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cookies */}
              <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                    <FaCookieBite size={24} className="text-tertiary-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-two">
                    Gestion des cookies
                  </h2>
                </div>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <p>
                    Notre site utilise des cookies pour améliorer votre
                    expérience utilisateur et analyser l&apos;utilisation de
                    notre plateforme.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Cookies essentiels
                      </h3>
                      <p className="text-sm">
                        Nécessaires au fonctionnement du site et à la sécurité
                        de votre connexion.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Cookies analytiques
                      </h3>
                      <p className="text-sm">
                        Collecte de statistiques anonymes pour améliorer nos
                        services.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Cookies marketing
                      </h3>
                      <p className="text-sm">
                        Personnalisation des contenus et mesure de
                        l&apos;efficacité publicitaire.
                      </p>
                    </div>
                  </div>

                  <div className="bg-tertiary-500/10 border border-tertiary-400/20 rounded-2xl p-6 mt-6">
                    <h3 className="font-semibold text-tertiary-400 mb-3">
                      Gestion de vos préférences
                    </h3>
                    <p className="text-sm">
                      Vous pouvez modifier vos préférences de cookies à tout
                      moment dans les paramètres de votre navigateur ou via
                      notre centre de préférences accessible depuis le pied de
                      page.
                    </p>
                  </div>
                </div>
              </div>

              {/* Vos droits */}
              <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                    <FaLock size={24} className="text-tertiary-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-two">
                    Vos droits
                  </h2>
                </div>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <p>
                    Conformément au RGPD, vous disposez des droits suivants
                    concernant vos données personnelles :
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-white mb-3">
                        Droit d&apos;accès
                      </h3>
                      <p className="text-sm">
                        Connaître les données que nous détenons sur vous et
                        comment elles sont utilisées.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-white mb-3">
                        Droit de rectification
                      </h3>
                      <p className="text-sm">
                        Corriger ou mettre à jour vos données personnelles
                        inexactes ou incomplètes.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-white mb-3">
                        Droit à l&apos;effacement
                      </h3>
                      <p className="text-sm">
                        Demander la suppression de vos données dans certaines
                        conditions.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-white mb-3">
                        Droit à la portabilité
                      </h3>
                      <p className="text-sm">
                        Récupérer vos données dans un format structuré et
                        lisible.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-white mb-3">
                        Droit d&apos;opposition
                      </h3>
                      <p className="text-sm">
                        Vous opposer au traitement de vos données pour des
                        raisons légitimes.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-white mb-3">
                        Droit de limitation
                      </h3>
                      <p className="text-sm">
                        Demander la limitation du traitement de vos données dans
                        certains cas.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-6 mt-6">
                    <h3 className="font-semibold text-tertiary-400 mb-3">
                      Comment exercer vos droits ?
                    </h3>
                    <p className="text-sm">
                      Pour exercer vos droits, contactez-nous à l&apos;adresse{" "}
                      <strong>dpo@inkstudio.fr</strong> en précisant votre
                      demande et en joignant une copie de votre pièce
                      d&apos;identité. Nous vous répondrons dans un délai
                      maximum d&apos;un mois.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sécurité */}
              <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white font-two mb-6">
                  Sécurité des données
                </h2>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <p>
                    Nous mettons en place des mesures techniques et
                    organisationnelles appropriées pour protéger vos données
                    personnelles contre tout accès non autorisé, altération,
                    divulgation ou destruction.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Chiffrement
                      </h3>
                      <p className="text-sm">
                        Toutes les données sensibles sont chiffrées en transit
                        et au repos avec des algorithmes de dernière génération.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Authentification
                      </h3>
                      <p className="text-sm">
                        Système d&apos;authentification forte avec gestion des
                        sessions sécurisée.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Surveillance
                      </h3>
                      <p className="text-sm">
                        Monitoring 24/7 de notre infrastructure avec détection
                        des anomalies.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Formation
                      </h3>
                      <p className="text-sm">
                        Formation régulière de nos équipes aux bonnes pratiques
                        de sécurité.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conservation */}
              <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white font-two mb-6">
                  Durée de conservation
                </h2>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <p>
                    Nous conservons vos données personnelles uniquement pour la
                    durée nécessaire aux finalités pour lesquelles elles ont été
                    collectées :
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Comptes actifs
                      </h3>
                      <p className="text-sm">
                        Tant que votre compte est actif et pendant 3 ans après
                        la dernière connexion.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Données de facturation
                      </h3>
                      <p className="text-sm">
                        10 ans conformément aux obligations comptables et
                        fiscales.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Données médicales
                      </h3>
                      <p className="text-sm">
                        20 ans conformément à la réglementation du secteur
                        médical.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Logs de connexion
                      </h3>
                      <p className="text-sm">
                        12 mois pour la sécurité et la détection
                        d&apos;incidents.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20">
                <h2 className="text-2xl font-bold text-white font-two mb-6">
                  Contact et réclamations
                </h2>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <p>
                    Pour toute question concernant cette politique de
                    confidentialité ou le traitement de vos données :
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Contact DPO
                      </h3>
                      <p className="text-sm">
                        Email : dpo@inkstudio.fr
                        <br />
                        Courrier : DPO InkStudio
                        <br />
                        123 Rue de l&apos;Innovation
                        <br />
                        75001 Paris, France
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Autorité de contrôle
                      </h3>
                      <p className="text-sm">
                        En cas de litige, vous pouvez saisir la CNIL :<br />
                        Commission Nationale de l&apos;Informatique et des
                        Libertés
                        <br />
                        3 Place de Fontenoy - TSA 80715
                        <br />
                        75334 Paris Cedex 07
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modifications */}
              <div className="text-center py-8">
                <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10 max-w-3xl mx-auto">
                  <h3 className="text-lg font-bold text-white font-two mb-4">
                    Modifications de cette politique
                  </h3>
                  <p className="text-white/80 font-one text-sm leading-relaxed">
                    Nous nous réservons le droit de modifier cette politique de
                    confidentialité. Les modifications seront publiées sur cette
                    page avec une date de mise à jour. Nous vous encourageons à
                    consulter régulièrement cette page.
                  </p>
                  <div className="inline-flex items-center gap-2 bg-tertiary-500/10 border border-tertiary-400/20 rounded-full px-4 py-2 mt-4">
                    <span className="text-white/70 font-one text-sm">
                      Version actuelle :{" "}
                      {new Date().toLocaleDateString("fr-FR")}
                    </span>
                  </div>
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
