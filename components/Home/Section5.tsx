/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Section5() {
  return (
    <section className="bg-secondary-600 flex flex-col lg:flex-row lg:h-screen">
      {/* Section image - version modernisée */}
      <div className="relative flex h-[50vh] w-full items-center justify-center overflow-hidden p-8 sm:p-10 lg:h-full lg:w-1/2">
        {/* <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[14%] top-[18%] h-32 w-32 rounded-full bg-tertiary-500/20 blur-3xl sm:h-44 sm:w-44" />
          <div className="absolute bottom-[18%] right-[16%] h-36 w-36 rounded-full bg-primary-500/20 blur-3xl sm:h-48 sm:w-48" />
        </div> */}

        <div className="relative w-[45%] max-w-[280px] sm:w-[42%] sm:max-w-[250px] md:w-[36%] md:max-w-[220px] lg:w-[40%] lg:max-w-[300px]">
          <div className="absolute -inset-3 rounded-[34px] bg-gradient-to-br from-white/15 via-white/5 to-transparent opacity-80 blur-xl" />

          <div className="relative rounded-[30px] border border-white/20 bg-gradient-to-br from-white/12 to-white/4 p-2.5 shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur-md">
            <div className="overflow-hidden rounded-[24px] border border-white/15 bg-noir-700/30">
              <Image
                src="/images/iphone_profil.webp"
                alt="Application INKERA sur mobile"
                width={1000}
                height={1000}
                className="h-auto max-h-[42vh] w-full object-contain transition-transform duration-500 hover:scale-[1.03] sm:max-h-[38vh] md:max-h-[34vh] lg:max-h-none"
                priority
              />
            </div>
          </div>

          <div className="pointer-events-none absolute -bottom-5 left-1/2 h-8 w-4/5 -translate-x-1/2 rounded-full bg-black/45 blur-xl" />
        </div>
      </div>

      {/* Section contenu - même structure que Section3 */}
      <div className="w-full lg:w-1/2 h-full relative flex flex-col justify-center gap-6 lg:gap-8 py-10 lg:py-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/sec5.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.2,
          }}
        ></div>

        <h2 className="px-4 sm:px-20 text-xl sm:text-2xl lg:text-3xl font-two tracking-wide text-white font-bold relative z-10 leading-tight">
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

        {/* Contenu avec design moderne en gardant la structure Section3 */}
        <div className="px-4 sm:px-20 relative z-10">
          <div className="bg-gradient-to-br from-noir-500/20 to-noir-700/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 mb-4 sm:mb-6">
            <p className="text-white/90 font-one text-sm sm:text-base leading-relaxed">
              INKERA Studio propose une plateforme publique accessible à tous,
              où les utilisateurs peuvent{" "}
              <span className="font-bold text-tertiary-400">
                découvrir les salons de tatouage recensés par ville, région ou
                style.
              </span>
            </p>
          </div>

          <div className="bg-gradient-to-br from-noir-500/20 to-noir-700/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10">
            <p className="text-white/90 font-one text-sm sm:text-base leading-relaxed">
              Chaque salon dispose d'un{" "}
              <span className="font-bold text-tertiary-400">
                profil public unique
              </span>{" "}
              regroupant ses informations, son portfolio, les photos du lieu, et
              ses artistes. C'est une vitrine professionnelle idéale pour gagner
              en visibilité et attirer de nouveaux clients.
            </p>
          </div>
        </div>

        {/* Bouton avec marge adaptée à la structure */}
        <div className="px-4 sm:px-20 relative z-10 mx-auto">
          <Link
            href={"/inscription"}
            className="group cursor-pointer bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 w-full max-w-sm text-center text-white font-one py-2 px-10 rounded-4xl hover:scale-105 transition-all ease-in-out duration-300 shadow-lg hover:shadow-2xl border border-tertiary-400/20 block"
          >
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="text-sm sm:text-base">
                Créer un compte gratuit
              </span>
            </span>
          </Link>
        </div>

        <div className="flex justify-center mt-2">
          <div className="h-1 w-20 bg-gradient-to-r from-tertiary-400 to-tertiary-500 rounded-full opacity-80 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
