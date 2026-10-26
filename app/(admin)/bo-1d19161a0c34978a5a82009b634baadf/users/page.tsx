"use client";
import { Suspense, useState, type KeyboardEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Building2, MailPlus, UsersRound } from "lucide-react";
import SalonsList from "@/components/Admin/SalonsList";
import ClientsList from "@/components/Admin/ClientsList";
import Invitations from "@/components/Admin/Invitations";
import styles from "@/components/Admin/UsersWorkspace.module.css";
const tabs = [
  { id: "salons", label: "Salons et indépendants", icon: Building2 },
  { id: "clients", label: "Clients", icon: UsersRound },
  { id: "invitations", label: "Invitations", icon: MailPlus },
] as const;
type Tab = typeof tabs[number]["id"];
export default function UsersPage() { return <Suspense fallback={<p className="admin-muted">Chargement…</p>}><UsersContent /></Suspense>; }
function UsersContent() {
  const params = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>(() => { const tab = params.get("tab"); return tab === "clients" || tab === "invitations" ? tab : "salons"; });
  const navigateTabs = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : null;
    if (next === null) return;
    event.preventDefault(); setActiveTab(tabs[next].id); document.getElementById(`users-tab-${tabs[next].id}`)?.focus();
  };
  return <div className={`admin-page ${styles.page}`}>
    <h1 className="sr-only">Gestion des utilisateurs</h1>
    <div role="tablist" aria-label="Types d’utilisateurs" className={styles.tabs}>
      {tabs.map(({ id, label, icon: Icon }, index) => <button key={id} type="button" role="tab" id={`users-tab-${id}`} aria-controls={`users-panel-${id}`} aria-selected={activeTab === id} tabIndex={activeTab === id ? 0 : -1} onClick={() => setActiveTab(id)} onKeyDown={event => navigateTabs(event, index)}><Icon size={15} aria-hidden="true" /><span>{label}</span></button>)}
    </div>
    <section role="tabpanel" id={`users-panel-${activeTab}`} aria-labelledby={`users-tab-${activeTab}`} className={styles.tabPanel}>
      {activeTab === "salons" ? <SalonsList /> : activeTab === "clients" ? <ClientsList /> : <Invitations />}
    </section>
  </div>;
}
