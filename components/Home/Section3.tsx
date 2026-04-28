import Image from "next/image";
import React from "react";

export default function Section3() {
  return (
    <section className="bg-primary-500 flex flex-col-reverse lg:flex-row sm:h-screen">
      {/* Section image - responsive */}
      <div className="w-full h-[50vh] sm:h-full flex justify-center items-center">
        <div className="flex flex-col items-center justify-center">
          <div className="group relative w-3/4 overflow-hidden rounded-[20px] border border-white/15 shadow-[15px_15px_10px_0px_rgba(0,0,0,0.35)]">
            <Image
              src="/images/dash.png"
              alt="sec3"
              width={1000}
              height={1000}
              className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-black/25 backdrop-blur-[6px] [mask-image:linear-gradient(135deg,black_12%,rgba(0,0,0,0.88)_48%,transparent_100%)]" />
            <div className="pointer-events-none absolute inset-x-6 bottom-6 rounded-2xl border border-white/20 bg-white/10 px-4 py-4 backdrop-blur-md" />
          </div>
        </div>
      </div>
      <div className="w-full h-[50vh] lg:h-full relative flex flex-col justify-center gap-4">
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
        <h2 className="px-4 sm:px-10 lg:px-20 text-2xl font-two uppercase text-white font-bold relative z-10">
          INKERA Studio, pensé{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #ff9d00, #ff4d41)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            avec et pour
          </span>{" "}
          les tatoueurs.
        </h2>
        <p className="px-4 sm:px-10 lg:px-20 text-white font-one relative z-10">
          De la réservation à la cicatrisation, INKERA Studio vous fait gagner
          du temps, simplifie votre organisation, et améliore l’expérience de
          vos clients.
        </p>
        <p className="px-4 sm:px-10 lg:px-20 text-white font-one relative z-10">
          INKERA Studio a été conçu main dans la main avec des tatoueurs. Chaque
          fonctionnalité répond à un vrai besoin du terrain.
        </p>
      </div>
    </section>
  );
}
