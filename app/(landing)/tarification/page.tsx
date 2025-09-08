import Header from "@/components/Shared/Header";
import Tarifs from "@/components/TarifPage/Tarifs";
import { FaArrowDown, FaEuroSign, FaCheckCircle } from "react-icons/fa";

export default function TarificationPage() {
  return (
    <>
      <div className="fixed backdrop-blur-2xl top-0 left-0 w-full z-50">
        <Header />
      </div>
      {/* Hero Section modernisée */}
      <section className="min-h-[100vh] sm:min-h-[100vh] bg-noir-700 flex items-center justify-center relative overflow-hidden pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/bgsol.png')",
            backgroundSize: "cover",
          }}
        ></div>

        {/* Overlay moderne */}
        <div className="absolute inset-0 bg-gradient-to-b from-noir-700/60 via-noir-700/40 to-noir-700/80"></div>

        <div className="relative z-0 container mx-auto px-4 sm:px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Badge moderne */}
            <div className="inline-flex items-center gap-2 bg-tertiary-500/20 border border-tertiary-400/30 rounded-full px-4 py-2 backdrop-blur-sm">
              <FaEuroSign size={14} className="text-tertiary-400" />
              <span className="text-tertiary-400 font-one text-sm font-semibold">
                PRICING
              </span>
            </div>

            {/* Titre principal */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white uppercase font-two tracking-wide leading-tight">
              <span className="block mb-1">Tarification</span>
              <span className="block bg-gradient-to-r from-tertiary-400 to-tertiary-500 bg-clip-text text-transparent">
                transparente et flexible
              </span>
            </h1>

            {/* Sous-titre */}
            <p className="text-lg sm:text-xl text-white/80 font-one leading-relaxed max-w-2xl mx-auto">
              Découvrez nos tarifs compétitifs adaptés à{" "}
              <span className="text-tertiary-400 font-semibold">
                tous les budgets
              </span>{" "}
              et conçus pour{" "}
              <span className="text-white font-semibold">
                maximiser votre rentabilité
              </span>
            </p>

            {/* Avantages rapides */}
            <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FaCheckCircle size={16} className="text-tertiary-400" />
                  <span className="text-sm font-bold text-white font-two">
                    Sans engagement
                  </span>
                </div>
                <div className="text-xs text-white/80 font-one">
                  Flexibilité totale
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FaCheckCircle size={16} className="text-tertiary-400" />
                  <span className="text-sm font-bold text-white font-two">
                    Support inclus
                  </span>
                </div>
                <div className="text-xs text-white/80 font-one">
                  Assistance 7j/7
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FaCheckCircle size={16} className="text-tertiary-400" />
                  <span className="text-sm font-bold text-white font-two">
                    Essai gratuit
                  </span>
                </div>
                <div className="text-xs text-white/80 font-one">
                  30 jours offerts
                </div>
              </div>
            </div>

            {/* CTA d'exploration */}
            <div className="flex flex-col items-center gap-4 mt-8">
              <div className="text-white/60 font-one text-sm">
                Explorez nos offres
              </div>
              <FaArrowDown
                size={24}
                className="text-tertiary-400 animate-bounce"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section introduction aux tarifs */}
      <section className="bg-gradient-to-b from-noir-700 to-noir-500 py-16">
        <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-two mb-4">
              Choisissez la formule qui vous convient
            </h2>
            <p className="text-white/70 font-one text-lg max-w-2xl mx-auto">
              Des tarifs étudiés pour s&apos;adapter à tous les types de salons,
              des tatoueurs indépendants aux studios multi-artistes
            </p>
          </div>

          {/* Indicateurs de valeur */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaEuroSign size={24} className="text-tertiary-400" />
              </div>
              <h3 className="text-xl font-bold text-white font-two mb-2">
                Prix transparent
              </h3>
              <p className="text-white/70 font-one">
                Pas de frais cachés, tout est inclus dans nos formules
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle size={24} className="text-tertiary-400" />
              </div>
              <h3 className="text-xl font-bold text-white font-two mb-2">
                Toutes fonctionnalités
              </h3>
              <p className="text-white/70 font-one">
                Accès complet à tous les outils InkStudio
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaArrowDown size={24} className="text-tertiary-400" />
              </div>
              <h3 className="text-xl font-bold text-white font-two mb-2">
                Évolutif
              </h3>
              <p className="text-white/70 font-one">
                Changez de formule à tout moment selon vos besoins
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Composant Tarifs modernisé */}
      <div className="bg-gradient-to-b from-noir-500 to-noir-700">
        <Tarifs />
      </div>

      {/* Section finale encouragement */}
      <section className="bg-noir-700 py-20">
        <div className="container mx-auto px-4 sm:px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-two">
              Prêt à transformer votre salon ?
            </h2>
            <p className="text-xl text-white/80 font-one leading-relaxed">
              Rejoignez les centaines de tatoueurs qui ont déjà choisi{" "}
              <span className="text-tertiary-400 font-semibold">InkStudio</span>{" "}
              pour{" "}
              <span className="text-white font-semibold">
                professionnaliser leur activité
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <button className="bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white font-one font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg">
                Démarrer l&apos;essai gratuit
              </button>
              <button className="border border-white/20 text-white hover:bg-white/10 font-one font-semibold px-8 py-4 rounded-2xl transition-all duration-300">
                Contactez-nous
              </button>
            </div>

            <div className="flex justify-center items-center gap-6 mt-8 text-sm text-white/60">
              <span>✓ Sans engagement</span>
              <span>✓ Support inclus</span>
              <span>✓ Installation comprise</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
