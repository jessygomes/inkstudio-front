"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronsUpDown, LogOut, Settings2, UserRound } from "lucide-react";
import { LogoutBtn } from "@/components/Auth/LogoutBtn";

const itemClass = "flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[11px] font-medium text-white/70 transition aria-[current=page]:bg-tertiary-400/5 aria-[current=page]:text-tertiary-400 hover:bg-tertiary-400/5 hover:text-white focus-visible:bg-tertiary-400/10 focus-visible:text-white focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";
const iconClass = "grid size-7 shrink-0 place-items-center rounded-lg border border-tertiary-400/15 bg-tertiary-400/10 text-tertiary-400";

export default function NavbarAccountMenu({ collapsed = false, placement, salonName, onNavigate }: {
  collapsed?: boolean;
  placement?: "above" | "below";
  salonName?: string | null;
  onNavigate?: () => void;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const name = salonName || session?.user?.salonName || session?.user?.name || "Mon compte";
  const image = session?.user?.profileImage || session?.user?.image;
  const plan = session?.user?.saasPlan;

  useEffect(() => setMounted(true), []);
  const position = useCallback(() => {
    const menu = panel.current;
    const button = trigger.current;
    if (!menu?.matches(":popover-open") || !button) return;
    const rect = button.getBoundingClientRect();
    if (!rect.width || !rect.height) { menu.hidePopover(); return; }
    const width = Math.min(288, window.innerWidth - 24);
    menu.style.width = `${width}px`;
    const height = menu.getBoundingClientRect().height;
    const left = collapsed ? rect.right + 10 : rect.left;
    const top = placement === "below" ? rect.bottom + 8 : collapsed ? rect.bottom - height : rect.top - height - 8;
    menu.style.left = `${Math.max(12, Math.min(left, window.innerWidth - width - 12))}px`;
    menu.style.top = `${Math.max(12, Math.min(top, window.innerHeight - height - 12))}px`;
  }, [collapsed, placement]);

  useEffect(() => {
    const menu = panel.current;
    if (!mounted || !menu) return;
    const sync = () => { setOpen(menu.matches(":popover-open")); position(); };
    menu.addEventListener("toggle", sync);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => { menu.removeEventListener("toggle", sync); window.removeEventListener("resize", position); window.removeEventListener("scroll", position, true); };
  }, [mounted, position]);

  useEffect(() => { panel.current?.hidePopover(); setOpen(false); }, [pathname, collapsed]);
  const close = () => { panel.current?.hidePopover(); setOpen(false); };
  const toggle = () => {
    const menu = panel.current;
    if (!menu) return;
    if (menu.matches(":popover-open")) { close(); return; }
    menu.showPopover(); position(); setOpen(true);
    menu.querySelector<HTMLElement>('[role="menuitem"]')?.focus({ preventScroll: true });
  };
  const navigate = () => { close(); onNavigate?.(); };
  const avatar = <span className="relative grid size-8 shrink-0 place-items-center overflow-hidden rounded-xl border border-tertiary-400/20 bg-tertiary-400/10 text-tertiary-400">{image ? <Image src={image} alt="" fill sizes="32px" unoptimized className="object-cover" /> : <UserRound size={17} />}</span>;

  return <div className="min-w-0 w-full">
    <button ref={trigger} type="button" disabled={!mounted} onClick={toggle} onKeyDown={event => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); if (!open) toggle(); if (event.key === "ArrowUp") { const items = panel.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)'); items?.[items.length - 1]?.focus(); } } }} aria-haspopup="menu" aria-expanded={open} aria-controls={id} aria-label={`Menu du compte : ${name}`} title={collapsed ? name : undefined} className={"flex min-h-12 w-full cursor-pointer items-center gap-2.5 overflow-hidden rounded-xl border px-[9px] py-2 font-one transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400 " + (open ? "border-tertiary-400/20 bg-tertiary-400/5" : "border-transparent hover:border-white/10 hover:bg-white/[0.025]")}>
      {avatar}{!collapsed && <><span className="min-w-0 flex-1 text-left"><span className="block truncate text-[11px] font-medium text-white/85">{name}</span><span className="mt-1 block text-[9px] text-white/35">Profil et paramètres</span></span><ChevronsUpDown size={13} className="shrink-0 text-white/35" /></>}
    </button>
    {mounted && createPortal(<div ref={panel} id={id} popover="auto" data-account-menu role="menu" aria-label="Menu du compte" style={{ inset: "auto" }} className="fixed m-0 max-h-[calc(100dvh-1.5rem)] w-72 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-2xl border border-white/15 bg-noir-500 p-1.5 font-one text-white shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
      onKeyDown={event => {
        const items = Array.from(panel.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)') || []);
        const index = items.indexOf(document.activeElement as HTMLElement);
        if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) { event.preventDefault(); const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length; items[next]?.focus(); }
        if (event.key === "Escape" || event.key === "Tab") { if (event.key === "Escape") event.preventDefault(); close(); trigger.current?.focus(); }
      }}>
      <div role="presentation" className="mb-1.5 flex items-center gap-2.5 border-b border-white/[0.07] px-2.5 pb-3 pt-2">{avatar}<div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-white/85">{name}</p><p className="mt-1 truncate text-[10px] text-white/35">{session?.user?.email || "Votre espace professionnel"}</p></div>{plan && <span className="shrink-0 rounded-md border border-tertiary-400/15 bg-tertiary-400/10 px-1.5 py-0.5 text-[8px] font-medium text-tertiary-400">{plan}</span>}</div>
      <Link href="/mon-compte" aria-current={pathname.startsWith("/mon-compte") ? "page" : undefined} role="menuitem" tabIndex={-1} onClick={navigate} className={itemClass}><span className={iconClass}><UserRound size={14} /></span><span className="flex-1">Mon profil</span><ArrowUpRight size={13} className="text-white/25" /></Link>
      <Link href="/parametres" aria-current={pathname.startsWith("/parametres") ? "page" : undefined} role="menuitem" tabIndex={-1} onClick={navigate} className={itemClass}><span className={iconClass}><Settings2 size={14} /></span><span className="flex-1">Paramètres du compte</span><ArrowUpRight size={13} className="text-white/25" /></Link>
      <div role="separator" className="mx-2 my-1.5 border-t border-white/[0.07]" />
      <LogoutBtn role="menuitem" tabIndex={-1} className={itemClass + " hover:text-red-300"} icon={<span className={iconClass}><LogOut size={14} /></span>}><span>Se déconnecter</span></LogoutBtn>
    </div>, document.body)}
  </div>;
}
