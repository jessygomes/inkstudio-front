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

  return (
    <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl">
      <button
        onClick={() => toggleSection("account")}
        className="w-full flex items-center justify-between mb-3 sm:mb-4"
      >
        <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl text-white font-one">
          <CiUser size={20} className="sm:w-6 sm:h-6 text-tertiary-400" />
          <span className="hidden sm:inline">Informations du compte</span>
          <span className="sm:hidden">Compte</span>
        </h2>
        <div className="text-white/50">{openSections.account ? "−" : "+"}</div>
      </button>

      {openSections.account && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
              <label className="text-sm text-white/80 font-one mb-2 block">
                <span className="hidden sm:inline">Nom du salon</span>
                <span className="sm:hidden">Salon</span>
              </label>
              <p className="text-white font-one text-base sm:text-lg break-words">
                {user?.salonName || "Nom non défini"}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
              <label className="text-sm text-white/80 font-one mb-2 block">
                Email
              </label>
              <p className="text-white font-one text-sm sm:text-base break-words">
                {user?.email || "Email non défini"}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
              <label className="text-sm text-white/80 font-one mb-2 block">
                Téléphone
              </label>
              <p className="text-white font-one">
                {user?.phone || "Non renseigné"}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
              <label className="text-sm text-white/80 font-one mb-2 block">
                Adresse
              </label>
              <p className="text-white font-one text-sm break-words">
                {user?.address || "Non renseignée"}
              </p>
            </div>
          </div>

          <div className="h-[0.5px] bg-white/10"></div>
          <div className="flex justify-end">
            <button className="cursor-pointer w-full sm:w-[175px] flex justify-center items-center gap-2 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs shadow-lg">
              <span className="hidden sm:inline">
                Modifier les informations
              </span>
              <span className="sm:hidden">Modifier</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
