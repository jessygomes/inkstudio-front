"use client";
import { getSession } from "next-auth/react";

/** Keep private tools accessible to their owner even when the public profile is hidden. */
export async function authenticatedFetch(input: string | URL, init?: RequestInit) {
  const base = process.env.NEXT_PUBLIC_BACK_URL;
  const url = new URL(input, window.location.origin);
  if (!base) return fetch(input, init);
  const api = new URL(base);
  const apiPath = api.pathname.replace(/\/$/, "");
  if (url.origin !== api.origin || (apiPath && url.pathname !== apiPath && !url.pathname.startsWith(apiPath + "/"))) return fetch(input, init);
  const session = await getSession();
  const headers = new Headers(init?.headers);
  if (session?.accessToken && !headers.has("Authorization")) headers.set("Authorization", "Bearer " + session.accessToken);
  return fetch(input, { ...init, headers });
}
