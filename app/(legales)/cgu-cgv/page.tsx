import React from "react";
import {
  FaFileContract,
  FaHandshake,
  FaEuroSign,
  FaGavel,
  FaUserTie,
  FaExclamationTriangle,
} from "react-icons/fa";
import type { Metadata } from "next";
import Footer from "@/components/Shared/Footer/Footer";
import Header from "@/components/Shared/Header";

export const metadata: Metadata = {
  title: "CGU & CGV | InkStudio",
  description:
    "Consultez les conditions générales d'utilisation et de vente d'InkStudio. Termes du service, obligations des parties et modalités d'utilisation de la plateforme pour salons de tatouage.",
  keywords: [
    "CGU",
    "CGV",
    "conditions générales",
    "termes service",
    "InkStudio",
    "contrat",
  ],
};

export default function CguCgv() {
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
                <FaFileContract size={16} className="text-tertiary-400" />
                <span className="text-tertiary-400 font-one text-sm font-semibold">
                  Conditions Générales
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
                  CGU & CGV
                </span>
              </h1>

              <div className="w-24 h-1 bg-gradient-to-r from-tertiary-400 to-tertiary-500 rounded-full mx-auto mb-8"></div>

              <p className="text-xl text-white/70 font-one leading-relaxed max-w-3xl mx-auto">
                Conditions générales d&apos;utilisation et de vente de la
                plateforme{" "}
                <span className="text-tertiary-400 font-semibold">
                  InkStudio
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* Contenu principal */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-8 max-w-5xl">
            <div className="space-y-12">
              {/* Préambule */}
              <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20">
                <h2 className="text-2xl font-bold text-white font-two mb-6">
                  Préambule
                </h2>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <p>
                    Les présentes conditions générales d&apos;utilisation et de
                    vente (ci-après &quot;CGU/CGV&quot;) régissent
                    l&apos;utilisation de la plateforme InkStudio, éditée par
                    InkStudio SAS, société par actions simplifiée au capital de
                    50 000 euros.
                  </p>

                  <p>
                    InkStudio est une plateforme numérique dédiée à la gestion
                    professionnelle des salons de tatouage, proposant des outils
                    de réservation, de gestion client et de présentation en
                    ligne.
                  </p>

                  <div className="bg-white/5 rounded-2xl p-6 mt-6">
                    <h3 className="font-semibold text-tertiary-400 mb-3">
                      Acceptation des conditions
                    </h3>
                    <p>
                      L&apos;utilisation de la plateforme InkStudio implique
                      l&apos;acceptation pleine et entière des présentes
                      CGU/CGV. Si vous n&apos;acceptez pas ces conditions,
                      veuillez ne pas utiliser nos services.
                    </p>
                  </div>
                </div>
              </div>

              {/* Définitions */}
              <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white font-two mb-6">
                  Définitions
                </h2>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Plateforme
                      </h3>
                      <p className="text-sm">
                        Site web et application InkStudio accessible à
                        l&apos;adresse www.inkstudio.fr et ses sous-domaines.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Utilisateur
                      </h3>
                      <p className="text-sm">
                        Toute personne physique ou morale utilisant la
                        plateforme InkStudio, qu&apos;elle soit client ou
                        professionnel.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Professionnel
                      </h3>
                      <p className="text-sm">
                        Tatoueur, salon de tatouage ou entreprise du secteur
                        utilisant les services InkStudio pour sa gestion.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Client
                      </h3>
                      <p className="text-sm">
                        Personne souhaitant prendre rendez-vous ou utilisant les
                        services d&apos;un professionnel via la plateforme.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Services
                      </h3>
                      <p className="text-sm">
                        Ensemble des fonctionnalités proposées par InkStudio :
                        gestion, réservation, profil public, etc.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Contenu
                      </h3>
                      <p className="text-sm">
                        Toute information, donnée, texte, image ou fichier
                        publié sur la plateforme par les utilisateurs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Objet et champ d'application */}
              <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                    <FaHandshake size={24} className="text-tertiary-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-two">
                    Objet et champ d&apos;application
                  </h2>
                </div>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <p>
                    Les présentes CGU/CGV ont pour objet de définir les
                    modalités et conditions d&apos;utilisation des services
                    proposés sur la plateforme InkStudio, ainsi que de définir
                    les droits et obligations des parties dans ce cadre.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-white mb-3">
                        Services professionnels
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Outils de gestion de salon</li>
                        <li>• Système de réservation en ligne</li>
                        <li>• Gestion de la clientèle</li>
                        <li>• Profil public et portfolio</li>
                        <li>• Suivi post-prestation</li>
                      </ul>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-white mb-3">
                        Services clients
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Recherche de professionnels</li>
                        <li>• Prise de rendez-vous en ligne</li>
                        <li>• Consultation de portfolios</li>
                        <li>• Suivi de prestations</li>
                        <li>• Communication sécurisée</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accès et inscription */}
              <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                    <FaUserTie size={24} className="text-tertiary-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-two">
                    Accès et inscription
                  </h2>
                </div>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <h3 className="font-semibold text-white mb-3">
                    Conditions d&apos;accès
                  </h3>
                  <p>
                    L&apos;accès à la plateforme InkStudio est réservé aux
                    personnes majeures disposant de la capacité juridique pour
                    contracter. Les professionnels doivent justifier de leur
                    activité légale dans le secteur du tatouage.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Inscription professionnelle
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Majeur et capacité juridique</li>
                        <li>• Activité légale déclarée</li>
                        <li>• Respect des normes sanitaires</li>
                        <li>• Assurance professionnelle</li>
                        <li>• Formation hygiène et salubrité</li>
                      </ul>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Inscription client
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Majeur ou autorisation parentale</li>
                        <li>• Informations exactes et à jour</li>
                        <li>• Adresse email valide</li>
                        <li>• Acceptation des CGU/CGV</li>
                        <li>• Respect de la communauté</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-tertiary-500/10 border border-tertiary-400/20 rounded-2xl p-6 mt-6">
                    <h3 className="font-semibold text-tertiary-400 mb-3">
                      Vérification des comptes
                    </h3>
                    <p className="text-sm">
                      InkStudio se réserve le droit de vérifier l&apos;identité
                      et les qualifications des utilisateurs. Les comptes
                      professionnels peuvent faire l&apos;objet d&apos;une
                      validation avant activation complète.
                    </p>
                  </div>
                </div>
              </div>

              {/* Obligations des utilisateurs */}
              <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20">
                <h2 className="text-2xl font-bold text-white font-two mb-6">
                  Obligations des utilisateurs
                </h2>

                <div className="space-y-6 text-white/80 font-one leading-relaxed">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-white mb-3">
                        Professionnels
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Respecter la déontologie professionnelle</li>
                        <li>• Maintenir les normes d&apos;hygiène</li>
                        <li>• Informer les clients des risques</li>
                        <li>• Respecter les délais de cicatrisation</li>
                        <li>• Assurer un suivi post-prestation</li>
                        <li>• Tenir à jour son profil et portfolio</li>
                      </ul>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-white mb-3">Clients</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Fournir des informations exactes</li>
                        <li>• Respecter les rendez-vous pris</li>
                        <li>• Suivre les consignes de soin</li>
                        <li>• Informer de tout problème médical</li>
                        <li>• Respecter le travail des artistes</li>
                        <li>• Payer les prestations convenues</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-6">
                    <h3 className="font-semibold text-tertiary-400 mb-3">
                      Interdictions générales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ul className="space-y-2 text-sm">
                        <li>• Usurpation d&apos;identité</li>
                        <li>• Contenu illégal ou offensant</li>
                        <li>• Spam ou sollicitations non désirées</li>
                        <li>• Violation de droits d&apos;auteur</li>
                      </ul>
                      <ul className="space-y-2 text-sm">
                        <li>• Tentative de piratage</li>
                        <li>• Utilisation de robots ou scripts</li>
                        <li>• Collecte de données non autorisée</li>
                        <li>• Contournement des mesures de sécurité</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarifs et paiement */}
              <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                    <FaEuroSign size={24} className="text-tertiary-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-two">
                    Tarifs et modalités de paiement
                  </h2>
                </div>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <p>
                    Les tarifs des services InkStudio sont indiqués en euros
                    toutes taxes comprises. Ils sont susceptibles d&apos;être
                    modifiés à tout moment, mais les tarifs applicables sont
                    ceux en vigueur au moment de la commande.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Abonnements professionnels
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Facturation mensuelle ou annuelle</li>
                        <li>• Prélèvement automatique sécurisé</li>
                        <li>• Possibilité de résiliation à tout moment</li>
                        <li>• Période d&apos;essai gratuite disponible</li>
                        <li>• Tarifs dégressifs selon la durée</li>
                      </ul>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Commissions sur réservations
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Pourcentage fixe par transaction</li>
                        <li>• Prélèvement automatique</li>
                        <li>• Facturation mensuelle détaillée</li>
                        <li>• Aucun frais caché</li>
                        <li>• Transparence totale des coûts</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-tertiary-500/10 border border-tertiary-400/20 rounded-2xl p-6 mt-6">
                    <h3 className="font-semibold text-tertiary-400 mb-3">
                      Moyens de paiement acceptés
                    </h3>
                    <p className="text-sm">
                      Cartes bancaires (Visa, Mastercard, American Express),
                      virements SEPA, prélèvements automatiques. Tous les
                      paiements sont sécurisés par notre partenaire bancaire
                      certifié PCI-DSS.
                    </p>
                  </div>
                </div>
              </div>

              {/* Résiliation */}
              <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white font-two mb-6">
                  Résiliation et suspension
                </h2>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <h3 className="font-semibold text-white mb-3">
                    Résiliation par l&apos;utilisateur
                  </h3>
                  <p>
                    L&apos;utilisateur peut résilier son compte à tout moment
                    depuis son espace personnel ou en contactant notre service
                    client. La résiliation prend effet immédiatement pour les
                    services gratuits, et à la fin de la période facturée pour
                    les abonnements.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Conséquences de la résiliation
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Suppression de l&apos;accès aux services</li>
                        <li>• Conservation des données 30 jours</li>
                        <li>• Possibilité de récupération des données</li>
                        <li>• Arrêt des prélèvements futurs</li>
                        <li>• Maintien des obligations passées</li>
                      </ul>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Suspension par InkStudio
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Non-respect des CGU/CGV</li>
                        <li>• Activité frauduleuse détectée</li>
                        <li>• Défaut de paiement persistant</li>
                        <li>• Mise en danger d&apos;autres utilisateurs</li>
                        <li>• Décision de justice</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Responsabilité */}
              <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                    <FaExclamationTriangle
                      size={24}
                      className="text-tertiary-400"
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-two">
                    Responsabilité et garanties
                  </h2>
                </div>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Responsabilité d&apos;InkStudio
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Fourniture des services décrits</li>
                        <li>• Sécurité de la plateforme</li>
                        <li>• Protection des données personnelles</li>
                        <li>• Disponibilité raisonnable du service</li>
                        <li>• Support technique approprié</li>
                      </ul>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Limitations de responsabilité
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Contenu publié par les utilisateurs</li>
                        <li>• Qualité des prestations de tatouage</li>
                        <li>• Relations entre utilisateurs</li>
                        <li>• Dommages indirects ou immatériels</li>
                        <li>• Force majeure ou cas fortuit</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-tertiary-500/10 border border-tertiary-400/20 rounded-2xl p-6 mt-6">
                    <h3 className="font-semibold text-tertiary-400 mb-3">
                      Garanties utilisateurs
                    </h3>
                    <p className="text-sm">
                      Les utilisateurs garantissent la véracité des informations
                      fournies, le respect des lois en vigueur et l&apos;absence
                      de violation des droits de tiers. Ils s&apos;engagent à
                      indemniser InkStudio de tout préjudice résultant de leurs
                      actions.
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
                    La plateforme InkStudio, son code source, sa structure, ses
                    bases de données, ainsi que tous les éléments qui la
                    composent (textes, images, sons, vidéos, etc.) sont protégés
                    par le droit de la propriété intellectuelle.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-white mb-3">
                        Droits d&apos;InkStudio
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Marques et logos InkStudio</li>
                        <li>• Code source et architecture</li>
                        <li>• Design et interface utilisateur</li>
                        <li>• Documentation et contenus éditoriaux</li>
                        <li>• Algorithmes et fonctionnalités</li>
                      </ul>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-white mb-3">
                        Droits des utilisateurs
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Portfolio et réalisations artistiques</li>
                        <li>• Photos et contenus personnels</li>
                        <li>• Textes de présentation</li>
                        <li>• Licence d&apos;utilisation à InkStudio</li>
                        <li>• Droit de retrait à tout moment</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-6 mt-6">
                    <h3 className="font-semibold text-tertiary-400 mb-3">
                      Utilisation des contenus
                    </h3>
                    <p className="text-sm">
                      En publiant du contenu sur InkStudio, vous accordez une
                      licence d&apos;utilisation non-exclusive pour
                      l&apos;affichage, la promotion et l&apos;amélioration des
                      services. Vous conservez tous vos droits de propriété
                      intellectuelle.
                    </p>
                  </div>
                </div>
              </div>

              {/* Droit applicable */}
              <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center">
                    <FaGavel size={24} className="text-tertiary-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-two">
                    Droit applicable et règlement des litiges
                  </h2>
                </div>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <p>
                    Les présentes CGU/CGV sont soumises au droit français. En
                    cas de litige, les parties s&apos;efforceront de trouver une
                    solution amiable avant tout recours judiciaire.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Médiation préalable
                      </h3>
                      <p className="text-sm">
                        Avant tout recours judiciaire, nous encourageons le
                        recours à la médiation. Contact : mediation@inkstudio.fr
                        ou via la plateforme officielle de médiation.
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="font-semibold text-tertiary-400 mb-3">
                        Compétence judiciaire
                      </h3>
                      <p className="text-sm">
                        À défaut d&apos;accord amiable, les tribunaux de Paris
                        seront seuls compétents, même en cas de pluralité de
                        défendeurs ou d&apos;appel en garantie.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modifications */}
              <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20">
                <h2 className="text-2xl font-bold text-white font-two mb-6">
                  Modification des CGU/CGV
                </h2>

                <div className="space-y-4 text-white/80 font-one leading-relaxed">
                  <p>
                    InkStudio se réserve le droit de modifier les présentes
                    CGU/CGV à tout moment. Les utilisateurs seront informés de
                    toute modification substantielle par email et/ou
                    notification sur la plateforme.
                  </p>

                  <div className="bg-white/5 rounded-2xl p-6 mt-6">
                    <h3 className="font-semibold text-tertiary-400 mb-3">
                      Entrée en vigueur
                    </h3>
                    <p className="text-sm">
                      Les nouvelles conditions entrent en vigueur 30 jours après
                      leur publication, sauf pour les modifications imposées par
                      la loi qui s&apos;appliquent immédiatement. La poursuite
                      de l&apos;utilisation vaut acceptation des nouvelles
                      conditions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              {/* <div className="text-center py-8">
              <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10 max-w-3xl mx-auto">
                <h3 className="text-lg font-bold text-white font-two mb-4">
                  Contact et questions
                </h3>
                <p className="text-white/80 font-one text-sm leading-relaxed mb-4">
                  Pour toute question relative aux présentes CGU/CGV, vous
                  pouvez nous contacter :
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-tertiary-400">Email :</strong>{" "}
                    legal@inkstudio.fr
                  </div>
                  <div>
                    <strong className="text-tertiary-400">Courrier :</strong>{" "}
                    InkStudio SAS - Service Juridique
                  </div>
                  <div>
                    <strong className="text-tertiary-400">Adresse :</strong> 123
                    Rue de l&apos;Innovation
                  </div>
                  <div>
                    <strong className="text-tertiary-400">Ville :</strong> 75001
                    Paris, France
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 bg-tertiary-500/10 border border-tertiary-400/20 rounded-full px-4 py-2 mt-6">
                  <span className="text-white/70 font-one text-sm">
                    Version en vigueur depuis le{" "}
                    {new Date().toLocaleDateString("fr-FR")}
                  </span>
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
