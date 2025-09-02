import React from "react";
import { HoverEffect } from "../ui/card-hover-effect";
import {
  FaRegCalendarCheck,
  FaAddressCard,
  FaCamera,
  FaBell,
} from "react-icons/fa6";

export const projects = [
  {
    icons: <FaRegCalendarCheck />,
    title: "Réservation en ligne intelligente",
    description:
      "Fini les DM et les allers-retours. Vos clients réservent directement en ligne, choisissent leur créneau, reçoivent un rappel automatique.",
    link: "/solutions",
  },
  {
    icons: <FaAddressCard />,
    title: "Fiches clients & historique",
    description:
      "Accédez en 1 clic à l’historique complet de chaque client : infos, photos, zones tatouées, allergies... tout est organisé.",
    link: "/solutions",
  },
  {
    icons: <FaCamera />,
    title: "Portfolio en ligne",
    description:
      "Montrez vos plus belles créations grâce à une galerie personnalisée, partageable en un lien, avec protection anti-vol (watermark).",
    link: "/solutions",
  },
  {
    icons: <FaBell />,
    title: "Rappels & soins automatiques",
    description:
      "Emails automatiques pour rappeler les RDV et envoyer les instructions de soin. Vos clients sont suivis même après la séance.",
    link: "/solutions",
  },
];

export default function Section2() {
  return (
    <section className="px-4 sm:px-20 py-16 bg-noir-700">
      <h2 className="text-white font-two tracking-wide text-2xl sm:text-3xl font-bold py-2">
        Moins d’administratif, plus de tatouages.{" "}
        <span
          className="font-bold text-xl sm:text-2xl uppercase bg-gradient-to-l from-tertiary-400 to-tertiary-500 bg-clip-text text-transparent"
          // style={{
          //   background: "linear-gradient(90deg, #ff9d00, #ff4d41)",
          //   WebkitBackgroundClip: "text",
          //   WebkitTextFillColor: "transparent",
          // }}
        >
          La plateforme tout-en-un !
        </span>
      </h2>
      <p className="text-white font-one">
        Gérez vos RDV, vos clients, vos soins et votre planning en un seul
        endroit. InkStudio simplifie votre quotidien pour que vous puissiez vous
        concentrer sur l’essentiel : <span className="font-bold">tatouer</span>.
      </p>

      <div className="flex mt-10 gap-4">
        <HoverEffect items={projects} />
      </div>
    </section>
  );
}
