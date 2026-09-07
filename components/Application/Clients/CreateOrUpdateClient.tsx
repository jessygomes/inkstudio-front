"use client";

import { useState, type ReactNode } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  AlertTriangle,
  ChevronDown,
  FileCheck2,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Tag,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import DashboardButton from "@/components/Shared/DashboardButton";
import type { ClientProps } from "@/lib/type";
import { createOrUpdateClient } from "@/lib/queries/client";
import { clientSchema } from "@/lib/zod/validator.schema";

type ClientFormData = z.infer<typeof clientSchema>;

interface CreateOrUpdateClientProps {
  onCreate: () => void;
  existingClient?: ClientProps | null;
  setIsOpen?: (isOpen: boolean) => void;
}

const inputClass = "w-full rounded-xl border border-white/10 bg-black/15 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/45 focus:bg-white/[0.045] focus:ring-2 focus:ring-tertiary-400/10 font-two";

export default function CreateOrUpdateClient({ onCreate, existingClient, setIsOpen = () => {} }: CreateOrUpdateClientProps) {
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [showMedicalHistory, setShowMedicalHistory] = useState(Boolean(existingClient?.medicalHistory));
  const isEditing = Boolean(existingClient);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      firstName: existingClient?.firstName || "",
      lastName: existingClient?.lastName || "",
      phone: existingClient?.phone || "",
      email: existingClient?.email || "",
      birthDate: existingClient?.birthDate ? new Date(existingClient.birthDate).toISOString().split("T")[0] : "",
      address: existingClient?.address || "",
      consentSigned: existingClient?.consentSigned || false,
      consentSignedAt: existingClient?.consentSignedAt ? new Date(existingClient.consentSignedAt).toISOString().split("T")[0] : "",
      consentFileUrl: existingClient?.consentFileUrl || "",
      isMinor: existingClient?.isMinor || false,
      guardianName: existingClient?.guardianName || "",
      guardianPhone: existingClient?.guardianPhone || "",
      tags: Array.isArray(existingClient?.tags) ? existingClient.tags.join(", ") : existingClient?.tags || "",
      marketingConsent: existingClient?.marketingConsent || false,
      allergies: existingClient?.medicalHistory?.allergies || "",
      healthIssues: existingClient?.medicalHistory?.healthIssues || "",
      medications: existingClient?.medicalHistory?.medications || "",
      pregnancy: existingClient?.medicalHistory?.pregnancy || false,
      previousReactions: existingClient?.medicalHistory?.previousReactions || "",
      tattooHistory: existingClient?.medicalHistory?.tattooHistory || "",
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true);
    setError(undefined);
    setSuccess(undefined);
    const processedData = {
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate).toISOString() : undefined,
      consentSignedAt: data.consentSignedAt ? new Date(data.consentSignedAt).toISOString() : undefined,
      tags: typeof data.tags === "string" ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : data.tags,
    };
    const url = existingClient
      ? `${process.env.NEXT_PUBLIC_BACK_URL}/clients/update/${existingClient.id}`
      : `${process.env.NEXT_PUBLIC_BACK_URL}/clients`;

    try {
      const result = await createOrUpdateClient(processedData, existingClient ? "PATCH" : "POST", url);
      if (result.error) {
        setError(result.message?.includes("Limite de fiches clients atteinte") ? "SAAS_LIMIT" : result.message || "Une erreur est survenue.");
        return;
      }
      if (!result.ok) {
        setError("Une erreur est survenue côté serveur.");
        return;
      }
      const message = result.message || (isEditing ? "Client modifié avec succès !" : "Client créé avec succès !");
      setSuccess(message);
      toast.success(message);
      form.reset();
      onCreate();
    } catch (submitError) {
      console.error("Erreur lors de l’enregistrement du client :", submitError);
      setError("Une erreur est survenue lors de l’enregistrement du client.");
    } finally {
      setLoading(false);
    }
  };

  const errors = form.formState.errors;
  const isMinor = form.watch("isMinor");
  const isConsentSigned = form.watch("consentSigned");

  return (
    <div data-modal role="dialog" aria-modal="true" aria-labelledby="client-form-title" className="fixed inset-0 z-[9999] flex h-[100dvh] w-screen items-end justify-center overflow-hidden bg-noir-700 lg:items-center lg:bg-black/65 lg:p-4 lg:backdrop-blur-md">
      <form onSubmit={form.handleSubmit(onSubmit)} className="dashboard-embedded-panel relative flex h-full min-h-0 w-full flex-col overflow-hidden border-0 lg:h-auto lg:max-h-[92vh] lg:max-w-6xl lg:rounded-[28px] lg:border lg:border-white/15 lg:shadow-2xl lg:shadow-black/40">
        <header className="dashboard-embedded-header relative shrink-0 overflow-hidden border-b border-white/[0.08] px-4 py-4 sm:px-6 lg:px-7">
          <div className="pointer-events-none absolute -left-20 -top-24 h-52 w-52 rounded-full bg-tertiary-400/10 blur-3xl" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-tertiary-400/25 bg-tertiary-400/10 text-tertiary-400"><UserRound size={20} /></div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary-400/75 font-one">{isEditing ? "Édition du dossier" : "Nouveau dossier"}</p>
                <h2 id="client-form-title" className="mt-1 truncate text-lg font-semibold text-white font-one sm:text-xl">{isEditing ? `${existingClient?.firstName} ${existingClient?.lastName}` : "Ajouter un client"}</h2>
                <p className="mt-0.5 hidden text-xs text-white/40 font-two sm:block">{isEditing ? "Mettez à jour les informations utiles du client" : "Renseignez les informations nécessaires à la création du profil"}</p>
              </div>
            </div>
            <DashboardButton variant="secondary" onClick={() => setIsOpen(false)} className="!h-10 !min-w-10 !rounded-xl !p-0" ><span className="sr-only">Fermer</span><X size={17} /></DashboardButton>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-5 lg:p-6">
          <div className="grid gap-4 lg:grid-cols-12">
            <FormSection icon={<UserRound size={17} />} title="Identité et contact" description="Coordonnées principales du client" className="lg:col-span-7">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Prénom" required registration={form.register("firstName")} error={errors.firstName?.message} />
                <Field label="Nom" required registration={form.register("lastName")} error={errors.lastName?.message} />
                <Field label="E-mail" type="email" icon={<Mail size={13} />} registration={form.register("email")} error={errors.email?.message} />
                <Field label="Téléphone" type="tel" icon={<Phone size={13} />} registration={form.register("phone")} error={errors.phone?.message} />
                <Field label="Date de naissance" type="date" registration={form.register("birthDate")} error={errors.birthDate?.message} />
                <Field label="Adresse" icon={<MapPin size={13} />} registration={form.register("address")} error={errors.address?.message} placeholder="Adresse complète" />
              </div>
            </FormSection>

            <FormSection icon={<FileCheck2 size={17} />} title="Dossier client" description="Consentements et classification" className="lg:col-span-5">
              <div className="space-y-3">
                <ToggleCard id="consentSigned" label="Consentement signé" description="Le document légal a été signé" registration={form.register("consentSigned")} />
                {isConsentSigned && (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <Field label="Date de signature" type="date" registration={form.register("consentSignedAt")} />
                    <Field label="URL du document" type="url" registration={form.register("consentFileUrl")} placeholder="https://…" />
                  </div>
                )}
                <ToggleCard id="marketingConsent" label="Communication marketing" description="Le client accepte les communications" registration={form.register("marketingConsent")} />
                <Field label="Tags" icon={<Tag size={13} />} registration={form.register("tags")} placeholder="fidèle, VIP, allergique…" hint="Séparez les tags par une virgule." />
              </div>
            </FormSection>

            <FormSection icon={<UsersRound size={17} />} title="Représentant légal" description="À compléter uniquement pour un client mineur" className="lg:col-span-12">
              <ToggleCard id="isMinor" label="Client mineur" description="Active les coordonnées du représentant légal" registration={form.register("isMinor")} compact />
              {isMinor && <div className="mt-3 grid gap-3 sm:grid-cols-2"><Field label="Nom du représentant" registration={form.register("guardianName")} error={errors.guardianName?.message} /><Field label="Téléphone du représentant" type="tel" registration={form.register("guardianPhone")} error={errors.guardianPhone?.message} /></div>}
            </FormSection>

            <section className="dashboard-embedded-section overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] lg:col-span-12">
              <DashboardButton type="button" variant="secondary" onClick={() => setShowMedicalHistory((current) => !current)} className="!min-h-16 !w-full !min-w-0 !justify-between !rounded-none !border-0 !bg-transparent !px-4 sm:!px-5">
                <span className="flex items-center gap-3 text-left"><span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-tertiary-400"><HeartPulse size={17} /></span><span><span className="block text-sm font-semibold text-white">Informations de santé</span><span className="mt-0.5 block text-[11px] font-normal text-white/40 font-two">Antécédents médicaux facultatifs et confidentiels</span></span></span>
                <ChevronDown size={17} className={`text-white/45 transition-transform ${showMedicalHistory ? "rotate-180" : ""}`} />
              </DashboardButton>
              {showMedicalHistory && (
                <div className="grid gap-3 border-t border-white/[0.08] p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
                  <TextArea label="Allergies" registration={form.register("allergies")} placeholder="Allergies connues" />
                  <TextArea label="Problèmes de santé" registration={form.register("healthIssues")} placeholder="Problèmes actuels" />
                  <TextArea label="Médicaments" registration={form.register("medications")} placeholder="Traitements en cours" />
                  <TextArea label="Historique des tatouages" registration={form.register("tattooHistory")} placeholder="Tatouages précédents…" />
                  <TextArea label="Réactions antérieures" registration={form.register("previousReactions")} placeholder="Réactions, infections…" />
                  <div className="flex items-center"><ToggleCard id="pregnancy" label="Grossesse / allaitement" description="Situation actuelle déclarée" registration={form.register("pregnancy")} compact /></div>
                </div>
              )}
            </section>

            {error && <div className={`rounded-2xl border p-4 lg:col-span-12 ${error === "SAAS_LIMIT" ? "border-amber-400/25 bg-amber-400/[0.08]" : "border-red-400/25 bg-red-400/[0.08]"}`}><div className="flex items-start gap-3"><AlertTriangle size={18} className={error === "SAAS_LIMIT" ? "text-amber-300" : "text-red-300"} /><div><p className="text-sm font-semibold text-white font-one">{error === "SAAS_LIMIT" ? "Limite de plan atteinte" : "Enregistrement impossible"}</p><p className="mt-1 text-xs text-white/60 font-two">{error === "SAAS_LIMIT" ? "Votre plan actuel ne permet pas d’ajouter une fiche client supplémentaire." : error}</p>{error === "SAAS_LIMIT" && <DashboardButton href="/parametres" className="mt-3 !min-w-0">Changer de plan</DashboardButton>}</div></div></div>}
            {success && <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.08] p-4 text-xs text-emerald-200 lg:col-span-12 font-two"><ShieldCheck size={17} />{success}</div>}
          </div>
        </div>

        <footer className="dashboard-embedded-footer flex shrink-0 items-center justify-end gap-2 border-t border-white/[0.08] px-4 py-3 sm:px-6 lg:px-7">
          <DashboardButton type="button" variant="secondary" onClick={() => setIsOpen(false)} className="!min-w-[110px]">Annuler</DashboardButton>
          <DashboardButton type="submit" disabled={loading} className="!min-w-[160px]"><Save size={14} />{loading ? "Enregistrement…" : isEditing ? "Enregistrer" : "Créer le client"}</DashboardButton>
        </footer>
      </form>
    </div>
  );
}

