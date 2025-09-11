import { Subscription } from "./type";

// Données des plans disponibles
export const availablePlans = [
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

// Fonction pour obtenir les détails d'un plan
export const getPlanDetails = (plan: string, subscription?: Subscription) => {
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
