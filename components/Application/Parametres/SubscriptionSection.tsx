/* eslint-disable react/no-unescaped-entities */
"use client";
import SettingsSectionHeader from "./SettingsSectionHeader";
import { CreditCard, CalendarDays, Check, Sparkles } from "lucide-react";

import styles from "./SettingsCard.module.css";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { FaCheck } from "react-icons/fa";
import { availablePlans, getPlanDetails } from "@/lib/saasPlan.data";
import { Subscription } from "@/lib/type";
import { changePlanAction } from "@/lib/queries/stripe";
import DashboardButton from "@/components/Shared/DashboardButton";

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
  const { data: session } = useSession();
  const planDialogRef = useRef<HTMLDialogElement>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [loading, setLoading] = useState(true);
  const isNativeTrial = subscription?.planStatus === "TRIAL" && !subscription.hasStripeSubscription;

  useEffect(() => {
    if (!showPlanModal) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const dialog = planDialogRef.current;
    dialog?.showModal();
    return () => { dialog?.close(); previousFocus?.focus(); };
  }, [showPlanModal]);

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
      <div className={styles.card}>
        <SettingsSectionHeader icon={CreditCard} title="Votre abonnement" description="Consultez votre offre et gérez votre abonnement." expanded={openSections.subscription} controls="settings-subscription-content" action={subscription && <span className="hidden shrink-0 self-center rounded-lg border border-tertiary-400/20 bg-tertiary-400/10 px-2 py-1 text-[10px] text-tertiary-400 sm:inline-flex">{getPlanDetails(subscription.currentPlan, subscription).name}</span>} onToggle={() => toggleSection("subscription")} />

        {openSections.subscription && (
          <div id="settings-subscription-content" className={styles.body}>
            {loading ? (
              <div className="animate-pulse space-y-2.5">
                <div className="h-16 rounded-xl bg-white/8" />
                <div className="h-9 rounded-xl bg-white/8" />
              </div>
            ) : subscription && currentPlanDetails ? (
              <>
                <div
                  className="rounded-xl border border-tertiary-400/20 bg-tertiary-400/5 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-white/55 font-one text-[11px] uppercase tracking-wider">
                        <span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-tertiary-400" /> Votre offre actuelle</span>
                      </p>
                      <h3 className={`font-one mt-2 text-2xl font-semibold ${currentPlanDetails.color}`}>
                        {currentPlanDetails.name}
                      </h3>
                      <p className="text-white/70 font-two text-xs mt-0.5">
                        {subscription.planStatus === "TRIAL" ? "Période d’essai" : subscription.planStatus === "ACTIVE" ? "Actif" : "Inactif"}
                        {" · "}
                        {subscription.nextPaymentDate
                          ? "Renouvellement automatique"
                          : "Sans renouvellement"}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-white font-one text-3xl font-semibold leading-none">
                        {subscription.monthlyPrice || 0}€
                      </p>
                      <p className="text-white/60 text-xs font-two mt-0.5">/mois</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 border-t border-white/10 pt-4 sm:grid-cols-2">
                    <div className="min-w-0">
                      <p className="text-white/55 font-one text-[11px] uppercase tracking-wider">
                        <span className="inline-flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5" /> Début de l’abonnement</span>
                      </p>
                      <p className="text-white font-two text-xs mt-0.5">
                        {new Date(subscription.startDate).toLocaleDateString("fr-FR")}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-white/55 font-one text-[11px] uppercase tracking-wider">
                        {subscription.nextPaymentDate ? "Prochain paiement" : subscription.endDate ? "Fin de l’abonnement" : "Renouvellement"}
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

                  {subscription.planStatus === "TRIAL" && subscription.trialEndDate && (
                    <div className="mt-3 rounded-[10px] border border-tertiary-500/25 bg-tertiary-500/10 px-2.5 py-2">
                      <p className="text-tertiary-300 font-one text-xs font-semibold">
                        Période d'essai active
                      </p>
                      <p className="text-tertiary-200/80 font-two text-[11px] mt-0.5">
                        Expire le {new Date(subscription.trialEndDate).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" })}
                      </p>
                    </div>
                  )}
                </div>

                {currentPlanDetails.features.length > 0 && <div className="py-1">
                  <h3 className="mb-3 text-xs font-semibold text-white">Inclus dans votre offre</h3>
                  <ul className="grid gap-3 sm:grid-cols-2">{currentPlanDetails.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-xs text-white/70"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{feature}</li>)}</ul>
                </div>}
                <div className={styles.footer}>
                  <DashboardButton
                    onClick={() => isNativeTrial ? handlePlanChange(subscription.currentPlan) : setShowCancelModal(true)}
                    disabled={isChangingPlan || subscription.currentPlan === "FREE"}
                    variant="secondary"
                    className="min-w-0! min-h-11 px-4"
                  >
                    {isNativeTrial ? "Souscrire pour continuer après l’essai" : "Annuler l'abonnement"}
                  </DashboardButton>

                  <DashboardButton
                    onClick={() => { setSelectedPlan(isNativeTrial ? subscription.currentPlan : ""); setShowPlanModal(true); }}
                    className="min-w-0! min-h-11 px-5"
                  >
                    Comparer les offres
                  </DashboardButton>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/[0.015] p-4 text-center">
                <p className="text-white/65 font-two text-xs">
                  Aucune information d'abonnement disponible
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {showPlanModal && subscription && (
        <dialog ref={planDialogRef} aria-labelledby="plans-title" onCancel={(event) => { event.preventDefault(); if (!isChangingPlan) { setShowPlanModal(false); setSelectedPlan(""); } }} className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-white backdrop:bg-black/70 backdrop:backdrop-blur-sm">
          <div className="flex h-full items-center justify-center p-3 sm:p-6">
          <div className={styles.dialogPanel + " flex max-h-[calc(100dvh-3rem)] w-full max-w-6xl flex-col overflow-hidden"}>
            <div className="shrink-0 border-b border-white/10 p-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-white/50 font-one text-[11px] uppercase tracking-wider">
                  Choix du plan
                </p>
                <h2 id="plans-title" className="text-white font-one text-lg font-semibold mt-1">
                  Une offre pour votre activité
                </h2>
                <p className="text-white/60 font-two text-xs mt-1">
                  Sélectionnez le plan le plus adapté à votre activité.
                </p>
              </div>

              <DashboardButton variant="secondary"
                onClick={() => {
                  setShowPlanModal(false);
                  setSelectedPlan("");
                }}
                aria-label="Fermer les offres" disabled={isChangingPlan} className="min-w-0! h-10 w-10 shrink-0 p-0! text-xl"
              >
                ×
              </DashboardButton>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {availablePlans.filter((plan) => plan.id !== "BUSINESS" || session?.user?.role === "user_salon").map((plan) => {
                  const isCurrentPlan = subscription.currentPlan === plan.id;
                  const isSelected = selectedPlan === plan.id;

                  return (
                    <article
                      key={plan.id}
                      className={`relative flex flex-col rounded-xl border p-5 transition-colors focus-within:ring-2 focus-within:ring-tertiary-400 ${
                        isCurrentPlan
                          ? `${plan.bgColor} ${plan.borderColor} ring-1 ring-white/20`
                          : isSelected
                          ? `${plan.bgColor} ${plan.borderColor} ring-1 ring-tertiary-400/50`
                          : "bg-white/[0.015] border-white/12 hover:bg-white/6"
                      }`}
                    >
                      <label className="mb-4 flex items-center gap-2 text-xs text-white/65"><input type="radio" name="subscription-plan" checked={selectedPlan ? isSelected : isCurrentPlan} disabled={(isCurrentPlan && !isNativeTrial) || isChangingPlan} onChange={() => setSelectedPlan(plan.id)} className="h-4 w-4 accent-tertiary-500" />{isCurrentPlan && isNativeTrial ? "Souscrire à cette offre après l’essai" : isCurrentPlan ? "Votre offre actuelle" : "Choisir cette offre"}</label>
                      {isCurrentPlan && (
                        <span className="absolute top-2 right-2 rounded-xl border border-green-500/35 bg-green-500/20 px-2 py-0.5 text-[10px] text-green-300 font-one">
                          Actuel
                        </span>
                      )}

                      <div className="min-w-0">
                        <h3 className={`text-xl font-semibold font-one ${plan.color}`}>
                          {plan.name}
                        </h3>
                        <p className="text-white/60 text-xs font-two mt-0.5 min-h-[30px]">
                          {plan.description}
                        </p>
                        <p className="text-white font-one text-4xl font-semibold mt-5">
                          {plan.price}€
                          <span className="text-white/60 text-xs font-two">/mois</span>
                        </p>
                      </div>

                      <div className="mt-5 space-y-3 border-t border-white/10 pt-5">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <FaCheck className="text-green-400 text-[11px] mt-[2px] shrink-0" />
                            <span className="text-white/75 text-xs font-one leading-relaxed">
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

            <div className="shrink-0 p-5 border-t border-white/10 bg-white/[0.015] flex flex-col sm:flex-row justify-end gap-3">
              <DashboardButton
                onClick={() => {
                  setShowPlanModal(false);
                  setSelectedPlan("");
                }}
                disabled={isChangingPlan}
                variant="secondary"
                className="min-w-0! min-h-11 px-5"
              >
                Annuler
              </DashboardButton>

              <DashboardButton
                onClick={() => selectedPlan && handlePlanChange(selectedPlan)}
                disabled={!selectedPlan || isChangingPlan}
                className="min-w-0! min-h-11 px-5"
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
              </DashboardButton>
            </div>
          </div>
          </div>
        </dialog>
      )}

      {showCancelModal && subscription && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className={styles.dialogPanel + " w-full max-w-lg overflow-hidden"}>
            <div className="p-4 border-b border-white/10 bg-white/5">
              <p className="text-white/50 font-one text-[11px] uppercase tracking-wider">
                Confirmation
              </p>
              <h2 className="text-white font-one text-sm sm:text-base font-semibold mt-1">
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
                <DashboardButton variant="secondary"
                  onClick={() => setShowCancelModal(false)}
                  disabled={isChangingPlan}
                  className="min-w-0! cursor-pointer h-9 px-4 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-one disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Garder mon abonnement
                </DashboardButton>

                <DashboardButton variant="secondary"
                  onClick={() => handlePlanChange("FREE")}
                  disabled={isChangingPlan}
                  className="min-w-0! cursor-pointer h-9 px-4 rounded-[14px] border border-red-400/25 bg-red-400/10 hover:bg-red-400/20 text-white text-xs font-one disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isChangingPlan ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                      Résiliation...
                    </>
                  ) : (
                    "Confirmer et passer en FREE"
                  )}
                </DashboardButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
