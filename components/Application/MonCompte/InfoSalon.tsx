"use client";

import { UpdateSalonUserProps } from "@/lib/type";
import Image from "next/image";
import Link from "next/link";
import styles from "./AccountProfile.module.css";
import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowUpRight,
  Camera,
  Sparkles,
  Layers3,
  Palette,
  Check,
  MapPin,
  Pencil,
  Plus,
  QrCode,
  X,
  ShieldCheck,
} from "lucide-react";
import { CiInstagram, CiFacebook } from "react-icons/ci";
import { PiTiktokLogoThin } from "react-icons/pi";
import { TfiWorld } from "react-icons/tfi";
import { QRCodeSVG } from "qrcode.react";
import { makeCitySlug, makeSlug } from "@/lib/utils/makeLink";

const editHref = "/mon-compte/modifier-salon";

export default function InfoSalon({ salon }: { salon: UpdateSalonUserProps }) {
  const [qrOpen, setQrOpen] = useState(false);
  const [origin, setOrigin] = useState("");
  const slug =
    (salon as UpdateSalonUserProps & { slug?: string }).slug ??
    makeSlug(salon.salonName);
  const path =
    salon.city && salon.postalCode
      ? `/salon/${slug}/${makeCitySlug(salon.city)}-${salon.postalCode}`
      : `/salon/${slug}`;
  const publicBase =
    process.env.NEXT_PUBLIC_FRONTENDPUBLIC_URL?.replace(/\/$/, "") || origin;
  const publicHref = publicBase + path;
  const address = [
    salon.address,
    [salon.postalCode, salon.city].filter(Boolean).join(" "),
  ]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(", ");
  const essentials = [
    { label: "Photo de profil", complete: Boolean(salon.profileImage) },
    { label: "Prestations", complete: Boolean(salon.prestations?.length) },
    {
      label: "Adresse complète",
      complete: Boolean(
        salon.address?.trim() && salon.city?.trim() && salon.postalCode?.trim(),
      ),
    },
  ];
  const completed = essentials.filter((item) => item.complete).length;
  const socials = [
    {
      href: salon.instagram,
      label: "Instagram",
      icon: <CiInstagram size={22} />,
    },
    { href: salon.facebook, label: "Facebook", icon: <CiFacebook size={22} /> },
    {
      href: salon.tiktok,
      label: "TikTok",
      icon: <PiTiktokLogoThin size={21} />,
    },
    { href: salon.website, label: "Site web", icon: <TfiWorld size={18} /> },
  ];

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  return (
    <div className={styles.layout}>
      <div className={styles.profileRow}>
      <section className={styles.profileCard} aria-labelledby="salon-identity">
        <div className={styles.cover}>
          {salon.image && <Image fill src={salon.image} alt="Couverture du salon" sizes="(min-width: 1280px) 70vw, 100vw" className="object-cover" />}
          <div className={styles.coverShade} />
          <div className={styles.identityBody}>
            <Link href={editHref} className={styles.avatar} aria-label="Modifier la photo de profil">
              {salon.profileImage ? <Image fill src={salon.profileImage} alt={`Photo de profil de ${salon.salonName}`} sizes="88px" className="object-cover" /> : <span>{salon.salonName?.trim().charAt(0).toUpperCase() || "S"}</span>}
              <span className={styles.avatarEdit}><Camera size={18} aria-hidden="true" /></span>
            </Link>
            <div className={styles.identityInfo}>
              {salon.verifiedSalon && <span className={styles.verified}><ShieldCheck size={16} aria-hidden="true" />Profil vérifié</span>}
              <div className={styles.nameRow}>
                <h2 id="salon-identity">{salon.salonName || "Votre salon"}</h2>
              </div>
              <div className={styles.addressRow}>
                <p className={styles.address}><MapPin size={15} aria-hidden="true" />{address || "Ajoutez l’adresse de votre salon"}</p>
                <div className={styles.identityActions}>
                  <Link href={editHref} className={styles.editAction}><Pencil size={14} aria-hidden="true" />Modifier le profil</Link>
                  <a href={publicHref} target="_blank" rel="noopener noreferrer" className={`${styles.editAction} ${styles.publicProfileAction}`}>Voir le profil<ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (nouvel onglet)</span></a>
                  <button type="button" className={styles.editAction} onClick={() => setQrOpen(true)} aria-haspopup="dialog"><QrCode size={14} aria-hidden="true" />QR code</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      {completed < essentials.length && <section className={styles.completion} aria-label="Compléter le profil"><span>Complétez votre vitrine <small>{completed}/{essentials.length}</small></span><div>{essentials.filter(item => !item.complete).map(item => <Link key={item.label} href={editHref}><Plus size={13} aria-hidden="true" />{item.label}</Link>)}</div></section>}
      </section>
      <section className={styles.specialtiesCard} aria-label="Prestations et styles de tatouage">
          <div className={styles.specialties}>
            {[{ title: "Prestations", values: salon.prestations, icon: Layers3, kind: "service" }, { title: "Styles de tatouage", values: salon.style, icon: Palette, kind: "style" }].map(({ title, values, icon: Icon, kind }) => <div className={styles.specialty} key={title}>
              <h4><span className={styles.specialtyIcon}><Icon size={15} aria-hidden="true" /></span>{title}<span className={styles.specialtyCount}>{values?.length || 0}</span></h4>
              {values?.length ? <ul className={styles.tags}>{values.map(value => <li key={value} className={styles.tag} data-kind={kind}>{kind === "service" && <Check size={11} aria-hidden="true" />}{value}</li>)}</ul> : <Link href={editHref} className={styles.add}><Plus size={13} aria-hidden="true" />Ajouter</Link>}
            </div>)}
          </div>
      </section>
      </div>


      <section className={styles.detailsCard} aria-labelledby="salon-presentation">
        <div className={styles.sectionHeader}>
          <div><p className={styles.eyebrow}><Sparkles size={13} aria-hidden="true" />Votre univers</p><h3 id="salon-presentation">L’essence de votre salon</h3></div>
          <Link href={editHref} className={styles.editAction}><Pencil size={14} aria-hidden="true" />Modifier</Link>
        </div>
        <div className={styles.universe}>
          <div className={styles.presentation}>
            <h4>À propos</h4>
            {salon.description?.trim() ? <p className={styles.description}>{salon.description}</p> : <Link href={editHref} className={styles.empty}>Racontez votre histoire et ce qui rend votre salon unique.<span><Plus size={13} aria-hidden="true" />Ajouter une présentation</span></Link>}
          </div>
      <section className={styles.socials} aria-labelledby="salon-socials">
          <div className={styles.socialHeading}><h3 id="salon-socials">Retrouvez-nous en ligne</h3><span>Vos liens, au même endroit</span></div>
          <div className={styles.socialList}>{socials.map(({ href, label, icon }) => <Link key={label} href={href || editHref} target={href ? "_blank" : undefined} rel={href ? "noopener noreferrer" : undefined} className={styles.socialLink}>
            <span className={styles.socialIcon} aria-hidden="true">{icon}</span><span className={styles.socialName}>{label}<small>{href ? "Voir la page" : "Ajouter un lien"}</small></span>{href ? <><ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> (nouvel onglet)</span></> : <Plus size={15} aria-hidden="true" />}
          </Link>)}</div>
      </section>
        </div>
      </section>

      {qrOpen && <ProfileQrModal href={publicHref} name={salon.salonName || "Votre salon"} onClose={() => setQrOpen(false)} />}
    </div>
  );
}

function ProfileQrModal({ href, name, onClose }: { href: string; name: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    const element = dialog.current;
    document.body.style.overflow = "hidden";
    element?.showModal();
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);
  return <dialog ref={dialog} data-modal className={styles.qrModal} aria-labelledby={titleId} aria-describedby={descriptionId}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    }}>
    <header className={styles.qrModalHeader}><div><p>Votre profil public</p><h2 id={titleId}>{name}</h2></div><button type="button" autoFocus onClick={onClose} className={styles.copy} aria-label="Fermer la modale"><X size={18} aria-hidden="true" /></button></header>
    <div className={styles.qrModalBody}><div className={styles.qrCode}><QRCodeSVG value={href} size={208} includeMargin level="M" title={`QR code du profil de ${name}`} /></div><p id={descriptionId}>Scannez ce QR code pour découvrir le profil du salon.</p><a href={href} target="_blank" rel="noopener noreferrer" className={`${styles.primaryAction} ${styles.publicProfileAction}`}>Voir le profil<ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> (nouvel onglet)</span></a></div>
  </dialog>;
}
