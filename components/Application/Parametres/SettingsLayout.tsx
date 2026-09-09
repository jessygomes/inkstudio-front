import { ReactNode } from "react";
import styles from "./SettingsLayout.module.css";
import { CalendarDays, CreditCard, Palette, ShieldCheck, UserRound } from "lucide-react";

const sections = [
  { id: "compte", label: "Compte et documents", icon: UserRound },
  { id: "rendez-vous", label: "Rendez-vous", icon: CalendarDays },
  { id: "preferences", label: "Préférences", icon: Palette },
  { id: "facturation", label: "Abonnement et factures", icon: CreditCard },
  { id: "securite", label: "Sécurité", icon: ShieldCheck },
] as const;

export function SettingsNavigation() {
  return (
    <nav aria-label="Rubriques des paramètres" className={`${styles.navigation} dashboard-embedded-panel rounded-2xl border border-white/10 p-2 lg:p-3`}>
      <p className="hidden px-3 pb-3 pt-2 text-[11px] font-semibold uppercase tracking-widest text-white/45 lg:block">Vos paramètres</p>
      <ul className="flex gap-1 overflow-x-auto">
        {sections.map(({ id, label, icon: Icon }) => (
          <li key={id} className="shrink-0">
            <a href={`#${id}`} className="flex min-h-11 items-center gap-3 whitespace-nowrap rounded-xl px-3 py-3 text-sm text-white/70 transition-colors hover:bg-tertiary-400/10 hover:text-tertiary-400 focus-visible:outline-2 focus-visible:outline-tertiary-400 lg:whitespace-normal">
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SettingsGroup({ id, title, description, children }: {
  id: typeof sections[number]["id"];
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-6 space-y-4">
      <div className="px-1">
        <h2 id={`${id}-heading`} className="font-one text-lg font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-white/55">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
