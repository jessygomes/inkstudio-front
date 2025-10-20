import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function HeroSection() {
  return (
    <section className="w-full px-4 lg:px-0 sm:flex justify-center z-20">
      <div className="hidden lg:block w-2/5"></div>
      <div className="w-full lg:w-3/4 lg:mr-20 flex flex-col items-center justify-center gap-6 lg:gap-8">
        <div className="flex flex-col justify-center items-center gap-3 sm:gap-2">
          {/* Titre principal avec meilleure lisibilité mobile */}
          <h1 className="text-white font-two text-2xl sm:text-4xl lg:text-5xl font-bold tracking-wide">
            <Image
              src="/images/logo_white_color.png"
              alt="Logo"
              width={150}
              height={50}
            />
          </h1>

          <div className="w-24 h-1 bg-gradient-to-r from-tertiary-400 to-tertiary-500 rounded-full mx-auto my-3"></div>

          {/* Sous-titre responsive */}
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-center text-white uppercase font-two tracking-wide leading-tight">
            <span className="block  bg-gradient-to-r from-tertiary-400 via-tertiary-500 to-cuatro-500 bg-clip-text text-transparent">
              Gérez votre salon
            </span>{" "}
            de tatouage en toute simplicité
          </h2>

          {/* Description avec fond semi-transparent pour mobile */}
          <div className="bg-noir-700/40 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none rounded-xl sm:rounded-none p-4 sm:p-0 border border-white/20 sm:border-none">
            <p className="text-sm text-white/80 text-center font-one leading-relaxed max-w-2xl mx-auto">
              Gestion de salon de tatouage qui vous permet de gérer facilement
              vos rendez-vous, vos clients et vos finances.
            </p>
          </div>
        </div>

        {/* Bouton avec adaptation responsive */}
        <div className="relative z-10 mx-auto w-full sm:w-auto">
          <Link
            href={"/inscription"}
            className="group cursor-pointer bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 w-full sm:w-auto max-w-sm text-center text-white font-one py-3 sm:py-4 px-8 sm:px-10 rounded-2xl hover:scale-105 transition-all ease-in-out duration-300 shadow-lg hover:shadow-2xl border border-tertiary-400/20 block"
          >
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="text-sm sm:text-lg lg:text-base font-semibold">
                Créer un compte gratuit
              </span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
