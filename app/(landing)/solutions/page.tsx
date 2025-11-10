/* eslint-disable react/no-unescaped-entities */
import Header from "@/components/Shared/Header";
import ClientSection from "@/components/SolutionsPage/ClientSection";
import ProfilSection from "@/components/SolutionsPage/ProfilSection";
import ReservationSection from "@/components/SolutionsPage/ReservationSection";
import Image from "next/image";
import { FaArrowDown, FaCalendarAlt, FaUsers, FaGlobe } from "react-icons/fa";

export default function SolutionsPage() {
  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50">
        <Header />
      </div>
      {/* Hero Section optimisée */}
      <section className="min-h-[100vh] lg:min-h-[100vh] bg-noir-700 flex items-center justify-center relative overflow-hidden pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/bgsol.png')",
            backgroundSize: "cover",
          }}
        ></div>

        {/* Overlay moderne */}
        <div className="absolute inset-0 bg-gradient-to-b from-noir-700/60 via-noir-700/40 to-noir-700/80"></div>

        <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center py-12">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Badge moderne */}
            <div className="inline-flex items-center gap-2">
              <Image
                src="/images/Logo13.png"
                alt="Logo"
                width={50}
                height={50}
              />
            </div>

            {/* Titre principal */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white uppercase font-two tracking-wide leading-tight">
              <span className="block mb-1">Toutes les solutions</span>
              <span className="block bg-gradient-to-r from-tertiary-500 to-cuatro-500 bg-clip-text text-transparent">
                pour gérer votre salon
              </span>
              <span className="block">de tatouage</span>
            </h1>

            {/* Sous-titre */}
            <p className="text-lg sm:text-xl text-white/80 font-one leading-relaxed max-w-2xl mx-auto">
              Découvrez comment INKERA Studio révolutionne la gestion de votre
              salon avec des outils pensés
              <span className="text-tertiary-400 font-semibold">
                {" "}
                par et pour les tatoueurs
              </span>
            </p>

            {/* Statistiques rapides */}
            <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="text-xl font-bold text-tertiary-400 font-two">
                  3
                </div>
                <div className="text-sm text-white/80 font-one">
                  Solutions complètes
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="text-xl font-bold text-tertiary-400 font-two">
                  100%
                </div>
                <div className="text-sm text-white/80 font-one">
                  Pensé tatoueurs
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="text-xl font-bold text-tertiary-400 font-two">
                  24/7
                </div>
                <div className="text-sm text-white/80 font-one">
                  Disponibilité
                </div>
              </div>
            </div>

            {/* CTA d'exploration */}
            <div className="flex flex-col items-center gap-4 mt-8">
              <div className="text-white/60 font-one text-md">
                Explorez nos solutions
              </div>
              <FaArrowDown
                size={24}
                className="text-tertiary-400 animate-bounce"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Navigation des features */}
      <section className="bg-gradient-to-b from-noir-700 to-noir-700 py-16">
        <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-two mb-4">
              Nos 3 solutions essentielles
            </h2>
            <p className="text-white/70 font-one text-lg max-w-2xl mx-auto">
              Chaque solution répond à un besoin spécifique de votre salon pour
              une gestion optimale
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card Réservation */}
            <div className="bg-gradient-to-br from-noir-600/50 to-noir-800/50 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-tertiary-400/30 transition-all duration-300 group cursor-pointer">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-3xl flex items-center justify-center group-hover:from-tertiary-500/40 group-hover:to-tertiary-600/40 transition-all duration-300">
                  <FaCalendarAlt size={32} className="text-tertiary-400" />
                </div>
                <h3 className="text-xl font-bold text-white font-two group-hover:text-tertiary-400 transition-colors">
                  Réservation en ligne
                </h3>
                <p className="text-white/70 font-one leading-relaxed">
                  Automatisez vos prises de rendez-vous avec un système
                  intelligent et professionnel
                </p>
                <div className="text-tertiary-400 font-one text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Découvrir →
                </div>
              </div>
            </div>

            {/* Card Gestion Client */}
            <div className="bg-gradient-to-br from-noir-600/50 to-noir-800/50 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-tertiary-400/30 transition-all duration-300 group cursor-pointer">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-3xl flex items-center justify-center group-hover:from-tertiary-500/40 group-hover:to-tertiary-600/40 transition-all duration-300">
                  <FaUsers size={32} className="text-tertiary-400" />
                </div>
                <h3 className="text-xl font-bold text-white font-two group-hover:text-tertiary-400 transition-colors">
                  Gestion clients
                </h3>
                <p className="text-white/70 font-one leading-relaxed">
                  Centralisez toutes les informations clients avec un suivi
                  complet et intelligent
                </p>
                <div className="text-tertiary-400 font-one text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Découvrir →
                </div>
              </div>
            </div>

            {/* Card Profil Public */}
            <div className="bg-gradient-to-br from-noir-600/50 to-noir-800/50 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-tertiary-400/30 transition-all duration-300 group cursor-pointer">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-3xl flex items-center justify-center group-hover:from-tertiary-500/40 group-hover:to-tertiary-600/40 transition-all duration-300">
                  <FaGlobe size={32} className="text-tertiary-400" />
                </div>
                <h3 className="text-xl font-bold text-white font-two group-hover:text-tertiary-400 transition-colors">
                  Profil public
                </h3>
                <p className="text-white/70 font-one leading-relaxed">
                  Votre vitrine professionnelle en ligne pour attirer de
                  nouveaux clients
                </p>
                <div className="text-tertiary-400 font-one text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Découvrir →
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sections des features avec séparateurs visuels */}
      <div className="bg-gradient-to-b from-noir-800 to-noir-700">
        {/* Feature 1: Réservation */}
        <div className="relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-20 bg-gradient-to-b from-tertiary-400 to-transparent"></div>
          <ReservationSection />
        </div>

        {/* Séparateur */}
        {/* <div className="flex justify-center py-8">
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-tertiary-400 to-transparent rounded-full"></div>
        </div> */}

        {/* Feature 2: Gestion Client */}
        <div className="relative">
          <ClientSection />
        </div>

        {/* Séparateur */}
        {/* <div className="flex justify-center py-8">
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-tertiary-400 to-transparent rounded-full"></div>
        </div> */}

        {/* Feature 3: Profil Public */}
        <div className="relative">
          <ProfilSection />
        </div>
      </div>

      {/* Section finale CTA */}
      <section className="bg-gradient-to-t from-noir-700 to-noir-500 py-20">
        <div className="container mx-auto px-4 sm:px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-two">
              Prêt à révolutionner votre salon ?
            </h2>
            <p className="text-xl text-white/80 font-one leading-relaxed">
              Rejoignez les tatoueurs qui ont déjà fait le choix
              d&apos;InkStudio pour
              <span className="text-tertiary-400 font-semibold">
                {" "}
                simplifier leur quotidien
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <button className="bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white font-one font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg">
                S'inscrire gratuitement
              </button>
              <button className="border border-white/20 text-white hover:bg-white/10 font-one font-semibold px-8 py-4 rounded-2xl transition-all duration-300">
                Devenir testeur
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
