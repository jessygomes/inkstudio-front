//! TATOUEUR
export interface TatoueurProps {
  id: string;
  name: string;
  img?: string;
  description: string | null;
}

export interface TimeSlotProps {
  id: string;
  start: string;
  end: string;
}

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
}
