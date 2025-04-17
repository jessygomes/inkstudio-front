import Image from "next/image";
import React from "react";

export default function Section3() {
  return (
    <section className="bg-primary-500 flex flex-col-reverse sm:flex-row sm:h-screen">
      <div className="w-full h-[50vh] sm:h-full flex justify-center items-center">
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
      <div className="w-full h-[50vh] sm:h-full relative flex flex-col justify-center gap-4">
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
          InkStudio, pensé{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #ff5500, #ff4d41)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            avec et pour
          </span>{" "}
          les tatoueurs.
        </h2>
        <p className="px-4 sm:px-20 text-white font-one relative z-10">
          De la réservation à la cicatrisation, InkStudio vous fait gagner du
          temps, simplifie votre organisation, et améliore l’expérience de vos
          clients.
        </p>
        <p className="px-4 sm:px-20 text-white font-one relative z-10">
          InkStudio a été conçu main dans la main avec des tatoueurs. Chaque
          fonctionnalité répond à un vrai besoin du terrain.
        </p>
      </div>
    </section>
  );
}
