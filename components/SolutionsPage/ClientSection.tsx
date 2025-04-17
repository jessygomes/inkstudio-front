/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import { FaCircleInfo } from "react-icons/fa6";
import { BiDetail } from "react-icons/bi";
import { FaNotesMedical, FaHistory } from "react-icons/fa";
import { AiOutlineMonitor } from "react-icons/ai";

export default function ClientSection() {
  return (
    <section className="bg-primary-500 flex flex-col-reverse sm:flex-row sm:h-[150vh]">
      <div className="w-full py-16 sm:py-0 sm:w-2/3 flex justify-center items-center">
        <div className="flex flex-col items-center justify-center gap-10">
          <Image
            src="/images/fiche.png"
            alt="sec3"
            width={1000}
            height={1000}
            className=" object-cover w-full rounded-[20px] shadow-[15px_15px_10px_0px_rgba(0,0,0,0.35)] hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      <div className="w-full py-16 sm:py-0 relative flex flex-col justify-center gap-4">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/seclient.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.3,
            // zIndex: -1,
          }}
        ></div>
        <h2 className="px-4 sm:px-20 text-2xl font-two uppercase text-white font-bold relative z-10">
          Gestion des clients et{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #ff5500, #ff4d41)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            historique des prestations
          </span>
        </h2>
        <p className="px-4 sm:px-20 text-white font-one relative z-10">
          Gérez l’ensemble de vos clients de manière centralisée et sécurisée
          grâce aux fiches clients intelligentes d’InkStudio. À chaque nouveau
          rendez-vous validé, une fiche client est générée automatiquement avec
          toutes les informations utiles avant, pendant et après la séance.
        </p>

        <p className="px-4 sm:px-20 text-white font-one font-bold relative">
          InkStudio transforme la gestion client en atout professionnel : →
          Moins de stress, plus d’organisation, et une vraie qualité de suivi.
        </p>

        <div className="grid grid-cols-1 gap-8 mt-4">
          <div className="mx-4 sm:mx-20  rounded-[20px]">
            <div className="flex gap-10 items-center mb-2">
              <FaCircleInfo size={20} className="text-tertiary-500 relative" />
              <p className="font-bold text-white font-one relative z-10">
                Informations de base
              </p>
            </div>
            <ul className="flex flex-col gap-2 list-disc list-inside text-white text-sm font-one relative">
              <p>
                Nom, prénom, email, téléphone et date de naissance (vérification
                majorité)
              </p>
              <p>
                Ces données permettent d’assurer le suivi du client, de le
                contacter facilement, et de respecter les obligations légales
                liées à l’âge minimum pour se faire tatouer.
              </p>
            </ul>
          </div>

          <div className="mx-4 sm:mx-20 rounded-[20px]">
            <div className="flex gap-10 items-center mb-2">
              <BiDetail size={20} className="text-tertiary-500 relative" />
              <p className=" font-bold text-white font-one relative z-10">
                Détails du tatouage à réaliser
              </p>
            </div>
            <ul className=" flex flex-col gap-2 list-disc list-inside text-white text-sm font-one relative">
              <p>
                Cela vous permet d’anticiper le matériel nécessaire, d’éviter
                les malentendus, et de garder un historique clair du projet.
              </p>
            </ul>
          </div>

          <div className="mx-4 sm:mx-20  rounded-[20px]">
            <div className="flex gap-10 items-center mb-2">
              <FaNotesMedical
                size={20}
                className="text-tertiary-500 relative"
              />
              <p className="font-bold text-white font-one relative z-10">
                Antécédents médicaux & contre-indications
              </p>
            </div>
            <ul className="flex flex-col gap-4 list-disc list-inside text-white text-sm font-one relative">
              <p>
                La fiche permet de noter les allergies connues (latex, etc.),
                les problèmes de santé (diabète, troubles de la
                cicatrisation...), les médicamets en cours et des informations
                sensibles (grossesse, peau réactive...)
              </p>
              <p>
                Ces informations permettent de travailler en toute sécurité et
                d’adapter vos pratiques à chaque client.
              </p>
            </ul>
          </div>

          <div className="mx-4 sm:mx-20 rounded-[20px]">
            <div className="flex gap-10 items-center mb-2">
              <FaHistory size={20} className="text-tertiary-500 relative" />
              <p className=" font-bold text-white font-one relative z-10">
                Historique des prestations
              </p>
            </div>
            <ul className=" flex flex-col gap-2 list-disc list-inside text-white text-sm font-one relative">
              <p>
                Liste des tatouages déjà réalisés, vos annotations (temps de
                cicatrisation observé, etc.)
              </p>
              <p>
                Vous retrouvez instantanément tout l’historique d’un client, ce
                qui est essentiel pour les retouches ou les demandes de nouveau
                projet.
              </p>
            </ul>
          </div>

          <div className="mx-4 sm:mx-20 rounded-[20px]">
            <div className="flex gap-10 items-center mb-2">
              <AiOutlineMonitor
                size={20}
                className="text-tertiary-500 relative"
              />
              <p className="font-bold text-white font-one relative z-10">
                Suivi post-tatouage & cicatrisation
              </p>
            </div>
            <ul className="flex flex-col gap-4 list-disc list-inside text-white text-sm font-one relative">
              <p>
                Envoie automatique d'un email avec vos consignes de soin après
                chaque séance. Puis envoie automatique d'un lien unique pour
                recevoirune photo 15 jours après la séance pour vérifier la
                cicatrisation et donner un feedback rapide.
              </p>
              <p>
                Le suivi est professionnel et rassurant pour vos clients, tout
                en réduisant les demandes de retouche non justifiées.
              </p>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
