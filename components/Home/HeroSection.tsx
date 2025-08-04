import Link from "next/link";
import React from "react";

export default function HeroSection() {
  return (
    <section className="w-full px-2 sm:px-0 sm:flex justify-center z-20">
      <div className="hidden sm:block w-2/5"></div>
      <div className="w-full sm:w-3/4 mr-20 flex flex-col items-center justify-center gap-8">
        <div className="flex flex-col justify-center items-center gap-2">
          <h1 className="text-white font-two">INKSTUDIO</h1>
          <h2 className="text-3xl font-bold text-center text-white uppercase font-two tracking-wide">
            Gérez votre salon de tatouage en toute simplicité
          </h2>
          <p className="text-center text-gray-600 text-md font-semibold font-one">
            Gestion de salon de tatouage qui vous permet de gérer facilement vos
            rendez-vous, vos clients et vos finances.
          </p>
        </div>
        <Link
          href={"/inscription"}
          className="cursor-pointer px-8 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs"
        >
          Créer un compte gratuit
        </Link>
      </div>
    </section>
  );
}
