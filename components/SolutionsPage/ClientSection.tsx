/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import { FaCircleInfo, FaUsers } from "react-icons/fa6";
import { BiDetail } from "react-icons/bi";
import { FaNotesMedical, FaHistory } from "react-icons/fa";
import { AiOutlineMonitor } from "react-icons/ai";

export default function ClientSection() {
  return (
    <section className="bg-primary-500 py-20 sm:py-16 relative overflow-hidden">
      {/* Background image pour tout le composant */}
      <div
        className="absolute inset-0 opacity-8"
        style={{
          backgroundImage: "url('/images/seclient.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>

      {/* Overlay pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary-500/80 to-secondary-500/90"></div>

      {/* Éléments décoratifs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-tertiary-400/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-tertiary-500/3 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-8 max-w-7xl relative z-10">
        {/* Header premium */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 bg-tertiary-500/10 border border-tertiary-400/20 rounded-full px-4 py-2 mb-6">
            <FaUsers size={16} className="text-tertiary-400" />
            <span className="text-tertiary-400 font-one text-sm font-semibold">
              Gestion Client Avancée
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-two uppercase text-white font-bold leading-tight mb-6">
            Gestion des clients et{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #ff9d00, #ff4d41)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              historique des prestations
            </span>
          </h2>

          <div className="w-24 h-1 bg-gradient-to-r from-tertiary-400 to-tertiary-500 rounded-full mx-auto mb-8"></div>

          <p className="text-xl text-white/80 font-one leading-relaxed max-w-4xl mx-auto">
            Centralisez et sécurisez toutes vos données clients avec des{" "}
            <span className="text-white font-semibold">
              fiches intelligentes automatisées
            </span>{" "}
            qui révolutionnent votre{" "}
            <span className="text-tertiary-400 font-semibold">
              suivi professionnel
            </span>
          </p>
        </div>

        {/* Image showcase moderne */}
        <div className="mb-20">
          <div className="max-w-6xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-tertiary-400/20 via-tertiary-500/20 to-tertiary-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-700"></div>
              <div className="relative bg-noir-800/40 backdrop-blur-sm rounded-3xl p-4">
                <Image
                  src="/images/capt.png"
                  alt="Interface de gestion client"
                  width={1400}
                  height={900}
                  className="object-contain w-full h-[50vh] sm:h-[60vh] lg:h-[70vh] rounded-2xl"
                />
              </div>

              {/* Badge flottant */}
              <div className="absolute top-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white px-8 py-2 rounded-2xl shadow-xl">
                <span className="font-one text-sm font-bold">
                  Gestion Client InkStudio
                </span>
              </div>

              {/* Indicateur de fonctionnalité */}
              <div className="absolute bottom-2 right-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-2">
                <span className="text-white font-one text-xs font-semibold">
                  🔒 Sécurisé
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section description principale */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-tertiary-400/20 transition-all duration-500">
            <h3 className="text-2xl font-bold text-white font-two mb-6 flex items-center gap-3">
              <div className="w-12 h-12 bg-tertiary-500/20 rounded-2xl flex items-center justify-center">
                <FaCircleInfo size={20} className="text-tertiary-400" />
              </div>
              Fiches clients intelligentes
            </h3>
            <p className="text-white/90 font-one text-sm leading-relaxed">
              À chaque nouveau rendez-vous validé, une fiche client est générée
              automatiquement avec toutes les informations utiles avant, pendant
              et après la séance.
            </p>
          </div>

          <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20">
            <h3 className="text-2xl font-bold text-tertiary-400 font-two mb-6">
              💡 Avantage différenciant
            </h3>
            <p className="text-white/90 font-one text-base leading-relaxed font-semibold">
              Réduisez le stress administratif, augmentez votre organisation et
              offrez un suivi professionnel qui fidélise vos clients.
            </p>
          </div>
        </div>

        {/* Fonctionnalités en grid premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Informations de base */}
          <div className="group bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-tertiary-400/20 transition-all duration-500 hover:transform hover:scale-[1.02]">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center group-hover:from-tertiary-500/30 group-hover:to-tertiary-600/30 transition-all duration-500">
                <FaCircleInfo size={24} className="text-tertiary-400" />
              </div>
              <h3 className="font-bold text-white font-two text-lg group-hover:text-tertiary-400 transition-colors duration-300">
                Données essentielles
              </h3>
              <p className="text-white/70 font-one text-sm leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                Coordonnées, vérification majorité et conformité légale
                automatisée.
              </p>
            </div>
          </div>

          {/* Détails du tatouage */}
          <div className="group bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-tertiary-400/20 transition-all duration-500 hover:transform hover:scale-[1.02]">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center group-hover:from-tertiary-500/30 group-hover:to-tertiary-600/30 transition-all duration-500">
                <BiDetail size={24} className="text-tertiary-400" />
              </div>
              <h3 className="font-bold text-white font-two text-lg group-hover:text-tertiary-400 transition-colors duration-300">
                Détails du projet
              </h3>
              <p className="text-white/70 font-one text-sm leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                Planification matériel, prévention malentendus et traçabilité
                complète.
              </p>
            </div>
          </div>

          {/* Antécédents médicaux */}
          <div className="group bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-tertiary-400/20 transition-all duration-500 hover:transform hover:scale-[1.02]">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center group-hover:from-tertiary-500/30 group-hover:to-tertiary-600/30 transition-all duration-500">
                <FaNotesMedical size={24} className="text-tertiary-400" />
              </div>
              <h3 className="font-bold text-white font-two text-lg group-hover:text-tertiary-400 transition-colors duration-300">
                Sécurité médicale
              </h3>
              <p className="text-white/70 font-one text-sm leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                Allergies, traitements en cours et contre-indications pour un
                travail sécurisé.
              </p>
            </div>
          </div>

          {/* Historique */}
          <div className="group bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-tertiary-400/20 transition-all duration-500 hover:transform hover:scale-[1.02]">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center group-hover:from-tertiary-500/30 group-hover:to-tertiary-600/30 transition-all duration-500">
                <FaHistory size={24} className="text-tertiary-400" />
              </div>
              <h3 className="font-bold text-white font-two text-lg group-hover:text-tertiary-400 transition-colors duration-300">
                Historique complet
              </h3>
              <p className="text-white/70 font-one text-sm leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                Réalisations, cicatrisation et évolution : base indispensable
                pour les retouches.
              </p>
            </div>
          </div>
        </div>

        {/* Section highlight suivi post-tatouage */}
        <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-tertiary-400/20">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-8 mb-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-tertiary-500/30 to-tertiary-600/30 rounded-3xl flex items-center justify-center">
                  <AiOutlineMonitor size={40} className="text-tertiary-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white font-two text-2xl sm:text-3xl mb-2">
                    Suivi post-tatouage & cicatrisation
                  </h3>
                  <p className="text-tertiary-400 font-one font-semibold text-lg">
                    Le service premium qui fait votre différence
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/5 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-4 h-4 bg-tertiary-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-white font-one font-semibold mb-2">
                      Email automatique
                    </h4>
                    <p className="text-white/80 font-one text-sm leading-relaxed">
                      Consignes de soin personnalisées envoyées immédiatement
                      après chaque séance
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-4 h-4 bg-tertiary-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-white font-one font-semibold mb-2">
                      Suivi cicatrisation
                    </h4>
                    <p className="text-white/80 font-one text-sm leading-relaxed">
                      Lien unique pour réception de photo de contrôle après 15
                      jours automatiquement
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 text-center">
              <p className="text-white font-one font-semibold text-lg">
                ✨ Professionnalisme reconnu qui réduit drastiquement les
                demandes de retouche non justifiées
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
