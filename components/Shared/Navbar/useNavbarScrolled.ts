"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const getSnapshot = () => window.scrollY > 0;
const getServerSnapshot = () => false;

export function useNavbarScrolled() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
