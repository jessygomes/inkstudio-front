"use client";

import { useUser } from "@/components/Auth/Context/UserContext";
import { UpdateSalonUserProps } from "@/lib/type";
import { CSSProperties, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateSalonSchema } from "@/lib/zod/validator.schema";
import { z } from "zod";
import SalonImageUploader from "@/components/Application/MonCompte/SalonImageUploader";
import { useRouter } from "next/navigation";
import BarLoader from "react-spinners/BarLoader";
import Link from "next/link";

export default function UpdateAccountPage() {
  const user = useUser();
  const router = useRouter();
  const [salon, setSalon] = useState<UpdateSalonUserProps | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof updateSalonSchema>>({
    resolver: zodResolver(updateSalonSchema),
  });

  useEffect(() => {
    const fetchSalon = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/users/${user.id}`,
          { method: "GET" }
        );

        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        setSalon(data);

        // Mettre à jour les valeurs du formulaire
        form.reset({
          ...data,
          instagram: data.instagram ?? undefined,
          facebook: data.facebook ?? undefined,
          tiktok: data.tiktok ?? undefined,
          website: data.website ?? undefined,
          description: data.description ?? undefined,
          image: data.image ?? undefined,
        });
      } catch (error) {
        console.error("Error fetching salon data:", error);
      }
    };

    fetchSalon();
  }, [user?.id, form]);

  const onSubmit = async (data: z.infer<typeof updateSalonSchema>) => {
    if (!salon) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/users/${salon.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (res.ok) {
        router.push("/mon-compte");
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
          // size={150}
          width={300}
          height={5}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir-700">
      <div className="container mx-auto ">
        {/* Header */}
        <div className="mb-8">
          <div className="w-full bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href="/mon-compte"
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white/70 hover:text-white transition-all duration-200 border border-white/20"
                >
                  ←
                </Link>
              </div>
              <div className="space-y-2 w-full">
                <h1 className="text-3xl font-bold text-white font-one tracking-widest text-center">
                  Modifier le salon
                </h1>
                <p className="text-white/70 font-one text-sm text-center">
                  Mettez à jour les informations de votre salon
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl p-8 border-white/20 shadow-2xl">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Section: Informations générales */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                ℹ️ Informations générales
              </h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    Nom du salon
                  </label>
                  <input
                    placeholder="Nom du salon"
                    {...form.register("salonName")}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-white/70 font-one">
                      Prénom du propriétaire
                    </label>
                    <input
                      placeholder="Prénom"
                      {...form.register("firstName")}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-white/70 font-one">
                      Nom du propriétaire
                    </label>
                    <input
                      placeholder="Nom"
                      {...form.register("lastName")}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Contact et localisation */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                📍 Contact et localisation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    N° de téléphone
                  </label>
                  <input
                    placeholder="Téléphone"
                    {...form.register("phone")}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    Adresse
                  </label>
                  <input
                    placeholder="Adresse"
                    {...form.register("address")}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    Ville
                  </label>
                  <input
                    placeholder="Ville"
                    {...form.register("city")}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    Code postal
                  </label>
                  <input
                    placeholder="Code postal"
                    {...form.register("postalCode")}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                </div>
              </div>
            </div>

            {/* Section: Réseaux sociaux */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                🌐 Réseaux sociaux et site web
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    Instagram
                  </label>
                  <input
                    placeholder="Lien Instagram"
                    {...form.register("instagram")}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    Facebook
                  </label>
                  <input
                    placeholder="Lien Facebook"
                    {...form.register("facebook")}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    TikTok
                  </label>
                  <input
                    placeholder="Lien TikTok"
                    {...form.register("tiktok")}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    Site Web
                  </label>
                  <input
                    placeholder="URL de votre site"
                    {...form.register("website")}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                </div>
              </div>
            </div>

            {/* Section: Description */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                📝 Description
              </h3>
              <div className="space-y-1">
                <label className="text-xs text-white/70 font-one">
                  Description du salon
                </label>
                <textarea
                  placeholder="Décrivez votre salon, votre style, votre ambiance..."
                  {...form.register("description")}
                  rows={4}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors resize-none placeholder-white/50"
                />
              </div>
            </div>

            {/* Section: Image */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                📸 Photo de profil
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

            {/* Footer avec boutons d'action */}
            <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={() => router.back()}
                className="cursor-pointer px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer px-8 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs"
              >
                {isSubmitting
                  ? "Enregistrement..."
                  : "Sauvegarder les modifications"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
