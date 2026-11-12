"use client";

import Link from "next/link";
import { useState, type ButtonHTMLAttributes, type CSSProperties, type FocusEvent, type MouseEvent, type ReactNode } from "react";
import { LoaderCircle, type LucideIcon } from "lucide-react";

export type RdvActionTone = "primary" | "success" | "danger" | "warning" | "neutral";

// Texte blanc fixe sur les boutons pleins : la couleur « white » est inversée par le thème clair.
const TONES: Record<RdvActionTone, string> = {
  primary: "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-[#ffffff] shadow-md shadow-tertiary-500/20 hover:brightness-110",
  // Même vert que le badge du statut « Confirmé » (emerald-400 à 15 %, texte emerald-300).
  success: "bg-emerald-400/15 text-emerald-300 hover:bg-emerald-400/25",
  danger: "bg-red-500/10 text-red-300 hover:bg-red-500/20",
  warning: "bg-amber-400/10 text-amber-300 hover:bg-amber-400/20",
  neutral: "bg-white/[0.07] text-white/85 hover:bg-white/[0.12] hover:text-white",
};

const BASE = "relative inline-flex h-9 min-w-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-xl font-one text-xs font-medium transition active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

type Props = {
  tone?: RdvActionTone;
  icon?: LucideIcon;
  /** Affiche un indicateur de chargement à la place de l'icône et désactive le bouton. */
  loading?: boolean;
  /** `sm` : petit bouton (26 px, texte de 10 px ; carré de 26 px avec `iconOnly`) pour les en-têtes de section ; `md` (défaut) : 36 px. */
  size?: "md" | "sm";
  /** Icône seule (carré de 36 px) : le libellé reste lu par les lecteurs d'écran et affiché en infobulle. */
  iconOnly?: boolean;
  /** Avec `href`, le bouton est un lien. */
  href?: string;
  className?: string;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

/**
 * Bouton d'action d'un rendez-vous (confirmer, annuler, modifier, terminé, absent, conversation, e-mail…).
 * Un seul style pour toutes les actions : 36 px de haut, coins arrondis, sans contour, icône + libellé, teinte selon l'intention.
 */
export default function RdvActionButton({ tone = "neutral", icon: Icon, loading, iconOnly, size = "md", href, className = "", children, type = "button", disabled, ...props }: Props) {
  const small = size === "sm" && !iconOnly;
  // Infobulle des icônes seules : affichée tout de suite au survol ou au focus, en position fixe pour ne pas être rognée par un conteneur.
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  const showTip = (event: MouseEvent<HTMLElement> | FocusEvent<HTMLElement>) => {
    if (!iconOnly) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const center = Math.min(Math.max(rect.left + rect.width / 2, 70), window.innerWidth - 70);
    setTip({ x: size === "sm" ? rect.right : center, y: rect.top });
  };
  const hideTip = () => setTip(null);
  const classes = `${BASE} ${iconOnly ? (size === "sm" ? "flex-none self-center !rounded-lg" : "w-9 flex-none px-0") : small ? "self-center !w-auto !gap-1 !rounded-lg !px-2.5 !text-[10px]" : "w-full px-3.5"} ${TONES[tone]} ${className}`;
  // Dimensions des petits boutons en style en ligne : elles ne dépendent pas de la génération des classes et ne sont pas étirées par un parent flex.
  const sizeStyle: CSSProperties | undefined = size === "sm" ? (iconOnly ? { width: 26, minWidth: 26, height: 26, padding: 0 } : { height: 26 }) : undefined;
  const label = typeof children === "string" ? children : undefined;
  const content = <>{loading ? <LoaderCircle size={iconOnly ? (size === "sm" ? 13 : 16) : 14} className="shrink-0 animate-spin" /> : Icon ? <Icon size={iconOnly ? (size === "sm" ? 13 : 16) : small ? 11 : 14} className="shrink-0" /> : null}<span className={iconOnly ? "sr-only" : "truncate"}>{children}</span>{iconOnly && tip && <span aria-hidden="true" style={{ position: "fixed", left: tip.x, top: tip.y - 8, transform: size === "sm" ? "translate(-100%, -100%)" : "translate(-50%, -100%)" }} className="pointer-events-none z-[10050] whitespace-nowrap rounded-lg bg-[#111111] px-2.5 py-1.5 text-[11px] font-medium text-[#ffffff] shadow-lg shadow-black/40">{label}</span>}</>;
  // Icône seule : l'infobulle est affichée tout de suite par le composant (pas de délai du navigateur), donc pas d'attribut title.
  const title = iconOnly ? undefined : props.title;
  if (href) return <Link href={href} title={title} className={classes} style={sizeStyle} onMouseEnter={showTip} onMouseLeave={hideTip} onFocus={showTip} onBlur={hideTip}>{content}</Link>;
  return <button type={type} disabled={disabled || loading} className={classes} {...props} style={{ ...sizeStyle, ...props.style }} title={title} onMouseEnter={(event) => { showTip(event); props.onMouseEnter?.(event); }} onMouseLeave={(event) => { hideTip(); props.onMouseLeave?.(event); }} onFocus={(event) => { showTip(event); props.onFocus?.(event); }} onBlur={(event) => { hideTip(); props.onBlur?.(event); }}>{content}</button>;
}
