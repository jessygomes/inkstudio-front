/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import imageCompression from "browser-image-compression";
import { ArrowRight, CalendarDays, Camera, Check, CheckCircle2, Clock3, ImagePlus, Loader2, LockKeyhole, MessageCircle, RefreshCw, Send, ShieldCheck, Star, TriangleAlert, X } from "lucide-react";
import DashboardButton from "@/components/Shared/DashboardButton";
import { followUpSubmissionSchema } from "@/lib/zod/validator.schema";
import { useUploadThing } from "@/lib/utils/uploadthing";
import styles from "./FollowUpResponse.module.css";

type Values = z.infer<typeof followUpSubmissionSchema>;
type Appointment = { title?: string; start?: string; prestation?: string; salonName?: string; artistName?: string };
type Validation = { kind: "loading" | "ready" | "invalid" | "expired" | "used" | "unavailable"; appointment?: Appointment };
const satisfaction = ["Choisissez une note", "Très insatisfait", "Insatisfait", "Neutre", "Satisfait", "Très satisfait"];
const photoTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const apiBase = process.env.NEXT_PUBLIC_BACK_URL;
const responseMessage = (data: { message?: string | string[] } | null, fallback: string) => Array.isArray(data?.message) ? data.message.join(" ") : data?.message || fallback;

