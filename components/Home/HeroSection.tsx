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
          className="relative cursor-pointer mx-auto bg-gradient-to-l from-tertiary-400 to-tertiary-500 min-w-[400px] max-w-[400px] text-center text-white font-one py-2 px-4 rounded-[20px] hover:scale-105 transition-all ease-in-out duration-300"
        >
          Créer un compte gratuit
        </Link>
      </div>
    </section>
  );
}
