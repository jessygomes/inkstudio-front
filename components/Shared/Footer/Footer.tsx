import Link from "next/link";
import React from "react";

export default function Footer() {
  return (
    <footer className="px-4 py-20 sm:px-20 bg-noir-700">
      <div className="flex items-center justify-center gap-4 mb-8">
        <h3 className="text-white text-3xl font-two font-bold uppercase">
          InkStudio
        </h3>
        <div className="bg-white/50 w-full h-[1px]"></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-0 text-white">
        <ul className="font-two flex flex-col gap-4 text-sm">
          <li className="bg-gradient-to-l from-tertiary-400 to-tertiary-500 bg-clip-text text-transparent uppercase font-bold">
            Navigation
          </li>
          <li>
            <Link href={"/"} className="hover:text-white/70 duration-300">
              Accueil
            </Link>
          </li>
          <li>
            <Link
              href={"/solutions"}
              className="hover:text-white/70 duration-300"
            >
              Solutions
            </Link>
          </li>
          <li>
            <Link
              href={"/tarification"}
              className="hover:text-white/70 duration-300"
            >
              Tarification
            </Link>
          </li>
          <li>
            <Link
              href={"/connexion"}
              className="hover:text-white/70 duration-300"
            >
              Connexion / Inscription
            </Link>
          </li>
        </ul>

        <ul className="font-two flex flex-col gap-4 text-sm">
          <li className="bg-gradient-to-l from-tertiary-400 to-tertiary-500 bg-clip-text text-transparent uppercase font-bold">
            Qui sommes-nous ?
          </li>
          <li>
            <Link
              href={"/a-propos"}
              className="hover:text-white/70 duration-300"
            >
              A Propos de INKSTUDIO
            </Link>
          </li>
          <li>
            <Link
              href={"https://www.inthegleam.com/"}
              target="_blank"
              className="hover:text-white/70 duration-300"
            >
              Project by inTheGleam
            </Link>
          </li>
        </ul>

        <ul className="font-two flex flex-col gap-4 text-sm">
          <li className="bg-gradient-to-l from-tertiary-400 to-tertiary-500 bg-clip-text text-transparent uppercase font-bold">
            Légales
          </li>
          <li>
            <Link
              href={"/mentions-legales"}
              className="hover:text-white/70 duration-300"
            >
              Mentions Légales
            </Link>
          </li>
          <li>
            <Link
              href={"/politique-de-confidentialite"}
              className="hover:text-white/70 duration-300"
            >
              Politique de confidentialité
            </Link>
          </li>
          <li>
            <Link
              href={"/cgu-cgv"}
              className="hover:text-white/70 duration-300"
            >
              CGU / CGV
            </Link>
          </li>
        </ul>

        <ul className="font-two flex flex-col gap-4 text-sm">
          <li className="bg-gradient-to-l from-tertiary-400 to-tertiary-500 bg-clip-text text-transparent uppercase font-bold">
            Contact
          </li>
          <li>
            <Link
              href={"/contactez-nous"}
              className="hover:text-white/70 duration-300"
            >
              Contactez-nous
            </Link>
          </li>
          {/* <li>
            <Link
              href={"/politique-de-confidentialite"}
              className="hover:text-white/70 duration-300"
            >
              Politique de confidentialité
            </Link>
          </li>
          <li>
            <Link
              href={"/cgu-cgv"}
              className="hover:text-white/70 duration-300"
            >
              CGU / CGV
            </Link>
          </li> */}
        </ul>
      </div>
    </footer>
  );
}
