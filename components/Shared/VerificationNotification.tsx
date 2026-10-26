"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CgDanger } from "react-icons/cg";
import { useSession } from "next-auth/react";
import { getTrialNotice, type TrialNotice } from "@/lib/trial-reminders";

type UserPlanResponse = {
  planStatus?: string;
  trialEndDate?: string | null;
  currentPlan?: string;
  hasStripeSubscription?: boolean;
};

const getTodayIsoDate = () => new Date().toISOString().slice(0, 10);

const getPastDueSessionStorageKey = (userId: string) =>
  `inkera:notification:past-due:dismissed-date:${userId}`;

const getVerificationSessionStorageKey = (userId: string) =>
  `inkera:notification:verification:dismissed-date:${userId}`;

export default function VerificationNotification() {
  const { data: session, status, update } = useSession();
  const user = session?.user;
  const router = useRouter();
  const [isVerificationVisible, setIsVerificationVisible] = useState(false);
  const [isPastDueVisible, setIsPastDueVisible] = useState(false);
  const [trialNotice, setTrialNotice] = useState<TrialNotice | null>(null);

  const dismissTrialNotice = () => {
    if (user?.id && trialNotice) {
      try {
        sessionStorage.setItem(`inkera:trial-notice:${user.id}:${trialNotice.endDate}`, getTodayIsoDate());
      } catch { /* Le rappel reste masquable si le stockage est indisponible. */ }
    }
    setTrialNotice(null);
  };

  const dismissPastDueNotice = () => {
    if (user?.id) {
      sessionStorage.setItem(getPastDueSessionStorageKey(user.id), getTodayIsoDate());
    }
    setIsPastDueVisible(false);
  };

  const dismissVerificationNotice = () => {
    if (user?.id) {
      sessionStorage.setItem(
        getVerificationSessionStorageKey(user.id),
        getTodayIsoDate(),
      );
    }
    setIsVerificationVisible(false);
  };

  useEffect(() => {
    // N'afficher la notification que si le salon n'est pas vérifié et que la session est chargée
    if (status !== "authenticated" || !user?.id) {
      return;
    }

    const verificationSessionStorageKey =
      getVerificationSessionStorageKey(user.id);
    const dismissedDate = sessionStorage.getItem(verificationSessionStorageKey);
    const dismissedToday = dismissedDate === getTodayIsoDate();

    if (user.verifiedSalon === false) {
      setIsVerificationVisible(!dismissedToday);
    } else {
      sessionStorage.removeItem(verificationSessionStorageKey);
      setIsVerificationVisible(false);
    }
  }, [status, user?.id, user?.verifiedSalon]);

  useEffect(() => {
    let cancelled = false;
    const fetchPlanStatus = async () => {
      if (status !== "authenticated" || !user?.id) {
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/saas/plan/${user.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          },
        );

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as UserPlanResponse;
        if (cancelled) return;
        const notice = getTrialNotice(data);
        let dismissedTrialToday = false;
        if (notice) {
          try {
            dismissedTrialToday = sessionStorage.getItem(`inkera:trial-notice:${user.id}:${notice.endDate}`) === getTodayIsoDate();
          } catch { /* Afficher le rappel même sans stockage navigateur. */ }
        }
        setTrialNotice(dismissedTrialToday ? null : notice);
        const normalizedPlanStatus = (data.planStatus || "")
          .toLowerCase()
          .replaceAll("_", "-");

        const todayIsoDate = getTodayIsoDate();
        const pastDueSessionStorageKey = getPastDueSessionStorageKey(user.id);
        const dismissedDate = sessionStorage.getItem(pastDueSessionStorageKey);
        const dismissedToday = dismissedDate === todayIsoDate;

        if (normalizedPlanStatus === "past-due") {
          setIsPastDueVisible(!dismissedToday);
        } else {
          sessionStorage.removeItem(pastDueSessionStorageKey);
          setIsPastDueVisible(false);
        }
        if ((user.role === "user_salon" || user.role === "user_tatoueur") && data.currentPlan && ["FREE", "PRO", "BUSINESS"].includes(data.currentPlan) && data.currentPlan !== user.saasPlan) {
          await update({ user: { saasPlan: data.currentPlan } });
          router.refresh();
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du statut d'abonnement:",
          error,
        );
      }
    };

    fetchPlanStatus();
    const interval = window.setInterval(fetchPlanStatus, 5 * 60_000);
    const refreshOnReturn = () => { if (document.visibilityState === "visible") void fetchPlanStatus(); };
    document.addEventListener("visibilitychange", refreshOnReturn);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshOnReturn);
    };
  }, [status, user?.id, user?.role, user?.saasPlan, update, router]);

  const showVerificationNotice =
    isVerificationVisible && user?.verifiedSalon === false;
  const showPastDueNotice = isPastDueVisible;

  const showTrialNotice = status === "authenticated" && trialNotice &&
    ((trialNotice.plan === "PRO" && user?.role === "user_tatoueur") ||
      (trialNotice.plan === "BUSINESS" && user?.role === "user_salon"));

  if (!showVerificationNotice && !showPastDueNotice && !showTrialNotice) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 lg:top-auto lg:bottom-4 lg:left-auto lg:right-4 z-[9998] max-h-[calc(100dvh-2rem)] overflow-y-auto max-w-sm mx-auto lg:mx-0 space-y-3">
      {showTrialNotice && trialNotice && (
        <div role="status" className="rounded-3xl border border-tertiary-400/50 bg-noir-700/95 p-4 shadow-xl backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="mb-1 text-sm text-white font-one">Votre période offerte se termine bientôt</h3>
              <p className="text-xs leading-relaxed text-white/80 font-one">
                Il vous reste {trialNotice.daysLeft} jour{trialNotice.daysLeft > 1 ? "s" : ""} sur votre offre {trialNotice.plan === "BUSINESS" ? "Business" : "Pro"}, jusqu’au {new Date(trialNotice.endDate).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" })}.
                {" "}Souscrivez avant la fin pour conserver vos fonctionnalités. Sans abonnement, votre compte repassera en Free.
              </p>
            </div>
            <button type="button" onClick={dismissTrialNotice} aria-label="Masquer le rappel d’essai pour aujourd’hui" className="min-h-11 min-w-11 shrink-0 cursor-pointer rounded-lg text-xl text-white/60 hover:text-white">×</button>
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={dismissTrialNotice} className="min-h-11 flex-1 cursor-pointer rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/80 font-one">Plus tard</button>
            <button type="button" onClick={() => { router.push("/parametres#facturation"); }} className="min-h-11 flex-1 cursor-pointer rounded-lg bg-tertiary-500 px-3 py-1.5 text-xs font-semibold text-white font-one">Souscrire</button>
          </div>
        </div>
      )}
      {showPastDueNotice && (
        <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/50 rounded-3xl p-4 shadow-xl backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-tertiary-400/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CgDanger className="text-red-300" size={25} />
              </div>
              <div className="flex-1">
                <h3 className="text-white text-sm font-one mb-1">
                  Paiement échoué
                </h3>
                <p className="text-white/80 text-xs font-one leading-relaxed">
                  Le dernier paiement de votre abonnement a échoué. Vous avez 5
                  jours pour régulariser. Passé ce délai, votre compte passera
                  en plan FREE et vous perdrez l&apos;accès aux fonctionnalités
                  payantes.
                </p>
              </div>
            </div>
            <button
              onClick={dismissPastDueNotice}
              className="text-white/50 hover:text-white/80 transition-colors flex-shrink-0 cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={dismissPastDueNotice}
              className="cursor-pointer flex-1 px-3 py-1.5 text-xs font-one rounded-lg border border-red-500/40 text-red-100 bg-red-500/10 hover:bg-red-500/20 transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={() => {
                dismissPastDueNotice();
                router.push("/parametres");
              }}
              className="cursor-pointer flex-1 px-3 py-1.5 text-xs font-one rounded-lg border border-red-500/60 text-white bg-red-500/40 hover:bg-red-500/50 transition-colors font-semibold"
            >
              Régler maintenant
            </button>
          </div>
        </div>
      )}

      {showVerificationNotice && (
        <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/50 rounded-3xl p-4 shadow-xl backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-tertiary-400/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CgDanger className="text-amber-400" size={25} />
              </div>
              <div className="flex-1">
                <h3 className="text-white text-sm font-one mb-1">
                  Vérifiez votre salon
                </h3>
                <p className="text-white/80 text-xs font-one leading-relaxed">
                  Envoyez vos documents pour vérifier votre salon et augmenter
                  la confiance de vos clients.
                </p>
              </div>
            </div>
            <button
              onClick={dismissVerificationNotice}
              className="text-white/50 hover:text-white/80 transition-colors flex-shrink-0 cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={dismissVerificationNotice}
              className="cursor-pointer flex-1 px-3 py-1.5 text-xs font-one rounded-lg border border-amber-500/40 text-amber-100 bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={() => {
                dismissVerificationNotice();
                router.push("/parametres");
              }}
              className="cursor-pointer flex-1 px-3 py-1.5 text-xs font-one rounded-lg border border-amber-500/60 text-white bg-amber-500/40 hover:bg-amber-500/50 transition-colors font-semibold"
            >
              Aller aux paramètres
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
