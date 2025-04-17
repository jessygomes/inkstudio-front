/* eslint-disable react/no-unescaped-entities */

import React from "react";
import {
  FaRegCalendarCheck,
  FaCircleInfo,
  FaChalkboardUser,
  FaCreativeCommonsBy,
} from "react-icons/fa6";
import { RiPassValidFill } from "react-icons/ri";
import { FaEye } from "react-icons/fa";
import { HoverEffect2 } from "../ui/card-hover-effect copy";

export default function ReservationSection() {
  const features = [
    {
      icons: <FaRegCalendarCheck />,
      title: "Formulaire de prise de RDV",
      description:
        "Vos clients sélectionnent le type de prestation, leur tatoueur et un créneau disponible via un formulaire simple et rapide. Pour un projet de tatouage, ils remplissent une description de leur projet et ajoutent une image pour vous aider à mieux comprendre leurs attentes.",
    },
    {
      icons: <FaCircleInfo />,
      title: "Informations client",
      description:
        "Vos clients indiquent leurs coordonnées (nom, prénom, email, téléphone) pour faciliter la prise de contact et la gestion des rendez-vous ainsi que des informations santé (allergies, contre-indications) pour garantir la sécurité de chaque séance.",
    },
    {
      icons: <FaChalkboardUser />,
      title: "Confirmation automatique",
      description:
        "Une fois la demande envoyée, le client reçoit un email ou SMS de confirmation. Vous pouvez accepter ou proposer une autre date.",
    },
    {
      icons: <FaCreativeCommonsBy />,
      title: "Création de la fiche client",
      description:
        "A partir des informations fournies par le client pour sa prise de rendez-vous, vous pouvez créer sa fiche client automatiquement.",
    },

    {
      icons: <RiPassValidFill />,
      title: "Contrôle de la validation",
      description:
        "Activez la validation automatique ou manuelle des rendez-vous selon vos préférences. Adaptez le processus à votre façon de travailler.",
    },
    {
      icons: <FaEye />,
      title: "Confidentialité des coordonnées",
      description:
        "Gérez la visibilité de vos informations de contact sur votre profil public. Masquez votre numéro ou votre adresse email pour encourager les clients à réserver uniquement via le formulaire de prise de rendez-vous.",
    },
  ];

  return (
    <section className="bg-noir-700 px-4 sm:px-20 py-16 md:px-20">
      <div className=" py-10 flex flex-col gap-4">
        <h2 className=" text-2xl font-two uppercase text-white font-bold relative">
          Prise de{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #ff5500, #ff4d41)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            rendez-vous en ligne
          </span>{" "}
          automatisée
        </h2>
        <p className="text-white font-one">
          Gain de temps, moins de messages et une expérience client
          professionnelle et fluide. InkStudio vous permet de gérer vos demandes
          de rendez-vous en toute simplicité.
        </p>
      </div>

      <HoverEffect2 items={features} />
    </section>
  );
}
