"use client";

import Image from "next/image";
import { ArrowUpRight, Clock3, ImageIcon, LockKeyhole, Pencil, Ruler, Trash2, UserRound } from "lucide-react";
import type { FlashProps } from "@/lib/type";
import styles from "./FlashCards.module.css";

const price = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 2 });

export default function FlashCard({ flash, artistName, durationLabel, readOnly, onEdit, onDelete }: {
  flash: FlashProps; artistName: string; durationLabel: string; readOnly: boolean; onEdit: () => void; onDelete: () => void;
}) {
  const tags = [...new Set((flash.style || []).map(item => item.trim()).filter(Boolean))];
  return <article className={styles.card} data-available={flash.isAvailable}>
    <div className={styles.imageFrame}>
      {flash.imageUrl ? <a href={flash.imageUrl} target="_blank" rel="noopener noreferrer" className={styles.imageLink} aria-label={`Voir le dessin du flash ${flash.title} en grand`}><Image src={flash.imageUrl} alt={flash.title} fill sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, 20vw" className={styles.image} /><span className={styles.zoom}><ArrowUpRight size={15} /></span></a> : <div className={styles.missingImage}><ImageIcon size={28} /><span>Aucun visuel</span></div>}
      <span className={styles.availability} data-available={flash.isAvailable}><span />{flash.isAvailable ? "Disponible" : "Indisponible"}</span>
      {readOnly && <span className={styles.readOnlyBadge} title="Flash d’un artiste lié : consultation uniquement"><LockKeyhole size={11} />Lecture seule</span>}
      {!readOnly && <div className={styles.imageActions} data-theme-contrast="dark"><button type="button" onClick={onEdit} className={styles.editButton} title="Modifier le flash" aria-label={`Modifier le flash ${flash.title}`}><Pencil size={18} /></button><button type="button" onClick={onDelete} className={styles.deleteButton} title="Supprimer le flash" aria-label={`Supprimer le flash ${flash.title}`}><Trash2 size={18} /></button></div>}
    </div>
    <div className={styles.content}>
      <div className={styles.heading}><h2>{flash.title}</h2><span className={styles.price}>{price.format(flash.price)}</span></div>
      <div className={styles.details}><span><Clock3 size={12} />{durationLabel}</span>{flash.dimension && <span><Ruler size={12} />{flash.dimension}</span>}</div>
      <p className={styles.description} data-empty={!flash.description}>{flash.description || "Aucune description renseignée."}</p>
      {tags.length > 0 && <div className={styles.tags} aria-label="Styles du flash">{tags.map(tag => <span key={tag}>{tag}</span>)}</div>}
      {artistName && <div className={styles.artist}><span className={styles.artistIcon}><UserRound size={12} /></span><span>{artistName}</span></div>}
    </div>
    <footer className={styles.footer}>
      {readOnly ? <span className={styles.readOnlyNote}><LockKeyhole size={12} />Géré par l’artiste lié</span> : <><button type="button" onClick={onEdit} className={styles.editButton}><Pencil size={13} />Modifier le flash</button><button type="button" onClick={onDelete} className={styles.deleteButton} title="Supprimer ce flash" aria-label={`Supprimer le flash ${flash.title}`}><Trash2 size={14} /></button></>}
    </footer>
  </article>;
}
