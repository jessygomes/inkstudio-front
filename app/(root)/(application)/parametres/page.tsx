/* eslint-disable react/no-unescaped-entities */
"use client";

import { useUser } from "@/components/Auth/Context/UserContext";
import { useState, useEffect } from "react";
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

interface Subscription {
  id: string;
  userId: string;
  currentPlan: "FREE" | "PRO" | "BUSINESS";
  planStatus: "ACTIVE" | "CANCELLED" | "EXPIRED";
  startDate: string;
  endDate: string | null;
  trialEndDate: string | null;
  maxAppointments: number;
  maxClients: number;
  maxTattooeurs: number;
  maxPortfolioImages: number;
  hasAdvancedStats: boolean;
  hasEmailReminders: boolean;
  hasCustomBranding: boolean;
  hasApiAccess: boolean;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  lastPaymentDate: string | null;
  nextPaymentDate: string | null;
  paymentMethod: string | null;
  stripeCustomerId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  appointmentReminders: boolean;
  followUpReminders: boolean;
}

export default function ParamPage() {
  const user = useUser();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
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

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  //! Récupérer le plan utilisateur
  const fetchUserPlan = async () => {
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
  };

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        setLoading(true);
        // Appeler la vraie fonction au lieu de la simulation
        await fetchUserPlan();
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchAccountData();
    }
  }, [user?.id]);

  const getPlanDetails = (plan: string) => {
    switch (plan) {
      case "FREE":
        return {
          name: "Gratuit",
          color: "text-gray-400",
          bgColor: "bg-gray-500/20",
          borderColor: "border-gray-500/30",
          features: [
            `${subscription?.maxClients || 0} clients max`,
            `${subscription?.maxAppointments || 0} RDV/mois`,
            "Support basique",
          ],
        };
      case "PRO":
        return {
          name: "Pro",
          color: "text-tertiary-400",
          bgColor: "bg-tertiary-500/20",
          borderColor: "border-tertiary-500/30",
          features: [
            "Clients illimités",
            "RDV illimités",
            "Support prioritaire",
            subscription?.hasAdvancedStats
              ? "Analytics avancées"
              : "Analytics basiques",
            subscription?.hasEmailReminders
              ? "Rappels automatiques"
              : "Rappels manuels",
          ],
        };
      case "BUSINESS":
        return {
          name: "Business",
          color: "text-purple-400",
          bgColor: "bg-purple-500/20",
          borderColor: "border-purple-500/30",
          features: [
            "Multi-salons",
            subscription?.hasApiAccess ? "API accès" : "Pas d'API",
            "Support dédié",
            subscription?.hasCustomBranding
              ? "Branding personnalisé"
              : "Branding standard",
            "Intégrations avancées",
          ],
        };
      default:
        return {
          name: "Inconnu",
          color: "text-white",
          bgColor: "bg-white/5",
          borderColor: "border-white/10",
          features: [],
        };
    }
  };

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
        `Plan changé avec succès vers ${getPlanDetails(newPlan).name} !`
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

  // Données des plans disponibles
  const availablePlans = [
    {
      id: "FREE",
      name: "Gratuit",
      price: 0,
      color: "text-gray-400",
      bgColor: "bg-gray-500/20",
      borderColor: "border-gray-500/30",
      features: ["5 clients max", "10 RDV/mois", "Support basique"],
      description: "Parfait pour débuter",
    },
    {
      id: "PRO",
      name: "Pro",
      price: 29,
      color: "text-tertiary-400",
      bgColor: "bg-tertiary-500/20",
      borderColor: "border-tertiary-500/30",
      features: [
        "Clients illimités",
        "RDV illimités",
        "Support prioritaire",
        "Analytics avancées",
        "Rappels automatiques",
      ],
      description: "Pour les professionnels",
    },
    {
      id: "BUSINESS",
      name: "Business",
      price: 69,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      borderColor: "border-purple-500/30",
      features: [
        "Multi-salons",
        "API accès",
        "Support dédié",
        "Branding personnalisé",
        "Intégrations avancées",
      ],
      description: "Pour les entreprises",
    },
  ];

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

  if (loading) {
    return (
      <div className="min-h-screen bg-noir-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tertiary-400 mx-auto mb-4"></div>
          <p className="text-white font-one">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir-700 pb-8">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-one tracking-wide mb-2">
            Paramètres du compte
          </h1>
          <p className="text-white/70 font-one">
            Gérez votre compte, abonnement et préférences
          </p>
        </div>

        <div className="space-y-6">
          {/* Section Informations du compte */}
          <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
            <button
              onClick={() => toggleSection("account")}
              className="w-full flex items-center justify-between mb-4"
            >
              <h2 className="flex items-center gap-3 text-xl font-bold text-white font-one">
                <CiUser size={24} className="text-tertiary-400" />
                Informations du compte
              </h2>
              <div className="text-white/50">
                {openSections.account ? "−" : "+"}
              </div>
            </button>

            {openSections.account && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <label className="text-sm font-semibold text-white/80 font-one mb-2 block">
                      Nom du salon
                    </label>
                    <p className="text-white font-two text-lg">
                      {user?.salonName || "Nom non défini"}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <label className="text-sm font-semibold text-white/80 font-one mb-2 block">
                      Email
                    </label>
                    <p className="text-white font-two">
                      {user?.email || "Email non défini"}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <label className="text-sm font-semibold text-white/80 font-one mb-2 block">
                      Téléphone
                    </label>
                    <p className="text-white font-two">
                      {user?.phone || "Non renseigné"}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <label className="text-sm font-semibold text-white/80 font-one mb-2 block">
                      Adresse
                    </label>
                    <p className="text-white font-two">
                      {user?.address || "Non renseignée"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="px-4 py-2 bg-tertiary-400/20 hover:bg-tertiary-400/30 text-tertiary-400 border border-tertiary-400/30 rounded-lg text-sm font-one font-medium transition-colors">
                    Modifier les informations
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section Abonnement */}
          <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
            <button
              onClick={() => toggleSection("subscription")}
              className="w-full flex items-center justify-between mb-4"
            >
              <h2 className="flex items-center gap-3 text-xl font-bold text-white font-one">
                <CiCreditCard1 size={24} className="text-tertiary-400" />
                Abonnement
              </h2>
              <div className="text-white/50">
                {openSections.subscription ? "−" : "+"}
              </div>
            </button>

            {openSections.subscription && subscription && (
              <div className="space-y-4">
                {/* Plan actuel */}
                <div
                  className={`${
                    getPlanDetails(subscription.currentPlan).bgColor
                  } rounded-xl p-6 border ${
                    getPlanDetails(subscription.currentPlan).borderColor
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3
                        className={`text-xl font-bold ${
                          getPlanDetails(subscription.currentPlan).color
                        } font-one`}
                      >
                        Plan {getPlanDetails(subscription.currentPlan).name}
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
                      <p className="text-2xl font-bold text-white font-one">
                        {subscription.monthlyPrice || 0}€
                      </p>
                      <p className="text-white/60 text-sm font-one">/mois</p>
                    </div>
                  </div>

                  {/* Fonctionnalités */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    {getPlanDetails(subscription.currentPlan).features.map(
                      (feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <FaCheck className="text-green-400 text-sm" />
                          <span className="text-white/80 text-sm font-one">
                            {feature}
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  {/* Limites du plan */}
                  <div className="bg-white/10 rounded-lg p-4 mb-4">
                    <h4 className="text-white font-one mb-3 text-sm">
                      📊 Limites de votre plan
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div className="text-center">
                        <p className="text-white/60 font-one mb-1">Clients</p>
                        <p className="text-white font-one font-bold">
                          {subscription.maxClients === -1
                            ? "∞"
                            : subscription.maxClients}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-white/60 font-one mb-1">RDV/mois</p>
                        <p className="text-white font-one font-bold">
                          {subscription.maxAppointments === -1
                            ? "∞"
                            : subscription.maxAppointments}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-white/60 font-one mb-1">Tatoueurs</p>
                        <p className="text-white font-one font-bold">
                          {subscription.maxTattooeurs === -1
                            ? "∞"
                            : subscription.maxTattooeurs}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-white/60 font-one mb-1">
                          Images portfolio
                        </p>
                        <p className="text-white font-one font-bold">
                          {subscription.maxPortfolioImages === -1
                            ? "∞"
                            : subscription.maxPortfolioImages}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-white/60 font-one">Date de début</p>
                      <p className="text-white font-one">
                        {new Date(subscription.startDate).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/60 font-one">
                        {subscription.nextPaymentDate
                          ? "Prochaine facturation"
                          : "Fin d'abonnement"}
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
                            Période d'essai active
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

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPlanModal(true)}
                    className="cursor-pointer px-4 py-2 bg-tertiary-400/20 hover:bg-tertiary-400/30 text-tertiary-400 border border-tertiary-400/30 rounded-lg text-sm font-one font-medium transition-colors"
                  >
                    Changer de plan
                  </button>
                  <button className="cursor-pointer px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg text-sm font-one font-medium transition-colors">
                    Annuler l'abonnement
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section Notifications */}
          <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
            <button
              onClick={() => toggleSection("notifications")}
              className="w-full flex items-center justify-between mb-4"
            >
              <h2 className="flex items-center gap-3 text-xl font-bold text-white font-one">
                <CiBellOn size={24} className="text-tertiary-400" />
                Notifications
              </h2>
              <div className="text-white/50">
                {openSections.notifications ? "−" : "+"}
              </div>
            </button>

            {openSections.notifications && (
              <div className="space-y-4">
                {/* Email Notifications */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-one font-semibold mb-1">
                        Notifications par email
                      </h3>
                      <p className="text-white/60 text-sm font-one">
                        Recevez des emails pour les événements importants
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

                {/* Rappels RDV */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-one font-semibold mb-1">
                        Rappels de rendez-vous
                      </h3>
                      <p className="text-white/60 text-sm font-one">
                        Notifications avant les rendez-vous
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

                {/* Suivis de cicatrisation */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-one font-semibold mb-1">
                        Rappels de suivi
                      </h3>
                      <p className="text-white/60 text-sm font-one">
                        Notifications pour les suivis de cicatrisation
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

                {/* Marketing */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-one font-semibold mb-1">
                        Emails marketing
                      </h3>
                      <p className="text-white/60 text-sm font-one">
                        Actualités et offres spéciales
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

          {/* Section Sécurité */}
          <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
            <button
              onClick={() => toggleSection("security")}
              className="w-full flex items-center justify-between mb-4"
            >
              <h2 className="flex items-center gap-3 text-xl font-bold text-white font-one">
                <CiLock size={24} className="text-tertiary-400" />
                Sécurité
              </h2>
              <div className="text-white/50">
                {openSections.security ? "−" : "+"}
              </div>
            </button>

            {openSections.security && (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-white font-one font-semibold mb-2">
                    Mot de passe
                  </h3>
                  <p className="text-white/60 text-sm font-one mb-3">
                    Dernière modification: Il y a 2 mois
                  </p>
                  <button className="px-4 py-2 bg-tertiary-400/20 hover:bg-tertiary-400/30 text-tertiary-400 border border-tertiary-400/30 rounded-lg text-sm font-one font-medium transition-colors">
                    Changer le mot de passe
                  </button>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-white font-one font-semibold mb-2">
                    Sessions actives
                  </h3>
                  <p className="text-white/60 text-sm font-one mb-3">
                    Gérez les appareils connectés à votre compte
                  </p>
                  <button className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg text-sm font-one font-medium transition-colors">
                    Déconnecter tous les appareils
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section Préférences */}
          <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
            <button
              onClick={() => toggleSection("preferences")}
              className="w-full flex items-center justify-between mb-4"
            >
              <h2 className="flex items-center gap-3 text-xl font-bold text-white font-one">
                <MdOutlinePalette size={24} className="text-tertiary-400" />
                Préférences
              </h2>
              <div className="text-white/50">
                {openSections.preferences ? "−" : "+"}
              </div>
            </button>

            {openSections.preferences && (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-white font-one font-semibold mb-2">
                    Fuseau horaire
                  </h3>
                  <select className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-tertiary-400 transition-colors">
                    <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                    <option value="Europe/London">Europe/London (UTC+0)</option>
                    <option value="America/New_York">
                      America/New_York (UTC-5)
                    </option>
                  </select>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-white font-one font-semibold mb-2">
                    Langue
                  </h3>
                  <select className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-tertiary-400 transition-colors">
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

      {/* Modale de changement de plan */}
      {showPlanModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-noir-500 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20 shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-white/5">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white font-one tracking-wide">
                  Changer de plan
                </h2>
                <button
                  onClick={() => {
                    setShowPlanModal(false);
                    setSelectedPlan("");
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <span className="cursor-pointer text-white text-xl">×</span>
                </button>
              </div>
              <p className="text-white/70 mt-2 text-sm">
                Sélectionnez le plan qui correspond le mieux à vos besoins
              </p>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      <div className="text-center mb-6">
                        <h3
                          className={`text-xl font-bold ${plan.color} font-one mb-2`}
                        >
                          {plan.name}
                        </h3>
                        <p className="text-white/60 text-sm font-one mb-4">
                          {plan.description}
                        </p>
                        <div className="text-3xl font-bold text-white font-one">
                          {plan.price}€
                          <span className="text-base text-white/60 font-normal">
                            /mois
                          </span>
                        </div>
                      </div>

                      {/* Fonctionnalités */}
                      <div className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <FaCheck className="text-green-400 text-sm flex-shrink-0" />
                            <span className="text-white/80 text-sm font-one">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Sélection */}
                      {!isCurrentPlan && (
                        <div className="flex items-center justify-center">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isSelected
                                ? "border-tertiary-400 bg-tertiary-400"
                                : "border-white/40"
                            }`}
                          >
                            {isSelected && (
                              <FaCheck className="text-white text-xs" />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Message pour plan gratuit */}
                      {plan.id === "FREE" &&
                        subscription?.currentPlan !== "FREE" && (
                          <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                            <p className="text-yellow-300 text-xs font-one text-center">
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
              <div className="mt-8 bg-tertiary-500/10 border border-tertiary-500/20 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-tertiary-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-3 h-3 text-tertiary-400"
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
                    <h3 className="text-white font-semibold font-one mb-2 text-sm">
                      💡 À propos du changement de plan
                    </h3>
                    <ul className="text-white/70 text-xs space-y-1 font-one">
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
            <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPlanModal(false);
                  setSelectedPlan("");
                }}
                disabled={isChangingPlan}
                className="cursor-pointer px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={() => selectedPlan && handlePlanChange(selectedPlan)}
                disabled={!selectedPlan || isChangingPlan}
                className="cursor-pointer px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-sm flex items-center gap-2"
              >
                {isChangingPlan ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
    </div>
  );
}