function FormSection({ icon, title, description, className = "", children }: { icon: ReactNode; title: string; description: string; className?: string; children: ReactNode }) {
  return <section className={`dashboard-embedded-section rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5 ${className}`}><div className="mb-4 flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-tertiary-400">{icon}</span><div><h3 className="text-sm font-semibold text-white font-one">{title}</h3><p className="mt-0.5 text-[11px] text-white/40 font-two">{description}</p></div></div>{children}</section>;
}

function Field({ label, type = "text", registration, error, placeholder, hint, icon, required = false }: { label: string; type?: string; registration: UseFormRegisterReturn; error?: string; placeholder?: string; hint?: string; icon?: ReactNode; required?: boolean }) {
  return <label className="block min-w-0"><span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-white/60 font-one">{icon}{label}{required && <span className="text-tertiary-400">*</span>}</span><input {...registration} type={type} placeholder={placeholder} className={inputClass} />{error ? <span className="mt-1 block text-[10px] text-red-300 font-two">{error}</span> : hint ? <span className="mt-1 block text-[10px] text-white/30 font-two">{hint}</span> : null}</label>;
}

function TextArea({ label, registration, placeholder }: { label: string; registration: UseFormRegisterReturn; placeholder?: string }) {
  return <label className="block"><span className="mb-1.5 block text-[11px] font-medium text-white/60 font-one">{label}</span><textarea {...registration} rows={3} placeholder={placeholder} className={`${inputClass} resize-none`} /></label>;
}

function ToggleCard({ id, label, description, registration, compact = false }: { id: string; label: string; description: string; registration: UseFormRegisterReturn; compact?: boolean }) {
  return <label htmlFor={id} className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-black/10 ${compact ? "w-full p-3" : "p-3.5"}`}><span><span className="block text-xs font-medium text-white/80 font-one">{label}</span><span className="mt-0.5 block text-[10px] text-white/35 font-two">{description}</span></span><input {...registration} id={id} type="checkbox" className="h-4 w-4 shrink-0 accent-tertiary-400" /></label>;
}
