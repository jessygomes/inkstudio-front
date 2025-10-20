/* eslint-disable react/no-unescaped-entities */
import { FaCheck, FaCrown, FaRocket, FaUsers } from "react-icons/fa";

export default function Tarifs() {
  const plans = [
    {
      name: "Free",
      subtitle: "Parfait pour débuter",
      price: "0",
      period: "mois",
      description:
        "Idéal pour les salons qui souhaitent simplement être visibles en ligne.",
      icon: <FaUsers size={24} className="text-blue-400" />,
      features: [
        "Profil public professionnel",
        "Portfolio d’images",
        "Produits & services",
        "Profil tatoueur principal",
        "Lien direct de contact",
      ],
      popular: false,
      cta: "Commencer l'essai",
      color: "blue",
    },
    {
      name: "Studio",
      subtitle: "Le plus populaire",
      price: "29",
      period: "mois",
      description:
        "Idéal pour les tatoueurs indépendants qui démarrent leur activité",
      icon: <FaCrown size={24} className="text-tertiary-400" />,
      features: [
        "1 tatoueur",
        "Gestion clients illimitée",
        "Réservation en ligne",
        "Profil public",
        "Support email",
        "Sauvegarde cloud",
      ],
      popular: true,
      cta: "Essayer gratuitement",
      color: "tertiary",
    },
    {
      name: "Pro",
      subtitle: "Pour les grandes structures",
      price: "59",
      period: "mois",
      description: "Solution complète pour les salons avec plusieurs artistes",
      icon: <FaRocket size={24} className="text-purple-400" />,
      features: [
        "Tatoueurs illimités",
        "Gestion du stock",
        "Tout du plan Solo",
        "Statistiques détaillées",
        "Support prioritaire",
        "Formations incluses",
      ],
      popular: false,
      cta: "Nous contacter",
      color: "purple",
    },
  ];

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      {/* Éléments décoratifs de fond */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-tertiary-400/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/3 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-8 max-w-7xl relative z-10">
        {/* Header moderne */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-two font-bold text-white mb-6">
            Nos formules d'abonnement
          </h2>
          <p className="text-xl text-white/70 font-one max-w-3xl mx-auto leading-relaxed">
            Choisissez la solution qui correspond à votre salon et faites
            évoluer votre abonnement selon vos besoins
          </p>
        </div>

        {/* Grille des tarifs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative group ${
                plan.popular
                  ? "bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/10 border-2 border-tertiary-400/30"
                  : "bg-gradient-to-br from-noir-600/30 to-noir-800/30 border border-white/10"
              } backdrop-blur-xl rounded-3xl p-8 transition-all duration-500 hover:transform hover:scale-[1.02] hover:border-tertiary-400/40`}
            >
              {/* Badge populaire */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                    ⭐ Recommandé
                  </div>
                </div>
              )}

              {/* Header du plan */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      plan.color === "tertiary"
                        ? "bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20"
                        : plan.color === "purple"
                        ? "bg-gradient-to-br from-purple-500/20 to-purple-600/20"
                        : "bg-gradient-to-br from-blue-500/20 to-blue-600/20"
                    }`}
                  >
                    {plan.icon}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white font-two mb-2">
                  {plan.name}
                </h3>
                <p
                  className={`text-sm font-semibold mb-4 ${
                    plan.popular ? "text-tertiary-400" : "text-white/60"
                  }`}
                >
                  {plan.subtitle}
                </p>

                <div className="mb-4">
                  {plan.price === "Sur mesure" ? (
                    <div className="text-3xl font-bold text-white font-two">
                      Sur mesure
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-white font-two">
                        {plan.price}€
                      </span>
                      <span className="text-white/60 font-one">
                        /{plan.period}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-white/70 font-one text-sm leading-relaxed">
                  {plan.description}
                </p>
              </div>

              {/* Liste des fonctionnalités */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 ${
                        plan.popular ? "bg-tertiary-400/20" : "bg-white/10"
                      }`}
                    >
                      <FaCheck
                        size={12}
                        className={
                          plan.popular ? "text-tertiary-400" : "text-white/70"
                        }
                      />
                    </div>
                    <span className="text-white/90 font-one text-sm">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                className={`w-full py-4 px-6 rounded-2xl font-one font-semibold transition-all duration-300 hover:scale-105 ${
                  plan.popular
                    ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white shadow-lg"
                    : "border border-white/20 text-white hover:bg-white/10"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Section FAQ/Informations */}
        <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-white/10">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-white font-two text-center mb-8">
              Questions fréquentes
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-bold text-white font-two mb-3">
                  Puis-je changer de formule ?
                </h4>
                <p className="text-white/70 font-one text-sm leading-relaxed">
                  Oui, vous pouvez upgrader ou downgrader votre abonnement à
                  tout moment depuis votre espace client.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white font-two mb-3">
                  Y a-t-il un engagement ?
                </h4>
                <p className="text-white/70 font-one text-sm leading-relaxed">
                  Aucun engagement requis. Vous pouvez annuler votre abonnement
                  à tout moment sans frais.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white font-two mb-3">
                  Le support est-il inclus ?
                </h4>
                <p className="text-white/70 font-one text-sm leading-relaxed">
                  Oui, tous nos plans incluent un support technique.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white font-two mb-3">
                  Mes données sont-elles sécurisées ?
                </h4>
                <p className="text-white/70 font-one text-sm leading-relaxed">
                  Toutes vos données sont chiffrées et sauvegardées
                  quotidiennement sur des serveurs sécurisés.
                </p>
              </div>
            </div>

            <div className="text-center mt-8 p-6 bg-white/5 rounded-2xl">
              <p className="text-tertiary-400 font-one font-semibold">
                🎁 30 jours d'essai gratuit sur tous les plans - Aucune carte
                bancaire requise
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
