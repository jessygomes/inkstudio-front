"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FileCheck2, HeartPulse, Mail, MapPin, Phone, Save, Tag, UserRound, UsersRound, LoaderCircle } from "lucide-react";
import CreationWorkspace from "@/components/Shared/CreationWorkspace";
import DashboardButton from "@/components/Shared/DashboardButton";
import { createOrUpdateClient } from "@/lib/queries/client";
import { clientSchema } from "@/lib/zod/validator.schema";

type ClientFormData = z.infer<typeof clientSchema>;

const inputClass = "w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/45 focus:bg-white/[0.045] focus:ring-2 focus:ring-tertiary-400/10 [color-scheme:dark] disabled:opacity-50 font-two";

export default function CreateClientForm({ userId }: { userId: string }) {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      firstName: "", lastName: "", phone: "", email: "", birthDate: "", address: "",
      consentSigned: false, consentSignedAt: "", consentFileUrl: "", isMinor: false,
      guardianName: "", guardianPhone: "", tags: "", marketingConsent: false,
      allergies: "", healthIssues: "", medications: "", pregnancy: false,
      previousReactions: "", tattooHistory: "",
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    if (loading) return;
    setLoading(true);
    setError(undefined);
    const processedData = {
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate).toISOString() : undefined,
      consentSignedAt: data.consentSignedAt ? new Date(data.consentSignedAt).toISOString() : undefined,
      tags: typeof data.tags === "string" ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : data.tags,
      userId,
    };
    try {
      const result = await createOrUpdateClient(processedData, "POST", `${process.env.NEXT_PUBLIC_BACK_URL}/clients`);
      if (result.error || !result.ok) {
        setError(result.message || "Une erreur est survenue.");
        return;
      }
      toast.success("Client créé avec succès !");
      router.push("/clients");
    } catch {
      setError("Une erreur est survenue lors de la création du client.");
    } finally {
      setLoading(false);
    }
  };

  const errors = form.formState.errors;
  const isMinor = form.watch("isMinor");
  const consentSigned = form.watch("consentSigned");

  return (
    <CreationWorkspace sections={[
      { id: "client-identity", label: "Identité & coordonnées", hint: "Les informations essentielles" },
      { id: "client-record", label: "Dossier administratif", hint: "Consentements et représentant" },
      { id: "client-health", label: "Santé & antécédents", hint: "Les précisions utiles à la séance" },
    ]} summary={<div className="space-y-4"><div><p className="break-words text-sm font-medium text-white/85">{[form.watch("firstName"), form.watch("lastName")].filter(Boolean).join(" ") || "Votre nouveau client"}</p><p className="mt-1 break-all text-[11px] text-white/40">{form.watch("email") || "Email à renseigner"}</p></div><p className="text-[11px] leading-5 text-white/40">Le prénom, le nom et l’email sont nécessaires pour créer la fiche. Les autres informations peuvent être complétées plus tard.</p><p className="text-[11px] text-white/50">{isMinor ? "Client mineur · représentant légal" : "Fiche client"}{consentSigned ? " · consentement signé" : ""}</p></div>}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid min-w-0 grid-cols-12 gap-4">
          <section id="client-identity" className="order-1 col-span-12 scroll-mt-5 rounded-2xl border border-white/10 bg-noir-600 p-4 sm:p-6">
            <SectionHeader eyebrow="01 · Informations essentielles" title="Qui est ce nouveau client ?" description="Commencez par ses coordonnées. Les champs marqués d’un * sont obligatoires." icon={<UserRound size={18} />} />
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              <Field label="Prénom" required registration={form.register("firstName")} error={errors.firstName?.message} />
              <Field label="Nom" required registration={form.register("lastName")} error={errors.lastName?.message} />
              <Field label="E-mail" required type="email" icon={<Mail size={13} />} registration={form.register("email")} error={errors.email?.message} />
              <Field label="Téléphone" type="tel" icon={<Phone size={13} />} registration={form.register("phone")} error={errors.phone?.message} placeholder="Optionnel" />
              <Field label="Date de naissance" type="date" registration={form.register("birthDate")} error={errors.birthDate?.message} />
              <Field label="Adresse" icon={<MapPin size={13} />} registration={form.register("address")} error={errors.address?.message} placeholder="Adresse complète" />
            </div>
          </section>

          <section id="client-record" className="order-2 col-span-12 scroll-mt-5 rounded-2xl border border-white/10 bg-noir-600 p-4 sm:p-6">
            <SectionHeader eyebrow="02 · Dossier client" title="Informations administratives" description="Consentements, statut du client et repères internes." icon={<FileCheck2 size={18} />} />
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-4 rounded-xl border border-white/[0.06] bg-black/10 p-3 sm:p-4">
                <p className="text-xs font-semibold text-white/70 font-one">Consentements</p>
                <ToggleCard id="consentSigned" label="Consentement signé" description="Le document légal a déjà été signé" registration={form.register("consentSigned")} />
                {consentSigned && <div className="grid gap-3 sm:grid-cols-2"><Field label="Date de signature" type="date" registration={form.register("consentSignedAt")} /><Field label="URL du PDF signé" type="url" registration={form.register("consentFileUrl")} error={errors.consentFileUrl?.message} placeholder="https://…" /></div>}
                <ToggleCard id="marketingConsent" label="Communication marketing" description="Le client accepte de recevoir les communications" registration={form.register("marketingConsent")} />
              </div>

              <div className="space-y-4 rounded-xl border border-white/[0.06] bg-black/10 p-3 sm:p-4">
                <p className="text-xs font-semibold text-white/70 font-one">Statut et classification</p>
                <ToggleCard id="isMinor" label="Client mineur" description="Active les informations du représentant légal" registration={form.register("isMinor")} icon={<UsersRound size={15} />} />
                {isMinor && <div className="grid gap-3 sm:grid-cols-2"><Field label="Nom du représentant" registration={form.register("guardianName")} error={errors.guardianName?.message} /><Field label="Téléphone du représentant" type="tel" registration={form.register("guardianPhone")} error={errors.guardianPhone?.message} /></div>}
                <Field label="Tags" icon={<Tag size={13} />} registration={form.register("tags")} placeholder="VIP, fidèle, suivi…" hint="Séparez les tags par une virgule." />
              </div>
            </div>
          </section>

          <section id="client-health" className="order-3 col-span-12 scroll-mt-5 rounded-2xl border border-white/10 bg-noir-600 p-4 sm:p-6">
            <SectionHeader eyebrow="03 · Informations facultatives" title="Informations médicales" description="Ces données sont facultatives, sensibles et utiles à la prise en charge." icon={<HeartPulse size={18} />} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <TextArea label="Allergies" registration={form.register("allergies")} placeholder="Allergies connues" />
              <TextArea label="Problèmes de santé" registration={form.register("healthIssues")} placeholder="Problèmes actuels" />
              <TextArea label="Médicaments" registration={form.register("medications")} placeholder="Traitements en cours" />
              <TextArea label="Historique des tatouages" registration={form.register("tattooHistory")} placeholder="Tatouages précédents…" />
              <TextArea label="Réactions antérieures" registration={form.register("previousReactions")} placeholder="Réactions, infections…" />
              <div className="flex items-center"><ToggleCard id="pregnancy" label="Grossesse / allaitement" description="Situation actuelle déclarée" registration={form.register("pregnancy")} /></div>
            </div>
          </section>

          {error && <div role="alert" className="order-8 col-span-12 rounded-xl border border-red-500/35 bg-red-500/10 p-3"><p className="text-xs text-red-300 font-two">{error}</p></div>}

          <footer className="sticky bottom-4 z-20 order-9 col-span-12 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-noir-600/95 p-4 shadow-xl shadow-black/20 backdrop-blur-xl">
            <p className="text-[11px] text-white/40"><span className="text-tertiary-400">*</span> Champs obligatoires</p><div className="ml-auto flex flex-wrap gap-2">
            <DashboardButton href="/clients" variant="secondary" className="!min-w-0 !rounded-xl !shadow-none">Annuler</DashboardButton>
            <DashboardButton type="submit" disabled={loading} className="!min-w-0 !rounded-xl !shadow-none">{loading ? <LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> : <Save size={14} aria-hidden="true" />}{loading ? "Création…" : "Créer le client"}</DashboardButton>
            </div>
          </footer>
        </form>
    </CreationWorkspace>
  );
}

