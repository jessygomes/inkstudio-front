"use client";

import { useEffect, useId, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, HeartPulse, MessageSquareHeart, ShieldCheck, UserRound, X, type LucideIcon } from "lucide-react";
import type { ClientProps } from "@/lib/type";
import AppointmentSection from "./Fiche/AppointmentSection";
import BaseInfoSection from "./Fiche/BaseInfoSection";
import FollowUpSection from "./Fiche/FollowUpSection";
import MedicalHistorySection from "./Fiche/MedicalHistorySection";

interface InfoClientProps {
  client: ClientProps | null;
  isOpen: boolean;
  onClose: () => void;
  salonName?: string;
}

type SectionId = "infos" | "appointments" | "followups" | "medical";
interface TabDefinition { id: SectionId; label: string; shortLabel: string; description: string; icon: LucideIcon; count?: number }

export default function InfoClient({ client, isOpen, onClose }: InfoClientProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [topOffset, setTopOffset] = useState(0);
  const [bottomOffset, setBottomOffset] = useState(0);
  const [activeSection, setActiveSection] = useState<SectionId>("infos");
  const tabsId = useId();
  const tabs: TabDefinition[] = [
    { id: "infos", label: "Informations", shortLabel: "Profil", description: "Coordonnées et consentements", icon: UserRound },
    { id: "appointments", label: "Rendez-vous", shortLabel: "Rendez-vous", description: "Historique des prestations", icon: CalendarDays, count: client?.appointments?.length ?? 0 },
    { id: "followups", label: "Suivis", shortLabel: "Suivis", description: "Cicatrisation et avis", icon: MessageSquareHeart, count: client?.FollowUpSubmission?.length ?? 0 },
    { id: "medical", label: "Santé", shortLabel: "Santé", description: "Antécédents déclarés", icon: HeartPulse },
  ];

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    setActiveSection("infos");
    const handleKeyDown = (event: globalThis.KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [client?.id, isOpen, onClose]);

  useEffect(() => {
    const computeOffsets = () => {
      const header = document.querySelector("div.sticky.bg-noir-700.top-0.left-0.w-full.z-50") as HTMLElement | null;
      const mobileBottomNavbar = document.querySelector("div.fixed.bottom-0.left-0.right-0.z-40") as HTMLElement | null;
      setTopOffset(header?.offsetHeight ?? 0);
      setBottomOffset(mobileBottomNavbar?.offsetHeight ?? 0);
    };
    computeOffsets();
    window.addEventListener("resize", computeOffsets);
    return () => window.removeEventListener("resize", computeOffsets);
  }, []);

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    setActiveSection(tabs[nextIndex].id);
    document.getElementById(`${tabsId}-tab-${tabs[nextIndex].id}`)?.focus();
  };

  if (!isOpen || !client || !isMounted) return null;
  const fullName = `${client.firstName} ${client.lastName}`.trim();
  const initials = `${client.firstName?.charAt(0) ?? ""}${client.lastName?.charAt(0) ?? ""}`.toUpperCase();
  return createPortal(
    <div data-modal role="dialog" aria-modal="true" aria-labelledby={`${tabsId}-title`} className="fixed left-0 right-0 z-[45] flex items-stretch justify-center overflow-hidden bg-noir-700 lg:bg-noir-700 lg:p-4 lg:backdrop-blur-md" style={{ top: `${topOffset}px`, bottom: `${bottomOffset}px` }}>
      <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-noir-500 shadow-2xl shadow-black/40 lg:max-w-[1500px] lg:rounded-[28px] lg:border lg:border-white/10">

        <header className="relative shrink-0 border-b border-white/[0.08] px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-wrap items-center gap-3 lg:flex-nowrap lg:gap-6">
            <div className="flex min-w-0 shrink-0 items-center gap-3 sm:gap-4 lg:max-w-[320px]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-tertiary-400/25 bg-tertiary-400/10 text-sm font-bold tracking-wide text-tertiary-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] font-one sm:h-12 sm:w-12">{initials || <UserRound size={20} />}</div>
              <div className="min-w-0">
                <div className="flex items-center gap-2"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary-400/75 font-one">Dossier client</p><span className={`h-1.5 w-1.5 rounded-full ${client.consentSigned ? "bg-emerald-300" : "bg-amber-300"}`} aria-hidden="true" /></div>
                <h2 id={`${tabsId}-title`} className="mt-1 truncate text-lg font-semibold tracking-tight text-white font-one sm:text-xl">{fullName}</h2>
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="Fermer la fiche client" className="group order-2 ml-auto flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/55 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400/60 lg:order-3"><X size={18} aria-hidden="true" /></button>
          <nav aria-label="Sections de la fiche client" className="scrollbar-hidden order-3 -mx-1 w-[calc(100%+0.5rem)] overflow-x-auto px-1 lg:order-2 lg:mx-0 lg:min-w-0 lg:flex-1 lg:px-0">
            <div role="tablist" aria-label="Informations client" className="flex min-w-max gap-1 sm:gap-2 lg:ml-auto lg:w-fit">
              {tabs.map((tab, index) => <ClientTab key={tab.id} tab={tab} active={activeSection === tab.id} tabId={`${tabsId}-tab-${tab.id}`} panelId={`${tabsId}-panel-${tab.id}`} onClick={() => setActiveSection(tab.id)} onKeyDown={(event) => handleTabKeyDown(event, index)} />)}
            </div>
          </nav>
          </div>
        </header>

        <main className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-6 sm:py-6 lg:px-6 bg-noir-500">
          <div className="mx-auto w-full ">
            <section role="tabpanel" id={`${tabsId}-panel-${activeSection}`} aria-labelledby={`${tabsId}-tab-${activeSection}`} tabIndex={0} className="outline-none">
              {activeSection === "infos" && <BaseInfoSection client={client} />}
              {activeSection === "appointments" && <AppointmentSection appointments={client.appointments ?? []} />}
              {activeSection === "followups" && <FollowUpSection followUpSubmissions={client.FollowUpSubmission} />}
              {activeSection === "medical" && <MedicalHistorySection medicalHistory={client.medicalHistory} />}
            </section>
          </div>
        </main>

        <footer className="relative flex shrink-0 items-center justify-between border-t border-white/[0.08] bg-black/10 px-4 py-3 sm:px-6 lg:px-8">
          <p className="hidden items-center gap-2 text-[11px] text-white/35 font-two sm:flex"><ShieldCheck size={14} className="text-emerald-300/70" /> Données client sécurisées</p>
          <button type="button" onClick={onClose} className="ml-auto min-h-9 cursor-pointer rounded-xl border border-white/10 bg-white/[0.05] px-5 text-xs font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/[0.09] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400/60 font-one">Fermer</button>
        </footer>
      </div>
    </div>, document.body,
  );
}