export default function FollowUpResponse({ token }: { token: string }) {
  const [validation, setValidation] = useState<Validation>({ kind: token ? "loading" : "invalid" });
  const [retry, setRetry] = useState(0);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [stage, setStage] = useState<"idle" | "uploading" | "sending" | "done">("idle");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const submitting = useRef(false);
  const uploaded = useRef<{ file: File; url: string } | null>(null);
  const { startUpload } = useUploadThing("imageUploader");
  const form = useForm<Values>({ resolver: zodResolver(followUpSubmissionSchema), defaultValues: { rating: 0, review: "", isPhotoPublic: false } });
  const rating = form.watch("rating");
  const publicPhoto = form.watch("isPhotoPublic");
  const busy = stage === "uploading" || stage === "sending";

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    setValidation({ kind: "loading" });
    (async () => {
      try {
        if (!apiBase) throw new Error("Service indisponible");
        const response = await fetch(`${apiBase}/follow-up/requests/${encodeURIComponent(token)}`, { cache: "no-store", signal: controller.signal });
        const data = await response.json().catch(() => null);
        if (controller.signal.aborted) return;
        if (response.ok && data?.ok) { setValidation({ kind: "ready", appointment: data.appointment }); return; }
        const message = responseMessage(data, "Lien indisponible");
        const kind = response.status >= 500 || response.status === 429 ? "unavailable" : /déjà/i.test(message) ? "used" : /expir/i.test(message) ? "expired" : "invalid";
        setValidation({ kind });
      } catch { if (!controller.signal.aborted) setValidation({ kind: "unavailable" }); }
    })();
    return () => controller.abort();
  }, [token, retry]);

  useEffect(() => {
    if (!photo) { setPreview(""); return; }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const selectPhoto = (file: File | null) => {
    if (busy) return;
    setPhotoError(""); setSubmitError("");
    if (file && !photoTypes.includes(file.type)) { setPhotoError("Choisissez une photo JPG, PNG ou WebP."); return; }
    if (file && file.size > 8 * 1024 * 1024) { setPhotoError("La photo ne doit pas dépasser 8 Mo."); return; }
    setPhoto(file); uploaded.current = null;
    form.setValue("photo", file as File, { shouldValidate: true, shouldDirty: true });
  };
  const onPhotoChange = (event: ChangeEvent<HTMLInputElement>) => { selectPhoto(event.target.files?.[0] ?? null); event.target.value = ""; };
  const onDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setDragging(false); selectPhoto(event.dataTransfer.files[0] ?? null); };
  const submit = async (values: Values) => {
    if (submitting.current || validation.kind !== "ready" || !photo) return;
    submitting.current = true; setSubmitError("");
    try {
      let url = uploaded.current?.file === photo ? uploaded.current.url : "";
      if (!url) {
        setStage("uploading");
        const compressed = await imageCompression(photo, { maxSizeMB: 2, maxWidthOrHeight: 1920, useWebWorker: true, fileType: "image/webp", initialQuality: 0.85 });
        const result = await startUpload([compressed], { followUpToken: token });
        url = result?.[0]?.ufsUrl ?? result?.[0]?.url ?? "";
        if (!url) throw new Error("La photo n’a pas pu être transférée. Réessayez : votre formulaire est conservé.");
        uploaded.current = { file: photo, url };
      }
      setStage("sending");
      const response = await fetch(`${apiBase}/follow-up/submissions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, rating: values.rating, review: values.review?.trim() || undefined, photoUrl: url, isPhotoPublic: values.isPhotoPublic }) });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        const message = responseMessage(data, "L’envoi n’a pas abouti. Votre formulaire est conservé, vous pouvez réessayer.");
        if (/déjà/i.test(message)) { setValidation({ kind: "used" }); setStage("idle"); return; }
        if (/expir/i.test(message)) { setValidation({ kind: "expired" }); setStage("idle"); return; }
        throw new Error(message);
      }
      setStage("done");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Impossible d’envoyer votre réponse. Réessayez dans un instant.");
      setStage("idle");
    } finally { submitting.current = false; }
  };

  const appointment = validation.appointment;
  const studio = appointment?.salonName || "Votre salon";
  const completed = stage === "done" || validation.kind === "used";
  return <main className={styles.page}>
    <header className={styles.topbar}><Link href="/" aria-label="Accueil Inkera Studio"><Image src="/images/logo_white_color.png" alt="Inkera Studio" width={130} height={60} className={styles.logo} priority /></Link><span><ShieldCheck size={14} />Votre suivi personnel</span></header>
    {validation.kind === "loading" ? <State icon={<Loader2 className={styles.spinner} size={26} />} title="Un instant, on retrouve votre suivi." text="Nous vérifions le lien reçu dans votre email." />
      : completed ? <State icon={<CheckCircle2 size={30} />} title={stage === "done" ? "Merci, votre suivi est envoyé." : "Votre réponse a déjà été reçue."} text={stage === "done" ? `Votre photo et votre retour ont bien été transmis à ${studio === "Votre salon" ? "votre salon" : studio}.` : "Ce lien a déjà servi à envoyer votre suivi. Vous n’avez rien à renvoyer."}>
        <div className={styles.next}><MessageCircle size={19} /><div><h2>La suite, avec votre salon</h2><p>Votre salon pourra consulter votre photo et votre retour, puis vous répondre par email. Pour toute question complémentaire, contactez-le directement.</p></div></div>
        <DashboardButton href="/" variant="secondary">Retour à l’accueil<ArrowRight size={14} /></DashboardButton>
      </State>
      : validation.kind !== "ready" ? <State icon={validation.kind === "expired" ? <Clock3 size={28} /> : <TriangleAlert size={28} />} title={validation.kind === "unavailable" ? "Le suivi est momentanément indisponible." : validation.kind === "expired" ? "Ce lien de suivi a expiré." : "Ce lien de suivi est indisponible."} text={validation.kind === "unavailable" ? "La connexion au service n’a pas abouti. Vous pouvez réessayer sans perdre votre lien." : validation.kind === "expired" ? "Demandez un nouveau lien à votre salon pour partager votre photo et votre retour." : "Vérifiez le lien complet de votre email ou demandez à votre salon de vous le renvoyer."}>
        {validation.kind === "unavailable" && <DashboardButton onClick={() => setRetry(value => value + 1)}><RefreshCw size={14} />Réessayer</DashboardButton>}
        <Link href="/" className={styles.textLink}>Retour à l’accueil<ArrowRight size={13} /></Link>
      </State>
      : <div className={styles.layout}>
        <aside className={styles.intro}>
          <span className={styles.kicker}>APRÈS VOTRE SÉANCE</span>
          <h1>Et depuis,<br /><span>comment ça va ?</span></h1>
          <p>Une photo, quelques mots : gardez le lien avec votre salon et partagez l’évolution de votre cicatrisation.</p>
          {appointment?.title && <div className={styles.appointment}><CalendarDays size={18} /><div><strong>{appointment.title}</strong><span>{studio}{appointment.start ? ` · ${new Date(appointment.start).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" })}` : ""}</span>{appointment.artistName && <span>Avec {appointment.artistName}</span>}</div></div>}
          <ol className={styles.steps}><li><span>01</span><div><strong>Une photo récente</strong><p>Pour montrer l’évolution depuis votre séance.</p></div></li><li><span>02</span><div><strong>Votre expérience</strong><p>Une note et, si vous le souhaitez, quelques mots.</p></div></li><li><span>03</span><div><strong>Un retour à votre salon</strong><p>Votre réponse lui est envoyée directement.</p></div></li></ol>
          <div className={styles.privateNote}><LockKeyhole size={16} /><p>Votre photo reste privée par défaut. Vous choisissez si le salon peut la partager.</p></div>
        </aside>
        <form onSubmit={form.handleSubmit(submit)} className={styles.form}>
          <fieldset disabled={busy} className={styles.fields}>
            <section className={styles.section} aria-labelledby="photo-title">
              <div className={styles.sectionHeading}><span>01</span><div><h2 id="photo-title">Votre photo de suivi</h2><p>Une photo nette et récente, prise à la lumière naturelle.</p></div></div>
              <div className={styles.upload} data-dragging={dragging} onDragOver={event => { event.preventDefault(); if (!busy) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
                <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Choisir une photo de suivi" aria-describedby="photo-help photo-error" onChange={onPhotoChange} className={styles.fileInput} />
                {preview ? <><img src={preview} alt="Aperçu de votre photo de suivi" className={styles.preview} /><div className={styles.photoActions}><span>{photo?.name}</span><button type="button" onClick={() => selectPhoto(null)} aria-label="Retirer la photo"><X size={15} /></button></div></> : <><span className={styles.uploadIcon}><ImagePlus size={26} /></span><strong>Ajoutez votre photo</strong><p>Glissez-la ici ou choisissez-la sur votre appareil.</p><button type="button" onClick={() => inputRef.current?.click()} className={styles.choosePhoto}><Camera size={15} />Choisir une photo</button></>}
              </div>
              {preview && <button type="button" onClick={() => inputRef.current?.click()} className={styles.textLink}>Choisir une autre photo</button>}
              <p id="photo-help" className={styles.hint}>JPG, PNG ou WebP · 8 Mo maximum. La photo est optimisée avant l’envoi.</p>
              <p id="photo-error" role="alert" className={styles.error}>{photoError || form.formState.errors.photo?.message}</p>
            </section>
            <section className={styles.section} aria-labelledby="experience-title">
              <div className={styles.sectionHeading}><span>02</span><div><h2 id="experience-title">Comment s’est passée votre expérience ?</h2><p>Votre retour aide le salon à vous accompagner.</p></div></div>
              <fieldset className={styles.rating}><legend>Votre satisfaction <span aria-hidden="true">*</span></legend><div className={styles.stars}>{[1, 2, 3, 4, 5].map(value => <label key={value} className={styles.star} data-selected={value <= rating}><input type="radio" name="rating" value={value} checked={rating === value} onChange={() => form.setValue("rating", value, { shouldValidate: true })} aria-label={`${value} sur 5 : ${satisfaction[value]}`} /><Star size={26} fill={value <= rating ? "currentColor" : "none"} /></label>)}</div><p aria-live="polite">{satisfaction[rating]}</p>{form.formState.errors.rating && <span role="alert" className={styles.error}>{form.formState.errors.rating.message}</span>}</fieldset>
              <label className={styles.reviewLabel} htmlFor="followup-review">Quelques mots pour votre salon <span>(facultatif)</span></label>
              <textarea id="followup-review" rows={4} maxLength={5000} placeholder="Comment se déroule la cicatrisation ? Souhaitez-vous partager quelque chose avec votre salon ?" {...form.register("review")} className={styles.textarea} />
              {form.formState.errors.review && <p role="alert" className={styles.error}>{form.formState.errors.review.message}</p>}
            </section>
            <section className={styles.section} aria-labelledby="privacy-title">
              <div className={styles.sectionHeading}><span>03</span><div><h2 id="privacy-title">Votre photo, votre choix</h2><p>Le partage public est entièrement facultatif.</p></div></div>
              <label className={styles.consent} data-checked={publicPhoto}><input type="checkbox" {...form.register("isPhotoPublic")} /><span className={styles.consentCheck}><Check size={12} /></span><span><strong>J’autorise le salon à partager cette photo.</strong><small>Le salon pourra l’utiliser dans sa galerie ou ses communications. Sans votre accord, elle reste réservée au suivi avec votre salon.</small></span></label>
            </section>
          </fieldset>
          {submitError && <div role="alert" className={styles.submitError}><TriangleAlert size={16} /><p>{submitError}</p></div>}
          <div className={styles.submit}><p><LockKeyhole size={13} />Aucun compte nécessaire</p><DashboardButton type="submit" disabled={busy || !photo} className={styles.submitButton}>{busy ? <Loader2 size={16} className={styles.spinner} /> : <Send size={15} />}{stage === "uploading" ? "Transfert de la photo…" : stage === "sending" ? "Envoi de votre réponse…" : "Envoyer mon suivi"}</DashboardButton></div>
        </form>
      </div>}
    <footer className={styles.footer}><span>Un lien simple entre vous et votre salon.</span><Link href="/politique-de-confidentialite">Confidentialité</Link></footer>
  </main>;
}

function State({ icon, title, text, children }: { icon: ReactNode; title: string; text: string; children?: ReactNode }) {
  return <section className={styles.state} aria-live="polite"><span className={styles.stateIcon}>{icon}</span><h1>{title}</h1><p>{text}</p>{children}</section>;
}
