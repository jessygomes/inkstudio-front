"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CiLock } from "react-icons/ci";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { changePasswordAction } from "@/lib/queries/user";
import { changePasswordSchema } from "@/lib/zod/validator.schema";

interface SecuritySectionProps {
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
}

export default function SecuritySection({
  openSections,
  toggleSection,
}: SecuritySectionProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const passwordForm = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Fonction pour changer le mot de passe
  const handlePasswordChange = async (
    data: z.infer<typeof changePasswordSchema>
  ) => {
    setIsChangingPassword(true);

    try {
      const response = await changePasswordAction({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      if (!response.ok) {
        throw new Error(
          response.message || "Erreur lors du changement de mot de passe"
        );
      }

      toast.success("Mot de passe changé avec succès !");
      setShowPasswordModal(false);
      passwordForm.reset();
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe :", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors du changement de mot de passe"
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <>
      {/* Section Sécurité responsive */}
      <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl">
        <button
          onClick={() => toggleSection("security")}
          className="w-full flex items-center justify-between mb-3 sm:mb-4"
        >
          <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl text-white font-one">
            <CiLock size={20} className="sm:w-6 sm:h-6 text-tertiary-400" />
            Sécurité
          </h2>
          <div className="text-white/50">
            {openSections.security ? "−" : "+"}
          </div>
        </button>

        {openSections.security && (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h3 className="text-white font-one">Mot de passe</h3>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="cursor-pointer w-full sm:w-[175px] flex justify-center items-center gap-2 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs shadow-lg"
              >
                <span className="hidden sm:inline">
                  Changer le mot de passe
                </span>
                <span className="sm:hidden">Changer</span>
              </button>
            </div>

            <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-white font-one mb-2 text-sm sm:text-base">
                  <span className="hidden sm:inline">Sessions actives</span>
                  <span className="sm:hidden">Sessions</span>
                </h3>
                <p className="text-white/60 text-xs sm:text-sm font-one mb-3">
                  <span className="hidden sm:inline">
                    Gérez les appareils connectés à votre compte
                  </span>
                  <span className="sm:hidden">Appareils connectés</span>
                </p>
              </div>
              <button className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg text-xs font-one font-medium transition-colors w-full sm:w-auto">
                <span className="hidden sm:inline">
                  Déconnecter tous les appareils
                </span>
                <span className="sm:hidden">Déconnecter</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modale de changement de mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[9999] lg:bg-black/60 lg:backdrop-blur-sm bg-noir-700 flex items-end lg:items-center justify-center p-0 lg:p-4">
          <div className="bg-noir-500 rounded-none lg:rounded-3xl w-full h-full lg:h-auto lg:max-w-md lg:max-h-[90vh] overflow-hidden flex flex-col border-0 lg:border lg:border-white/20 lg:shadow-2xl">
            {/* Header */}
            <div className="p-6 lg:p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl lg:text-xl font-bold text-white font-one tracking-wide">
                  🔑 Changer le mot de passe
                </h2>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    passwordForm.reset();
                  }}
                  disabled={isChangingPassword}
                  className="p-3 lg:p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                >
                  <span className="cursor-pointer text-white text-2xl lg:text-xl">
                    ×
                  </span>
                </button>
              </div>
              <p className="text-white/70 mt-2 text-base lg:text-sm">
                Modifiez votre mot de passe de connexion
              </p>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-4 min-h-0">
              <form
                onSubmit={passwordForm.handleSubmit(handlePasswordChange)}
                className="space-y-6 lg:space-y-4"
              >
                {/* Mot de passe actuel */}
                <div className="space-y-2 lg:space-y-1">
                  <label className="text-base lg:text-sm text-white/80 font-one">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    {...passwordForm.register("currentPassword")}
                    disabled={isChangingPassword}
                    className="w-full p-4 lg:p-3 bg-white/10 border border-white/20 rounded-lg text-white text-base lg:text-sm focus:outline-none focus:border-tertiary-400 transition-colors disabled:opacity-50"
                    placeholder="Votre mot de passe actuel"
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-red-300 text-sm lg:text-xs">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                {/* Nouveau mot de passe */}
                <div className="space-y-2 lg:space-y-1">
                  <label className="text-base lg:text-sm text-white/80 font-one">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    {...passwordForm.register("newPassword")}
                    disabled={isChangingPassword}
                    className="w-full p-4 lg:p-3 bg-white/10 border border-white/20 rounded-lg text-white text-base lg:text-sm focus:outline-none focus:border-tertiary-400 transition-colors disabled:opacity-50"
                    placeholder="Votre nouveau mot de passe"
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-red-300 text-sm lg:text-xs">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Confirmation nouveau mot de passe */}
                <div className="space-y-2 lg:space-y-1">
                  <label className="text-base lg:text-sm text-white/80 font-one">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    {...passwordForm.register("confirmPassword")}
                    disabled={isChangingPassword}
                    className="w-full p-4 lg:p-3 bg-white/10 border border-white/20 rounded-lg text-white text-base lg:text-sm focus:outline-none focus:border-tertiary-400 transition-colors disabled:opacity-50"
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-red-300 text-sm lg:text-xs">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Règles de sécurité */}
                <div className="bg-tertiary-500/10 border border-tertiary-500/20 rounded-lg p-4 lg:p-3 mt-6 lg:mt-4">
                  <div className="flex items-start gap-3 lg:gap-2">
                    <svg
                      className="w-5 h-5 lg:w-4 lg:h-4 text-tertiary-400 mt-0.5 flex-shrink-0"
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
                    <div>
                      <p className="text-tertiary-400 text-sm lg:text-xs font-semibold mb-2 lg:mb-1">
                        Exigences du mot de passe
                      </p>
                      <ul className="text-tertiary-400/80 text-sm lg:text-xs space-y-2 lg:space-y-1">
                        <li>• Au moins 6 caractères</li>
                        <li>• Différent de votre mot de passe actuel</li>
                        <li>
                          • Combinaison de lettres et chiffres recommandée
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer fixe */}
            <div className="p-6 lg:p-4 border-t border-white/10 bg-white/5 flex justify-end gap-4 lg:gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  passwordForm.reset();
                }}
                disabled={isChangingPassword}
                className="cursor-pointer px-6 py-3 lg:px-4 lg:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-base lg:text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isChangingPassword}
                onClick={passwordForm.handleSubmit(handlePasswordChange)}
                className="cursor-pointer px-8 py-3 lg:px-6 lg:py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-base lg:text-xs shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isChangingPassword ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 lg:h-4 lg:w-4 border-b-2 border-white"></div>
                    <span>Changement...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 lg:w-4 lg:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z"
                      />
                    </svg>
                    <span>Changer le mot de passe</span>
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
