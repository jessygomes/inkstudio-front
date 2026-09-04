export const DRAWING_CARD_STATUSES = [
  "A_DESSINER",
  "EN_COURS",
  "A_MODIFIER",
  "TERMINE",
  "APPROUVE",
] as const;

export type DrawingCardStatus = (typeof DRAWING_CARD_STATUSES)[number];
export type DrawingCardNoteType =
  | "INTERNAL"
  | "CLIENT_EXCHANGE"
  | "DESIGN_UPDATE";

export interface DrawingPerson {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  salonName?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface DrawingAppointment {
  id: string;
  title: string;
  start: string;
  end: string;
  prestation?: string;
  status: string;
}

export interface DrawingCardImage {
  id: string;
  url: string;
  caption?: string | null;
  version: number;
  isApproved: boolean;
  createdAt: string;
  uploadedById: string;
}

export interface DrawingCardNote {
  id: string;
  content: string;
  type: DrawingCardNoteType;
  createdAt: string;
  updatedAt: string;
  author: DrawingPerson;
}

export interface DrawingCard {
  id: string;
  salonId: string;
  sourceAppointmentId: string;
  tattooAppointmentId?: string | null;
  clientId?: string | null;
  clientUserId?: string | null;
  tatoueurId?: string | null;
  performerUserId?: string | null;
  title: string;
  description?: string | null;
  additionalInfo?: string | null;
  status: DrawingCardStatus;
  approvedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  sourceAppointment: DrawingAppointment;
  tattooAppointment?: DrawingAppointment | null;
  client?: DrawingPerson | null;
  clientUser?: DrawingPerson | null;
  tatoueur?: DrawingPerson | null;
  performerUser?: DrawingPerson | null;
  notes: DrawingCardNote[];
  images: DrawingCardImage[];
}

export interface DrawingCardFilters {
  status?: DrawingCardStatus;
  search?: string;
  tatoueurId?: string;
  appointmentDateFrom?: string;
  appointmentDateTo?: string;
}

export interface AppointmentCardStatus {
  appointmentId: string;
  appointmentCompleted: boolean;
  canCreate: boolean;
  cardExists: boolean;
  cardId: string | null;
  cardStatus: DrawingCardStatus | null;
}
