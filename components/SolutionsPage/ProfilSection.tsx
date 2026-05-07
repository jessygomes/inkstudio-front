import Image from "next/image";
import {
  FaGlobe,
  FaImages,
  FaUsers,
  FaCalendarAlt,
  FaEye,
} from "react-icons/fa";

const features = [
  {
    icon: <FaGlobe size={24} className="text-tertiary-400" />,
    title: "Visibilité 24h/24",
    description:
      "Visible en ligne même sans site web personnel. Référencé par ville, région ou style artistique.",
  },
  {
    icon: <FaImages size={24} className="text-tertiary-400" />,
    title: "Portfolio & Galerie",
    description:
      "Vos œuvres, photos du salon et réalisations des artistes dans une galerie professionnelle soignée.",
  },
  {
    icon: <FaUsers size={24} className="text-tertiary-400" />,
    title: "Présentation équipe",
    description:
      "Profils des tatoueurs, spécialités et styles pour que les clients trouvent l'artiste idéal.",
  },
  {
    icon: <FaCalendarAlt size={24} className="text-tertiary-400" />,
    title: "Réservation directe",
    description:
      "Prise de rendez-vous directement depuis votre profil public, sans passer par d'autres plateformes.",
  },
  {
    icon: <FaEye size={24} className="text-tertiary-400" />,
    title: "Confidentialité maîtrisée",
    description:
      "Contrôle total de la visibilité de vos informations personnelles et de celles de votre salon.",
  },
   {
    icon: <FaGlobe size={24} className="text-tertiary-400" />,
    title: "Gratuit pour les salons",
    description:
      "Profitez de cette vitrine pro gratuitement en vous inscrivant sur Inkera Studio avec le Plan FREE.",
  },
];

export default function ProfilSection() {
  return (
    <section className="relative overflow-hidden bg-noir-700 py-20 sm:py-16">
     

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-8">
        {/* Hero split */}
        <div className="mb-14 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          {/* Texte côté gauche */}
          <div className="lg:col-span-7">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-tertiary-400/25 bg-tertiary-500/10 px-4 py-2">
              <FaGlobe size={15} className="text-tertiary-400" />
              <span className="text-sm font-semibold text-tertiary-400 font-one">
                Vitrine Professionnelle
              </span>
            </div>

            <h2 className="text-3xl font-bold uppercase leading-tight text-white font-two sm:text-4xl lg:text-5xl">
              Votre profil public,
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #ff9d00, #ff4d41)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                votre vitrine en ligne
              </span>
            </h2>

            <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/72 font-one sm:text-lg">
              Chaque salon inscrit sur INKERA Studio dispose d&apos;un profil
              public complet. Mettez en valeur votre univers, votre équipe et
              vos réalisations pour attirer de nouveaux clients directement en
              ligne.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs text-white/80 font-one">
                Portfolio intégré
              </span>
              <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs text-white/80 font-one">
                Réservation directe
              </span>
              <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs text-white/80 font-one">
                Référencement local
              </span>
            </div>
          </div>

          {/* Image côté droit */}
          <div className="lg:col-span-5">
            <div className="group relative mx-auto max-w-xl">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-tertiary-400/25 via-tertiary-500/20 to-tertiary-600/20 blur-xl transition-all duration-700 group-hover:blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-noir-800/60 p-3 backdrop-blur-sm">
                <Image
                  src="/images/Profil_public.png"
                  alt="Interface profil salon"
                  width={1400}
                  height={900}
                  className="w-full rounded-2xl"
                  style={{ height: "auto" }}
                />
              </div>
             
              <div className="absolute bottom-4 right-4 rounded-2xl border border-white/20 bg-black/35 px-3 py-1 text-[11px] text-white/90 backdrop-blur-md font-one">
                🌐 En ligne
              </div>
            </div>
          </div>
        </div>

        {/* KPI row */}
        <div className="mb-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-center">
            <p className="text-xl font-bold text-white font-two">24/7</p>
            <p className="text-[11px] text-white/55 font-one">Visibilité en ligne</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-center">
            <p className="text-xl font-bold text-white font-two">0€</p>
            <p className="text-[11px] text-white/55 font-one">Site web requis</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-center">
            <p className="text-xl font-bold text-white font-two">1 lien</p>
            <p className="text-[11px] text-white/55 font-one">Partageable partout</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-center">
            <p className="text-xl font-bold text-white font-two">SEO</p>
            <p className="text-[11px] text-white/55 font-one">Référencement local</p>
          </div>
        </div>

        {/* Feature cards */}
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
