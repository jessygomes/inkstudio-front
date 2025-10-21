"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CiCreditCard1 } from "react-icons/ci";
import { FaCheck } from "react-icons/fa";
import { availablePlans, getPlanDetails } from "@/lib/saasPlan.data";
import { Subscription } from "@/lib/type";

interface SubscriptionSectionProps {
  openSections: {
    account: boolean;
    subscription: boolean;
    notifications: boolean;
    security: boolean;
    preferences: boolean;
  };
  toggleSection: (
    section:
      | "subscription"
      | "account"
      | "notifications"
      | "security"
      | "preferences"
  ) => void;
  userId: string | null;
}

export default function SubscriptionSection({
  openSections,
  toggleSection,
  userId,
}: SubscriptionSectionProps) {
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [loading, setLoading] = useState(true);

  //! Récupérer le plan utilisateur
  const fetchUserPlan = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/saas/plan/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Inclut automatiquement le cookie "session"
        }
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération du plan utilisateur");
      }
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du plan utilisateur :",
        error
      );
    }
  }, [userId]);

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchUserPlan()]);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAccountData();
    } else {
      setLoading(false);
    }
  }, [userId, fetchUserPlan]);

  //! CHANGER DE PLAN
  const handlePlanChange = async (newPlan: string) => {
    if (!userId || !subscription?.currentPlan) return;

    setIsChangingPlan(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/saas/upgrade/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plan: newPlan,
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors du changement de plan");
      }

      await response.json();

      // Récupérer les nouvelles données de plan depuis l'API
      await fetchUserPlan();

      toast.success(
        `Plan changé avec succès vers ${
          getPlanDetails(newPlan, subscription || undefined).name
        } !`
      );
      setShowPlanModal(false);
      setSelectedPlan("");
    } catch (error) {
      console.error("Erreur lors du changement de plan :", error);
      toast.error("Erreur lors du changement de plan");
    } finally {
      setIsChangingPlan(false);
    }
  };

  return (
    <>
      {/* Section Abonnement responsive */}
      <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl">
        <button
          onClick={() => toggleSection("subscription")}
          className="w-full flex items-center justify-between mb-3 sm:mb-4"
        >
          <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl text-white font-one">
            <CiCreditCard1
              size={20}
              className="sm:w-6 sm:h-6 text-tertiary-400"
            />
            Abonnement
          </h2>
          <div className="text-white/50">
            {openSections.subscription ? "−" : "+"}
          </div>
        </button>

        {openSections.subscription &&
          (loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-tertiary-400"></div>
              <span className="ml-2 text-white/70 text-sm font-one">
                Chargement de l&apos;abonnement...
              </span>
            </div>
          ) : subscription ? (
            <div className="space-y-4">
              {/* Plan actuel responsive */}
              <div
                className={`${
                  getPlanDetails(subscription.currentPlan, subscription).bgColor
                } rounded-xl p-4 sm:p-6 border ${
                  getPlanDetails(subscription.currentPlan, subscription)
                    .borderColor
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                  <div>
                    <h3
                      className={`text-lg sm:text-xl font-bold ${
                        getPlanDetails(subscription.currentPlan, subscription)
                          .color
                      } font-one`}
                    >
                      Plan{" "}
                      {
                        getPlanDetails(subscription.currentPlan, subscription)
                          .name
                      }
                    </h3>
                    <p className="text-white/70 font-one text-sm">
                      {subscription.planStatus === "ACTIVE"
                        ? "Actif"
                        : "Inactif"}{" "}
                      •
                      {subscription.nextPaymentDate
                        ? " Renouvellement automatique"
                        : " Pas de renouvellement"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl sm:text-2xl font-bold text-white font-one">
                      {subscription.monthlyPrice || 0}€
                    </p>
                    <p className="text-white/60 text-sm font-one">/mois</p>
                  </div>
                </div>

                {/* Fonctionnalités responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {getPlanDetails(
                    subscription.currentPlan,
                    subscription
                  ).features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <FaCheck className="text-green-400 text-sm" />
                      <span className="text-white/80 text-sm font-one">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Limites du plan responsive */}
                <div className="bg-white/10 rounded-lg p-3 sm:p-4 mb-4">
                  <h4 className="text-white font-one mb-3 text-sm">
                    📊{" "}
                    <span className="hidden sm:inline">
                      Limites de votre plan
                    </span>
                    <span className="sm:hidden">Limites</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs">
                    <div className="text-center">
                      <p className="text-white/60 font-one mb-1">Clients</p>
                      <p className="text-white font-one font-bold">
                        {subscription.maxClients === -1
                          ? "∞"
                          : subscription.maxClients}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/60 font-one mb-1">
                        <span className="hidden sm:inline">RDV/mois</span>
                        <span className="sm:hidden">RDV</span>
                      </p>
                      <p className="text-white font-one font-bold">
                        {subscription.maxAppointments === -1
                          ? "∞"
                          : subscription.maxAppointments}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/60 font-one mb-1">
                        <span className="hidden sm:inline">Tatoueurs</span>
                        <span className="sm:hidden">Tat.</span>
                      </p>
                      <p className="text-white font-one font-bold">
                        {subscription.maxTattooeurs === -1
                          ? "∞"
                          : subscription.maxTattooeurs}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/60 font-one mb-1">
                        <span className="hidden sm:inline">
                          Images portfolio
                        </span>
                        <span className="sm:hidden">Images</span>
                      </p>
                      <p className="text-white font-one font-bold">
                        {subscription.maxPortfolioImages === -1
                          ? "∞"
                          : subscription.maxPortfolioImages}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dates responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div>
                    <p className="text-white/60 font-one">
                      <span className="hidden sm:inline">Date de début</span>
                      <span className="sm:hidden">Début</span>
                    </p>
                    <p className="text-white font-one">
                      {new Date(subscription.startDate).toLocaleDateString(
                        "fr-FR"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 font-one">
                      <span className="hidden sm:inline">
                        {subscription.nextPaymentDate
                          ? "Prochaine facturation"
                          : "Fin d'abonnement"}
                      </span>
                      <span className="sm:hidden">
                        {subscription.nextPaymentDate ? "Facture" : "Fin"}
                      </span>
                    </p>
                    <p className="text-white font-one">
                      {subscription.nextPaymentDate
                        ? new Date(
                            subscription.nextPaymentDate
                          ).toLocaleDateString("fr-FR")
                        : subscription.endDate
                        ? new Date(subscription.endDate).toLocaleDateString(
                            "fr-FR"
                          )
                        : "Aucune"}
                    </p>
                  </div>
                </div>

                {/* Période d'essai si applicable */}
                {subscription.trialEndDate && (
                  <div className="mt-4 bg-tertiary-500/10 border border-tertiary-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-tertiary-400">🎁</span>
                      <div>
                        <p className="text-tertiary-400 text-sm font-one font-semibold">
                          <span className="hidden sm:inline">
                            Période d&apos;essai active
                          </span>
                          <span className="sm:hidden">Essai actif</span>
                        </p>
                        <p className="text-tertiary-400/80 text-xs font-one">
                          Expire le{" "}
                          {new Date(
                            subscription.trialEndDate
                          ).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-[0.5px] bg-white/10"></div>

              {/* Actions responsive */}
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button className="cursor-pointer px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg text-xs font-one font-medium transition-colors">
                  <span className="hidden sm:inline">
                    Annuler l&apos;abonnement
                  </span>
                  <span className="sm:hidden">Annuler</span>
                </button>
                <button
                  onClick={() => setShowPlanModal(true)}
                  className="cursor-pointer w-full sm:w-[175px] flex justify-center items-center gap-2 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs shadow-lg"
                >
                  <span className="hidden sm:inline">Changer de plan</span>
                  <span className="sm:hidden">Changer plan</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-white/70 font-one">
              <span className="hidden sm:inline">
                Aucune information d&apos;abonnement disponible
              </span>
              <span className="sm:hidden">Pas d&apos;abonnement</span>
            </div>
          ))}
      </div>

      {/* Modale de changement de plan */}
      {showPlanModal && (
        <div className="fixed inset-0 z-[9999] sm:bg-black/60 sm:backdrop-blur-sm bg-noir-700 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-noir-500 rounded-none sm:rounded-3xl w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[90vh] overflow-hidden flex flex-col border-0 sm:border sm:border-white/20 sm:shadow-2xl">
            {/* Header */}
            <div className="p-6 sm:p-6 border-b border-white/10 bg-white/5">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl sm:text-2xl font-bold text-white font-one tracking-wide">
                  Changer de plan
                </h2>
                <button
                  onClick={() => {
                    setShowPlanModal(false);
                    setSelectedPlan("");
                  }}
                  className="p-3 sm:p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <span className="cursor-pointer text-white text-2xl sm:text-xl">
                    ×
                  </span>
                </button>
              </div>
              <p className="text-white/70 mt-2 text-base sm:text-sm">
                Sélectionnez le plan qui correspond le mieux à vos besoins
              </p>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-6">
                {availablePlans.map((plan) => {
                  const isCurrentPlan = subscription?.currentPlan === plan.id;
                  const isSelected = selectedPlan === plan.id;

                  return (
                    <div
                      key={plan.id}
                      className={`relative rounded-2xl p-6 border transition-all duration-300 cursor-pointer ${
                        isCurrentPlan
                          ? `${plan.bgColor} ${plan.borderColor} ring-2 ring-white/20`
                          : isSelected
                          ? `${plan.bgColor} ${plan.borderColor} ring-2 ring-tertiary-400/50`
                          : "bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30"
                      }`}
                      onClick={() => !isCurrentPlan && setSelectedPlan(plan.id)}
                    >
                      {/* Badge plan actuel */}
                      {isCurrentPlan && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          Plan actuel
                        </div>
                      )}

                      {/* Header du plan */}
                      <div className="text-center mb-6 sm:mb-6">
                        <h3
                          className={`text-2xl sm:text-xl font-bold ${plan.color} font-one mb-3 sm:mb-2`}
                        >
                          {plan.name}
                        </h3>
                        <p className="text-white/60 text-base sm:text-sm font-one mb-4 sm:mb-4">
                          {plan.description}
                        </p>
                        <div className="text-4xl sm:text-3xl font-bold text-white font-one">
                          {plan.price}€
                          <span className="text-lg sm:text-base text-white/60 font-normal">
                            /mois
                          </span>
                        </div>
                      </div>

                      {/* Fonctionnalités */}
                      <div className="space-y-4 sm:space-y-3 mb-6 sm:mb-6">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <FaCheck className="text-green-400 text-base sm:text-sm flex-shrink-0" />
                            <span className="text-white/80 text-base sm:text-sm font-one">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Sélection */}
                      {!isCurrentPlan && (
                        <div className="flex items-center justify-center">
                          <div
                            className={`w-7 h-7 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isSelected
                                ? "border-tertiary-400 bg-tertiary-400"
                                : "border-white/40"
                            }`}
                          >
                            {isSelected && (
                              <FaCheck className="text-white text-sm sm:text-xs" />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Message pour plan gratuit */}
                      {plan.id === "FREE" &&
                        subscription?.currentPlan !== "FREE" && (
                          <div className="mt-5 sm:mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 sm:p-3">
                            <p className="text-yellow-300 text-sm sm:text-xs font-one text-center">
                              ⚠️ Rétrograder vers le plan gratuit limitera vos
                              fonctionnalités
                            </p>
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>

              {/* Information sur la facturation */}
              <div className="mt-8 sm:mt-8 bg-tertiary-500/10 border border-tertiary-500/20 rounded-2xl p-5 sm:p-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 sm:w-6 sm:h-6 bg-tertiary-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-4 h-4 sm:w-3 sm:h-3 text-tertiary-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold font-one mb-3 sm:mb-2 text-base sm:text-sm">
                      💡 À propos du changement de plan
                    </h3>
                    <ul className="text-white/70 text-sm sm:text-xs space-y-2 sm:space-y-1 font-one">
                      <li>• Le changement prend effet immédiatement</li>
                      <li>• Pour les upgrades : facturation au prorata</li>
                      <li>
                        • Pour les downgrades : crédits appliqués au cycle
                        suivant
                      </li>
                      <li>• Vous pouvez changer de plan à tout moment</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 sm:p-6 border-t border-white/10 bg-white/5 flex justify-end gap-4 sm:gap-3">
              <button
                onClick={() => {
                  setShowPlanModal(false);
                  setSelectedPlan("");
                }}
                disabled={isChangingPlan}
                className="cursor-pointer px-6 py-3 sm:px-6 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-base sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={() => selectedPlan && handlePlanChange(selectedPlan)}
                disabled={!selectedPlan || isChangingPlan}
                className="cursor-pointer px-8 py-3 sm:px-6 sm:py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-base sm:text-sm flex items-center gap-2"
              >
                {isChangingPlan ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                    <span>Changement...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmer le changement</span>
                    {selectedPlan && (
                      <span className="text-white/80">
                        →{" "}
                        {
                          availablePlans.find((p) => p.id === selectedPlan)
                            ?.name
                        }
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