function SectionHeader({ eyebrow, title, description, icon }: { eyebrow: string; title: string; description: string; icon: ReactNode }) {
  return <div className="mb-4 flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-tertiary-400">{icon}</span><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35 font-one">{eyebrow}</p><h3 className="mt-1 text-sm font-semibold text-white font-one sm:text-base tracking-tight">{title}</h3><p className="mt-1 text-[11px] leading-relaxed text-white/40 font-two">{description}</p></div></div>;
}

function Field({ label, type = "text", registration, error, placeholder, hint, icon, required = false }: { label: string; type?: string; registration: UseFormRegisterReturn; error?: string; placeholder?: string; hint?: string; icon?: ReactNode; required?: boolean }) {
  return <label className="block min-w-0"><span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-white/60 font-one">{icon}{label}{required && <span className="text-tertiary-400">*</span>}</span><input {...registration} type={type} aria-required={required} aria-invalid={!!error} aria-describedby={error || hint ? registration.name + "-help" : undefined} placeholder={placeholder} className={inputClass} />{error ? <span id={registration.name + "-help"} role="alert" className="mt-1 block text-[10px] text-red-300 font-two">{error}</span> : hint ? <span id={registration.name + "-help"} className="mt-1 block text-[10px] text-white/30 font-two">{hint}</span> : null}</label>;
}

function TextArea({ label, registration, placeholder }: { label: string; registration: UseFormRegisterReturn; placeholder?: string }) {
  return <label className="block"><span className="mb-1.5 block text-[11px] font-medium text-white/60 font-one">{label}</span><textarea {...registration} rows={2} placeholder={placeholder} className={`${inputClass} resize-y`} /></label>;
}

function ToggleCard({ id, label, description, registration, icon }: { id: string; label: string; description: string; registration: UseFormRegisterReturn; icon?: ReactNode }) {
  return <label htmlFor={id} className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 transition hover:border-white/15 hover:bg-white/[0.045]"><span className="flex items-center gap-2.5">{icon && <span className="text-tertiary-400">{icon}</span>}<span><span className="block text-xs font-medium text-white/80 font-one">{label}</span><span className="mt-0.5 block text-[10px] text-white/35 font-two">{description}</span></span></span><input {...registration} id={id} type="checkbox" className="peer sr-only" /><span aria-hidden="true" className="relative h-5 w-9 shrink-0 rounded-full bg-white/15 transition after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:transition peer-checked:bg-tertiary-400 peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-tertiary-400" /></label>;
}
