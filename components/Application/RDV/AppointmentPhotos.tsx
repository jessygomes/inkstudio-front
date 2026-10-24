"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { Camera, ImagePlus, Trash2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useUploadThing } from "@/lib/utils/uploadthing";
import { addAppointmentPhotos, deleteAppointmentPhoto, getAppointmentPhotos, getClientPhotos, type AppointmentPhoto } from "@/lib/queries/appointment-photos";
import { deletePortfolioImageAction, getSalonTatoueursForPortfolioAction, type PortfolioTatoueurDto } from "@/lib/queries/portfolio";
import CreateOrUpdatePhoto from "../Portfolio/CreateOrUpdatePhoto";

function PhotoViewer({ photo, onClose }: { photo: AppointmentPhoto; onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    close.current?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.stopImmediatePropagation(); onClose(); }
      if (event.key === "Tab") { event.preventDefault(); close.current?.focus(); }
    };
    document.addEventListener("keydown", escape, true);
    return () => { document.removeEventListener("keydown", escape, true); previous?.focus(); };
  }, [onClose]);
  return createPortal(<div role="dialog" aria-modal="true" aria-label="Photo du rendez-vous" className="fixed inset-0 z-[10010] flex items-center justify-center bg-black/95 p-4" onClick={onClose}>
    <button ref={close} type="button" aria-label="Fermer la photo" onClick={onClose} className="absolute right-4 top-4 z-10 cursor-pointer rounded-full bg-black/60 p-3 text-white"><X /></button>
    <div className="relative h-[85dvh] w-full" onClick={(event) => event.stopPropagation()}>
      <Image src={photo.url} alt={photo.caption || "Photo du rendez-vous"} fill sizes="100vw" unoptimized className="object-contain" />
    </div>
  </div>, document.body);
}

