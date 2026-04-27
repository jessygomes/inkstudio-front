"use client";

import { CiUser } from "react-icons/ci";
import { useUser } from "@/components/Auth/Context/UserContext";

type SectionKeys =
  | "account"
  | "subscription"
  | "notifications"
  | "security"
  | "preferences";

interface AccountInfoSectionProps {
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
  openSections,
  toggleSection,
}: AccountInfoSectionProps) {
  const user = useUser();
  const completionCount = [
    user?.salonName,
    user?.email,
    user?.phone,
    user?.address,
  ].filter(Boolean).length;

  return (
    <div className="dashboard-embedded-panel rounded-2xl border border-white/10 bg-white/4 p-3 sm:p-4">
      <button
        onClick={() => toggleSection("account")}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5 min-w-0 text-left">
          <div className="w-9 h-9 rounded-xl border border-tertiary-400/25 bg-tertiary-400/15 flex items-center justify-center shrink-0">
            <CiUser className="w-5 h-5 text-tertiary-500" />
          </div>
          <div className="min-w-0">
            <p className="text-white/50 font-one text-[10px] uppercase tracking-wider">
              Profil
            </p>
            <h2 className="text-white font-one text-sm sm:text-base font-semibold truncate">
              Informations du compte
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex rounded-[10px] border border-white/20 bg-white/10 px-2 py-1 text-[10px] font-one text-white/75">
            {completionCount}/4 remplis
          </span>
          <span className="text-white/50 text-lg leading-none">
            {openSections.account ? "−" : "+"}
          </span>
        </div>
      </button>

      {openSections.account && (
        <div className="pt-3 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-white/10 bg-white/3 px-3 py-2.5">
              <p className="text-white/45 font-one text-[10px] uppercase tracking-wider mb-1">
                Nom du salon
              </p>
              <p className="text-white font-one text-sm sm:text-base break-words">
                {user?.salonName || "Nom non défini"}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/3 px-3 py-2.5">
              <p className="text-white/45 font-one text-[10px] uppercase tracking-wider mb-1">
                Email
              </p>
              <p className="text-white font-one text-sm sm:text-base break-words">
                {user?.email || "Email non défini"}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/3 px-3 py-2.5">
              <p className="text-white/45 font-one text-[10px] uppercase tracking-wider mb-1">
                Téléphone
              </p>
              <p className="text-white font-one text-sm break-words">
                {user?.phone || "Non renseigné"}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/3 px-3 py-2.5">
              <p className="text-white/45 font-one text-[10px] uppercase tracking-wider mb-1">
                Adresse
              </p>
              <p className="text-white font-one text-sm break-words">
                {user?.address || "Non renseignée"}
              </p>
            </div>
          </div>

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
