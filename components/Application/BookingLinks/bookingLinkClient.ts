"use client";

import { useSyncExternalStore } from "react";
import { isUsableBookingUrl } from "@/lib/types/booking-links";

// Le backend ne renvoie l'URL (qui contient le token) qu'à la création. On la garde uniquement
// en mémoire pour la session d'onglet en cours : jamais de stockage persistant, de log ou d'analytics.
const urls = new Map<string, string>();
const listeners = new Set<() => void>();

export function rememberBookingUrl(linkId: string, url: string) {
  if (!isUsableBookingUrl(url)) return;
  urls.set(linkId, url);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useBookingUrl(linkId: string | null | undefined): string | null {
  return useSyncExternalStore(
    subscribe,
    () => (linkId ? urls.get(linkId) ?? null : null),
    () => null,
  );
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Repli ci-dessous (contexte non sécurisé, permission refusée…)
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const done = document.execCommand("copy");
    area.remove();
    return done;
  } catch {
    return false;
  }
}

export function bookingLinkMessage(prestation: string, url: string) {
  const label = prestation === "RETOUCHE" ? "votre retouche" : "votre tatouage";
  return `Voici votre lien personnel pour réserver ${label} : ${url}`;
}
