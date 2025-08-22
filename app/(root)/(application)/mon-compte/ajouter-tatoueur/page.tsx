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
import { IoClose } from "react-icons/io5";
import { createOrUpdateTatoueur } from "@/lib/queries/tatoueur";
import { toast } from "sonner";

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
  const [error, setError] = useState<string>("");
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
      style: existingTatoueur?.style || [],
      skills: existingTatoueur?.skills || [],
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
        style: existingTatoueur.style || [],
        skills: existingTatoueur.skills || [],
      });

      if (existingTatoueur.hours) {
        setEditingHours(JSON.parse(existingTatoueur.hours));
      }
    }
  }, [existingTatoueur, form, salonId]);

  // Pour gérer les badges style et skills
  const [styleInput, setStyleInput] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [styleBadges, setStyleBadges] = useState<string[]>(
    form.watch("style") || []
  );
  const [skillsBadges, setSkillsBadges] = useState<string[]>(
    form.watch("skills") || []
  );

  // Synchronise badges avec form (utile en édition)
  useEffect(() => {
    setStyleBadges(form.watch("style") || []);
    setSkillsBadges(form.watch("skills") || []);
  }, [existingTatoueur]);

  // Ajout badge style
  const handleAddStyle = () => {
    const val = styleInput.trim();
    if (val && !styleBadges.includes(val)) {
      const updated = [...styleBadges, val];
      setStyleBadges(updated);
      form.setValue("style", updated);
    }
    setStyleInput("");
  };

  // Ajout badge skill
  const handleAddSkill = () => {
    const val = skillsInput.trim();
    if (val && !skillsBadges.includes(val)) {
      const updated = [...skillsBadges, val];
      setSkillsBadges(updated);
      form.setValue("skills", updated);
    }
    setSkillsInput("");
  };

  // Suppression badge style
  const handleRemoveStyle = (val: string) => {
    const updated = styleBadges.filter((s) => s !== val);
    setStyleBadges(updated);
    form.setValue("style", updated);
  };

  // Suppression badge skill
  const handleRemoveSkill = (val: string) => {
    const updated = skillsBadges.filter((s) => s !== val);
    setSkillsBadges(updated);
    form.setValue("skills", updated);
  };

  const onSubmit = async (values: z.infer<typeof createTatoueurSchema>) => {
    if (!salonId) return;

    const payload = {
      ...values,
      hours: JSON.stringify(editingHours),
    };

    setLoading(true);
    setError("");

    try {
      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs/update/${tatoueurId}`
        : `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs`;

      const result = await createOrUpdateTatoueur(
        payload,
        isEditing ? "PATCH" : "POST",
        url
      );

      // Vérifier si c'est une erreur de limite SaaS
      if (result.error) {
        if (
          result.message &&
          result.message.includes("Limite de tatoueurs atteinte")
        ) {
          setError("SAAS_LIMIT");
        } else {
          setError(result.message || "Une erreur est survenue.");
        }
        return;
      }

      if (result.ok) {
        toast.success("Tatoueur créé/modifié avec succès !");
        router.push("/mon-compte");
      } else {
        setError("Une erreur est survenue côté serveur.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setError("Une erreur est survenue lors de la création du tatoueur.");
    } finally {
      setLoading(false);
    }
  };

  if (!salonId) {
    return <div className="text-white">Chargement...</div>;
  }

  return (
    <div className="min-h-screen w-full bg-noir-700">
      <div className="container pt-24">
        {/* Header */}
        <div className="flex items-center gap-4 max-w-6xl mx-auto mb-8">
          <div className="w-12 h-12 flex items-center justify-center ">
            <Link
              href="/mon-compte"
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white/70 hover:text-white transition-all duration-200 border border-white/20"
            >
              ←
            </Link>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white font-one tracking-widest text-center">
              {isEditing ? "Modifier le tatoueur" : "Ajouter un tatoueur"}
            </h1>
            <p className="text-white/70 text-xs font-one mt-1">
              {isEditing
                ? "Modifiez les informations du tatoueur"
                : "Ajoutez un nouveau membre à votre équipe"}
            </p>
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

                {/* Ajouté : Compétences (badges) */}
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    Compétences (ex: Tatouage, Piercing)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      placeholder="Ajouter une compétence et appuyer sur Entrée"
                      className="flex-1 p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="cursor-pointer px-8 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs"
                    >
                      Ajouter
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skillsBadges.map((skill) => (
                      <span
                        key={skill}
                        className="bg-tertiary-400/20 text-tertiary-400 px-2 py-1 rounded-lg font-one text-xs flex items-center gap-1"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-1 text-tertiary-400 hover:text-red-400"
                          title="Supprimer"
                        >
                          <IoClose size={14} className="cursor-pointer" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ajouté : Styles (badges) */}
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    Styles (ex: Japonais, Old School)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={styleInput}
                      onChange={(e) => setStyleInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddStyle();
                        }
                      }}
                      placeholder="Ajouter un style et appuyer sur Entrée"
                      className="flex-1 p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                    <button
                      type="button"
                      onClick={handleAddStyle}
                      className="cursor-pointer px-8 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs"
                    >
                      Ajouter
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {styleBadges.map((style) => (
                      <span
                        key={style}
                        className="bg-tertiary-400/20 text-tertiary-400 px-2 py-1 rounded-lg font-one text-xs flex items-center gap-1"
                      >
                        {style}
                        <button
                          type="button"
                          onClick={() => handleRemoveStyle(style)}
                          className="ml-1 text-tertiary-400 hover:text-red-400"
                          title="Supprimer"
                        >
                          <IoClose size={14} className="cursor-pointer" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                {/* ...existing code... */}
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

            {/* Messages d'erreur */}
            {error && error === "SAAS_LIMIT" ? (
              /* Message spécial pour les limites SaaS */
              <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-4 h-4 text-orange-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-orange-300 font-semibold font-one mb-2 text-sm">
                      👨‍🎨 Limite de tatoueurs atteinte
                    </h3>

                    <p className="text-orange-200 text-xs font-one mb-3">
                      Vous avez atteint la limite de tatoueurs de votre plan
                      actuel.
                    </p>

                    <div className="bg-white/10 rounded-lg p-3 mb-3">
                      <h4 className="text-white font-semibold font-one text-xs mb-2">
                        📈 Solutions disponables :
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 bg-tertiary-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-tertiary-400 text-[10px] font-bold">
                              1
                            </span>
                          </div>
                          <div className="text-white/90">
                            <span className="font-semibold text-tertiary-400">
                              Plan PRO (29€/mois)
                            </span>
                            <br />
                            <span className="text-white/70">
                              Tatoueurs illimités + fonctionnalités avancées
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 bg-purple-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-purple-400 text-[10px] font-bold">
                              2
                            </span>
                          </div>
                          <div className="text-white/90">
                            <span className="font-semibold text-purple-400">
                              Plan BUSINESS (69€/mois)
                            </span>
                            <br />
                            <span className="text-white/70">
                              Solution complète multi-salons
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          window.location.href = "/parametres";
                        }}
                        className="cursor-pointer px-3 py-1.5 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg text-xs font-one font-medium transition-all duration-300"
                      >
                        📊 Changer de plan
                      </button>

                      <button
                        type="button"
                        onClick={() => setError("")}
                        className="cursor-pointer px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 text-xs font-one font-medium transition-colors"
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : error ? (
              /* Message d'erreur standard */
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
                <p className="text-red-300 text-xs">{error}</p>
              </div>
            ) : null}

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
