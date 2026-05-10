import Image from "next/image";
import {
  FaRegCalendarCheck,
  FaCircleInfo,
  FaChalkboardUser,
  FaCreativeCommonsBy,
} from "react-icons/fa6";
import { FaEye, FaCalendarAlt } from "react-icons/fa";

export default function ReservationSection() {
  const features = [
    {
      icon: <FaRegCalendarCheck size={24} className="text-tertiary-400" />,
      title: "Formulaire de prise de RDV",
      description:
        "Interface intuitive pour vos clients : sélection du service, choix du tatoueur et créneaux disponibles en temps réel.",
    },
    {
      icon: <FaCircleInfo size={24} className="text-tertiary-400" />,
      title: "Informations client complètes",
      description:
        "Collecte automatique des données essentielles mises par le client : coordonnées, informations médicales et préférences personnelles.",
    },
    {
      icon: <FaChalkboardUser size={24} className="text-tertiary-400" />,
      title: "Confirmation intelligente",
      description:
        "Notifications automatiques par email avec possibilité de validation ou reprogrammation.",
    },
    {
      icon: <FaCreativeCommonsBy size={24} className="text-tertiary-400" />,
      title: "Fiche client automatisée",
      description:
        "Génération instantanée des fiches clients avec toutes les données de réservation pré-remplies.",
    },
    {
      icon: <FaEye size={24} className="text-tertiary-400" />,
      title: "Confidentialité maîtrisée",
      description:
        "Contrôle total de la visibilité de vos informations personnelles sur votre profil public.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-noir-700 py-20 sm:py-16">
    
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-8">
        <div className="mb-14 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-tertiary-400/25 bg-tertiary-500/10 px-4 py-2">
              <FaCalendarAlt size={15} className="text-tertiary-400" />
              <span className="text-sm font-semibold text-tertiary-400 font-one">
                Réservation Intelligente
              </span>
            </div>

            <h2 className="text-3xl font-bold uppercase leading-tight text-white font-two sm:text-4xl lg:text-5xl">
              Réduisez la friction,
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #ff9d00, #ff4d41)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                accélérez chaque réservation
              </span>
            </h2>

            <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/72 font-one sm:text-lg">
              Offrez un tunnel de prise de rendez-vous fluide, automatisé et
              rassurant. Vos clients réservent plus vite, vous récupérez moins
              de messages manuels et vous gardez la maîtrise complète de votre
              planning.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs text-white/80 font-one">
                Disponibilité en temps réel
              </span>
              <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs text-white/80 font-one">
                Confirmation intelligente
              </span>
              <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs text-white/80 font-one">
                Fiche client automatique
              </span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="group relative mx-auto max-w-xl">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-tertiary-400/25 via-tertiary-500/20 to-tertiary-600/20 blur-xl transition-all duration-700 group-hover:blur-2xl" />

              <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-noir-800/60 p-3 backdrop-blur-sm">
                <Image
                  src="/images/Rdv_app.png"
                  alt="Interface de réservation moderne"
                  width={1400}
                  height={900}
                  className="w-full rounded-2xl"
                  style={{ height: "auto" }}
                />
              </div>

              <div className="absolute left-4 top-4 rounded-2xl border border-white/20 bg-black/35 px-3 py-1 text-[11px] text-white/90 backdrop-blur-md font-one">
                Interface INKERA Studio
              </div>
              <div className="absolute bottom-4 right-4 rounded-2xl border border-white/20 bg-black/35 px-3 py-1 text-[11px] text-white/90 backdrop-blur-md font-one">
                Synchronisation instantanée
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-center">
            <p className="text-xl font-bold text-white font-two">24/7</p>
            <p className="text-[11px] text-white/55 font-one">Prise de RDV</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-center">
            <p className="text-xl font-bold text-white font-two">-70%</p>
            <p className="text-[11px] text-white/55 font-one">Coordination manuelle</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-center">
            <p className="text-xl font-bold text-white font-two">+85%</p>
            <p className="text-[11px] text-white/55 font-one">Satisfaction client</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-center">
            <p className="text-xl font-bold text-white font-two">1 clic</p>
            <p className="text-[11px] text-white/55 font-one">Validation flexible</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => (
            <article
              key={index}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-noir-600/35 to-noir-800/30 p-5 transition-all duration-300 hover:border-tertiary-400/30 hover:bg-noir-600/45"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-tertiary-400/6 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10 flex items-start gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-tertiary-400/20 bg-tertiary-500/15">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="mb-2 text-base font-semibold text-white font-two group-hover:text-tertiary-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/62 font-one group-hover:text-white/78">
                    {feature.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
