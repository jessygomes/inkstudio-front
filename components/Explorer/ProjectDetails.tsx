"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Compass, ImageIcon, LoaderCircle, MapPin, Maximize2, MessageSquare, MoveUpRight, Ruler, Send, ShieldCheck, Sparkles, Tag, X } from "lucide-react";
import type { ExploredProject } from "@/lib/queries/projects";
import DashboardButton from "@/components/Shared/DashboardButton";
import styles from "./ProjectExplorer.module.css";

const sizes: Record<string, string> = { SMALL: "Petite", MEDIUM: "Moyenne", LARGE: "Grande" };
const statuses: Record<string, string> = { PENDING: "En attente de réponse", ACCEPTED: "Proposition acceptée", REFUSED: "Proposition non retenue" };

export default function ProjectDetails({ project, sending, message, onMessageChange, onSend, onClose }: {
  project: ExploredProject;
  sending: boolean;
  message: string;
  onMessageChange: (message: string) => void;
  onSend: (event: FormEvent) => void;
  onClose: () => void;
}) {
  const [imageIndex, setImageIndex] = useState(0);
  const image = project.images[imageIndex];
  const proposal = project.proposals[0];
  const mobility = project.projectMobility === "RADIUS"
    ? project.projectRadiusKm != null ? `Se déplace jusqu’à ${project.projectRadiusKm} km` : "Se déplace autour de sa ville"
    : project.projectMobility === "ANYWHERE" ? "Peut se déplacer partout"
    : project.projectMobility ? "Ne souhaite pas se déplacer" : "Mobilité non précisée";

  return <>
    <header className={styles.modalHeader}>
      <div className={styles.headerIdentity}>
        <div className="min-w-0">
          <p className={styles.eyebrow}>Explorer / Projet client</p>
          <h2 id="project-title" className={styles.modalTitle}>{project.name}</h2>
        </div>
      </div>
      <div className={styles.headerActions}>
        {proposal && <span className={styles.headerStatus}><Check size={12} aria-hidden="true" />Proposition envoyée</span>}
        <button type="button" disabled={sending} onClick={onClose} aria-label="Fermer le projet" className={styles.iconButton}><X size={18} aria-hidden="true" /></button>
      </div>
    </header>

    <div className={styles.modalScroll}>
      <div className={styles.modalLayout}>
        <div className={styles.mainColumn}>
          <section aria-labelledby="project-inspirations" className={styles.gallery}>
            <div className={styles.sectionHeading}>
              <h3 id="project-inspirations"><ImageIcon size={15} aria-hidden="true" />Les inspirations</h3>
              <span className={styles.count}>{project.images.length} inspiration{project.images.length === 1 ? "" : "s"}</span>
            </div>
            {image ? <>
              <figure className={styles.featuredImage}>
                <a href={image.url} target="_blank" rel="noopener noreferrer" className={styles.imageLink}
                  aria-label={`Agrandir l’inspiration ${imageIndex + 1} (nouvel onglet)`}>
                  <Image src={image.url} alt={image.caption || `Inspiration ${imageIndex + 1} pour ${project.name}`} fill sizes="(max-width: 1023px) 100vw, 50vw" className="object-contain" />
                  <span className={styles.expandImage}><Maximize2 size={14} aria-hidden="true" />Agrandir</span>
                </a>
                {project.images.length > 1 && <div className={styles.galleryControls}>
                  <button type="button" className={styles.galleryArrow} aria-label="Inspiration précédente" onClick={() => setImageIndex(index => (index - 1 + project.images.length) % project.images.length)}><ChevronLeft size={17} /></button>
                  <span aria-live="polite">{imageIndex + 1} / {project.images.length}</span>
                  <button type="button" className={styles.galleryArrow} aria-label="Inspiration suivante" onClick={() => setImageIndex(index => (index + 1) % project.images.length)}><ChevronRight size={17} /></button>
                </div>}
                <figcaption className={styles.imageCaption}>
                  <span><MessageSquare size={13} aria-hidden="true" />La note du client</span>
                  <p>{image.caption?.trim() || "Aucune note ajoutée pour cette inspiration."}</p>
                </figcaption>
              </figure>
              {project.images.length > 1 && <div className={styles.thumbnails} aria-label="Choisir une inspiration">
                {project.images.map((item, index) => <button type="button" key={item.id} onClick={() => setImageIndex(index)}
                  aria-label={`Afficher l’inspiration ${index + 1}`} aria-pressed={index === imageIndex}
                  className={styles.thumbnail}>
                  <Image src={item.url} alt="" fill sizes="72px" className="object-cover" />
                </button>)}
              </div>}
            </> : <div className={styles.emptyGallery}><ImageIcon size={30} strokeWidth={1.25} aria-hidden="true" /><p>Une idée à imaginer ensemble</p><span>Le client n’a pas encore partagé d’image d’inspiration.</span></div>}
          </section>
          <section className={styles.brief} aria-labelledby="project-brief">
            <p className={styles.eyebrow}>01 / Le brief</p>
            <h3 id="project-brief">L’idée du client</h3>
            <p className={styles.description}>{project.description?.trim() || "Le client n’a pas encore ajouté de description."}</p>
            {(project.projectStyles.length > 0 || project.projectHashtags.length > 0) && <div className={styles.tags} aria-label="Styles et mots-clés">
              {project.projectStyles.map((style, index) => <span key={`style-${index}`}><Sparkles size={11} aria-hidden="true" />{style}</span>)}
              {project.projectHashtags.map((tag, index) => <span className={styles.hashtag} key={`tag-${index}`}>#{tag.replace(/^#/, "")}</span>)}
            </div>}
          </section>
        </div>

        <aside className={styles.sideColumn} aria-label="Détails et proposition">
          <section className={styles.detailsCard} aria-labelledby="project-details">
            <p className={styles.eyebrow}>02 / Les essentiels</p>
            <div className={styles.sectionHeading}><h3 id="project-details">Les détails du projet</h3></div>
            <dl className={styles.facts}>
              {[
                { label: "Localisation", value: project.projectCity, Icon: MapPin },
                { label: "Emplacement", value: project.projectBodyPlacement, Icon: MoveUpRight },
                { label: "Taille", value: sizes[project.projectSize || ""], Icon: Ruler },
                { label: "Catégorie", value: project.projectCategory, Icon: Tag },
              ].map(({ label, value, Icon }) => <div key={label} className={styles.fact}>
                <Icon size={15} aria-hidden="true" /><div><dt>{label}</dt><dd>{value || "Non précisé"}</dd></div>
              </div>)}
            </dl>
            <p className={styles.mobility}><Compass size={14} aria-hidden="true" />{mobility}</p>
          </section>

          <section className={styles.proposalCard} aria-labelledby="project-proposal">
            <div className={styles.proposalCardHeader}>
              <div className={styles.proposalHeading}>
                <span className={styles.proposalIcon}>{proposal ? <MessageSquare size={16} aria-hidden="true" /> : <Sparkles size={16} aria-hidden="true" />}</span>
                <div>
                  <p className={styles.eyebrow}>03 / La proposition</p>
                  <h3 id="project-proposal">{proposal ? "Votre proposition" : "Proposez votre approche"}</h3>
                </div>
              </div>
              {proposal && <div className={styles.proposalStatus} data-status={proposal.status}>
                {proposal.status === "ACCEPTED" ? <Check size={14} aria-hidden="true" /> : <span />}{statuses[proposal.status] || proposal.status}
              </div>}
            </div>
            {proposal ? <div className={styles.proposalBody}>
              <div className={styles.sentMessage}>
                <p className={styles.sentMessageLabel}><Send size={13} aria-hidden="true" />Votre message au client<span>Envoyé</span></p>
                <blockquote>{proposal.message || "Le texte de cette proposition n’est pas disponible pour le moment."}</blockquote>
              </div>
              <div className={styles.proposalSummary}>
                <p className={styles.proposalNextStep}><ShieldCheck size={16} aria-hidden="true" /><span>{proposal.status === "ACCEPTED" ? "Le client a accepté. Échangez dans la messagerie pour préparer la suite." : proposal.status === "REFUSED" ? "Le client n’a pas retenu votre proposition. Retrouvez d’autres idées dans Explorer." : "Le client découvre votre approche. La messagerie sera accessible après son acceptation."}</span></p>
                {proposal.status === "ACCEPTED" && proposal.conversationId && <DashboardButton href={`/messagerie/${proposal.conversationId}`} className="min-h-11 w-full sm:w-auto">Ouvrir la conversation<ArrowUpRight size={15} aria-hidden="true" /></DashboardButton>}
              </div>
            </div> : <>
              <p className={styles.proposalIntro}>Présentez votre univers et ce que vous imaginez pour ce projet.</p>
              <form onSubmit={onSend} className={styles.proposalForm}>
                <div className={styles.composerHeading}>
                  <label htmlFor="project-message">Votre premier message</label>
                  <span id="project-message-count" className={styles.messageCount}>{message.length.toLocaleString("fr-FR")} / 3 000</span>
                </div>
                <textarea id="project-message" required minLength={1} maxLength={3000} disabled={sending} rows={4} value={message}
                  onChange={event => onMessageChange(event.target.value)} placeholder="Bonjour ! Votre projet m’inspire… Voici comment je l’imagine avec vous."
                  aria-describedby="project-message-help project-message-count" />
                <div className={styles.composerFooter}>
                  <p id="project-message-help" className={styles.proposalHelp}><ShieldCheck size={15} aria-hidden="true" /><span>Une proposition par projet. Le client choisit d’accepter avant d’ouvrir la discussion.</span></p>
                  <DashboardButton type="submit" disabled={sending || !message.trim()} className="min-h-11 w-full sm:w-auto sm:self-end">
                    {sending ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : <Send size={15} aria-hidden="true" />}{sending ? "Envoi en cours…" : "Proposer mes services"}
                  </DashboardButton>
                </div>
              </form>
            </>}
          </section>
        </aside>
      </div>
    </div>
  </>;
}
