
"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { clientSchema } from "@/lib/zod/validator.schema";
import { toast } from "sonner";
import { RiHealthBookLine } from "react-icons/ri";
import { CiUser } from "react-icons/ci";
import { createOrUpdateClient } from "@/lib/queries/client";
import { useRouter } from "next/navigation";
import DashboardButton from "@/components/Shared/DashboardButton";

export default function CreateClientForm({ userId }: { userId: string }) {
  const [error, setError] = useState<string | undefined>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const inputClass =
    "w-full rounded-2xl border border-white/15 bg-white/8 px-3 py-2 font-one text-xs text-white placeholder:text-white/35 focus:outline-none focus:border-tertiary-400 focus:ring-1 focus:ring-tertiary-400/30 transition-colors";
  const textareaClass = `${inputClass} resize-none`;
  const labelClass = "text-[11px] uppercase tracking-wide text-white/65 font-one";
  const errorClass = "text-red-300 text-xs mt-1";

  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      birthDate: "",
      address: "",
      consentSigned: false,
      consentSignedAt: "",
      consentFileUrl: "",
      isMinor: false,
      guardianName: "",
      guardianPhone: "",
      tags: "",
      marketingConsent: false,
      allergies: "",
      healthIssues: "",
      medications: "",
      pregnancy: false,
      previousReactions: "",
      tattooHistory: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof clientSchema>) => {
    setLoading(true);
    setError("");
    // Transformation des champs spécifiques
    const processedData = {
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate).toISOString() : undefined,
      consentSignedAt: data.consentSignedAt ? new Date(data.consentSignedAt).toISOString() : undefined,
      tags: typeof data.tags === "string" ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : data.tags,
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

  const isMinor = form.watch("isMinor");
  const consentSigned = form.watch("consentSigned");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="tablet-inputs space-y-4 mx-auto mt-2 bg-noir-500 p-4 rounded-2xl ">
      <div className="dashboard-embedded-section rounded-2xl border border-white/10 p-4">
        <div className="mb-3 flex items-center gap-2">
          <CiUser size={18} className="text-tertiary-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white font-one">
            Identité et contact
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className={labelClass}>Prénom</label>
            <input {...form.register("firstName")} className={inputClass} />
            {form.formState.errors.firstName && <p className={errorClass}>{form.formState.errors.firstName.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Nom</label>
            <input {...form.register("lastName")} className={inputClass} />
            {form.formState.errors.lastName && <p className={errorClass}>{form.formState.errors.lastName.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input {...form.register("email")} type="email" className={inputClass} />
            {form.formState.errors.email && <p className={errorClass}>{form.formState.errors.email.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Téléphone</label>
            <input {...form.register("phone")} type="tel" className={inputClass} placeholder="Optionnel" />
            {form.formState.errors.phone && <p className={errorClass}>{form.formState.errors.phone.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Date de naissance</label>
            <input {...form.register("birthDate")} type="date" className={inputClass} />
            {form.formState.errors.birthDate && <p className={errorClass}>{form.formState.errors.birthDate.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Adresse</label>
            <input {...form.register("address")} className={inputClass} placeholder="Optionnel" />
            {form.formState.errors.address && <p className={errorClass}>{form.formState.errors.address.message}</p>}
          </div>
        </div>
      </div>

      <div className="dashboard-embedded-section rounded-2xl border border-white/10 p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white font-one">
          Consentement et statut
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="col-span-1 md:col-span-2 inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-3 py-2 text-xs text-white/85">
            <input {...form.register("consentSigned")} type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/10 text-tertiary-400" />
            Consentement signé
          </label>

          {consentSigned && (
            <>
              <div>
                <label className={labelClass}>Date de signature</label>
                <input {...form.register("consentSignedAt")} type="date" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>URL du PDF signé</label>
                <input {...form.register("consentFileUrl")} type="url" className={inputClass} placeholder="Optionnel" />
                {form.formState.errors.consentFileUrl && <p className={errorClass}>{form.formState.errors.consentFileUrl.message}</p>}
              </div>
            </>
          )}

          <label className="col-span-1 md:col-span-2 inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-3 py-2 text-xs font-one text-white/85">
            <input {...form.register("isMinor")} type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/10 text-tertiary-400" />
            Client mineur
          </label>

          {isMinor && (
            <>
              <div>
                <label className={labelClass}>Nom du tuteur</label>
                <input {...form.register("guardianName")} className={inputClass} />
                {form.formState.errors.guardianName && <p className={errorClass}>{form.formState.errors.guardianName.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Téléphone du tuteur</label>
                <input {...form.register("guardianPhone")} className={inputClass} />
                {form.formState.errors.guardianPhone && <p className={errorClass}>{form.formState.errors.guardianPhone.message}</p>}
              </div>
            </>
          )}

          <div className="md:col-span-2">
            <label className={labelClass}>Tags (séparés par virgule)</label>
            <input {...form.register("tags")} className={inputClass} placeholder="ex: VIP, fidèle, suivi" />
          </div>

          <label className="md:col-span-2 inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-3 py-2 text-xs font-one text-white/85">
            <input {...form.register("marketingConsent")} type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/10 text-tertiary-400" />
            Consentement marketing
          </label>
        </div>
      </div>

      <div className="dashboard-embedded-section rounded-2xl border border-white/10 p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white font-one">
          <RiHealthBookLine size={18} className="text-tertiary-400" /> Historique médical
        </h3>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className={labelClass}>Allergies</label>
            <textarea {...form.register("allergies")} className={textareaClass} rows={3} placeholder="Optionnel" />
          </div>
          <div>
            <label className={labelClass}>Problèmes de santé</label>
            <textarea {...form.register("healthIssues")} className={textareaClass} rows={3} placeholder="Optionnel" />
          </div>
          <div>
            <label className={labelClass}>Médicaments</label>
            <textarea {...form.register("medications")} className={textareaClass} rows={3} placeholder="Optionnel" />
          </div>
          <div>
            <label className={labelClass}>Historique tatouages</label>
            <textarea {...form.register("tattooHistory")} className={textareaClass} rows={3} placeholder="Optionnel" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Réactions antérieures</label>
            <textarea {...form.register("previousReactions")} className={textareaClass} rows={2} placeholder="Optionnel" />
          </div>
          <label className="md:col-span-2 inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-3 py-2 text-xs text-white/85">
            <input {...form.register("pregnancy")} type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/10 text-tertiary-400" />
            Enceinte ou allaite actuellement
          </label>
        </div>
      </div>

      {error && (
        <div className="dashboard-embedded-section rounded-xl border border-red-500/50 bg-red-500/20 p-3">
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      <div className="dashboard-embedded-footer flex justify-end gap-3 border-t border-white/10 bg-white/5 p-4">
        <DashboardButton type="submit" disabled={loading}>
          {loading ? "Création..." : "Créer le client"}
        </DashboardButton>
      </div>
    </form>
  );
}
