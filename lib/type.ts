//! TATOUEUR
export type TatoueurProps = {
  id: string;
  name: string;
  img?: string;
  description: string | null;
  phone?: string;
  instagram?: string;
  hours?: string | null;
  style: string[]; // Ajoutez cette propriété
  skills: string[]; // Ajoutez cette propriété
};

export interface TimeSlotProps {
  id: string;
  start: string;
  end: string;
}

//! RENDEZ-VOUS
export interface AppointmentProps {
  id: string;
  title: string;
  description: string;
  start: string; // Date au format ISO
  end: string; // Date au format ISO
  allDay?: boolean;
  status: "PENDING" | "CONFIRMED" | "DECLINED" | "CANCELED";
  prestation: "TATTOO" | "PIERCING" | "RETOUCHE" | "PROJET";
  zone: string;
  size: number;
  estimatedPrice: number;
  tatoueurId: string;
  userId: string;
  clientId: string;
  tattooDetail?: {
    description?: string;
    zone?: string;
    size?: string;
    colorStyle?: string;
    reference?: string;
    sketch?: string;
    estimatedPrice?: number;
  };
}

export type UpdateRdvFormProps = {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  status: "PENDING" | "CONFIRMED" | "DECLINED" | "CANCELED";
  prestation: "TATTOO" | "PIERCING" | "RETOUCHE" | "PROJET";
  zone: string;
  size: number;
  estimatedPrice: number;
  tatoueurId: string;
  userId: string;
  tattooDetail?: {
    description?: string;
    zone?: string;
    size?: string;
    colorStyle?: string;
    reference?: string;
    sketch?: string;
    estimatedPrice?: number;
    price?: number; // Ajout du prix réel
  };
};

//! SALON
export interface SalonUserProps {
  id: string;
  firstName: string;
  lastName: string;
  salonName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  role: string; // Exemple : "user"
  salonHours: string; // JSON string, peut être typé plus précisément si nécessaire
  description: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  website: string | null;
  image: string | null;
  Tatoueur: TatoueurProps[];
  prestations: string[]; // Liste des prestations
}

export interface UpdateSalonUserProps {
  id: string;
  firstName: string;
  lastName: string;
  salonName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  role: string; // Exemple : "user"
  // salonHours: string; // JSON string, peut être typé plus précisément si nécessaire
  description: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  website: string | null;
  image: string | null;
  prestations: string[]; // Liste des prestations
}

export interface Subscription {
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

export interface UserSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  appointmentReminders: boolean;
  followUpReminders: boolean;
}

//! TATTOO HISTORY
export interface TattooHistoryProps {
  id: string;
  clientId: string; // ID du client
  date: string; // Date au format ISO
  description: string; // Type de tatouage
  beforeImage: string; // Image avant le tatouage
  afterImage: string; // Image après le tatouage
  inkused: string; // Type d'encre utilisée
  healingTime: string; // Temps de guérison
  careProducts: string; // Produits de soin utilisés
}

//! CLIENTS
export interface ClientProps {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string | null; // Date de naissance au format ISO
  address: string;
  appointments: AppointmentProps[]; // Liste des rendez-vous
  tattooHistories: TattooHistoryProps[]; // Historique des tatouages
  medicalHistory: {
    allergies: string | null; // Allergies
    healthIssues: string | null; // Problèmes de santé
    medications: string | null; // Médicaments
    pregnancy: boolean; // Indique si la personne est enceinte
    tattooHistory: string | null; // Historique des tatouages
  };
  FollowUpSubmission?: {
    id: string;
    appointmentId: string;
    isAnswered: boolean;
    isPhotoPublic: boolean;
    rating: number; // Note de 1 à 5
    photoUrl: string; // URL de la photo de suivi
    review: string | null; // Commentaire du client
    createdAt: string; // Date de création au format ISO
  }[];
}

//! PORTFOLIO
export interface PortfolioProps {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string; // URL de l'image
  createdAt: string; // Date de création au format ISO
  updatedAt: string; // Date de mise à jour au format ISO
  tatoueurId: string; // ID du tatoueur associé
}

//! PRODUCTS
export interface ProductSalonProps {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string; // URL de l'image
}
