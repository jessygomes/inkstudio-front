"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { MdArrowBack, MdChevronRight, MdClose, MdDoneAll, MdTune } from "react-icons/md";
import { useNotificationCenter } from "@/components/Providers/NotificationCenterProvider";
import {
  getNotificationCategoryPrefs,
  listAppNotifications,
  markAllAppNotificationsRead,
  markAppNotificationRead,
  removeAppNotification,
  setNotificationCategoryPref,
  type AppNotification,
  type NotificationCategoryPrefs,
} from "@/lib/queries/notification-center";
import { CATEGORY_LABELS, notificationHref, timeAgo } from "./notificationRoute";

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400 ${checked ? "bg-tertiary-400" : "bg-white/15"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

/** Panneau latéral : liste des notifications (Toutes / Non lues) et réglages par catégorie. */
export default function NotificationPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { setUnread, version } = useNotificationCenter();
  const ref = useRef<HTMLDialogElement>(null);
  const [view, setView] = useState<"list" | "settings">("list");
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<NotificationCategoryPrefs | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    const dialog = ref.current;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => { dialog?.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);

  const load = useCallback(async (more: string | null = null) => {
    const id = ++requestId.current;
    try {
      const page = await listAppNotifications({ cursor: more, unreadOnly: onlyUnread });
      if (id !== requestId.current) return;
      setItems((prev) => (more ? [...prev, ...page.items.filter((n) => !prev.some((p) => p.id === n.id))] : page.items));
      setCursor(page.nextCursor);
      setUnread(page.unreadCount);
      setError(null);
    } catch {
      if (id === requestId.current) setError("Impossible de charger les notifications.");
    } finally {
      if (id === requestId.current) { setLoading(false); setLoadingMore(false); }
    }
  }, [onlyUnread, setUnread]);

  // Chargement à l'ouverture, au changement de filtre, et quand le compteur bouge (nouvelle notification).
  useEffect(() => { void load(); }, [load, version]);
  useEffect(() => {
    if (view === "settings" && !prefs) getNotificationCategoryPrefs().then(setPrefs).catch(() => setError("Impossible de charger les réglages."));
  }, [view, prefs]);

  const open = async (n: AppNotification) => {
    if (!n.readAt) {
      setItems((prev) => (onlyUnread ? prev.filter((x) => x.id !== n.id) : prev.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x))));
      markAppNotificationRead(n.id).then((r) => setUnread(r.unreadCount)).catch(() => undefined);
    }
    const href = notificationHref(n);
    if (href) { onClose(); router.push(href); }
  };
  const readAll = async () => {
    try {
      const r = await markAllAppNotificationsRead();
      setUnread(r.unreadCount);
      setItems((prev) => (onlyUnread ? [] : prev.map((x) => (x.readAt ? x : { ...x, readAt: new Date().toISOString() }))));
    } catch { setError("Action impossible pour le moment."); }
  };
  const remove = async (n: AppNotification) => {
    setItems((prev) => prev.filter((x) => x.id !== n.id));
    try { setUnread((await removeAppNotification(n.id)).unreadCount); } catch { void load(); }
  };
  const toggle = async (category: NotificationCategoryPrefs["categories"][number]["category"], inApp: boolean) => {
    const before = prefs;
    setPrefs((p) => p && { categories: p.categories.map((c) => (c.category === category ? { ...c, inApp } : c)) });
    try { setPrefs(await setNotificationCategoryPref(category, { inApp })); } catch { setPrefs(before); setError("Enregistrement impossible."); }
  };

  const hasUnread = items.some((n) => !n.readAt);

  return createPortal(
    <dialog ref={ref} aria-label="Notifications" onCancel={(e) => { e.preventDefault(); onClose(); }} onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className="studio-dashboard fixed inset-0 m-0 ml-auto h-dvh max-h-none w-full max-w-none overflow-hidden border-0 bg-transparent p-0 text-white backdrop:bg-black/65 backdrop:backdrop-blur-sm">
      <div className="ml-auto flex h-full w-full max-w-md flex-col border-l border-white/10 bg-noir-700 font-one shadow-2xl">
        <header className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
          {view === "settings" && (
            <button type="button" onClick={() => setView("list")} aria-label="Retour" className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-white/70 hover:bg-white/10"><MdArrowBack size={20} /></button>
          )}
          <h2 className="flex-1 text-lg font-semibold">{view === "list" ? "Notifications" : "Réglages"}</h2>
          {view === "list" && (
            <>
              <button type="button" onClick={readAll} disabled={!hasUnread} title="Tout marquer comme lu" aria-label="Tout marquer comme lu" className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-white/70 hover:bg-white/10 disabled:cursor-default disabled:opacity-40"><MdDoneAll size={20} /></button>
              <button type="button" onClick={() => setView("settings")} title="Réglages" aria-label="Réglages des notifications" className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-white/70 hover:bg-white/10"><MdTune size={20} /></button>
            </>
          )}
          <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-white/70 hover:bg-white/10"><MdClose size={20} /></button>
        </header>

        {view === "list" ? (
          <>
            <div className="flex gap-2 px-5 pt-4">
              {[{ v: false, l: "Toutes" }, { v: true, l: "Non lues" }].map(({ v, l }) => (
                <button key={l} type="button" onClick={() => { setLoading(true); setOnlyUnread(v); }} aria-pressed={onlyUnread === v}
                  className={`cursor-pointer rounded-full px-4 py-1.5 text-sm transition-colors ${onlyUnread === v ? "bg-white/15 text-white" : "text-white/50 hover:bg-white/5 hover:text-white"}`}>{l}</button>
              ))}
            </div>
            <div className="custom-scrollbar flex-1 overflow-y-auto px-3 py-3">
              {loading ? (
                <p className="px-3 py-10 text-center text-sm text-white/50">Chargement…</p>
              ) : error && items.length === 0 ? (
                <p className="px-3 py-10 text-center text-sm text-white/50">{error}</p>
              ) : items.length === 0 ? (
                <p className="px-3 py-10 text-center text-sm text-white/50">{onlyUnread ? "Aucune notification non lue." : "Aucune notification pour le moment."}</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {items.map((n) => (
                    <li key={n.id} className="group relative">
                      <button type="button" onClick={() => void open(n)} className={`flex w-full cursor-pointer items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-white/5 ${n.readAt ? "" : "bg-white/[0.04]"}`}>
                        <span aria-hidden="true" className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.readAt ? "bg-transparent" : "bg-tertiary-400"}`} />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline gap-2">
                            <span className={`min-w-0 flex-1 truncate text-sm ${n.readAt ? "text-white/80" : "font-semibold text-white"}`}>{n.title}</span>
                            <span className="shrink-0 text-xs text-white/40">{timeAgo(n.createdAt)}</span>
                          </span>
                          <span className="mt-0.5 line-clamp-2 block text-sm text-white/55">{n.body}</span>
                        </span>
                        {notificationHref(n) && <MdChevronRight size={18} className="mt-1 shrink-0 text-white/30" aria-hidden="true" />}
                      </button>
                      <button type="button" onClick={() => void remove(n)} aria-label="Supprimer la notification" title="Supprimer"
                        className="absolute right-2 top-2 hidden h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-noir-700 text-white/60 hover:text-white group-hover:flex"><MdClose size={16} /></button>
                    </li>
                  ))}
                </ul>
              )}
              {cursor && !loading && (
                <button type="button" disabled={loadingMore} onClick={() => { setLoadingMore(true); void load(cursor); }}
                  className="mx-auto mt-3 block cursor-pointer rounded-xl px-4 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white disabled:opacity-50">{loadingMore ? "Chargement…" : "Voir plus"}</button>
              )}
            </div>
          </>
        ) : (
          <div className="custom-scrollbar flex-1 overflow-y-auto px-5 py-4">
            <p className="mb-4 text-sm text-white/55">Choisissez les notifications que vous voulez recevoir. Les alertes importantes (paiement échoué, annulation d’un rendez-vous) restent toujours actives.</p>
            {!prefs ? (
              <p className="py-6 text-center text-sm text-white/50">{error ?? "Chargement…"}</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {prefs.categories.map((c) => {
                  const info = CATEGORY_LABELS[c.category];
                  if (!info) return null;
                  return (
                    <li key={c.category} className="flex items-center gap-4 rounded-xl px-3 py-3 hover:bg-white/5">
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-white">{info.label}</span>
                        <span className="block text-xs text-white/50">{info.description}</span>
                      </span>
                      <Switch checked={c.inApp} onChange={(v) => void toggle(c.category, v)} label={info.label} />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </dialog>,
    document.body,
  );
}
