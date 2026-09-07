"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FileCheck2, HeartPulse, Mail, MapPin, Phone, Save, Tag, UserRound, UsersRound } from "lucide-react";
import DashboardButton from "@/components/Shared/DashboardButton";
import { createOrUpdateClient } from "@/lib/queries/client";
import { clientSchema } from "@/lib/zod/validator.schema";

type ClientFormData = z.infer<typeof clientSchema>;

const inputClass = "w-full rounded-xl border border-white/10 bg-black/15 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/45 focus:bg-white/[0.045] focus:ring-2 focus:ring-tertiary-400/10 font-two";

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
      router.push("/application/clients");
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
    <div className="mx-auto w-full max-w-[1600px] pb-8">
      <div className=" !h-auto overflow-hidden !rounded-[28px] !p-0">
        <header className=" relative z-10 flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary-400 font-one">Nouveau client</p>
            <h2 className="text-lg font-semibold text-white font-one sm:text-xl">Créer une nouvelle fiche client</h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-white/45 font-one">Commencez par l’identité, puis complétez les informations administratives et de santé utiles.</p>
          </div>
          <div className="hidden items-center gap-2 xl:flex">
            {["Identité", "Dossier", "Santé"].map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                {index > 0 && <span className="h-px w-5 bg-white/10" />}
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-tertiary-400/25 bg-tertiary-500/10 text-[10px] font-semibold text-tertiary-400 font-one">{index + 1}</span>
                <span className="text-[11px] text-white/55 font-one">{step}</span>
              </div>
            ))}
          </div>
        </header>

        <form onSubmit={form.handleSubmit(onSubmit)} className="create-rdv-form tablet-inputs relative z-10 grid grid-cols-12 gap-4 p-3 sm:p-5 lg:p-6">
          <section className="order-1 col-span-12 overflow-hidden rounded-[22px] border border-tertiary-400/20 bg-gradient-to-br from-tertiary-500/10 via-[#181818] to-[#181818] p-4 sm:p-5">
            <SectionHeader eyebrow="Étape 1 · Identité" title="Qui est ce nouveau client ?" description="Les champs marqués d’un * sont obligatoires." icon={<UserRound size={18} />} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Prénom" required registration={form.register("firstName")} error={errors.firstName?.message} />
              <Field label="Nom" required registration={form.register("lastName")} error={errors.lastName?.message} />
              <Field label="E-mail" type="email" icon={<Mail size={13} />} registration={form.register("email")} error={errors.email?.message} />
              <Field label="Téléphone" type="tel" icon={<Phone size={13} />} registration={form.register("phone")} error={errors.phone?.message} placeholder="Optionnel" />
              <Field label="Date de naissance" type="date" registration={form.register("birthDate")} error={errors.birthDate?.message} />
              <Field label="Adresse" icon={<MapPin size={13} />} registration={form.register("address")} error={errors.address?.message} placeholder="Adresse complète" />
            </div>
          </section>

          <section className="dashboard-embedded-section order-2 col-span-12 rounded-2xl p-4 sm:p-5">
            <SectionHeader eyebrow="Étape 2 · Dossier" title="Informations administratives" description="Consentements, statut du client et repères internes." icon={<FileCheck2 size={18} />} />
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-black/15 p-3 sm:p-4">
                <p className="text-xs font-semibold text-white/70 font-one">Consentements</p>
                <ToggleCard id="consentSigned" label="Consentement signé" description="Le document légal a déjà été signé" registration={form.register("consentSigned")} />
                {consentSigned && <div className="grid gap-3 sm:grid-cols-2"><Field label="Date de signature" type="date" registration={form.register("consentSignedAt")} /><Field label="URL du PDF signé" type="url" registration={form.register("consentFileUrl")} error={errors.consentFileUrl?.message} placeholder="https://…" /></div>}
                <ToggleCard id="marketingConsent" label="Communication marketing" description="Le client accepte de recevoir les communications" registration={form.register("marketingConsent")} />
              </div>

              <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-black/15 p-3 sm:p-4">
                <p className="text-xs font-semibold text-white/70 font-one">Statut et classification</p>
                <ToggleCard id="isMinor" label="Client mineur" description="Active les informations du représentant légal" registration={form.register("isMinor")} icon={<UsersRound size={15} />} />
                {isMinor && <div className="grid gap-3 sm:grid-cols-2"><Field label="Nom du représentant" registration={form.register("guardianName")} error={errors.guardianName?.message} /><Field label="Téléphone du représentant" type="tel" registration={form.register("guardianPhone")} error={errors.guardianPhone?.message} /></div>}
                <Field label="Tags" icon={<Tag size={13} />} registration={form.register("tags")} placeholder="VIP, fidèle, suivi…" hint="Séparez les tags par une virgule." />
              </div>
            </div>
          </section>

          <section className="dashboard-embedded-section order-3 col-span-12 rounded-2xl p-4 sm:p-5">
            <SectionHeader eyebrow="Étape 3 · Santé" title="Informations médicales" description="Ces données sont facultatives, sensibles et utiles à la prise en charge." icon={<HeartPulse size={18} />} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <TextArea label="Allergies" registration={form.register("allergies")} placeholder="Allergies connues" />
              <TextArea label="Problèmes de santé" registration={form.register("healthIssues")} placeholder="Problèmes actuels" />
              <TextArea label="Médicaments" registration={form.register("medications")} placeholder="Traitements en cours" />
              <TextArea label="Historique des tatouages" registration={form.register("tattooHistory")} placeholder="Tatouages précédents…" />
              <TextArea label="Réactions antérieures" registration={form.register("previousReactions")} placeholder="Réactions, infections…" />
              <div className="flex items-center"><ToggleCard id="pregnancy" label="Grossesse / allaitement" description="Situation actuelle déclarée" registration={form.register("pregnancy")} /></div>
            </div>
          </section>

          {error && <div className="order-8 col-span-12 rounded-xl border border-red-500/35 bg-red-500/10 p-3"><p className="text-xs text-red-300 font-two">{error}</p></div>}

          <footer className="sticky bottom-0 z-20 order-9 col-span-12 -mx-3 -mb-3 flex flex-col-reverse justify-end gap-2 px-3 py-3 backdrop-blur-xl sm:-mx-5 sm:-mb-5 sm:flex-row sm:px-5 lg:-mx-6 lg:-mb-6 lg:px-6">
            <DashboardButton href="/application/clients" variant="secondary" className="w-full sm:w-auto">Annuler</DashboardButton>
            <DashboardButton type="submit" disabled={loading} className="w-full sm:w-auto"><Save size={14} />{loading ? "Création…" : "Créer le client"}</DashboardButton>
          </footer>
        </form>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, description, icon }: { eyebrow: string; title: string; description: string; icon: ReactNode }) {
  return <div className="mb-4 flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-tertiary-400/25 bg-tertiary-500/10 text-tertiary-400">{icon}</span><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-tertiary-400/80 font-one">{eyebrow}</p><h3 className="mt-1 text-sm font-semibold text-white font-one sm:text-base">{title}</h3><p className="mt-1 text-[11px] leading-relaxed text-white/40 font-two">{description}</p></div></div>;
}

