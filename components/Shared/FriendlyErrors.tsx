"use client";
import { toast } from "sonner";
import { friendlyMessage } from "@/lib/user-error";

// Filet de sécurité pour tous les toasts d'erreur du site : un message technique (« Failed to fetch »,
// « Minified React error #441 », « Erreur HTTP 404 »…) est remplacé par un message compréhensible.
type ToastError = typeof toast.error;
const patched = toast as typeof toast & { __inkeraFriendly?: boolean };
if (typeof window !== "undefined" && !patched.__inkeraFriendly) {
  const original: ToastError = toast.error.bind(toast);
  patched.error = ((message: Parameters<ToastError>[0], data?: Parameters<ToastError>[1]) =>
    original(typeof message === "string" ? friendlyMessage(message) : message, data)) as ToastError;
  patched.__inkeraFriendly = true;
}

export default function FriendlyErrors() {
  return null;
}