function ClientTab({ tab, active, tabId, panelId, onClick, onKeyDown }: { tab: TabDefinition; active: boolean; tabId: string; panelId: string; onClick: () => void; onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void }) {
  const Icon = tab.icon;
  return (
    <button id={tabId} type="button" role="tab" aria-selected={active} aria-controls={panelId} tabIndex={active ? 0 : -1} onClick={onClick} onKeyDown={onKeyDown} className={`group relative flex min-h-14 min-w-[116px] cursor-pointer items-center gap-2.5 rounded-t-xl border-x border-t px-3.5 pb-3 pt-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-tertiary-400/60 sm:min-w-[155px] sm:px-4 ${active ? "border-white/10 bg-white/[0.055] text-white" : "border-transparent text-white/45 hover:bg-white/[0.025] hover:text-white/75"}`}>
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-colors ${active ? "border-tertiary-400/25 bg-tertiary-400/10 text-tertiary-400" : "border-white/[0.07] bg-white/[0.025] text-white/35 group-hover:text-white/60"}`}><Icon size={16} strokeWidth={1.8} aria-hidden="true" /></span>
      <span className="min-w-0"><span className="flex items-center gap-2 text-xs font-semibold font-one"><span className="sm:hidden">{tab.shortLabel}</span><span className="hidden sm:inline">{tab.label}</span>{typeof tab.count === "number" && <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${active ? "bg-tertiary-400/15 text-tertiary-400" : "bg-white/[0.06] text-white/40"}`}>{tab.count}</span>}</span><span className="mt-0.5 hidden truncate text-[10px] font-normal text-white/35 font-two sm:block">{tab.description}</span></span>
      <span className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-tertiary-400 transition-opacity ${active ? "opacity-100" : "opacity-0"}`} aria-hidden="true" />
    </button>
  );
}
