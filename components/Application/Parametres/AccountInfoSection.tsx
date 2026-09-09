"use client";

import DashboardButton from "@/components/Shared/DashboardButton";
import styles from "./SettingsCard.module.css";

import { CiUser } from "react-icons/ci";
import { getUserParamAction } from "@/lib/queries/user";
import { useEffect, useState } from "react";

type SectionKeys =
  | "account"
  | "subscription"
  | "notifications"
  | "security"
  | "preferences";

interface AccountInfoSectionProps {
  userId: string | null;
  openSections: {
    account: boolean;
    subscription: boolean;
    notifications: boolean;
    security: boolean;
    preferences: boolean;
  };
  toggleSection: (section: SectionKeys) => void;
}

export default function AccountInfoSection({
  userId,
  openSections,
  toggleSection,
}: AccountInfoSectionProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchUserData = async () => {
      if (!userId) { setLoading(false); return; }
      setLoading(true);
      setError(false);
      try {
        const result = await getUserParamAction(userId);
        if (!cancelled) { setUser(result.data); setError(!result.data); }
      } catch { if (!cancelled) setError(true); }
      finally { if (!cancelled) setLoading(false); }
    };
    void fetchUserData();
    return () => { cancelled = true; };
  }, [userId]);

  return (
    <div className={styles.card}>
      <DashboardButton variant="secondary"
        aria-expanded={openSections.account}
          aria-controls="settings-account-content"
          onClick={() => toggleSection("account")}
        className="w-full min-w-0! justify-between! border-0! bg-transparent! p-0! text-left hover:translate-y-0!"
      >
        <div className="flex items-center gap-2.5 min-w-0 text-left">
          <div className="w-11 h-11 rounded-2xl border border-tertiary-400/25 bg-tertiary-400/15 flex items-center justify-center shrink-0">
            <CiUser className="w-5 h-5 text-tertiary-500" />
          </div>
          <div className="min-w-0">
            <p className="text-white/50 font-one text-[11px] uppercase tracking-wider">
              Profil
            </p>
            <h2 className="text-white font-one text-base font-semibold">
              Informations du compte
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white/50 text-lg leading-none">
            {openSections.account ? "−" : "+"}
          </span>
        </div>
      </DashboardButton>

      {openSections.account && (
        <div id="settings-account-content" className="pt-5 space-y-5">
          {loading ? <div role="status" className="animate-pulse rounded-2xl bg-white/5 p-6 text-sm text-white/60">Chargement de votre profil…</div> : error ? <p role="alert" className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">Impossible de charger votre profil. Rechargez la page pour réessayer.</p> : <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3">
              <p className="text-white/55 font-one text-[11px] uppercase tracking-wider mb-1">
                Nom du salon
              </p>
              <p className="text-white font-one text-sm sm:text-base break-words">
                {user?.salonName || "Nom non défini"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3">
              <p className="text-white/55 font-one text-[11px] uppercase tracking-wider mb-1">
                Nom et prénom
              </p>
              <p className="text-white font-one text-sm sm:text-base break-words">
                {user?.lastName || "Nom non défini"} {user?.firstName || "Prénom non défini"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3">
              <p className="text-white/55 font-one text-[11px] uppercase tracking-wider mb-1">
                Email
              </p>
              <p className="text-white font-one text-sm sm:text-base break-words">
                {user?.email || "Email non défini"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3">
              <p className="text-white/55 font-one text-[11px] uppercase tracking-wider mb-1">
                Téléphone
              </p>
              <p className="text-white font-one text-sm break-words">
                {user?.phone || "Non renseigné"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3">
              <p className="text-white/55 font-one text-[11px] uppercase tracking-wider mb-1">
                Adresse
              </p>
              <p className="text-white font-one text-sm break-words">
                {user?.address || "Non renseignée"}, {user?.city || ""} {user?.postalCode || ""}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3">
              <p className="text-white/55 font-one text-[11px] uppercase tracking-wider mb-1">
                Plan
              </p>
              <p className="text-white font-one text-sm break-words">
                {user?.saasPlan || "Non renseigné"}
              </p>
            </div>
          </div>}

          <div className="rounded-[10px] border border-white/8 bg-white/2 px-3 py-2">
            <p className="text-[11px] font-two text-white/55">
              Ces informations sont utilisées pour votre profil public et la facturation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
