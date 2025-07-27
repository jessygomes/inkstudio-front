/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import React from "react";

export default function ProfilSection() {
  return (
    <section className="bg-secondary-600 flex flex-col-reverse sm:flex-row sm:h-screen">
      <div className="w-full sm:w-2/3 py-16 sm:py-0 flex justify-center items-center">
        <div className="flex flex-col items-center justify-center">
          <Image
            src="/images/dash.png"
            alt="sec3"
            width={1000}
            height={1000}
            className=" object-cover w-3/4 rounded-[20px] shadow-[15px_15px_10px_0px_rgba(0,0,0,0.35)] hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      <div className="w-full py-16 sm:py-0 relative flex flex-col justify-center gap-4">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/sec3.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.4,
            // zIndex: -1,
          }}
        ></div>
        <h2 className="px-4 sm:px-20 text-2xl font-two uppercase text-white font-bold relative z-10">
          Profil public du salon <br />
          <span
            style={{
              background: "linear-gradient(90deg, #ff9d00, #ff4d41)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Votre vitrine professionnelle en ligne
          </span>{" "}
        </h2>
        <p className="px-4 sm:px-20 text-white text-sm font-one relative z-10">
          Chaque salon inscrit sur InkStudio dispose d’un profil public complet,
          pensé comme une{" "}
          <span className="text-tertiary-500 font-bold">
            vitrine digitale professionnelle
          </span>
          . <br /> C’est l’endroit idéal pour mettre en valeur votre univers,
          votre équipe, vos œuvres et vos services — et permettre aux clients de
          réserver facilement.
        </p>

        <p className="px-4 sm:px-20 text-white text-sm font-one relative">
          Le profil public du salon de tatouage sur InkStudio est une vitrine
          digitale professionnelle conçue pour améliorer{" "}
          <span className="text-tertiary-500 font-bold">
            votre visibilité en ligne.
          </span>{" "}
          Il centralise vos infos clés (adresse, horaires, artistes, portfolio,
          photos, produits, avis). <br /> Grâce à une interface claire et
          responsive,{" "}
          <span className="text-tertiary-500 font-bold">
            les clients peuvent facilement vous trouver, découvrir votre
            univers, consulter vos réalisations et prendre rendez-vous
            directement en ligne.
          </span>{" "}
          Une solution idéale pour attirer de nouveaux clients, développer votre
          notoriété locale et{" "}
          <span className=" font-bold">
            centraliser votre présence web sur une seule plateforme dédiée aux
            tatoueurs.
          </span>
        </p>

        <p className="px-4 sm:px-20 text-white font-two font-bold relative uppercase">
          Un profil public pour référencer votre salon et attirer des clients
        </p>
        <p className="px-4 sm:px-20 text-white text-sm font-one relative">
          Votre profil est indexé sur notre site web de recherche public,
          consultable par ville, région ou style de tatouage. Idéal pour attirer
          de nouveaux clients !
        </p>

        <ul className="px-4 sm:px-20 flex flex-col gap-4 list-disc list-inside text-white font-one text-sm relative">
          <li>Vous êtes visible 24h/24, même sans site web personnel</li>
          <li>
            Les clients découvrent votre salon, vos tatoueurs, vos œuvres et vos
            produits en quelques secondes
          </li>
          <li>Vous gagnez en crédibilité et professionnalisez votre image</li>
        </ul>
        <p className="px-4 sm:px-20 text-white font-one relative z-10">
          Un profil clair, bien présenté = plus de visibilité, plus de clients.
        </p>
      </div>
    </section>
  );
}
