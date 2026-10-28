"use client";
import { formatPhoneNumber } from "@/lib/utils/formatPhoneNumber";
import AppointmentPhotos from "@/components/Application/RDV/AppointmentPhotos";


import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ImageIcon, MessageSquareHeart, Mail, Phone, UserRound, X, type LucideIcon } from "lucide-react";
import type { ClientProps } from "@/lib/type";
import AppointmentSection from "./Fiche/AppointmentSection";
import BaseInfoSection from "./Fiche/BaseInfoSection";
import FollowUpSection from "./Fiche/FollowUpSection";
import MedicalHistorySection from "./Fiche/MedicalHistorySection";
import ClientAvatar from "./ClientAvatar";
import ConsentFormModal from "./ConsentFormModal";

interface InfoClientProps {
  client: ClientProps | null;
  isOpen: boolean;
  onClose: () => void;
  salonName?: string;
  onConsentSaved?: (clientId: string, url: string, signedAt: string) => void;
}

type SectionId = "infos" | "photos" | "appointments" | "followups";
interface TabDefinition { id: SectionId; label: string; shortLabel: string; description: string; icon: LucideIcon; count?: number }

export default function InfoClient({ client: sourceClient, isOpen, onClose, salonName = "Mon Salon", onConsentSaved }: InfoClientProps) {
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [savedConsent, setSavedConsent] = useState<{ clientId: string; url: string; signedAt: string } | null>(null);
  const client = useMemo(() => sourceClient && savedConsent?.clientId === sourceClient.id
    ? { ...sourceClient, consentSigned: true, consentFileUrl: savedConsent.url, consentSignedAt: savedConsent.signedAt }
    : sourceClient, [sourceClient, savedConsent]);
  const [isMounted, setIsMounted] = useState(false);
  const [topOffset, setTopOffset] = useState(0);
  const [leftOffset, setLeftOffset] = useState(0);
  const [activeSection, setActiveSection] = useState<SectionId>("infos");
  const tabsId = useId();
  const root = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const tabs: TabDefinition[] = [
    { id: "infos", label: "Informations", shortLabel: "Profil", description: "Coordonnées, consentements et santé", icon: UserRound },
    { id: "appointments", label: "Rendez-vous", shortLabel: "Rendez-vous", description: "Historique des prestations", icon: CalendarDays, count: client?.appointments?.length ?? 0 },
    { id: "photos", label: "Photos", shortLabel: "Photos", description: "Toutes les photos des rendez-vous", icon: ImageIcon },
    { id: "followups", label: "Suivis", shortLabel: "Suivis", description: "Cicatrisation et avis", icon: MessageSquareHeart, count: client?.FollowUpSubmission?.length ?? 0 },
  ];

  useEffect(() => setIsMounted(true), []);

  useEffect(() => { if (isOpen) setActiveSection("infos"); }, [client?.id, isOpen]);
  useEffect(() => { setIsConsentOpen(false); }, [client?.id, isOpen]);

  useEffect(() => {
    if (!isOpen || !isMounted) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      const nestedModal = Array.from(document.querySelectorAll<HTMLElement>("[data-modal], [role=dialog]")).some((element) => element !== root.current && !root.current?.contains(element));
      if (nestedModal || event.defaultPrevented) return;
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
      if (event.key === "Tab") {
        const focusable = Array.from(root.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])') || []).filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => { document.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, [isOpen, isMounted, onClose]);

  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-app-mobile-header]");
    const sidebar = document.querySelector<HTMLElement>("[data-app-sidebar]");
    const computeOffsets = () => {
      setTopOffset(header?.getBoundingClientRect().height ?? 0);
      setLeftOffset(sidebar?.getBoundingClientRect().right ?? 0);
    };
    const observer = new ResizeObserver(computeOffsets);
    if (header) observer.observe(header);
    if (sidebar) observer.observe(sidebar);
    computeOffsets();
    window.addEventListener("resize", computeOffsets);
    return () => { observer.disconnect(); window.removeEventListener("resize", computeOffsets); };
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
  return createPortal(
    <div ref={root} data-modal role="dialog" aria-modal="true" aria-labelledby={tabsId + "-title"} className="fixed right-0 bottom-0 z-[45] flex flex-col overflow-hidden bg-noir-700 font-one text-white [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed [&_a]:cursor-pointer [&_button:focus-visible]:outline-none [&_button:focus-visible]:ring-2 [&_button:focus-visible]:ring-tertiary-400 [&_a:focus-visible]:outline-none [&_a:focus-visible]:ring-2 [&_a:focus-visible]:ring-tertiary-400" style={{ top: topOffset, left: leftOffset }}>
      <header className="shrink-0 border-b border-white/10 bg-noir-600">
        <div className="flex min-w-0 items-center gap-3 px-4 py-2 sm:px-6">
          <ClientAvatar client={client} className="size-8 rounded-lg" />
          <div className="min-w-0 flex-1"><div className="flex min-w-0 items-center gap-2"><h2 id={tabsId + "-title"} className="truncate text-base font-semibold tracking-tight">{fullName}</h2>{client.isMinor && <span className="shrink-0 rounded-md border border-white/10 px-1.5 py-0.5 text-[9px] text-white/45">Mineur</span>}</div><p className="mt-0.5 text-[10px] text-white/35">Fiche client<span className="mx-1.5">·</span>{client.appointments?.length ?? 0} rendez-vous</p></div>
          <div className="hidden min-w-0 items-center gap-4 text-[11px] text-white/45 lg:flex">{client.email && <a href={"mailto:" + client.email} className="inline-flex max-w-56 items-center gap-1.5 hover:text-white"><Mail size={12} className="shrink-0" /><span className="truncate">{client.email}</span></a>}{client.phone && <a href={"tel:" + client.phone} className="inline-flex items-center gap-1.5 hover:text-white"><Phone size={12} />{formatPhoneNumber(client.phone)}</a>}</div>
          <span className={"hidden shrink-0 items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] sm:inline-flex " + (client.consentSigned ? "border-emerald-400/15 bg-emerald-400/5 text-emerald-400" : "border-amber-400/15 bg-amber-400/5 text-amber-300/80")}><span className={"size-1 rounded-full " + (client.consentSigned ? "bg-emerald-400" : "bg-amber-300")} />{client.consentSigned ? "Consentement signé" : "Consentement à signer"}</span>
          <button ref={closeButton} type="button" onClick={onClose} aria-label="Fermer la fiche client" className="ml-1 flex size-8 shrink-0 items-center justify-center rounded-lg border border-tertiary-400/20 text-white/45 transition hover:bg-tertiary-400/15 hover:text-white"><X size={16} aria-hidden="true" /></button>
        </div>
        <nav aria-label="Sections de la fiche client" className="scrollbar-hidden overflow-x-auto px-3 sm:px-5">
          <div role="tablist" aria-label="Informations client" className="flex min-w-max gap-1">
            {tabs.map((tab, index) => <ClientTab key={tab.id} tab={tab} active={activeSection === tab.id} tabId={tabsId + "-tab-" + tab.id} panelId={tabsId + "-panel-" + tab.id} onClick={() => setActiveSection(tab.id)} onKeyDown={(event) => handleTabKeyDown(event, index)} />)}
          </div>
        </nav>
      </header>
      <main key={client.id + activeSection} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
        <div className="mx-auto w-full max-w-6xl">
          <section role="tabpanel" id={tabsId + "-panel-" + activeSection} aria-labelledby={tabsId + "-tab-" + activeSection} tabIndex={0} className="outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400/40">
            {activeSection === "infos" && <div className="space-y-4"><BaseInfoSection client={client} onOpenConsent={() => setIsConsentOpen(true)} /><MedicalHistorySection medicalHistory={client.medicalHistory} /></div>}
            {activeSection === "appointments" && <AppointmentSection appointments={client.appointments ?? []} />}
            {activeSection === "photos" && <AppointmentPhotos clientId={client.id} readOnly />}
            {activeSection === "followups" && <FollowUpSection followUpSubmissions={client.FollowUpSubmission} />}
          </section>
        </div>
      </main>
      {isConsentOpen && <ConsentFormModal client={client} salonName={salonName} isOpen onClose={() => setIsConsentOpen(false)} onConsentSaved={(clientId, url, signedAt) => { setSavedConsent({ clientId, url, signedAt }); onConsentSaved?.(clientId, url, signedAt); }} />}
    </div>, document.body,
  );
}

function ClientTab({ tab, active, tabId, panelId, onClick, onKeyDown }: { tab: TabDefinition; active: boolean; tabId: string; panelId: string; onClick: () => void; onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void }) {
  const Icon = tab.icon;
  return <button id={tabId} type="button" role="tab" title={tab.description} aria-selected={active} aria-controls={panelId} tabIndex={active ? 0 : -1} onClick={onClick} onKeyDown={onKeyDown} className={"inline-flex min-h-10 shrink-0 items-center gap-2 border-b-2 px-3 py-2 text-[11px] font-medium transition " + (active ? "border-tertiary-400 text-white" : "border-transparent text-white/40 hover:text-white/80")}><Icon size={14} className={active ? "text-tertiary-400" : "text-white/30"} aria-hidden="true" /><span>{tab.label}</span>{typeof tab.count === "number" && <span className={"rounded-md px-1.5 py-0.5 text-[9px] " + (active ? "bg-white/10 text-white/70" : "bg-white/5 text-white/35")}>{tab.count}</span>}</button>;
}