export default function AppointmentPhotos({ appointmentId, clientId, readOnly = false }: { appointmentId?: string; clientId?: string; readOnly?: boolean }) {
  const { data: session } = useSession();
  const [artists, setArtists] = useState<PortfolioTatoueurDto[]>([]);
  const [photos, setPhotos] = useState<AppointmentPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [revision, setRevision] = useState(0);
  const [viewer, setViewer] = useState<AppointmentPhoto | null>(null);
  const [portfolio, setPortfolio] = useState<AppointmentPhoto | null>(null);
  const [deleting, setDeleting] = useState<AppointmentPhoto | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const files = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const deleteDialog = useRef<HTMLDivElement>(null);
  const { startUpload } = useUploadThing("imageUploader");
  const canAdd = !readOnly && !!appointmentId;

  useEffect(() => {
    if (!deleting) return;
    const previous = document.activeElement as HTMLElement | null;
    deleteDialog.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopImmediatePropagation();
        if (!saving) setDeleting(null);
      }
      if (event.key === "Tab") {
        const buttons = Array.from(deleteDialog.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") || []);
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (!first) { event.preventDefault(); return; }
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", keydown, true);
    return () => { document.removeEventListener("keydown", keydown, true); previous?.focus(); };
  }, [deleting, saving]);

  useEffect(() => {
    const refresh = () => setRevision((value) => value + 1);
    window.addEventListener("appointment-photos-changed", refresh);
    return () => window.removeEventListener("appointment-photos-changed", refresh);
  }, []);

  const refreshPhotos = () => window.dispatchEvent(new Event("appointment-photos-changed"));

  const remove = async (includePortfolio: boolean) => {
    if (!deleting) return;
    setSaving(true);
    setDeleteError("");
    try {
      if (includePortfolio) {
        for (const item of deleting.portfolios.filter((item) => item.userId === session?.user?.id)) {
          await deletePortfolioImageAction(item.id);
        }
      }
      await deleteAppointmentPhoto(deleting.appointmentId, deleting.id);
      setDeleting(null);
      refreshPhotos();
    } catch (reason) {
      setDeleteError(reason instanceof Error ? reason.message : "Suppression impossible.");
      refreshPhotos();
    } finally { setSaving(false); }
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setPhotos([]);
    const request = clientId ? getClientPhotos(clientId) : getAppointmentPhotos(appointmentId!);
    request.then((result) => { if (active) setPhotos(result); })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Chargement impossible."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [appointmentId, clientId, revision]);

  useEffect(() => {
    if (!canAdd || !session?.user?.id) return;
    let active = true;
    getSalonTatoueursForPortfolioAction(session.user.id).then((result) => {
      if (active && result.ok && Array.isArray(result.data)) setArtists(result.data);
    }).catch(() => { /* Artist assignment is optional; the photo can still be published. */ });
    return () => { active = false; };
  }, [canAdd, session?.user?.id]);

  const upload = async (input: HTMLInputElement) => {
    const selected = Array.from(input.files || []);
    input.value = "";
    if (!selected.length || !appointmentId) return;
    if (selected.length > 5 || selected.some((file) => !file.type.startsWith("image/") || file.size > 8 * 1024 * 1024)) {
      setError("Choisissez jusqu'à 5 images de 8 Mo maximum par ajout."); return;
    }
    setSaving(true); setError("");
    try {
      const compressed = await Promise.all(selected.map((file) => imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.8,
      })));
      const result = await startUpload(compressed);
      if (!result?.length) throw new Error("L'envoi des photos a échoué.");
      await addAppointmentPhotos(appointmentId, result.map((file) => ({ url: file.ufsUrl })));
      refreshPhotos();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Enregistrement impossible."); }
    finally { setSaving(false); }
  };

  return <section aria-label="Photos du rendez-vous" className="space-y-3 font-one [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-xs font-semibold text-white/80">Photos {photos.length > 0 && `(${photos.length})`}</p>
      {canAdd && <div className="flex flex-wrap gap-2">
        <button type="button" disabled={saving || loading} onClick={() => files.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-xs text-white disabled:opacity-40"><ImagePlus size={14} />{saving ? "Envoi en cours…" : "Ajouter une photo"}</button>
        <button type="button" disabled={saving || loading} onClick={() => camera.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-xs text-white disabled:opacity-40"><Camera size={14} />Prendre une photo</button>
        <input ref={files} type="file" accept="image/*" multiple className="hidden" aria-label="Choisir des photos" onChange={(event) => void upload(event.currentTarget)} />
        <input ref={camera} type="file" accept="image/*" capture="environment" className="hidden" aria-label="Prendre une photo" onChange={(event) => void upload(event.currentTarget)} />
      </div>}
    </div>
    {error && <p role="alert" className="text-xs text-red-300">{error} <button type="button" className="underline" onClick={() => setRevision((value) => value + 1)}>Réessayer</button></p>}
    {loading ? <p role="status" className="text-xs text-white/45">Chargement des photos…</p> : !photos.length && !error ? <p className="text-xs text-white/40">Aucune photo pour le moment.</p> : null}
    <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,128px))] gap-2">
      {photos.map((photo) => <div key={photo.id} className="min-w-0 space-y-2">
        <div className="relative overflow-hidden rounded-xl">
        <button type="button" onClick={() => setViewer(photo)} aria-label="Voir la photo en grand" className="relative block aspect-square w-full overflow-hidden rounded-xl border border-white/10 focus-visible:ring-2 focus-visible:ring-tertiary-400">
          <Image src={photo.url} alt={photo.caption || "Photo du rendez-vous"} fill sizes="128px" unoptimized className="rounded-xl object-cover" />
        </button>
        {canAdd && <div className="absolute inset-x-0 bottom-0 flex h-7 items-center justify-end overflow-hidden rounded-b-xl bg-black/60 text-white backdrop-blur-sm">
          {!photo.portfolios.some((item) => item.userId === session?.user?.id) && <button type="button" title="Ajouter au portfolio" aria-label="Ajouter au portfolio" onClick={() => setPortfolio(photo)} className="inline-flex h-full min-w-0 flex-1 items-center justify-center gap-1 px-1 text-[10px] hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70"><ImagePlus size={12} className="shrink-0" />Portfolio</button>}
          <button type="button" disabled={saving} title="Supprimer la photo du rendez-vous" aria-label="Supprimer la photo du rendez-vous" onClick={() => { setDeleting(photo); setDeleteError(""); }} className="inline-flex h-full w-7 shrink-0 items-center justify-center hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70 disabled:opacity-40"><Trash2 size={12} /></button>
        </div>}
        </div>
        {photo.appointment && <p className="text-[11px] text-white/55">{photo.appointment.title} · {new Date(photo.appointment.start).toLocaleDateString("fr-FR")}</p>}
      </div>)}
    </div>
    {viewer && <PhotoViewer photo={viewer} onClose={() => setViewer(null)} />}
    {portfolio && createPortal(<CreateOrUpdatePhoto sourcePhoto={portfolio} tatoueurs={artists} onCreate={() => { setPortfolio(null); refreshPhotos(); }} setIsOpen={(open) => { if (!open) setPortfolio(null); }} />, document.body)}
    {deleting && createPortal(<div data-modal role="dialog" aria-modal="true" aria-label="Supprimer la photo" className="fixed inset-0 z-[10020] flex items-center justify-center bg-black/75 p-4">
      <div ref={deleteDialog} className="w-full max-w-sm space-y-4 rounded-2xl border border-white/15 bg-[#1a1a1a] p-5 font-one text-white [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed">
        <h3 className="text-sm font-semibold">Supprimer cette photo ?</h3>
        <div className="relative h-32"><Image src={deleting.url} alt="Photo à supprimer" fill sizes="320px" unoptimized className="rounded-lg object-contain" /></div>
        <p className="text-xs text-white/65">{deleting.portfolios.length ? "Vous pouvez retirer la photo du rendez-vous en la conservant au portfolio." : "La photo sera retirée de ce rendez-vous."}</p>
        {deleteError && <p role="alert" className="text-xs text-red-300">{deleteError}</p>}
        <div className="flex flex-col gap-2 text-xs [&_button]:rounded-lg [&_button]:px-3 [&_button]:py-2 [&_button:disabled]:opacity-40">
          <button type="button" disabled={saving} onClick={() => void remove(false)} className="bg-white/10">{saving ? "Suppression en cours…" : "Supprimer du RDV uniquement"}</button>
          {deleting.portfolios.some((item) => item.userId === session?.user?.id) && <button type="button" disabled={saving} onClick={() => void remove(true)} className="bg-red-500/20 text-red-200">Supprimer du RDV et de mon portfolio</button>}
          <button type="button" disabled={saving} onClick={() => setDeleting(null)} className="text-white/60">Annuler</button>
        </div>
      </div>
    </div>, document.body)}
  </section>;
}
