/* eslint-disable react/no-unescaped-entities */
import React from "react";

import { FaClock, FaUserClock, FaBlackTie, FaDatabase } from "react-icons/fa6";

export default function Section4() {
  return (
    <section className="bg-secondary-500 flex flex-col sm:flex-row h-screen">
      <div className="w-full h-[50vh] sm:h-full relative flex flex-col justify-center">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/sec4.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.4,
          }}
        ></div>
        <h2 className="relative text-white text-center font-two tracking-wide text-4xl font-bold">
          Pourquoi{" "}
          <span
            className="text-tertiary-500 font-bold uppercase"
            style={{
              background: "linear-gradient(90deg, #ff5500, #ff4d41)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            INKSTUDIO
          </span>{" "}
          ?
        </h2>
      </div>

      <div className="w-full py-8 sm:py-0 flex flex-col justify-center ">
        <div className="relative px-4 sm:px-20 flex flex-col gap-8 text-white font-one">
          <div className="flex flex-col gap-2">
            <FaClock size={20} className="text-tertiary-500" />
            <div>
              <h3 className="text-base font-bold text-white mb-2">
                Gagner du temps
              </h3>
              <p className="text-sm">
                Passez moins de temps à gérer, plus de temps à créer. InkStudio
                libère votre emploi du temps pour vous concentrer sur votre art,
                vos clients, ou même... vous reposer.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <FaBlackTie size={20} className="text-tertiary-500" />
            <div>
              <h3 className="text-base font-bold text-white mb-2">
                Renforcer votre image professionnelle
              </h3>
              <p className="text-sm">
                Valorisez votre salon avec une gestion digne des plus grandes
                enseignes. Offrez une expérience client fluide, moderne et
                rassurante, dès la première prise de contact.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <FaDatabase size={20} className="text-tertiary-500" />
            <div>
              <h3 className="text-base font-bold text-white mb-2">
                Centraliser et sécuriser vos données
              </h3>
              <p className="text-sm">
                Vos infos, vos clients, vos portfolios — toujours accessibles,
                toujours protégés. Fini les notes perdues ou les historiques
                éparpillés.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <FaUserClock size={20} className="text-tertiary-500" />
            <div>
              <h3 className="text-base font-bold text-white mb-2">
                Suivi client intelligent
              </h3>
              <p className="text-sm">
                Un client bien suivi est un client qui revient. Cicatrisation,
                retouches, feedback, historique… InkStudio vous aide à bâtir une
                vraie relation de confiance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
