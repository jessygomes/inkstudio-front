/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Section5() {
  return (
    // <section className="bg-secondary-600 px-20 py-16 flex flex-col gap-8 justify-center">
    <section className="flex bg-secondary-600 h-screen">
      <div className="w-full flex justify-center items-center">
        <div className="flex flex-col items-center justify-center">
          <Image
            src="/images/profil.png"
            alt="sec3"
            width={1000}
            height={1000}
            className=" object-cover w-3/4 rounded-[20px] shadow-[15px_15px_10px_0px_rgba(0,0,0,0.35)] hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      <div className="relative w-full flex flex-col justify-center gap-8">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/sec5.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.2,
            // zIndex: -1,
          }}
        ></div>
        <h2 className="relative text-white font-two tracking-wide text-3xl font-bold px-4 sm:px-20">
          Créez votre compte gratuitement afin d'être{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #ff9d00, #ff4d41)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            recensé sur notre site public !
          </span>
        </h2>
        <p className="relative text-white font-one px-4 sm:px-20">
          InkStudio propose une plateforme publique accessible à tous, où les
          utilisateurs peuvent{" "}
          <span className="font-bold">
            découvrir les salons de tatouage recensés par ville, région ou
            style.
          </span>{" "}
          <br></br>
          <br></br>
          Chaque salon dispose d’un{" "}
          <span className="font-bold text-tertiary-400">
            profil public unique
          </span>{" "}
          regroupant ses informations, son portfolio, les photos du lieu, et ses
          artistes. C’est une vitrine professionnelle idéale pour gagner en
          visibilité et attirer de nouveaux clients.
        </p>
        {/* <div className="w-full flex justify-around items-center p-8 rounded-[20px]">
        <Image
          src="/images/profil.png"
          alt="sec5"
          width={1000}
          height={1000}
          className="object-cover w-2/5 rounded-[20px] shadow-[15px_15px_10px_0px_rgba(0,0,0,0.35)] hover:scale-105 transition-transform duration-300"
        />
      </div> */}

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
