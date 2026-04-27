"use client";

import { useSession } from "next-auth/react";
import { UpdateSalonUserProps } from "@/lib/type";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateSalonSchema } from "@/lib/zod/validator.schema";
import { z } from "zod";
import SalonImageUploader from "@/components/Application/MonCompte/SalonImageUploader";
import PiercingManager from "@/components/Application/MonCompte/PiercingManager";
import SkeletonForm from "@/components/Skeleton/SkeletonForm";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateUserInfoAction, getUserInfoAction } from "@/lib/queries/user";
import { toast } from "sonner";

export default function UpdateAccountPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [salon, setSalon] = useState<UpdateSalonUserProps | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof updateSalonSchema>>({
    resolver: zodResolver(updateSalonSchema),
  });

  useEffect(() => {
    const fetchSalon = async () => {
      if (!session?.user?.id) return;

      try {
        const result = await getUserInfoAction(session.user.id);

        if (result.ok) {
          setSalon(result.data);

          // Mettre à jour les valeurs du formulaire
          form.reset({
            ...result.data,
            instagram: result.data.instagram ?? undefined,
            facebook: result.data.facebook ?? undefined,
            tiktok: result.data.tiktok ?? undefined,
            website: result.data.website ?? undefined,
            description: result.data.description ?? undefined,
            image: result.data.image ?? undefined,
            prestations: result.data.prestations ?? [],
          });
        } else {
          console.error("Error fetching salon data:", result.message);
        }
      } catch (error) {
        console.error("Error fetching salon data:", error);
      }
    };

    fetchSalon();
  }, [session?.user?.id, form]);

  const onSubmit = async (data: z.infer<typeof updateSalonSchema>) => {
    if (!salon) return;

    setIsSubmitting(true);
    try {
      const result = await updateUserInfoAction(data);

      if (result.ok) {
        toast.success("Salon mis à jour avec succès !");
      } else {
        console.error("Erreur lors de la mise à jour:", result.message);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectionTitleClass =
    "mb-2 text-[14px] font-semibold tracking-widest text-white font-one";
  const labelClass =
    "text-[10px] uppercase tracking-wider text-white/50 font-one";
  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs text-white placeholder:text-white/35 focus:border-tertiary-400/40 focus:outline-none font-one";

  if (!salon) {
    return <SkeletonForm />;
  }

  return (
    <div className="wrapper-global pb-16 sm:pb-10 px-3 sm:px-4 lg:px-6">
      <section className="w-full space-y-3 pt-4 pb-10 xl:pb-0">
        <div className="dashboard-hero flex items-center gap-3 px-4 py-3 sm:px-5 lg:py-2.5">
          <div className="flex h-10 w-10 items-center justify-center">
            <Link
              href="/mon-compte"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-white/8 text-white/70 transition-colors hover:bg-white/12 hover:text-white"
            >
              ←
            </Link>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-white/50 font-one">
              Mon compte
            </p>
            <h1 className="text-base font-bold uppercase tracking-wide text-white font-one sm:text-lg">
              Modifier le salon
            </h1>
            <p className="mt-0.5 text-[11px] text-white/70 font-one">
              Mettez a jour les informations de votre salon.
            </p>
          </div>
        </div>

        <div className=" w-full rounded-2xl border border-white/10 bg-white/4 p-3 sm:p-4">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-2.5"
          >
            <div className=" p-3 sm:p-4">
              <h3 className={sectionTitleClass}>Photo de profil</h3>
              <SalonImageUploader
                currentImage={form.watch("image") || salon.image || undefined}
                onImageUpload={(imageUrl) => {
                  form.setValue("image", imageUrl);
                }}
                onImageRemove={() => {
                  form.setValue("image", undefined);
                }}
              />
            </div>

            <div className="p-3 sm:p-4">
              <h3 className={sectionTitleClass}>Informations générales</h3>
              <div className="space-y-2.5">
                <div className="space-y-1">
                  <label className={labelClass}>Nom du salon</label>
                  <input
                    placeholder="Nom du salon"
                    {...form.register("salonName")}
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className={labelClass}>Prénom du propriétaire</label>
                    <input
                      placeholder="Prénom"
                      {...form.register("firstName")}
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={labelClass}>Nom du propriétaire</label>
                    <input
                      placeholder="Nom"
                      {...form.register("lastName")}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4">
              <h3 className={sectionTitleClass}>Contact et localisation</h3>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className={labelClass}>Téléphone</label>
                  <input
                    placeholder="Téléphone"
                    {...form.register("phone")}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Adresse</label>
                  <input
                    placeholder="Adresse"
                    {...form.register("address")}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Ville</label>
                  <input
                    placeholder="Ville"
                    {...form.register("city")}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Code postal</label>
                  <input
                    placeholder="Code postal"
                    {...form.register("postalCode")}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4">
              <h3 className={sectionTitleClass}>Réseaux sociaux et site web</h3>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className={labelClass}>Instagram</label>
                  <input
                    placeholder="Lien Instagram"
                    {...form.register("instagram")}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Facebook</label>
                  <input
                    placeholder="Lien Facebook"
                    {...form.register("facebook")}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>TikTok</label>
                  <input
                    placeholder="Lien TikTok"
                    {...form.register("tiktok")}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Site web</label>
                  <input
                    placeholder="URL de votre site"
                    {...form.register("website")}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="dashboard-embedded-section p-3 sm:p-4">
              <h3 className={sectionTitleClass}>Description</h3>
              <div className="space-y-1">
                <label className={labelClass}>Description du salon</label>
                <textarea
                  placeholder="Décrivez votre salon, votre style, votre ambiance..."
                  {...form.register("description")}
                  rows={5}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>

            <div className="dashboard-embedded-section p-3 sm:p-4">
              <h3 className={sectionTitleClass}>Prestations proposées</h3>

              <p className="mb-3 text-[11px] text-white/60 font-one">
                Sélectionnez une ou plusieurs prestations proposées par le salon.
              </p>

              {(() => {
                const options = [
                  "TATTOO",
                  "RETOUCHE",
                  "PROJET",
                  "PIERCING",
                ] as const;
                const selected = form.watch("prestations") ?? [];

                return (
                  <div className="flex flex-wrap gap-1.5">
                    {options.map((opt) => {
                      const isActive = selected.includes(opt);
                      return (
                        <label
                          key={opt}
                          className={`cursor-pointer rounded-[10px] border px-2.5 py-1 text-[11px] font-one transition
                ${
                  isActive
                    ? "border-tertiary-400/40 bg-tertiary-500/20 text-tertiary-500"
                    : "border-white/15 bg-white/10 text-white/80 hover:bg-white/15"
                }`}
                        >
                          <input
                            type="checkbox"
                            value={opt}
                            {...form.register("prestations")}
                            className="sr-only"
                          />
                          {opt}
                        </label>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div className=" flex flex-col justify-end gap-2 py-3 sm:flex-row sm:items-center sm:rounded-b-2xl">
              <button
                type="button"
                onClick={() => router.push("/mon-compte")}
                className="cursor-pointer inline-flex h-9 items-center justify-center rounded-[14px] border border-white/12 bg-white/8 px-4 text-[11px] font-medium text-white/85 transition-colors hover:bg-white/12 font-one"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer inline-flex h-9 items-center justify-center rounded-[14px] bg-gradient-to-r from-tertiary-400 to-tertiary-500 px-4 text-[11px] font-medium text-white transition-all duration-200 hover:from-tertiary-500 hover:to-tertiary-600 disabled:opacity-50 disabled:cursor-not-allowed font-one"
              >
                {isSubmitting ? (
                  <span>Enregistrement...</span>
                ) : (
                  <span>Sauvegarder les modifications</span>
                )}
              </button>
            </div>
          </form>

          {(() => {
            const selected = form.watch("prestations") ?? [];
            const showPiercing = selected.includes("PIERCING");

            if (!showPiercing) return null;

            return (
              <div className="dashboard-embedded-section mt-2.5 p-3 sm:p-4">
                <h3 className={sectionTitleClass}>Configuration piercing</h3>
                <PiercingManager />
              </div>
            );
          })()}
        </div>
      </section>
    </div>
  );
}
