/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import React from "react";
import {
  FaGlobe,
  FaImages,
  FaUsers,
  FaCalendarAlt,
  FaEye,
} from "react-icons/fa";

export default function ProfilSection() {
  return (
    <section className="bg-secondary-600 py-20 sm:py-16 relative overflow-hidden">
      {/* Éléments décoratifs de fond */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-tertiary-400/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-tertiary-500/3 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-8 max-w-7xl relative z-10">
        {/* Header premium */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 bg-tertiary-500/10 border border-tertiary-400/20 rounded-full px-4 py-2 mb-6">
            <FaGlobe size={16} className="text-tertiary-400" />
            <span className="text-tertiary-400 font-one text-sm font-semibold">
              Vitrine Professionnelle
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-two uppercase text-white font-bold leading-tight mb-6">
            Profil public du salon{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #ff9d00, #ff4d41)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Votre vitrine professionnelle en ligne
            </span>
          </h2>

          <div className="w-24 h-1 bg-gradient-to-r from-tertiary-400 to-tertiary-500 rounded-full mx-auto mb-8"></div>

          <p className="text-xl text-white/70 font-one leading-relaxed max-w-4xl mx-auto">
            Chaque salon inscrit sur INKERA Studio dispose d'un{" "}
            <span className="text-white font-semibold">
              profil public complet
            </span>
            , pensé comme une{" "}
            <span className="text-tertiary-400 font-semibold">
              vitrine digitale professionnelle
            </span>
          </p>
        </div>

        {/* Image showcase moderne */}
        <div className="mb-20">
          <div className="max-w-6xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-tertiary-400/20 via-tertiary-500/20 to-tertiary-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-700"></div>
              <div className="relative bg-noir-800/50 backdrop-blur-sm rounded-3xl p-4">
                <Image
                  src="/images/profil.png"
                  alt="Interface profil salon"
                  width={1400}
                  height={900}
                  className="object-contain w-full h-[50vh] sm:h-[60vh] lg:h-[70vh] rounded-2xl"
                />
              </div>

              {/* Badge flottant */}
              <div className="absolute top-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white px-8 py-2 rounded-2xl shadow-xl">
                <span className="font-one text-sm font-bold">
                  Profil Public INKERA Studio
                </span>
              </div>

              {/* Indicateur de fonctionnalité */}
              <div className="absolute bottom-2 right-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-2">
                <span className="text-white font-one text-xs font-semibold">
                  🌐 En ligne
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section description principale */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-gradient-to-br from-noir-500/30 to-noir-700/30 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-tertiary-400/30 transition-all duration-500">
            <h3 className="text-2xl font-bold text-white font-two mb-6 flex items-center gap-3">
              <div className="w-12 h-12 bg-tertiary-500/20 rounded-2xl flex items-center justify-center">
                <FaGlobe size={20} className="text-tertiary-400" />
              </div>
              Vitrine digitale professionnelle
            </h3>
            <p className="text-white/90 font-one text-base leading-relaxed">
              L'endroit idéal pour mettre en valeur votre univers, votre équipe,
              vos œuvres et vos services de manière professionnelle.
            </p>
          </div>

          <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20">
            <h3 className="text-2xl font-bold text-tertiary-400 font-two mb-6">
              ✨ Visibilité garantie
            </h3>
            <p className="text-white/90 font-one text-base leading-relaxed font-semibold">
              Les clients peuvent vous trouver, découvrir votre univers et
              prendre rendez-vous directement en ligne.
            </p>
          </div>
        </div>

        {/* Fonctionnalités en grid premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Visibilité en ligne */}
          <div className="group bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-tertiary-400/20 transition-all duration-500 hover:transform hover:scale-[1.02]">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center group-hover:from-tertiary-500/30 group-hover:to-tertiary-600/30 transition-all duration-500">
                <FaGlobe size={24} className="text-tertiary-400" />
              </div>
              <h3 className="font-bold text-white font-two text-lg group-hover:text-tertiary-400 transition-colors duration-300">
                Visibilité 24h/24
              </h3>
              <p className="text-white/70 font-one text-sm leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                Visible en ligne même sans site web personnel. Indexé par ville,
                région ou style.
              </p>
            </div>
          </div>

          {/* Portfolio */}
          <div className="group bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-tertiary-400/20 transition-all duration-500 hover:transform hover:scale-[1.02]">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center group-hover:from-tertiary-500/30 group-hover:to-tertiary-600/30 transition-all duration-500">
                <FaImages size={24} className="text-tertiary-400" />
              </div>
              <h3 className="font-bold text-white font-two text-lg group-hover:text-tertiary-400 transition-colors duration-300">
                Portfolio & Galerie
              </h3>
              <p className="text-white/70 font-one text-sm leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                Vos œuvres, photos du salon et réalisations des artistes dans
                une galerie professionnelle.
              </p>
            </div>
          </div>

          {/* Équipe */}
          <div className="group bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-tertiary-400/20 transition-all duration-500 hover:transform hover:scale-[1.02]">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center group-hover:from-tertiary-500/30 group-hover:to-tertiary-600/30 transition-all duration-500">
                <FaUsers size={24} className="text-tertiary-400" />
              </div>
              <h3 className="font-bold text-white font-two text-lg group-hover:text-tertiary-400 transition-colors duration-300">
                Présentation équipe
              </h3>
              <p className="text-white/70 font-one text-sm leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                Profils des tatoueurs, spécialités et styles pour que les
                clients trouvent l'artiste idéal.
              </p>
            </div>
          </div>

          {/* Réservation */}
          <div className="group bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-tertiary-400/20 transition-all duration-500 hover:transform hover:scale-[1.02]">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center group-hover:from-tertiary-500/30 group-hover:to-tertiary-600/30 transition-all duration-500">
                <FaCalendarAlt size={24} className="text-tertiary-400" />
              </div>
              <h3 className="font-bold text-white font-two text-lg group-hover:text-tertiary-400 transition-colors duration-300">
                Réservation directe
              </h3>
              <p className="text-white/70 font-one text-sm leading-relaxed group-hover:text-white/90 transition-colors duration-300">
                Prise de rendez-vous directement depuis votre profil, sans
                passer par d'autres plateformes.
              </p>
            </div>
          </div>
        </div>

        {/* Section avantages principale */}
        <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-tertiary-400/20">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-8 mb-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-tertiary-500/30 to-tertiary-600/30 rounded-3xl flex items-center justify-center">
                  <FaEye size={40} className="text-tertiary-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white font-two text-2xl sm:text-3xl mb-2">
                    Référencement et attraction client
                  </h3>
                  <p className="text-tertiary-400 font-one font-semibold text-lg">
                    Votre vitrine digitale qui travaille pour vous
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/5 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-4 h-4 bg-tertiary-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-white font-one font-semibold mb-2">
                      Découverte rapide
                    </h4>
                    <p className="text-white/80 font-one text-sm leading-relaxed">
                      Découverte rapide de votre salon et de vos œuvres par les
                      clients potentiels
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-4 h-4 bg-tertiary-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-white font-one font-semibold mb-2">
                      Crédibilité
                    </h4>
                    <p className="text-white/80 font-one text-sm leading-relaxed">
                      Crédibilité et professionnalisation de votre image de
                      marque
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-4 h-4 bg-tertiary-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-white font-one font-semibold mb-2">
                      Présence web
                    </h4>
                    <p className="text-white/80 font-one text-sm leading-relaxed">
                      Présence web centralisée dédiée aux professionnels du
                      tatouage
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 text-center">
              <p className="text-white font-one font-semibold text-lg">
                ✨ Un profil clair, bien présenté = plus de visibilité, plus de
                clients fidèles
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