function Field({ label, type = "text", registration, error, placeholder, hint, icon, required = false }: { label: string; type?: string; registration: UseFormRegisterReturn; error?: string; placeholder?: string; hint?: string; icon?: ReactNode; required?: boolean }) {
  return <label className="block min-w-0"><span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-white/60 font-one">{icon}{label}{required && <span className="text-tertiary-400">*</span>}</span><input {...registration} type={type} placeholder={placeholder} className={inputClass} />{error ? <span className="mt-1 block text-[10px] text-red-300 font-two">{error}</span> : hint ? <span className="mt-1 block text-[10px] text-white/30 font-two">{hint}</span> : null}</label>;
}

function TextArea({ label, registration, placeholder }: { label: string; registration: UseFormRegisterReturn; placeholder?: string }) {
  return <label className="block"><span className="mb-1.5 block text-[11px] font-medium text-white/60 font-one">{label}</span><textarea {...registration} rows={3} placeholder={placeholder} className={`${inputClass} resize-none`} /></label>;
}

function ToggleCard({ id, label, description, registration, icon }: { id: string; label: string; description: string; registration: UseFormRegisterReturn; icon?: ReactNode }) {
  return <label htmlFor={id} className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 transition hover:border-white/15 hover:bg-white/[0.045]"><span className="flex items-center gap-2.5">{icon && <span className="text-tertiary-400">{icon}</span>}<span><span className="block text-xs font-medium text-white/80 font-one">{label}</span><span className="mt-0.5 block text-[10px] text-white/35 font-two">{description}</span></span></span><input {...registration} id={id} type="checkbox" className="h-4 w-4 shrink-0 accent-tertiary-400" /></label>;
}
