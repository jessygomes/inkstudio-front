/* eslint-disable react/no-unescaped-entities */
"use client";

export const dynamic = "force-dynamic";

import { useUser } from "@/components/Auth/Context/UserContext";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  CiUser,
  CiCreditCard1,
  CiBellOn,
  CiLock,
  // CiMail,
} from "react-icons/ci";
import { MdOutlinePalette } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CiSettings } from "react-icons/ci";
import {
  changePasswordAction,
  fetchAppointmentConfirmationAction,
  fetchAppointmentParamAction,
  updateAppointmentConfirmationAction,
  updateAppointmentParamAction,
} from "@/lib/queries/user";
import { availablePlans, getPlanDetails } from "@/lib/saasPlan.data";
import { changePasswordSchema } from "@/lib/zod/validator.schema";
import { Subscription, UserSettings } from "@/lib/type";
// import ColorProfile from "@/components/Application/MonCompte/ColorProfile";

export default function ParamPage() {
  const user = useUser();

  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [confirmationEnabled, setConfirmationEnabled] = useState(false);
  const [appointmentParam, setAppointmentParam] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    appointmentReminders: true,
    followUpReminders: true,
  });

  // États pour les sections dépliantes
  const [openSections, setOpenSections] = useState({
    account: true,
    subscription: true,
    notifications: false,
    security: false,
    preferences: false,
  });

  // États pour la modale de changement de plan
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  // États pour la modale de changement de mot de passe
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

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  //! Récupérer le plan utilisateur
  const fetchUserPlan = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/saas/plan/${user.id}`,
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
  }, [user?.id]);

  //! Récupérer les paramètre de RDV
  const fetchConfirmationSetting = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetchAppointmentConfirmationAction();
      const responseParam = await fetchAppointmentParamAction();

      if (response.ok) {
        setConfirmationEnabled(
          response.data.user.addConfirmationEnabled || false
        );
      }
      if (responseParam.ok) {
        setAppointmentParam(
          responseParam.data.user.addAppointmentParam || false
        );
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du paramètre de confirmation :",
        error
      );
    }
  }, [user?.id]);

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        setLoading(true);
        // Récupérer les données du plan et le paramètre de confirmation
        await Promise.all([fetchUserPlan(), fetchConfirmationSetting()]);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchAccountData();
    }
  }, [user?.id, fetchUserPlan, fetchConfirmationSetting]);

  //! CHANGER DE PLAN
  const handlePlanChange = async (newPlan: string) => {
    if (!user?.id) return;

    setIsChangingPlan(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/saas/upgrade/${user.id}`,
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

  const handleSettingChange = async (
    setting: keyof UserSettings,
    value: boolean
  ) => {
    try {
      setSettings((prev) => ({ ...prev, [setting]: value }));

      // Simuler un appel API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/users/settings`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [setting]: value }),
        }
      );

      if (response.ok) {
        toast.success("Paramètre mis à jour");
      } else {
        throw new Error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur:", error);
      // Revenir à l'ancien état en cas d'erreur
      setSettings((prev) => ({ ...prev, [setting]: !value }));
      toast.error("Erreur lors de la mise à jour");
    }
  };

  //! Fonction pour changer le paramètre de confirmation des RDV
  const handleConfirmationSettingChange = async (value: boolean) => {
    if (!user?.id) return;

    try {
      const response = await updateAppointmentConfirmationAction(value);

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du paramètre");
      }

      // Mise à jour de l'état local
      setConfirmationEnabled(value);

      toast.success(
        value
          ? "Confirmation manuelle activée - Les nouveaux RDV devront être confirmés"
          : "Confirmation automatique activée - Les nouveaux RDV seront directement confirmés"
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du paramètre :", error);
      toast.error("Erreur lors de la mise à jour du paramètre");
    }
  };

  //! Fonction pour changer le paramètre de confirmation des RDV
  const handleAppointmentSettingChange = async (value: boolean) => {
    if (!user?.id) return;

    try {
      const response = await updateAppointmentParamAction(value);

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du paramètre");
      }

      // Mise à jour de l'état local
      setAppointmentParam(value);

      toast.success(
        value
          ? "La prise de RDV est globale au salon."
          : "La prise de RDV est individuelle aux tatoueurs."
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du paramètre :", error);
      toast.error("Erreur lors de la mise à jour du paramètre");
    }
  };

  // Fonction pour changer le mot de passe
  const handlePasswordChange = async (
    data: z.infer<typeof changePasswordSchema>
  ) => {
    if (!user?.id) return;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-noir-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-tertiary-400 mx-auto mb-4"></div>
          <p className="text-white font-one">
            <span className="hidden sm:inline">
              Chargement des paramètres...
            </span>
            <span className="sm:hidden">Chargement...</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-noir-700 flex flex-col items-center justify-center gap-4 px-3 sm:px-6 lg:px-20">
      <div className="flex flex-col relative gap-4 sm:gap-6 w-full mt-23">
        {/* Header responsive */}
        <div className="">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-tertiary-400/30 rounded-full flex items-center justify-center">
                <CiSettings
                  size={20}
                  className="sm:w-7 sm:h-7 text-tertiary-400 animate-pulse"
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white font-one tracking-wide uppercase">
                  <span className="hidden sm:inline">Paramètres du compte</span>
                  <span className="sm:hidden">Paramètres</span>
                </h1>
                <p className="text-white/70 text-xs font-one mt-1">
                  <span className="hidden sm:inline">
                    Gérez votre compte, abonnement et préférences
                  </span>
                  <span className="sm:hidden">Compte et préférences</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Section Informations du compte responsive */}
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
              <div className="text-white/50">
                {openSections.account ? "−" : "+"}
              </div>
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

                {/* Paramètre de confirmation des RDV */}
                <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-one mb-1 text-sm sm:text-base">
                        <span className="hidden sm:inline">
                          Confirmation manuelle des rendez-vous
                        </span>
                        <span className="sm:hidden">Confirmation RDV</span>
                      </h3>
                      <p className="text-white/60 text-xs sm:text-sm font-one">
                        <span className="hidden sm:inline">
                          Si activé, vous devrez confirmer manuellement chaque
                          rendez-vous pris par un client
                        </span>
                        <span className="sm:hidden">
                          Confirmation manuelle des RDV
                        </span>
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmationEnabled}
                        onChange={(e) =>
                          handleConfirmationSettingChange(e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary-400"></div>
                    </label>
                  </div>

                  {/* Indicateur de statut */}
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          confirmationEnabled ? "bg-orange-400" : "bg-green-400"
                        }`}
                      ></div>
                      <span className="text-xs font-one text-white/70">
                        {confirmationEnabled ? (
                          <span className="text-orange-300">
                            <span className="hidden sm:inline">
                              Les nouveaux RDV seront en attente de votre
                              confirmation
                            </span>
                            <span className="sm:hidden">RDV en attente</span>
                          </span>
                        ) : (
                          <span className="text-green-300">
                            <span className="hidden sm:inline">
                              Les nouveaux RDV sont automatiquement confirmés
                            </span>
                            <span className="sm:hidden">
                              RDV auto-confirmés
                            </span>
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-one mb-1 text-sm sm:text-base">
                        <span className="hidden sm:inline">
                          Mode de prise de rendez-vous
                        </span>
                        <span className="sm:hidden">Mode RDV</span>
                      </h3>
                      <p className="text-white/60 text-xs sm:text-sm font-one">
                        <span className="hidden sm:inline">
                          Si activé, prise de RDV globale au salon (agenda
                          unique). <br />
                          Si désactivé, le client choisit son tatoueur et voit
                          son agenda personnel.
                        </span>
                        <span className="sm:hidden">
                          Agenda global ou par tatoueur
                        </span>
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={appointmentParam}
                        onChange={(e) =>
                          handleAppointmentSettingChange(e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary-400"></div>
                    </label>
                  </div>

                  {/* Indicateur de statut */}
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          appointmentParam ? "bg-blue-400" : "bg-green-400"
                        }`}
                      ></div>
                      <span className="text-xs font-one text-white/70">
                        {appointmentParam ? (
                          <span className="text-blue-300">
                            <span className="hidden sm:inline">
                              Agenda global du salon (moins de créneaux
                              disponibles)
                            </span>
                            <span className="sm:hidden">Agenda salon</span>
                          </span>
                        ) : (
                          <span className="text-green-300">
                            <span className="hidden sm:inline">
                              Agenda par tatoueur (client choisit son tatoueur)
                            </span>
                            <span className="sm:hidden">Par tatoueur</span>
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* <ColorProfile /> */}

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

            {openSections.subscription && subscription && (
              <div className="space-y-4">
                {/* Plan actuel responsive */}
                <div
                  className={`${
                    getPlanDetails(subscription.currentPlan, subscription)
                      .bgColor
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
                              Période d'essai active
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
                  <button
                    onClick={() => setShowPlanModal(true)}
                    className="cursor-pointer w-full sm:w-[175px] flex justify-center items-center gap-2 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs shadow-lg"
                  >
                    <span className="hidden sm:inline">Changer de plan</span>
                    <span className="sm:hidden">Changer plan</span>
                  </button>
                  <button className="cursor-pointer px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg text-xs font-one font-medium transition-colors">
                    <span className="hidden sm:inline">
                      Annuler l'abonnement
                    </span>
                    <span className="sm:hidden">Annuler</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section Notifications responsive */}
          <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl">
            <button
              onClick={() => toggleSection("notifications")}
              className="w-full flex items-center justify-between mb-3 sm:mb-4"
            >
              <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl text-white font-one">
                <CiBellOn
                  size={20}
                  className="sm:w-6 sm:h-6 text-tertiary-400"
                />
                Notifications
              </h2>
              <div className="text-white/50">
                {openSections.notifications ? "−" : "+"}
              </div>
            </button>

            {openSections.notifications && (
              <div className="space-y-4">
                {/* Email Notifications responsive */}
                <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-one mb-1 text-sm sm:text-base">
                        <span className="hidden sm:inline">
                          Notifications par email
                        </span>
                        <span className="sm:hidden">Email</span>
                      </h3>
                      <p className="text-white/60 text-xs sm:text-sm font-one">
                        <span className="hidden sm:inline">
                          Recevez des emails pour les événements importants
                        </span>
                        <span className="sm:hidden">Emails importants</span>
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) =>
                          handleSettingChange(
                            "emailNotifications",
                            e.target.checked
                          )
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary-400"></div>
                    </label>
                  </div>
                </div>

                {/* Rappels RDV responsive */}
                <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-one mb-1 text-sm sm:text-base">
                        <span className="hidden sm:inline">
                          Rappels de rendez-vous
                        </span>
                        <span className="sm:hidden">Rappels RDV</span>
                      </h3>
                      <p className="text-white/60 text-xs sm:text-sm font-one">
                        <span className="hidden sm:inline">
                          Notifications avant les rendez-vous
                        </span>
                        <span className="sm:hidden">Avant les RDV</span>
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.appointmentReminders}
                        onChange={(e) =>
                          handleSettingChange(
                            "appointmentReminders",
                            e.target.checked
                          )
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary-400"></div>
                    </label>
                  </div>
                </div>

                {/* Suivis de cicatrisation responsive */}
                <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-one mb-1 text-sm sm:text-base">
                        <span className="hidden sm:inline">
                          Rappels de suivi
                        </span>
                        <span className="sm:hidden">Rappels suivi</span>
                      </h3>
                      <p className="text-white/60 text-xs sm:text-sm font-one">
                        <span className="hidden sm:inline">
                          Notifications pour les suivis de cicatrisation
                        </span>
                        <span className="sm:hidden">Suivis cicatrisation</span>
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.followUpReminders}
                        onChange={(e) =>
                          handleSettingChange(
                            "followUpReminders",
                            e.target.checked
                          )
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary-400"></div>
                    </label>
                  </div>
                </div>

                {/* Marketing responsive */}
                <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-one mb-1 text-sm sm:text-base">
                        <span className="hidden sm:inline">
                          Emails marketing
                        </span>
                        <span className="sm:hidden">Marketing</span>
                      </h3>
                      <p className="text-white/60 text-xs sm:text-sm font-one">
                        <span className="hidden sm:inline">
                          Actualités et offres spéciales
                        </span>
                        <span className="sm:hidden">Actualités et offres</span>
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.marketingEmails}
                        onChange={(e) =>
                          handleSettingChange(
                            "marketingEmails",
                            e.target.checked
                          )
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary-400"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

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

          {/* Section Préférences responsive */}
          <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl">
            <button
              onClick={() => toggleSection("preferences")}
              className="w-full flex items-center justify-between mb-3 sm:mb-4"
            >
              <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl text-white font-one">
                <MdOutlinePalette
                  size={20}
                  className="sm:w-6 sm:h-6 text-tertiary-400"
                />
                Préférences
              </h2>
              <div className="text-white/50">
                {openSections.preferences ? "−" : "+"}
              </div>
            </button>

            {openSections.preferences && (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
                  <h3 className="text-white font-one mb-2 text-sm sm:text-base">
                    <span className="hidden sm:inline">Fuseau horaire</span>
                    <span className="sm:hidden">Fuseau</span>
                  </h3>
                  <select className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors">
                    <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                    <option value="Europe/London">Europe/London (UTC+0)</option>
                    <option value="America/New_York">
                      America/New_York (UTC-5)
                    </option>
                  </select>
                </div>

                <div className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
                  <h3 className="text-white font-one mb-2 text-sm sm:text-base">
                    Langue
                  </h3>
                  <select className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors">
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modales avec responsive... */}
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

      {/* Modale de changement de mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-noir-500 rounded-2xl sm:rounded-3xl w-full max-w-md overflow-hidden flex flex-col border border-white/20 shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-white/5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white font-one tracking-wide">
                  🔑 Changer le mot de passe
                </h2>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    passwordForm.reset();
                  }}
                  disabled={isChangingPassword}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                >
                  <span className="cursor-pointer text-white text-xl">×</span>
                </button>
              </div>
              <p className="text-white/70 mt-2 text-sm">
                Modifiez votre mot de passe de connexion
              </p>
            </div>

            {/* Contenu */}
            <div className="p-6">
              <form
                onSubmit={passwordForm.handleSubmit(handlePasswordChange)}
                className="space-y-4"
              >
                {/* Mot de passe actuel */}
                <div className="space-y-2">
                  <label className="text-sm text-white/80 font-one">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    {...passwordForm.register("currentPassword")}
                    disabled={isChangingPassword}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-tertiary-400 transition-colors disabled:opacity-50"
                    placeholder="Votre mot de passe actuel"
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-red-300 text-xs">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                {/* Nouveau mot de passe */}
                <div className="space-y-2">
                  <label className="text-sm text-white/80 font-one">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    {...passwordForm.register("newPassword")}
                    disabled={isChangingPassword}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-tertiary-400 transition-colors disabled:opacity-50"
                    placeholder="Votre nouveau mot de passe"
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-red-300 text-xs">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Confirmation nouveau mot de passe */}
                <div className="space-y-2">
                  <label className="text-sm text-white/80 font-one">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    {...passwordForm.register("confirmPassword")}
                    disabled={isChangingPassword}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-tertiary-400 transition-colors disabled:opacity-50"
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-red-300 text-xs">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Règles de sécurité */}
                <div className="bg-tertiary-500/10 border border-tertiary-500/20 rounded-lg p-3 mt-4">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-tertiary-400 mt-0.5 flex-shrink-0"
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
                      <p className="text-tertiary-400 text-xs font-semibold mb-1">
                        Exigences du mot de passe
                      </p>
                      <ul className="text-tertiary-400/80 text-xs space-y-1">
                        <li>• Au moins 6 caractères</li>
                        <li>• Différent de votre mot de passe actuel</li>
                        <li>
                          • Combinaison de lettres et chiffres recommandée
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      passwordForm.reset();
                    }}
                    disabled={isChangingPassword}
                    className="cursor-pointer w-full flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="cursor-pointer w-full flex justify-center items-center gap-2 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs shadow-lg"
                  >
                    {isChangingPassword ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Changement...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                          />
                        </svg>
                        <span>Changer le mot de passe</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
