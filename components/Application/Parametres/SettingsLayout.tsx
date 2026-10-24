"use client";
import { useEffect, useState, type ReactNode } from "react";
import { CalendarDays, ChevronRight, CreditCard, Info, Palette, ShieldCheck, UserRound } from "lucide-react";
import styles from "./SettingsLayout.module.css";
const sections = [
 { id: "compte", label: "Compte et documents", hint: "Profil et vérification", icon: UserRound },
 { id: "rendez-vous", label: "Rendez-vous", hint: "Confirmation et autorisations", icon: CalendarDays },
 { id: "preferences", label: "Préférences", hint: "Notifications et apparence", icon: Palette },
 { id: "facturation", label: "Abonnement et factures", hint: "Offre et paiements", icon: CreditCard },
 { id: "securite", label: "Sécurité", hint: "Accès à votre compte", icon: ShieldCheck },
] as const;
export function SettingsNavigation() {
  const [active, setActive] = useState<string>("compte");
  useEffect(() => {
    const hash = () => { const id = location.hash.slice(1); if (sections.some(section => section.id === id)) setActive(id); };
    hash(); window.addEventListener("hashchange", hash);
    let frame = 0;
    const update = () => {
      frame = 0;
      const visible = sections.map(section => {
        const rect = document.getElementById(section.id)?.getBoundingClientRect();
        return { id: section.id, pixels: rect ? Math.max(0, Math.min(rect.bottom, window.innerHeight - 24) - Math.max(rect.top, 24)) : 0 };
      }).sort((a,b) => b.pixels - a.pixels);
      if (visible[0]?.pixels) setActive(visible[0].id);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", schedule, { capture: true, passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule, true); window.removeEventListener("resize", schedule); window.removeEventListener("hashchange", hash); };
  }, []);
  return <aside className={styles.sidebar}><nav aria-label="Rubriques des paramètres" className={styles.navigation}><p className="hidden px-2 pb-3 pt-1 text-[9px] font-medium uppercase tracking-[0.14em] text-white/35 lg:block">Votre espace</p><ul>{sections.map(({ id, label, hint, icon: Icon }) => <li key={id}><a href={"#" + id} aria-current={active === id ? "location" : undefined} onClick={() => setActive(id)} className={styles.link}><span className={styles.icon}><Icon size={15} aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block whitespace-nowrap text-[11px] font-medium lg:whitespace-normal">{label}</span><span className="mt-1 hidden text-[9px] font-normal text-white/30 lg:block">{hint}</span></span><ChevronRight size={12} className="hidden shrink-0 opacity-40 lg:block" /></a></li>)}</ul></nav><div className="hidden px-3 py-4 lg:block"><p className="flex items-center gap-1.5 text-[10px] font-medium text-white/50"><Info size={12} />Enregistrement</p><p className="mt-2 text-[10px] leading-5 text-white/35">Les interrupteurs sont enregistrés immédiatement. Pour les formulaires, utilisez leur bouton d’enregistrement.</p></div></aside>;
}
export function SettingsGroup({ id, title, description, children }: { id: typeof sections[number]["id"]; title: string; description: string; children: ReactNode }) {
 return <section id={id} aria-labelledby={id + "-heading"} className="scroll-mt-5 space-y-3"><header className="px-0.5"><h2 id={id + "-heading"} className="text-sm font-semibold tracking-tight text-white/85">{title}</h2><p className="mt-1 text-[11px] leading-5 text-white/40">{description}</p></header><div className="space-y-3">{children}</div></section>;
}
