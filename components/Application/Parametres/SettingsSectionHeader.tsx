import type { ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";
import styles from "./SettingsCard.module.css";

export default function SettingsSectionHeader({ title, description, icon: Icon, action, expanded, controls, onToggle }: {
  title: string;
  description?: string;
  icon: LucideIcon;
  action?: ReactNode;
  expanded?: boolean;
  controls?: string;
  onToggle?: () => void;
}) {
  const content = <><span className={styles.icon}><Icon size={16} aria-hidden="true" /></span><span className="min-w-0 flex-1"><span role="heading" aria-level={3} className="block text-[13px] font-semibold leading-5 text-white/85">{title}</span>{description && <span className="mt-1 block text-[11px] font-normal leading-5 text-white/40">{description}</span>}</span></>;
  return onToggle ? <button type="button" aria-expanded={expanded} aria-controls={controls} onClick={onToggle} className={styles.disclosure}>{content}{action}<ChevronDown size={15} className={`mt-2 shrink-0 text-white/35 transition-transform ${expanded ? "rotate-180" : ""}`} /></button> : <header className={styles.header}>{content}{action && <div className="shrink-0 self-center">{action}</div>}</header>;
}
