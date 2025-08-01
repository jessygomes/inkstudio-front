"use client";

import { useUser } from "@/components/Auth/Context/UserContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createTatoueurSchema } from "@/lib/zod/validator.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { TatoueurProps } from "@/components/Application/MonCompte/TatoueurSalon";
import Link from "next/link";
import TatoueurImageUploader from "@/components/Application/MonCompte/TatoueurImageUploader";

import { CiUser } from "react-icons/ci";
import { TbClockHour5 } from "react-icons/tb";

type Horaire = {
  [key: string]: { start: string; end: string } | null;
};

const daysOfWeek = [
  { key: "monday", label: "Lundi" },
  { key: "tuesday", label: "Mardi" },
  { key: "wednesday", label: "Mercredi" },
  { key: "thursday", label: "Jeudi" },
  { key: "friday", label: "Vendredi" },
  { key: "saturday", label: "Samedi" },
  { key: "sunday", label: "Dimanche" },
];

export default function AddOrUpdateTatoueurPage() {
  const user = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const salonId = user?.id;

  const tatoueurId = searchParams.get("id");
  const isEditing = !!tatoueurId;

  const [loading, setLoading] = useState(false);
  const [existingTatoueur, setExistingTatoueur] =
    useState<TatoueurProps | null>(null);
  const [salonHours, setSalonHours] = useState<string | null>(null);

  // Récupérer les données du salon pour les horaires par défaut
  useEffect(() => {
    const fetchSalonData = async () => {
      if (!salonId) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/users/${salonId}`
        );
        if (response.ok) {
          const data = await response.json();
          setSalonHours(data.salonHours);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des données du salon:",
          error
        );
      }
    };

    fetchSalonData();
  }, [salonId]);

  // Récupérer les données du tatoueur en mode édition
  useEffect(() => {
    const fetchTatoueur = async () => {
      if (!tatoueurId) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs/${tatoueurId}`
        );
        if (response.ok) {
          const data = await response.json();
          setExistingTatoueur(data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du tatoueur:", error);
      }
    };

    fetchTatoueur();
  }, [tatoueurId]);

  const initialHours: Horaire = (existingTatoueur?.hours &&
    JSON.parse(existingTatoueur.hours)) ||
    (salonHours && JSON.parse(salonHours)) || {
      monday: { start: "", end: "" },
      tuesday: { start: "", end: "" },
      wednesday: { start: "", end: "" },
      thursday: { start: "", end: "" },
      friday: { start: "", end: "" },
      saturday: { start: "", end: "" },
      sunday: null,
    };

  const [editingHours, setEditingHours] = useState<Horaire>(initialHours);

  const form = useForm<z.infer<typeof createTatoueurSchema>>({
    resolver: zodResolver(createTatoueurSchema),
    defaultValues: {
      name: existingTatoueur?.name || "",
      img: existingTatoueur?.img || "",
      description: existingTatoueur?.description || "",
      instagram: existingTatoueur?.instagram || "",
      hours: existingTatoueur?.hours || "",
      userId: salonId || "",
    },
  });

  // Mettre à jour le formulaire quand les données sont chargées
  useEffect(() => {
    if (existingTatoueur) {
      form.reset({
        name: existingTatoueur.name,
        img: existingTatoueur.img || "",
        description: existingTatoueur.description || "",
        instagram: existingTatoueur.instagram || "",
        phone: existingTatoueur.phone || "",
        hours: existingTatoueur.hours || "",
        userId: salonId || "",
      });

      if (existingTatoueur.hours) {
        setEditingHours(JSON.parse(existingTatoueur.hours));
      }
    }
  }, [existingTatoueur, form, salonId]);

  const onSubmit = async (values: z.infer<typeof createTatoueurSchema>) => {
    if (!salonId) return;

    const payload = {
      ...values,
      hours: JSON.stringify(editingHours),
    };

    setLoading(true);

    try {
      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs/update/${tatoueurId}`
        : `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs`;

      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/mon-compte");
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!salonId) {
    return <div className="text-white">Chargement...</div>;
  }

  return (
    <div className="min-h-screen w-full bg-noir-700">
      <div className="container">
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
                  {isEditing ? "Modifier le tatoueur" : "Ajouter un tatoueur"}
                </h1>
                <p className="text-white/70 font-one text-sm text-center">
                  {isEditing
                    ? "Modifiez les informations du tatoueur"
                    : "Ajoutez un nouveau membre à votre équipe"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Section: Informations générales */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="flex gap-2 items-center text-sm text-white mb-3 font-one uppercase tracking-widest">
                <CiUser size={20} /> Informations générales
              </h3>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    Photo du tatoueur
                  </label>
                  <TatoueurImageUploader
                    currentImage={form.watch("img") || existingTatoueur?.img}
                    onImageUpload={(imageUrl) => {
                      form.setValue("img", imageUrl);
                    }}
                    onImageRemove={() => {
                      form.setValue("img", "");
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    Nom du tatoueur *
                  </label>
                  <input
                    placeholder="Nom du tatoueur"
                    {...form.register("name")}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Description du tatoueur, ses spécialités..."
                    {...form.register("description")}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors resize-none placeholder-white/50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-white/70 font-one">
                      Téléphone
                    </label>
                    <input
                      placeholder="Numéro de téléphone"
                      {...form.register("phone")}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-white/70 font-one">
                      Instagram
                    </label>
                    <input
                      placeholder="@nom_instagram"
                      {...form.register("instagram")}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Horaires */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="flex gap-2 items-center text-sm text-white mb-3 font-one uppercase tracking-wide">
                <TbClockHour5 size={20} /> Horaires de travail
              </h3>
              <p className="text-xs text-white/60 mb-4">
                Horaires du salon par défaut. Modifiez selon les disponibilités
                du tatoueur.
              </p>

              <div className="space-y-3">
                {daysOfWeek.map(({ key, label }) => {
                  const value = editingHours[key];
                  return (
                    <div
                      key={key}
                      className="bg-white/10 p-3 rounded-lg border border-white/20"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="w-20 text-xs text-white font-one">
                          {label}
                        </span>

                        {value ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="time"
                              value={value.start}
                              onChange={(e) =>
                                setEditingHours((prev) => ({
                                  ...prev,
                                  [key]: {
                                    ...(prev[key] || { start: "", end: "" }),
                                    start: e.target.value,
                                  },
                                }))
                              }
                              className="p-1 bg-white/10 border border-white/20 rounded text-white text-xs focus:outline-none focus:border-tertiary-400"
                            />
                            <span className="text-white/70 text-xs">à</span>
                            <input
                              type="time"
                              value={value.end}
                              onChange={(e) =>
                                setEditingHours((prev) => ({
                                  ...prev,
                                  [key]: {
                                    ...(prev[key] || { start: "", end: "" }),
                                    end: e.target.value,
                                  },
                                }))
                              }
                              className="p-1 bg-white/10 border border-white/20 rounded text-white text-xs focus:outline-none focus:border-tertiary-400"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setEditingHours((prev) => ({
                                  ...prev,
                                  [key]: null,
                                }))
                              }
                              className="cursor-pointer px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded text-xs hover:bg-red-500/30 transition-colors"
                            >
                              Fermé
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-1 justify-end">
                            <span className="text-red-300 text-xs">Fermé</span>
                            <button
                              type="button"
                              onClick={() =>
                                setEditingHours((prev) => ({
                                  ...prev,
                                  [key]: { start: "09:00", end: "18:00" },
                                }))
                              }
                              className="cursor-pointer px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded text-xs hover:bg-green-500/30 transition-colors"
                            >
                              Ouvrir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer avec boutons d'action */}
            <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
              <Link
                href="/mon-compte"
                className="cursor-pointer px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer px-8 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {isEditing ? "Modification..." : "Création..."}
                  </div>
                ) : isEditing ? (
                  "Modifier le tatoueur"
                ) : (
                  "Créer le tatoueur"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
