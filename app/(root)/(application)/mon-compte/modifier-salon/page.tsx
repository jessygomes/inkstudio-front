"use client";

import { useSession } from "next-auth/react";
import { UpdateSalonUserProps } from "@/lib/type";
import { CSSProperties, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateSalonSchema } from "@/lib/zod/validator.schema";
import { z } from "zod";
import SalonImageUploader from "@/components/Application/MonCompte/SalonImageUploader";
import PiercingManager from "@/components/Application/MonCompte/PiercingManager";
import { useRouter } from "next/navigation";
import BarLoader from "react-spinners/BarLoader";
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

  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "none",
  };
  const color = "#ff5500";

  if (!salon) {
    return (
      <div className="min-h-screen bg-noir-700 flex items-center justify-center">
        <BarLoader
          color={color}
          loading={!salon}
          cssOverride={override}
          width={300}
          height={5}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    );
  }

  return (
    <div className="w-full bg-noir-700">
      <div className="pt-4 lg:pt-24 px-3 lg:px-8">
        {/* Header responsive */}
        <div className="flex items-center gap-3 sm:gap-4 lg:max-w-6xl mx-auto mb-6 sm:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
            <Link
              href="/mon-compte"
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white/70 hover:text-white transition-all duration-200 border border-white/20"
            >
              ←
            </Link>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-one tracking-widest">
              <span className="hidden sm:inline">Modifier le salon</span>
              <span className="sm:hidden">Modifier salon</span>
            </h1>
            <p className="text-white/70 text-xs font-one mt-1">
              <span className="hidden sm:inline">
                Mettez à jour les informations de votre salon
              </span>
              <span className="sm:hidden">Mettez à jour vos infos</span>
            </p>
          </div>
        </div>

        {/* Form Content responsive */}
        <div className="w-full lg:max-w-6xl mx-auto bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-xl sm:rounded-3xl p-2 lg:p-8 border border-white/20 shadow-2xl">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 sm:space-y-6"
          >
            {/* Section: Image responsive */}
            <div className="bg-white/5 rounded-xl sm:rounded-2xl p-5 sm:p-4 border border-white/10">
              <h3 className="text-base sm:text-sm font-semibold text-tertiary-400 mb-4 sm:mb-3 font-one uppercase tracking-wide">
                <span className="hidden sm:inline">📸 Photo de profil</span>
                <span className="sm:hidden">📸 Photo</span>
              </h3>
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

            {/* Section: Informations générales responsive */}
            <div className="bg-white/5 rounded-xl sm:rounded-2xl p-2 lg:p-4 border border-white/10">
              <h3 className="text-base lg:text-sm font-semibold text-white mb-4 sm:mb-3 font-one uppercase tracking-wide">
                <span className="hidden sm:inline">
                  ℹ️ Informations générales
                </span>
                <span className="sm:hidden">ℹ️ Infos générales</span>
              </h3>
              <div className="space-y-5 sm:space-y-4">
                <div className="space-y-2 sm:space-y-1">
                  <label className="text-sm sm:text-xs text-white/70 font-one">
                    Nom du salon
                  </label>
                  <input
                    placeholder="Nom du salon"
                    {...form.register("salonName")}
                    className="w-full p-4 lg:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-md lg:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4">
                  <div className="space-y-2 sm:space-y-1">
                    <label className="text-sm sm:text-xs text-white/70 font-one">
                      <span className="hidden sm:inline">
                        Prénom du propriétaire
                      </span>
                      <span className="sm:hidden">Prénom</span>
                    </label>
                    <input
                      placeholder="Prénom"
                      {...form.register("firstName")}
                      className="w-full p-4 lg:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-md lg:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-1">
                    <label className="text-sm sm:text-xs text-white/70 font-one">
                      <span className="hidden sm:inline">
                        Nom du propriétaire
                      </span>
                      <span className="sm:hidden">Nom</span>
                    </label>
                    <input
                      placeholder="Nom"
                      {...form.register("lastName")}
                      className="w-full p-4 lg:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-md lg:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Contact et localisation responsive */}
            <div className="bg-white/5 rounded-xl sm:rounded-2xl p-5 sm:p-4 border border-white/10">
              <h3 className="text-base sm:text-sm font-semibold text-tertiary-400 mb-4 sm:mb-3 font-one uppercase tracking-wide">
                <span className="hidden sm:inline">
                  📍 Contact et localisation
                </span>
                <span className="sm:hidden">📍 Contact</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4">
                <div className="space-y-2 sm:space-y-1">
                  <label className="text-sm sm:text-xs text-white/70 font-one">
                    <span className="hidden sm:inline">N° de téléphone</span>
                    <span className="sm:hidden">Téléphone</span>
                  </label>
                  <input
                    placeholder="Téléphone"
                    {...form.register("phone")}
                    className="w-full p-4 lg:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-md lg:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                </div>

                <div className="space-y-2 sm:space-y-1">
                  <label className="text-sm sm:text-xs text-white/70 font-one">
                    Adresse
                  </label>
                  <input
                    placeholder="Adresse"
                    {...form.register("address")}
                    className="w-full p-4 lg:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-md lg:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                </div>

                <div className="space-y-2 sm:space-y-1">
                  <label className="text-sm sm:text-xs text-white/70 font-one">
                    Ville
                  </label>
                  <input
                    placeholder="Ville"
                    {...form.register("city")}
                    className="w-full p-4 lg:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-md lg:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                </div>

                <div className="space-y-2 sm:space-y-1">
                  <label className="text-sm sm:text-xs text-white/70 font-one">
                    Code postal
                  </label>
                  <input
                    placeholder="Code postal"
                    {...form.register("postalCode")}
                    className="w-full p-4 lg:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-md lg:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                </div>
              </div>
            </div>

            {/* Section: Réseaux sociaux responsive */}
            <div className="bg-white/5 rounded-xl sm:rounded-2xl p-5 sm:p-4 border border-white/10">
              <h3 className="text-base sm:text-sm font-semibold text-tertiary-400 mb-4 sm:mb-3 font-one uppercase tracking-wide">
                <span className="hidden sm:inline">
                  🌐 Réseaux sociaux et site web
                </span>
                <span className="sm:hidden">🌐 Réseaux</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4">
                <div className="space-y-2 sm:space-y-1">
                  <label className="text-sm sm:text-xs text-white/70 font-one">
                    Instagram
                  </label>
                  <input
                    placeholder="Lien Instagram"
                    {...form.register("instagram")}
                    className="w-full p-4 lg:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-md lg:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                </div>

                <div className="space-y-2 sm:space-y-1">
                  <label className="text-sm sm:text-xs text-white/70 font-one">
                    Facebook
                  </label>
                  <input
                    placeholder="Lien Facebook"
                    {...form.register("facebook")}
                    className="w-full p-4 lg:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-md lg:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                </div>

                <div className="space-y-2 sm:space-y-1">
                  <label className="text-sm sm:text-xs text-white/70 font-one">
                    TikTok
                  </label>
                  <input
                    placeholder="Lien TikTok"
                    {...form.register("tiktok")}
                    className="w-full p-4 lg:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-md lg:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                </div>

                <div className="space-y-2 sm:space-y-1">
                  <label className="text-sm sm:text-xs text-white/70 font-one">
                    Site Web
                  </label>
                  <input
                    placeholder="URL de votre site"
                    {...form.register("website")}
                    className="w-full p-4 lg:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-md lg:text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                </div>
              </div>
            </div>

            {/* Section: Description responsive */}
            <div className="bg-white/5 rounded-xl sm:rounded-2xl p-5 sm:p-4 border border-white/10">
              <h3 className="text-base sm:text-sm font-semibold text-tertiary-400 mb-4 sm:mb-3 font-one uppercase tracking-wide">
                📝 Description
              </h3>
              <div className="space-y-2 sm:space-y-1">
                <label className="text-sm sm:text-xs text-white/70 font-one">
                  <span className="hidden sm:inline">Description du salon</span>
                  <span className="sm:hidden">Description</span>
                </label>
                <textarea
                  placeholder="Décrivez votre salon, votre style, votre ambiance..."
                  {...form.register("description")}
                  rows={5}
                  className="w-full p-4 lg:p-2 bg-white/10 border border-white/20 rounded-lg text-white text-md lg:text-xs focus:outline-none focus:border-tertiary-400 transition-colors resize-none placeholder-white/50"
                />
              </div>
            </div>

            {/* Section: Prestations responsive */}
            <div className="bg-white/5 rounded-xl sm:rounded-2xl p-5 sm:p-4 border border-white/10">
              <h3 className="text-base sm:text-sm font-semibold text-tertiary-400 mb-4 sm:mb-3 font-one uppercase tracking-wide">
                <span className="hidden sm:inline">
                  💼 Prestations proposées
                </span>
                <span className="sm:hidden">💼 Prestations</span>
              </h3>

              <p className="text-sm sm:text-[11px] text-white/60 mb-4 sm:mb-3">
                <span className="hidden sm:inline">
                  Sélectionnez une ou plusieurs prestations proposées par le
                  salon.
                </span>
                <span className="sm:hidden">Sélectionnez vos prestations</span>
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
                  <div className="flex flex-wrap gap-3 sm:gap-2">
                    {options.map((opt) => {
                      const isActive = selected.includes(opt);
                      return (
                        <label
                          key={opt}
                          className={`cursor-pointer px-4 py-2.5 sm:px-3 sm:py-1.5 rounded-lg text-sm sm:text-[11px] font-one border transition
                ${
                  isActive
                    ? "bg-tertiary-500/20 text-tertiary-200 border-tertiary-400/40 text-tertiary-400"
                    : "bg-white/10 text-white/80 border-white/15 hover:bg-white/15"
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

            {/* Footer avec boutons d'action responsive */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 sm:gap-4 pt-6 sm:pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={() => router.push("/mon-compte")}
                className="cursor-pointer px-6 py-3 sm:px-6 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-md lg:text-xs text-center"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer px-8 sm:px-8 py-3 sm:py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-md lg:text-xs"
              >
                {isSubmitting ? (
                  <span className="hidden sm:inline">Enregistrement...</span>
                ) : (
                  <>
                    <span className="hidden sm:inline">
                      Sauvegarder les modifications
                    </span>
                    <span className="sm:hidden">Sauvegarder</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Section: Piercing Manager - Conditionally displayed */}
          {(() => {
            const selected = form.watch("prestations") ?? [];
            const showPiercing = selected.includes("PIERCING");

            if (!showPiercing) return null;

            return (
              <div className="my-10 bg-white/5 rounded-xl sm:rounded-2xl p-5 sm:p-4 border border-white/10">
                <h3 className="text-base sm:text-sm font-semibold text-tertiary-400 mb-4 sm:mb-3 font-one uppercase tracking-wide">
                  <span className="hidden sm:inline">
                    🎯 Configuration Piercing
                  </span>
                  <span className="sm:hidden">🎯 Piercing</span>
                </h3>
                <PiercingManager />
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
