/* eslint-disable react/no-unescaped-entities */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CiCreditCard1 } from "react-icons/ci";
import { FaCheck } from "react-icons/fa";
import { availablePlans, getPlanDetails } from "@/lib/saasPlan.data";
import { Subscription } from "@/lib/type";
import { changePlanAction } from "@/lib/queries/stripe";

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
  onBillingRefresh?: () => void;
}

export default function SubscriptionSection({
  openSections,
  toggleSection,
  userId,
  onBillingRefresh,
}: SubscriptionSectionProps) {
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [loading, setLoading] = useState(true);

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
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la recuperation du plan utilisateur");
      }

      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error("Erreur lors de la recuperation du plan utilisateur:", error);
    }
  }, [userId]);

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        setLoading(true);
        await fetchUserPlan();
      } catch (error) {
        console.error("Erreur lors du chargement des donnees:", error);
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

  const handlePlanChange = async (newPlan: string) => {
    if (!userId || !subscription?.currentPlan) return;

    setIsChangingPlan(true);

    try {
      const result = await changePlanAction(newPlan);

      if (!result.updated && result.url) {
        toast.success("Redirection vers le paiement...");
        setShowPlanModal(false);
        setShowCancelModal(false);
        setSelectedPlan("");
        window.location.href = result.url;
        return;
      }

      await fetchUserPlan();
      onBillingRefresh?.();

      if (result.updated && result.alreadyOnTargetPlan) {
        toast.info(result.message);
      } else {
        toast.success(
          result.message ||
            `Plan change avec succes vers ${
              getPlanDetails(newPlan, subscription || undefined).name
            } !`
        );
      }

      setShowPlanModal(false);
      setShowCancelModal(false);
      setSelectedPlan("");
    } catch (error) {
      console.error("Erreur lors du changement de plan:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors du changement de plan"
      );
    } finally {
      setIsChangingPlan(false);
    }
  };

  const currentPlanDetails = useMemo(() => {
    if (!subscription) return null;
    return getPlanDetails(subscription.currentPlan, subscription);
  }, [subscription]);

  return (
    <>
      <div className="dashboard-embedded-panel rounded-2xl border border-white/10 bg-white/4 p-3 sm:p-4">
        <button
          onClick={() => toggleSection("subscription")}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5 min-w-0 text-left">
            <div className="w-9 h-9 rounded-xl border border-tertiary-400/25 bg-tertiary-400/15 flex items-center justify-center shrink-0">
              <CiCreditCard1 className="w-5 h-5 text-tertiary-500" />
            </div>
            <div className="min-w-0">
              <p className="text-white/50 font-one text-[10px] uppercase tracking-wider">
                Facturation
              </p>
              <h2 className="text-white font-one text-sm sm:text-base font-semibold truncate">
                Abonnement
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {subscription && (
              <span className="hidden sm:inline-flex rounded-[10px] border border-white/20 bg-white/10 px-2 py-1 text-[10px] font-one text-white/75">
                {getPlanDetails(subscription.currentPlan, subscription).name}
              </span>
            )}
            <span className="text-white/50 text-lg leading-none">
              {openSections.subscription ? "−" : "+"}
            </span>
          </div>
        </button>

        {openSections.subscription && (
          <div className="pt-3 space-y-3">
            {loading ? (
              <div className="animate-pulse space-y-2.5">
                <div className="h-16 rounded-xl bg-white/8" />
                <div className="h-9 rounded-xl bg-white/8" />
              </div>
            ) : subscription && currentPlanDetails ? (
              <>
                <div
                  className={`${currentPlanDetails.bgColor} ${currentPlanDetails.borderColor} border rounded-xl p-3`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-white/55 font-one text-[10px] uppercase tracking-wider">
                        Plan actuel
                      </p>
                      <h3 className={`font-one text-base font-semibold ${currentPlanDetails.color}`}>
                        {currentPlanDetails.name}
                      </h3>
                      <p className="text-white/70 font-two text-xs mt-0.5">
                        {subscription.planStatus === "ACTIVE" ? "Actif" : "Inactif"}
                        {" · "}
                        {subscription.nextPaymentDate
                          ? "Renouvellement automatique"
                          : "Sans renouvellement"}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-white font-one text-xl font-semibold leading-none">
                        {subscription.monthlyPrice || 0}€
                      </p>
                      <p className="text-white/60 text-xs font-two mt-0.5">/mois</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="rounded-[10px] border border-white/10 bg-white/5 px-2.5 py-2">
                      <p className="text-white/45 font-one text-[10px] uppercase tracking-wider">
                        Debut
                      </p>
                      <p className="text-white font-two text-xs mt-0.5">
                        {new Date(subscription.startDate).toLocaleDateString("fr-FR")}
                      </p>
                    </div>

                    <div className="rounded-[10px] border border-white/10 bg-white/5 px-2.5 py-2">
                      <p className="text-white/45 font-one text-[10px] uppercase tracking-wider">
                        Prochaine echeance
                      </p>
                      <p className="text-white font-two text-xs mt-0.5">
                        {subscription.nextPaymentDate
                          ? new Date(subscription.nextPaymentDate).toLocaleDateString("fr-FR")
                          : subscription.endDate
                          ? new Date(subscription.endDate).toLocaleDateString("fr-FR")
                          : "Aucune"}
                      </p>
                    </div>
                  </div>

                  {subscription.trialEndDate && (
                    <div className="mt-3 rounded-[10px] border border-tertiary-500/25 bg-tertiary-500/10 px-2.5 py-2">
                      <p className="text-tertiary-300 font-one text-xs font-semibold">
                        Periode d'essai active
                      </p>
                      <p className="text-tertiary-200/80 font-two text-[11px] mt-0.5">
                        Expire le {new Date(subscription.trialEndDate).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={isChangingPlan || subscription.currentPlan === "FREE"}
                    className="cursor-pointer h-9 px-3 rounded-[14px] border border-red-500/35 bg-red-500/15 text-red-300 hover:bg-red-500/25 transition-colors text-xs font-one disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Annuler l'abonnement
                  </button>

                  <button
                    onClick={() => setShowPlanModal(true)}
                    className="cursor-pointer h-9 px-4 rounded-[14px] bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white transition-all duration-300 text-xs font-one font-medium"
                  >
                    Changer de plan
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/3 p-4 text-center">
                <p className="text-white/65 font-two text-sm">
                  Aucune information d'abonnement disponible
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {showPlanModal && subscription && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="dashboard-embedded-panel rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden border border-white/20 shadow-2xl flex flex-col">
            <div className="p-4 sm:p-5 border-b border-white/10 bg-white/5 flex items-start justify-between gap-3">
              <div>
                <p className="text-white/50 font-one text-[10px] uppercase tracking-wider">
                  Choix du plan
                </p>
                <h2 className="text-white font-one text-base sm:text-lg font-semibold mt-1">
                  Changer d'abonnement
                </h2>
                <p className="text-white/60 font-two text-xs mt-1">
                  Sélectionnez le plan le plus adapté à votre activité.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowPlanModal(false);
                  setSelectedPlan("");
                }}
                className="cursor-pointer rounded-[10px] border border-white/15 bg-white/5 hover:bg-white/10 w-8 h-8 text-white"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {availablePlans.map((plan) => {
                  const isCurrentPlan = subscription.currentPlan === plan.id;
                  const isSelected = selectedPlan === plan.id;

                  return (
                    <article
                      key={plan.id}
                      className={`relative rounded-xl border p-3 transition-all cursor-pointer ${
                        isCurrentPlan
                          ? `${plan.bgColor} ${plan.borderColor} ring-1 ring-white/20`
                          : isSelected
                          ? `${plan.bgColor} ${plan.borderColor} ring-1 ring-tertiary-400/50`
                          : "bg-white/3 border-white/12 hover:bg-white/6"
                      }`}
                      onClick={() => !isCurrentPlan && setSelectedPlan(plan.id)}
                    >
                      {isCurrentPlan && (
                        <span className="absolute top-2 right-2 rounded-[10px] border border-green-500/35 bg-green-500/20 px-2 py-0.5 text-[10px] text-green-300 font-one">
                          Actuel
                        </span>
                      )}

                      <div className="pr-12">
                        <h3 className={`text-base font-semibold font-one ${plan.color}`}>
                          {plan.name}
                        </h3>
                        <p className="text-white/60 text-xs font-two mt-0.5 min-h-[30px]">
                          {plan.description}
                        </p>
                        <p className="text-white font-one text-lg font-semibold mt-2">
                          {plan.price}€
                          <span className="text-white/60 text-xs font-two">/mois</span>
                        </p>
                      </div>

                      <div className="mt-3 space-y-1.5">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <FaCheck className="text-green-400 text-[11px] mt-[2px] shrink-0" />
                            <span className="text-white/80 text-xs font-two leading-snug">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      {!isCurrentPlan && (
                        <div className="mt-3 flex justify-end">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? "border-tertiary-400 bg-tertiary-400"
                                : "border-white/40"
                            }`}
                          >
                            {isSelected && <FaCheck className="text-white text-[10px]" />}
                          </div>
                        </div>
                      )}

                      {plan.id === "FREE" && subscription.currentPlan !== "FREE" && (
                        <div className="mt-2.5 rounded-[10px] border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-2">
                          <p className="text-yellow-300 text-[11px] font-two leading-snug">
                            Le passage au plan gratuit limite certaines fonctionnalités premium.
                          </p>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>

              <div className="rounded-xl border border-tertiary-500/25 bg-tertiary-500/10 px-3 py-2.5">
                <p className="text-white font-one text-xs font-semibold">À savoir</p>
                <ul className="text-white/70 text-xs font-two mt-1.5 space-y-1">
                  <li>Le changement prend effet immédiatement.</li>
                  <li>Vous pouvez modifier votre plan à tout moment.</li>
                </ul>
              </div>
            </div>

            <div className="p-3 sm:p-4 border-t border-white/10 bg-white/5 flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={() => {
                  setShowPlanModal(false);
                  setSelectedPlan("");
                }}
                disabled={isChangingPlan}
                className="cursor-pointer h-9 px-4 rounded-[14px] border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-one disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>

              <button
                onClick={() => selectedPlan && handlePlanChange(selectedPlan)}
                disabled={!selectedPlan || isChangingPlan}
                className="cursor-pointer h-9 px-4 rounded-[14px] bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white text-xs font-one disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isChangingPlan ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                    Changement...
                  </>
                ) : (
                  <>
                    Confirmer
                    {selectedPlan && (
                      <span className="text-white/80">
                        → {availablePlans.find((p) => p.id === selectedPlan)?.name}
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && subscription && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="dashboard-embedded-panel rounded-2xl w-full max-w-lg border border-white/20 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5">
              <p className="text-white/50 font-one text-[10px] uppercase tracking-wider">
                Confirmation
              </p>
              <h2 className="text-white font-one text-base sm:text-lg font-semibold mt-1">
                Résilier l'abonnement
              </h2>
              <p className="text-white/65 text-xs font-two mt-1.5 leading-relaxed">
                Votre compte passera au plan FREE. Si le mois en cours est déjà payé,
                le plan actuel reste actif jusqu'à la fin de période.
              </p>
            </div>

            <div className="p-4 space-y-3">
              <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3">
                <p className="text-yellow-300 text-xs font-one font-semibold">
                  Impact immédiat
                </p>
                <p className="text-yellow-200/90 text-[11px] font-two mt-1 leading-relaxed">
                  Certaines limites et fonctionnalités premium du plan
                  {" "}
                  {getPlanDetails(subscription.currentPlan, subscription).name}
                  {" "}
                  seront retirées.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={isChangingPlan}
                  className="cursor-pointer h-9 px-4 rounded-[14px] border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-one disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Garder mon abonnement
                </button>

                <button
                  onClick={() => handlePlanChange("FREE")}
                  disabled={isChangingPlan}
                  className="cursor-pointer h-9 px-4 rounded-[14px] bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-one disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isChangingPlan ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                      Résiliation...
                    </>
                  ) : (
                    "Confirmer et passer en FREE"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
