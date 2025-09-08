/* eslint-disable react/no-unescaped-entities */

import React from "react";
import Image from "next/image";
import {
  FaRegCalendarCheck,
  FaCircleInfo,
  FaChalkboardUser,
  FaCreativeCommonsBy,
} from "react-icons/fa6";
import { RiPassValidFill } from "react-icons/ri";
import { FaEye, FaCalendarAlt } from "react-icons/fa";

export default function ReservationSection() {
  const features = [
    {
      icon: <FaRegCalendarCheck size={24} className="text-tertiary-400" />,
      title: "Formulaire de prise de RDV",
      description:
        "Interface intuitive pour vos clients : sélection du service, choix du tatoueur et créneaux disponibles en temps réel.",
    },
    {
      icon: <FaCircleInfo size={24} className="text-tertiary-400" />,
      title: "Informations client complètes",
      description:
        "Collecte automatique des données essentielles : coordonnées, informations médicales et préférences personnelles.",
    },
    {
      icon: <FaChalkboardUser size={24} className="text-tertiary-400" />,
      title: "Confirmation intelligente",
      description:
        "Notifications automatiques par email et SMS avec possibilité de validation ou reprogrammation instantanée.",
    },
    {
      icon: <FaCreativeCommonsBy size={24} className="text-tertiary-400" />,
      title: "Fiche client automatisée",
      description:
        "Génération instantanée des fiches clients avec toutes les données de réservation pré-remplies.",
    },
    {
      icon: <RiPassValidFill size={24} className="text-tertiary-400" />,
      title: "Validation flexible",
      description:
        "Système de validation adaptable : automatique pour les clients fidèles, manuelle pour les nouveaux.",
    },
    {
      icon: <FaEye size={24} className="text-tertiary-400" />,
      title: "Confidentialité maîtrisée",
      description:
        "Contrôle total de la visibilité de vos informations personnelles sur votre profil public.",
    },
  ];

  return (
    <section className="bg-noir-700 py-20 sm:py-16 relative overflow-hidden">
      {/* Éléments décoratifs de fond */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-tertiary-400/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-tertiary-500/3 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-8 max-w-7xl relative z-10">
        {/* Header premium */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 bg-tertiary-500/10 border border-tertiary-400/20 rounded-full px-4 py-2 mb-6">
            <FaCalendarAlt size={16} className="text-tertiary-400" />
            <span className="text-tertiary-400 font-one text-sm font-semibold">
              Réservation Intelligente
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-two uppercase text-white font-bold leading-tight mb-6">
            Prise de{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #ff9d00, #ff4d41)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              rendez-vous automatisée
            </span>
          </h2>

          <div className="w-24 h-1 bg-gradient-to-r from-tertiary-400 to-tertiary-500 rounded-full mx-auto mb-8"></div>

          <p className="text-xl text-white/70 font-one leading-relaxed max-w-4xl mx-auto">
            Révolutionnez votre gestion de rendez-vous avec un système
            intelligent qui{" "}
            <span className="text-white font-semibold">
              réduit votre charge administrative
            </span>{" "}
            tout en offrant une{" "}
            <span className="text-tertiary-400 font-semibold">
              expérience client premium
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
                  src="/images/rdv.png"
                  alt="Interface de réservation moderne"
                  width={1400}
                  height={900}
                  className="object-contain w-full h-[50vh] sm:h-[60vh] lg:h-[70vh] rounded-2xl"
                />
              </div>

              {/* Badge flottant principal */}
              <div className="absolute top-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white px-8 py-2 rounded-2xl shadow-xl">
                <span className="font-one text-sm font-bold">
                  Interface InkStudio
                </span>
              </div>

              {/* Indicateur de fonctionnalité */}
              <div className="absolute bottom-2 right-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-2">
                <span className="text-white font-one text-xs font-semibold">
                  ✨ Temps réel
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid des fonctionnalités premium */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-noir-600/30 to-noir-800/30 backdrop-blur-xl rounded-3xl p-8 border border-white/5 hover:border-tertiary-400/20 transition-all duration-500 hover:transform hover:scale-[1.02]"
            >
              {/* Effet de lueur */}
              <div className="absolute inset-0 bg-gradient-to-br from-tertiary-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

              <div className="relative z-10">
                <div className="flex items-start gap-6 mb-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center group-hover:from-tertiary-500/30 group-hover:to-tertiary-600/30 transition-all duration-500">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white font-two text-lg group-hover:text-tertiary-400 transition-colors duration-300 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-white/60 font-one text-sm leading-relaxed group-hover:text-white/80 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section avantages */}
        {/* <div className="bg-gradient-to-br from-tertiary-500/5 to-tertiary-600/5 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-tertiary-400/10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-full flex items-center justify-center">
                <FaEye size={32} className="text-tertiary-400" />
              </div>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white font-two mb-4">
              Résultats garantis
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-tertiary-400 font-two mb-2">
                  -70%
                </div>
                <p className="text-white/70 font-one text-sm">
                  Messages de coordination
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-tertiary-400 font-two mb-2">
                  +85%
                </div>
                <p className="text-white/70 font-one text-sm">
                  Satisfaction client
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-tertiary-400 font-two mb-2">
                  24/7
                </div>
                <p className="text-white/70 font-one text-sm">Disponibilité</p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-white/5 rounded-2xl">
              <p className="text-tertiary-400 font-one font-semibold text-lg">
                ✨ Transformez votre salon en référence digitale du secteur
              </p>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  );
}
