"use client";

import { useState } from "react";
import { MdNotificationsNone } from "react-icons/md";
import NotificationBadge from "@/components/Shared/NotificationBadge";
import { useNotificationCenter } from "@/components/Providers/NotificationCenterProvider";
import NotificationPanel from "./NotificationPanel";

/** Entrée « Notifications » (barre latérale ou menu mobile) : pastille de non lues + panneau latéral. */
export default function NotificationBell({ collapsed = false, label = "Notifications", className = "", onOpen }: { collapsed?: boolean; label?: string; className?: string; onOpen?: () => void }) {
  const { unread } = useNotificationCenter();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => { onOpen?.(); setOpen(true); }}
        title={collapsed ? label : undefined}
        aria-haspopup="dialog"
        className={`relative flex ${collapsed ? "min-h-9" : "min-h-11"} w-full cursor-pointer items-center gap-3 overflow-hidden rounded-xl px-[15px] text-sm text-white/60 transition-colors duration-300 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400 ${className}`}
      >
        <MdNotificationsNone size={collapsed ? 18 : 20} className="shrink-0" aria-hidden="true" />
        <span className={`min-w-0 flex-1 truncate whitespace-nowrap text-left font-one transition-opacity duration-300 ${collapsed ? "opacity-0" : "opacity-100"}`}>{label}</span>
        <NotificationBadge count={unread} label="notifications non lues" className={collapsed ? "absolute right-0.5 top-0.5" : ""} />
      </button>
      {open && <NotificationPanel onClose={() => setOpen(false)} />}
    </>
  );
}
