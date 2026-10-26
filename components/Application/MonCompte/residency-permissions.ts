import { CalendarPlus, CalendarRange, Eye, Globe2, PencilLine } from "lucide-react";

export const salonPermissions = [
  { key: "salonAllowsArtistCreate", title: "Créer ses rendez-vous", description: "Le tatoueur peut créer des rendez-vous à son nom dans votre salon, sur ses plages de présence validées.", receivedTitle: "Créer vos rendez-vous dans ce salon", receivedDescription: "Le salon vous autorise à ajouter vos rendez-vous sur vos plages de présence validées.", icon: CalendarPlus },
  { key: "salonAllowsArtistManage", title: "Modifier et annuler ses rendez-vous", description: "Le tatoueur peut modifier ou annuler ses propres rendez-vous rattachés à ce salon.", receivedTitle: "Gérer vos rendez-vous dans ce salon", receivedDescription: "Le salon vous autorise à modifier et annuler vos rendez-vous qui y sont rattachés.", icon: PencilLine },
  { key: "salonAllowsPublicBooking", title: "Proposer la réservation en ligne", description: "Vous autorisez la réservation publique des créneaux du tatoueur dans ce salon. Son accord est également nécessaire.", receivedTitle: "Ouvrir votre réservation en ligne", receivedDescription: "Le salon donne son accord pour proposer vos créneaux à la réservation publique. Vous devez également l’autoriser.", icon: Globe2 },
] as const;

export const artistPermissions = [
  { key: "artistAllowsSalonView", title: "Consulter les détails de vos rendez-vous", description: "Ce salon peut consulter les informations de vos rendez-vous qui lui sont rattachés.", receivedTitle: "Consulter les détails de ses rendez-vous", receivedDescription: "Le tatoueur autorise votre salon à voir les informations de ses rendez-vous rattachés à ce salon.", icon: Eye },
  { key: "artistAllowsSalonCreate", title: "Créer des rendez-vous pour vous", description: "Ce salon peut ajouter des rendez-vous à votre nom dans son établissement.", receivedTitle: "Créer ses rendez-vous", receivedDescription: "Le tatoueur autorise votre salon à créer des rendez-vous à son nom dans cet établissement.", icon: CalendarPlus },
  { key: "artistAllowsSalonManage", title: "Modifier et annuler vos rendez-vous", description: "Ce salon peut modifier ou annuler vos rendez-vous qui lui sont rattachés.", receivedTitle: "Modifier et annuler ses rendez-vous", receivedDescription: "Le tatoueur autorise votre salon à modifier et annuler ses rendez-vous rattachés à cet établissement.", icon: CalendarRange },
  { key: "artistAllowsPublicBooking", title: "Ouvrir votre réservation en ligne", description: "Vous autorisez la réservation publique de vos créneaux dans ce salon. Le salon doit aussi donner son accord.", receivedTitle: "Ouvrir sa réservation en ligne", receivedDescription: "Le tatoueur donne son accord pour la réservation publique de ses créneaux dans votre salon. Votre accord est également nécessaire.", icon: Globe2 },
] as const;

export type ResidencyPermissionKey = typeof salonPermissions[number]["key"] | typeof artistPermissions[number]["key"];
