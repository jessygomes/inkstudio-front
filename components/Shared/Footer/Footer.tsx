import Link from "next/link";
import React from "react";

export default function Footer() {
  return (
    <footer className="px-4 py-12 sm:py-20 sm:px-8 lg:px-20 bg-noir-700">
      {/* Header du footer modernisé */}
      <div className="flex items-center justify-center gap-4 mb-8 sm:mb-12">
        <h3 className="text-white text-2xl sm:text-3xl font-two font-bold tracking-wide">
          InkEra
        </h3>
        <div className="bg-gradient-to-r from-tertiary-400 to-tertiary-500 w-full h-[2px] rounded-full"></div>
      </div>

      {/* Grid modernisée avec cartes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-white mb-8 sm:mb-12">
        {/* Navigation */}
        <div className="bg-gradient-to-br from-noir-500/20 to-noir-700/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-tertiary-400/30 transition-colors duration-300">
          <ul className="font-two flex flex-col gap-3 sm:gap-4 text-sm">
            <li className="bg-gradient-to-l from-tertiary-400 to-tertiary-500 bg-clip-text text-transparent uppercase font-bold text-base mb-2">
              Navigation
            </li>
            <li>
              <Link
                href={"/"}
                className="hover:text-tertiary-400 duration-300 transition-colors"
              >
                Accueil
              </Link>
            </li>
            <li>
              <Link
                href={"/solutions"}
                className="hover:text-tertiary-400 duration-300 transition-colors"
              >
                Solutions
              </Link>
            </li>
            <li>
              <Link
                href={"/tarification"}
                className="hover:text-tertiary-400 duration-300 transition-colors"
              >
                Tarification
              </Link>
            </li>
            <li>
              <Link
                href={"/connexion"}
                className="hover:text-tertiary-400 duration-300 transition-colors"
              >
                Connexion / Inscription
              </Link>
            </li>
          </ul>
        </div>

        {/* Qui sommes-nous */}
        <div className="bg-gradient-to-br from-noir-500/20 to-noir-700/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-tertiary-400/30 transition-colors duration-300">
          <ul className="font-two flex flex-col gap-3 sm:gap-4 text-sm">
            <li className="bg-gradient-to-l from-tertiary-400 to-tertiary-500 bg-clip-text text-transparent uppercase font-bold text-base mb-2">
              Qui sommes-nous ?
            </li>
            <li>
              <Link
                href={"/a-propos"}
                className="hover:text-tertiary-400 duration-300 transition-colors"
              >
                A Propos de InkEra
              </Link>
            </li>
            <li>
              <Link
                href={"https://www.inthegleam.com/"}
                target="_blank"
                className="hover:text-tertiary-400 duration-300 transition-colors"
              >
                Project by inTheGleam
              </Link>
            </li>
          </ul>
        </div>

        {/* Légales */}
        <div className="bg-gradient-to-br from-noir-500/20 to-noir-700/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-tertiary-400/30 transition-colors duration-300">
          <ul className="font-two flex flex-col gap-3 sm:gap-4 text-sm">
            <li className="bg-gradient-to-l from-tertiary-400 to-tertiary-500 bg-clip-text text-transparent uppercase font-bold text-base mb-2">
              Légales
            </li>
            <li>
              <Link
                href={"/mentions-legales"}
                className="hover:text-tertiary-400 duration-300 transition-colors"
              >
                Mentions Légales
              </Link>
            </li>
            <li>
              <Link
                href={"/politique-de-confidentialite"}
                className="hover:text-tertiary-400 duration-300 transition-colors"
              >
                Politique de confidentialité
              </Link>
            </li>
            <li>
              <Link
                href={"/cgu-cgv"}
                className="hover:text-tertiary-400 duration-300 transition-colors"
              >
                CGU / CGV
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-br from-noir-500/20 to-noir-700/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-tertiary-400/30 transition-colors duration-300">
          <ul className="font-two flex flex-col gap-3 sm:gap-4 text-sm">
            <li className="bg-gradient-to-l from-tertiary-400 to-tertiary-500 bg-clip-text text-transparent uppercase font-bold text-base mb-2">
              Contact
            </li>
            <li>
              <Link
                href={"/contactez-nous"}
                className="hover:text-tertiary-400 duration-300 transition-colors"
              >
                Contactez-nous
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright avec design moderne */}
      <div className="border-t border-white/10 pt-6 sm:pt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/60 font-one text-xs sm:text-sm text-center sm:text-left">
            © 2025 Inkera Studio. Tous droits réservés.
          </p>
          <div className="flex justify-center">
            <div className="h-1 w-16 bg-gradient-to-r from-tertiary-400 to-tertiary-500 rounded-full opacity-60"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
