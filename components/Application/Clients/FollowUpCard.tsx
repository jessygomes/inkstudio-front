"use client";
import { useActivityNotifications } from "@/components/Providers/ActivityNotificationsProvider";

import Image from "next/image";
import { ArrowUpRight, CalendarDays, CheckCheck, Clock3, Globe2, ImageIcon, LockKeyhole, MessageCircle, Star, Trash2, UserRound } from "lucide-react";
import { followUpClientName, followUpDate, followUpRatingLabel, type FollowUpItem } from "@/lib/types/followUp";
import styles from "./FollowUps.module.css";

export function FollowUpRating({ rating }: { rating: number }) {
  const stars = Math.max(0, Math.min(5, Math.round(rating)));
  return <span className={styles.rating} aria-label={`${stars} sur 5 : ${followUpRatingLabel(rating)}`}><span aria-hidden="true">{[1, 2, 3, 4, 5].map(value => <Star key={value} size={12} fill={value <= stars ? "currentColor" : "none"} data-filled={value <= stars} />)}</span><strong>{stars}/5</strong></span>;
}

export function FollowUpStatus({ answered }: { answered: boolean }) {
  return <span className={styles.status} data-answered={answered}>{answered ? <CheckCheck size={12} /> : <Clock3 size={12} />}{answered ? "Répondu" : "À traiter"}</span>;
}

export default function FollowUpCard({ followUp, onOpen, onDelete }: { followUp: FollowUpItem; onOpen: () => void; onDelete: () => void }) {
  const { isNew } = useActivityNotifications();
  const unread = isNew("followUps", followUp.id);
  const client = followUpClientName(followUp);
  return <article className={styles.card} style={unread ? { borderColor: "var(--color-tertiary-400)", boxShadow: "0 0 0 1px var(--color-tertiary-400)" } : undefined}>
    {unread && <span className="px-4 pt-3 text-xs font-semibold text-tertiary-400">Nouveau suivi</span>}
    <header className={styles.cardHeader}><div className={styles.clientIdentity}><span className={styles.avatar}>{client === "Client non renseigné" ? <UserRound size={16} /> : client.split(" ").filter(Boolean).slice(0, 2).map(name => name[0]).join("")}</span><div><h2>{client}</h2><time dateTime={followUp.createdAt}>Reçu le {followUpDate(followUp.createdAt)}</time></div></div><FollowUpStatus answered={followUp.isAnswered} /></header>
    <div className={styles.photo}>
      {followUp.photoUrl ? <a href={followUp.photoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Agrandir la photo de suivi de ${client}`}><Image src={followUp.photoUrl} alt={`Photo de cicatrisation de ${client}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw" className={styles.photoImage} /><span className={styles.photoZoom}><ArrowUpRight size={15} />Voir la photo</span></a> : <div className={styles.missingPhoto}><ImageIcon size={28} /><span>Aucune photo disponible</span></div>}
      <span className={styles.privacy}>{followUp.isPhotoPublic ? <Globe2 size={11} /> : <LockKeyhole size={11} />}{followUp.isPhotoPublic ? "Partage autorisé" : "Photo privée"}</span>
    </div>
    <div className={styles.cardBody}>
      <div className={styles.appointment}><span><CalendarDays size={13} /></span><div><h3>{followUp.appointment?.title || "Rendez-vous non renseigné"}</h3><p>{followUp.appointment?.tatoueur?.name || "Artiste non renseigné"}{followUp.appointment?.start && <> · {followUpDate(followUp.appointment.start)}</>}</p></div></div>
      <div className={styles.feedbackHeading}><FollowUpRating rating={followUp.rating} /><span>{followUpRatingLabel(followUp.rating)}</span></div>
      <p className={styles.review} data-empty={!followUp.review}>{followUp.review || "Le client n’a pas laissé de commentaire."}</p>
      {followUp.isAnswered && <div className={styles.responsePreview}><CheckCheck size={13} /><span>{followUp.response ? "Votre réponse est disponible dans le suivi." : "Ce suivi a déjà été traité."}</span></div>}
    </div>
    <footer className={styles.cardFooter}><button type="button" onClick={onOpen} className={styles.openButton} data-answered={followUp.isAnswered}><MessageCircle size={14} />{followUp.isAnswered ? "Consulter le suivi" : "Répondre au client"}<ArrowUpRight size={13} /></button><button type="button" onClick={onDelete} className={styles.deleteButton} aria-label={`Supprimer le suivi de ${client}`} title="Supprimer ce suivi"><Trash2 size={14} /></button></footer>
  </article>;
}
