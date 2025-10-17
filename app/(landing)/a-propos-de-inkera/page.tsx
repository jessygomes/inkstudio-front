import React from "react";
import {
  FaRocket,
  FaUsers,
  FaLightbulb,
  FaShieldAlt,
  FaHeart,
  FaTrophy,
  FaChartLine,
  FaHandshake,
} from "react-icons/fa";
import Image from "next/image";
import type { Metadata } from "next";
import Header from "@/components/Shared/Header";

export const metadata: Metadata = {
  title: "À propos d'InkEra | Notre Mission",
  description:
    "Découvrez l'histoire d'InkEra, notre mission de révolutionner la gestion des salons de tatouage et notre engagement envers la communauté des artistes tatoueurs.",
  keywords: [
    "à propos InkEra",
    "mission tatouage",
    "équipe InkEra",
    "histoire plateforme",
    "innovation tatoueurs",
  ],
};

export default function AproposPage() {
  return (
    <>
      <div className="fixed backdrop-blur-2xl top-0 left-0 w-full z-50">
        <Header />
      </div>
      <div className="min-h-screen bg-gradient-to-b from-noir-700 to-noir-700">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-noir-700 to-noir-800 py-20 sm:py-0 sm:pt-28 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-tertiary-400/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-tertiary-500/3 rounded-full blur-3xl"></div>

          <div className="container mx-auto px-4 sm:px-8 max-w-4xl relative z-10">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-tertiary-500/10 border border-tertiary-400/20 rounded-full px-4 py-2 mb-6">
                <FaHeart size={16} className="text-tertiary-400" />
                <span className="text-tertiary-400 font-one text-sm font-semibold">
                  Notre Histoire
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-two uppercase text-white font-bold leading-tight mb-6">
                À propos d&apos;{" "}
                <span
                  style={{
                    background: "linear-gradient(90deg, #ff9d00, #ff4d41)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  InkEra Studio
                </span>
              </h1>

              <div className="w-24 h-1 bg-gradient-to-r from-tertiary-400 to-tertiary-500 rounded-full mx-auto mb-8"></div>

              <p className="text-xl text-white/70 font-one leading-relaxed max-w-3xl mx-auto">
                Nous révolutionnons la gestion des salons de tatouage en
                combinant{" "}
                <span className="text-tertiary-400 font-semibold">
                  innovation technologique
                </span>{" "}
                et{" "}
                <span className="text-white font-semibold">
                  passion artistique
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* Notre Mission */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
            <div className="space-y-16">
              {/* Mission principale */}
              <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-tertiary-400/20">
                <div className="text-center mb-12">
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-full flex items-center justify-center">
                      <FaRocket size={32} className="text-tertiary-400" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-white font-two mb-6">
                    Notre Mission
                  </h2>
                  <p className="text-xl text-white/80 font-one leading-relaxed max-w-4xl mx-auto">
                    Démocratiser l&apos;accès aux outils de gestion
                    professionnels pour tous les artistes tatoueurs, des
                    indépendants aux studios multi-artistes, en leur offrant une
                    solution complète, intuitive et abordable.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white/5 rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FaLightbulb size={24} className="text-tertiary-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white font-two mb-3">
                      Innovation
                    </h3>
                    <p className="text-white/70 font-one text-sm leading-relaxed">
                      Développer des solutions technologiques innovantes
                      adaptées aux besoins spécifiques du secteur.
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FaUsers size={24} className="text-tertiary-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white font-two mb-3">
                      Communauté
                    </h3>
                    <p className="text-white/70 font-one text-sm leading-relaxed">
                      Créer un écosystème qui connecte tatoueurs et clients dans
                      un environnement de confiance.
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FaShieldAlt size={24} className="text-tertiary-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white font-two mb-3">
                      Qualité
                    </h3>
                    <p className="text-white/70 font-one text-sm leading-relaxed">
                      Garantir des standards élevés de sécurité, de fiabilité et
                      de service client.
                    </p>
                  </div>
                </div>
              </div>

              {/* Notre Histoire */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                  <h2 className="text-2xl font-bold text-white font-two mb-6">
                    Notre Histoire
                  </h2>
                  <div className="space-y-6 text-white/80 font-one leading-relaxed">
                    <p>
                      <strong className="text-tertiary-400">2019</strong> : Tout
                      a commencé par une rencontre entre passionnés de
                      technologie et artistes tatoueurs. Nous avons constaté que
                      le secteur manquait d&apos;outils modernes pour gérer
                      efficacement les activités quotidiennes.
                    </p>
                    <p>
                      <strong className="text-tertiary-400">2020-2021</strong> :
                      Développement de la première version d&apos;InkStudio en
                      étroite collaboration avec une quinzaine de salons
                      pilotes. Cette approche collaborative nous a permis de
                      créer une solution vraiment adaptée aux besoins réels.
                    </p>
                    <p>
                      <strong className="text-tertiary-400">2022</strong> :
                      Lancement officiel de la plateforme avec plus de 100
                      salons partenaires. Reconnaissance par les professionnels
                      du secteur pour l&apos;innovation et la qualité de
                      service.
                    </p>
                    <p>
                      <strong className="text-tertiary-400">2023-2024</strong> :
                      Expansion continue avec plus de 500 salons utilisateurs et
                      développement de nouvelles fonctionnalités basées sur les
                      retours de notre communauté.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-tertiary-400/20 via-tertiary-500/20 to-tertiary-600/20 rounded-3xl blur-xl"></div>
                  <div className="relative bg-noir-800/50 backdrop-blur-sm rounded-3xl p-4">
                    <Image
                      src="/images/bgsol.png"
                      alt="Équipe InkStudio"
                      width={600}
                      height={400}
                      className="object-cover w-full h-[300px] sm:h-[400px] rounded-2xl"
                    />
                  </div>
                </div>
              </div>

              {/* Nos Valeurs */}
              <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-white font-two mb-6">
                    Nos Valeurs
                  </h2>
                  <p className="text-xl text-white/70 font-one leading-relaxed max-w-3xl mx-auto">
                    Les principes qui guident chacune de nos décisions et
                    orientent notre développement
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                    <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center mb-4">
                      <FaHeart size={24} className="text-tertiary-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white font-two mb-3">
                      Passion
                    </h3>
                    <p className="text-white/70 font-one text-sm leading-relaxed">
                      Nous sommes animés par la passion de l&apos;art du
                      tatouage et l&apos;innovation technologique.
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                    <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center mb-4">
                      <FaHandshake size={24} className="text-tertiary-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white font-two mb-3">
                      Transparence
                    </h3>
                    <p className="text-white/70 font-one text-sm leading-relaxed">
                      Communication claire, tarifs transparents et engagement
                      authentique envers nos utilisateurs.
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                    <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center mb-4">
                      <FaUsers size={24} className="text-tertiary-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white font-two mb-3">
                      Écoute
                    </h3>
                    <p className="text-white/70 font-one text-sm leading-relaxed">
                      Développement en collaboration constante avec notre
                      communauté d&apos;utilisateurs.
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                    <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center mb-4">
                      <FaChartLine size={24} className="text-tertiary-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white font-two mb-3">
                      Excellence
                    </h3>
                    <p className="text-white/70 font-one text-sm leading-relaxed">
                      Recherche constante de l&apos;amélioration et de la
                      perfection dans nos services.
                    </p>
                  </div>
                </div>
              </div>

              {/* Nos Réalisations */}
              <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20">
                <div className="text-center mb-12">
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-full flex items-center justify-center">
                      <FaTrophy size={32} className="text-tertiary-400" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-white font-two mb-6">
                    Nos Réalisations
                  </h2>
                  <p className="text-xl text-white/80 font-one leading-relaxed max-w-3xl mx-auto">
                    Quelques chiffres qui témoignent de notre impact sur la
                    communauté des tatoueurs
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-tertiary-400 font-two mb-2">
                      500+
                    </div>
                    <p className="text-white/70 font-one">Salons partenaires</p>
                  </div>

                  <div className="text-center">
                    <div className="text-4xl font-bold text-tertiary-400 font-two mb-2">
                      15K+
                    </div>
                    <p className="text-white/70 font-one">
                      Réservations traitées
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="text-4xl font-bold text-tertiary-400 font-two mb-2">
                      98%
                    </div>
                    <p className="text-white/70 font-one">
                      Satisfaction client
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="text-4xl font-bold text-tertiary-400 font-two mb-2">
                      24/7
                    </div>
                    <p className="text-white/70 font-one">Support disponible</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 mt-8">
                  <h3 className="font-semibold text-tertiary-400 mb-3">
                    Reconnaissance du secteur
                  </h3>
                  <p className="text-white/80 font-one text-sm leading-relaxed">
                    InkStudio a été reconnu par la Fédération Française des
                    Tatoueurs Professionnels comme &quot;Solution Innovante de
                    l&apos;Année 2023&quot; pour sa contribution à la
                    professionnalisation du secteur et à l&apos;amélioration des
                    standards de qualité.
                  </p>
                </div>
              </div>

              {/* Notre Équipe */}
              <div className="bg-gradient-to-br from-noir-600/40 to-noir-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-white font-two mb-6">
                    Notre Équipe
                  </h2>
                  <p className="text-xl text-white/70 font-one leading-relaxed max-w-3xl mx-auto">
                    Une équipe passionnée et multidisciplinaire au service de
                    votre réussite
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white/5 rounded-2xl p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-tertiary-400 font-two text-xl font-bold">
                        12
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white font-two mb-2">
                      Développeurs
                    </h3>
                    <p className="text-white/70 font-one text-sm">
                      Experts en technologies web et mobile, passionnés
                      d&apos;innovation
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-tertiary-400 font-two text-xl font-bold">
                        6
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white font-two mb-2">
                      Consultants Métier
                    </h3>
                    <p className="text-white/70 font-one text-sm">
                      Anciens professionnels du tatouage qui comprennent vos
                      enjeux
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-tertiary-400 font-two text-xl font-bold">
                        8
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white font-two mb-2">
                      Support Client
                    </h3>
                    <p className="text-white/70 font-one text-sm">
                      Équipe dédiée à votre accompagnement et à votre
                      satisfaction
                    </p>
                  </div>
                </div>

                <div className="bg-tertiary-500/10 border border-tertiary-400/20 rounded-2xl p-6 mt-8">
                  <h3 className="font-semibold text-tertiary-400 mb-3">
                    Notre approche collaborative
                  </h3>
                  <p className="text-white/80 font-one text-sm leading-relaxed">
                    Chaque membre de notre équipe travaille en étroite
                    collaboration avec des professionnels du tatouage pour
                    garantir que nos solutions répondent parfaitement aux
                    besoins réels du terrain. Cette approche nous permet
                    d&apos;innover tout en restant pragmatiques.
                  </p>
                </div>
              </div>

              {/* Notre Engagement */}
              <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/15 backdrop-blur-xl rounded-3xl p-8 border border-tertiary-400/20">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white font-two mb-6">
                    Notre Engagement
                  </h2>
                  <p className="text-xl text-white/80 font-one leading-relaxed max-w-3xl mx-auto">
                    Nous nous engageons à faire évoluer InkStudio en permanence
                    pour rester la solution de référence du secteur
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white/5 rounded-2xl p-6">
                    <h3 className="font-semibold text-white mb-4">
                      Développement continu
                    </h3>
                    <ul className="space-y-2 text-white/80 font-one text-sm">
                      <li>• Nouvelles fonctionnalités chaque trimestre</li>
                      <li>• Améliorations basées sur vos retours</li>
                      <li>• Veille technologique permanente</li>
                      <li>• Tests utilisateurs réguliers</li>
                    </ul>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-6">
                    <h3 className="font-semibold text-white mb-4">
                      Support premium
                    </h3>
                    <ul className="space-y-2 text-white/80 font-one text-sm">
                      <li>• Formation gratuite à l&apos;utilisation</li>
                      <li>• Support technique réactif</li>
                      <li>• Documentation complète</li>
                      <li>• Webinaires de formation</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 mt-6 text-center">
                  <h3 className="font-semibold text-tertiary-400 mb-3">
                    Rejoignez l&apos;aventure
                  </h3>
                  <p className="text-white/80 font-one leading-relaxed mb-6">
                    Vous partagez notre vision ? Vous souhaitez contribuer à
                    révolutionner le secteur du tatouage ? Nous sommes toujours
                    à la recherche de talents passionnés pour renforcer notre
                    équipe.
                  </p>
                  <a
                    href="/contactez-nous"
                    className="inline-flex bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white font-one font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Nous contacter
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
