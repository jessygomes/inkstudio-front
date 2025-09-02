/* eslint-disable react/no-unescaped-entities */
import React from "react";

import { FaClock, FaUserClock, FaBlackTie, FaDatabase } from "react-icons/fa6";

export default function Section4() {
  return (
    <section className="bg-secondary-500 flex flex-col sm:flex-row min-h-screen">
      {/* Section gauche - Image et titre */}
      <div className="w-full sm:w-1/2 h-[40vh] sm:h-screen relative flex flex-col justify-center">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/sec4.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.4,
          }}
        ></div>
        <h2 className="relative text-white text-center font-two tracking-wide text-2xl sm:text-4xl font-bold px-4">
          Pourquoi{" "}
          <span
            className="text-tertiary-500 font-bold uppercase"
            style={{
              background: "linear-gradient(90deg, #ff9d00, #ff4d41)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            INKSTUDIO
          </span>{" "}
          ?
        </h2>
      </div>

      {/* Section droite - Cartes modernes */}
      <div className="w-full sm:w-1/2 py-8 sm:py-16 flex flex-col justify-center px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Carte 1 */}
          <div className="group bg-gradient-to-br from-noir-500/20 to-noir-700/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-tertiary-400/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-tertiary-400 to-tertiary-500 rounded-xl flex items-center justify-center shadow-lg">
                <FaClock size={20} className="text-white" />
              </div>
              <h3 className="text-white font-bold text-base sm:text-lg font-one">
                Gagner du temps
              </h3>
            </div>
            <p className="text-white/80 text-sm leading-relaxed font-one">
              Passez moins de temps à gérer, plus de temps à créer. InkStudio
              libère votre emploi du temps pour vous concentrer sur votre art.
            </p>
          </div>

          {/* Carte 2 */}
          <div className="group bg-gradient-to-br from-noir-500/20 to-noir-700/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-tertiary-400/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-tertiary-400 to-tertiary-500 rounded-xl flex items-center justify-center shadow-lg">
                <FaBlackTie size={20} className="text-white" />
              </div>
              <h3 className="text-white font-bold text-base sm:text-lg font-one">
                Image professionnelle
              </h3>
            </div>
            <p className="text-white/80 text-sm leading-relaxed font-one">
              Valorisez votre salon avec une gestion digne des plus grandes
              enseignes. Offrez une expérience client moderne et rassurante.
            </p>
          </div>

          {/* Carte 3 */}
          <div className="group bg-gradient-to-br from-noir-500/20 to-noir-700/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-tertiary-400/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-tertiary-400 to-tertiary-500 rounded-xl flex items-center justify-center shadow-lg">
                <FaDatabase size={20} className="text-white" />
              </div>
              <h3 className="text-white font-bold text-base sm:text-lg font-one">
                Données sécurisées
              </h3>
            </div>
            <p className="text-white/80 text-sm leading-relaxed font-one">
              Vos infos, vos clients, vos portfolios — toujours accessibles,
              toujours protégés. Fini les notes perdues ou éparpillées.
            </p>
          </div>

          {/* Carte 4 */}
          <div className="group bg-gradient-to-br from-noir-500/20 to-noir-700/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-tertiary-400/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-tertiary-400 to-tertiary-500 rounded-xl flex items-center justify-center shadow-lg">
                <FaUserClock size={20} className="text-white" />
              </div>
              <h3 className="text-white font-bold text-base sm:text-lg font-one">
                Suivi intelligent
              </h3>
            </div>
            <p className="text-white/80 text-sm leading-relaxed font-one">
              Un client bien suivi est un client qui revient. Cicatrisation,
              retouches, feedback… Bâtissez une vraie relation de confiance.
            </p>
          </div>
        </div>

        {/* Élément décoratif en bas */}
        <div className="flex justify-center mt-8">
          <div className="h-1 w-20 bg-gradient-to-r from-tertiary-400 to-tertiary-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
