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
import CookiePreferences from "@/components/Cookies/CookiePreferences";

export const metadata: Metadata = {
  title: "Politique de confidentialité & cookies | Inkera Studio",
  description:
    "Découvrez comment Inkera Studio traite les données personnelles, les messages Instagram et les préférences de cookies.",
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

const POLICY_UPDATED_AT = "23 octobre 2026";

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
                  Inkera Studio
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
                    Inkera Studio est une plateforme en cours de développement,
                    actuellement portée à titre personnel par son créateur,
                    dans l&apos;attente de la création de sa structure juridique.
                    Cette politique explique quelles données sont traitées dans
                    le cadre du site et de la plateforme, pour quelles raisons
                    et comment exercer vos droits.
                  </p>

                  <p>
                    Les traitements sont soumis au Règlement général sur la
                    protection des données (RGPD) et à la loi Informatique et
                    Libertés. Selon le service utilisé, Inkera traite certaines
                    données pour son propre compte et d&apos;autres pour le compte
                    des salons ou artistes qui utilisent ses outils de gestion.
                  </p>

                  <div className="bg-white/5 rounded-2xl p-6 mt-6">
                    <h3 className="font-semibold text-tertiary-400 mb-3">
                      Dernière mise à jour
                    </h3>
                    <p>{POLICY_UPDATED_AT}</p>
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
                        Responsable de la plateforme
                      </h3>
                      <p>
                        Pinto Barreto Jessy
                        <br />
                        Projet Inkera Studio — structure juridique en cours de création
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Adresse</h3>
                      <p>Avenue Anatole France, VITRY-SUR-SEINE, France</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        Protection des données
                      </h3>
                      <p>contact@inkera-studio.com</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        Contact général
                      </h3>
                      <p>contact@inkera-studio.com</p>
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
                        Informations sensibles (si renseignées)
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Allergies ou contre-indications communiquées</li>
                        <li>• Informations utiles à la préparation d&apos;une prestation</li>
                        <li>• Photos ou éléments de suivi transmis volontairement</li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-sm">
                    Les données relatives à la santé nécessitent une protection
                    particulière. Leur collecte par un professionnel doit être
                    limitée au strict nécessaire et reposer sur une condition
                    de licéité adaptée, notamment une exception prévue par
                    l&apos;article 9 du RGPD. Le professionnel reste responsable
                    des informations qu&apos;il choisit de recueillir dans les
                    dossiers de ses clients.
                  </p>
                </div>
              </div>

              {/* Messagerie Instagram */}
              <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                    <FaDatabase size={24} className="text-tertiary-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-two">
                    Connexion Instagram et messagerie unifiée
                  </h2>
                </div>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <p>
                    Un salon ou un artiste peut choisir de connecter son compte
                    Instagram professionnel à Inkera au moyen de
                    l&apos;autorisation proposée par Meta. Cette connexion sert
                    à consulter et à traiter les échanges Instagram depuis la
                    messagerie Inkera, ainsi qu&apos;à répondre aux messages.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Données du compte connecté
                      </h3>
                      <p className="text-sm">
                        Identifiants du compte Instagram, nom d&apos;utilisateur,
                        autorisations accordées et jeton d&apos;accès nécessaire
                        à la connexion. Ce jeton est stocké sous une forme
                        chiffrée.
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Données des conversations
                      </h3>
                      <p className="text-sm">
                        Identifiants et informations de profil accessibles des
                        correspondants, contenu des messages reçus et envoyés,
                        pièces jointes accessibles, dates et informations de
                        suivi des échanges.
                      </p>
                    </div>
                  </div>
                  <p>
                    La synchronisation intervient pour les nouveaux événements
                    reçus via l&apos;intégration ; elle ne signifie pas que
                    l&apos;historique antérieur à la connexion est importé.
                    Les conversations sont visibles par le titulaire du compte
                    Inkera concerné et, selon ses autorisations, par les membres
                    habilités de son équipe. Les réponses rédigées dans Inkera
                    sont transmises à Instagram par les services de Meta.
                  </p>
                  <p>
                    Le professionnel peut déconnecter son compte Instagram.
                    La déconnexion met fin aux nouveaux échanges via cette
                    connexion, mais n&apos;efface pas automatiquement les copies
                    de messages déjà enregistrées dans Inkera. Pour demander
                    leur suppression lorsque celle-ci est possible, écrivez à
                    contact@inkera-studio.com. L&apos;utilisation d&apos;Instagram
                    demeure également soumise aux règles de confidentialité de
                    Meta.
                  </p>
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
                        utilisateur sur la plateforme Inkera Studio.
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
                        informations relatives au service ; échanges entre
                        utilisateurs et gestion des messages Instagram
                        lorsqu&apos;un compte professionnel est connecté.
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
                        Inkera Studio, à la gestion des rendez-vous et des
                        fonctions de messagerie demandées.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Consentement
                      </h3>
                      <p className="text-sm">
                        Pour les communications commerciales ou les traceurs
                        soumis à consentement. Les éventuelles données de santé
                        exigent en outre une condition spécifique de
                        l&apos;article 9 du RGPD, telle que le consentement
                        explicite lorsqu&apos;il est approprié.
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

              {/* Destinataires et prestataires */}
              <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white font-two mb-6">
                  Destinataires et prestataires
                </h2>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <p>
                    Les données sont accessibles uniquement aux personnes qui
                    en ont besoin pour fournir les services : équipe chargée
                    de l&apos;exploitation d&apos;Inkera, professionnel concerné
                    et membres habilités de son espace.
                  </p>
                  <p>
                    La plateforme fait appel à des prestataires techniques pour
                    l&apos;hébergement de l&apos;application et des bases de données
                    (notamment Vercel, Railway et Neon), l&apos;envoi
                    d&apos;emails (Mailgun) et les paiements (Stripe). Les
                    échanges Instagram utilisent les services de Meta. Chaque
                    prestataire intervient selon la fonction concernée.
                  </p>
                  <p>
                    Certains prestataires peuvent traiter des données en dehors
                    de l&apos;Espace économique européen. Lorsque cela est
                    applicable, ces transferts doivent être encadrés par les
                    garanties prévues par le RGPD, telles qu&apos;une décision
                    d&apos;adéquation ou des clauses contractuelles types.
                  </p>
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
                        Mesure d&apos;audience, notamment avec Google Analytics
                        lorsqu&apos;un consentement est donné. Ces mesures
                        peuvent impliquer le traitement d&apos;identifiants et
                        de données de navigation.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Cookies marketing
                      </h3>
                      <p className="text-sm">
                        Éventuels traceurs publicitaires, activés uniquement
                        après consentement lorsqu&apos;ils sont utilisés.
                      </p>
                    </div>
                  </div>

                  <div className="bg-tertiary-500/10 border border-tertiary-400/20 rounded-2xl p-6 mt-6">
                    <h3 className="font-semibold text-tertiary-400 mb-3">
                      Gestion de vos préférences
                    </h3>
                    <p className="text-sm">
                      Vous pouvez accepter ou refuser les cookies non essentiels
                      à partir du bandeau de consentement et modifier vos choix
                      depuis le panneau ci-dessous. Les paramètres de votre
                      navigateur permettent également de supprimer les cookies.
                    </p>
                  </div>

                  <div className="mt-6">
                    <CookiePreferences />
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
                      <strong>contact@inkera-studio.com</strong> en précisant
                      votre demande. Un justificatif d&apos;identité ne sera
                      demandé qu&apos;en cas de doute raisonnable sur votre
                      identité. Nous vous répondrons en principe sous un mois,
                      sauf prolongation autorisée par le RGPD.
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
                        Connexions sécurisées pour les échanges avec les
                        services et chiffrement des jetons d&apos;accès
                        Instagram enregistrés par la plateforme.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Authentification
                      </h3>
                      <p className="text-sm">
                        Contrôles d&apos;accès et gestion des sessions pour
                        limiter l&apos;accès aux données des comptes.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Surveillance
                      </h3>
                      <p className="text-sm">
                        Journaux techniques et suivi des erreurs pour contribuer
                        à la fiabilité et à la sécurité du service.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Accès limité
                      </h3>
                      <p className="text-sm">
                        Accès aux informations réservé aux personnes autorisées
                        selon les besoins de fonctionnement et d&apos;assistance.
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
                    Les données sont conservées selon leur finalité, les
                    obligations légales applicables et les instructions du
                    professionnel lorsque nous agissons pour son compte.
                    Les critères suivants s&apos;appliquent :
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Comptes actifs
                      </h3>
                      <p className="text-sm">
                        Pendant l&apos;utilisation du compte, puis le temps
                        nécessaire à sa clôture et au traitement des éventuels
                        litiges ou obligations légales.
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
                        Données sensibles des dossiers clients
                      </h3>
                      <p className="text-sm">
                        Selon la nécessité de la prestation et les durées
                        définies par le professionnel responsable du dossier,
                        sous réserve des obligations légales applicables.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Logs de connexion
                      </h3>
                      <p className="text-sm">
                        Pendant une durée limitée, déterminée par les besoins
                        de sécurité, de détection d&apos;incidents et les
                        obligations applicables.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6 md:col-span-2">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Messages et contacts Instagram
                      </h3>
                      <p className="text-sm">
                        Pendant la période de gestion des échanges par le
                        professionnel, puis selon ses instructions, les demandes
                        de suppression recevables et les obligations de
                        conservation applicables. La déconnexion d&apos;Instagram
                        ne supprime pas à elle seule les messages déjà
                        synchronisés.
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
                        Contact pour la protection des données
                      </h3>
                      <p className="text-sm">
                        Email : contact@inkera-studio.com
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
                      {POLICY_UPDATED_AT}
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
