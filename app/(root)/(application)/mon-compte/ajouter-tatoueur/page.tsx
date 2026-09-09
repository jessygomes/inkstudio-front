"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createTatoueurSchema } from "@/lib/zod/validator.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { TatoueurProps } from "@/lib/type";
import { ArrowLeft, UserRound, Phone, Palette, CalendarDays, CalendarCheck, Save, LoaderCircle } from "lucide-react";
import TatoueurImageUploader, {
  TatoueurImageUploaderHandle,
} from "@/components/Application/MonCompte/TatoueurImageUploader";
import { IoClose } from "react-icons/io5";
import { createOrUpdateTatoueur } from "@/lib/queries/tatoueur";
import { toast } from "sonner";
import DashboardButton from "@/components/Shared/DashboardButton";
import InviteRegisteredTatoueurSection from "../../../../../components/Application/MonCompte/InviteRegisteredTatoueurSection";

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
] as const;

type DayKey = (typeof daysOfWeek)[number]["key"];

const defaultTatoueurHours: Horaire = {
  monday: { start: "", end: "" },
  tuesday: { start: "", end: "" },
  wednesday: { start: "", end: "" },
  thursday: { start: "", end: "" },
  friday: { start: "", end: "" },
  saturday: { start: "", end: "" },
  sunday: null,
};

const parseHoursSafely = (raw: string | null): Horaire | null => {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Horaire;
    return parsed;
  } catch {
    return null;
  }
};

type TeamTatoueur = TatoueurProps & {
  canBeEditedBySalon?: boolean;
  isLinkedAccount?: boolean;
  isLinkedUser?: boolean;
  isReadOnly?: boolean;
  linkedUserId?: string;
  tatoueurUserId?: string;
  role?: string;
};

const isReadOnlyLinkedTatoueur = (tatoueur: TeamTatoueur | null) => {
  if (!tatoueur) return false;
  if (tatoueur.canBeEditedBySalon === false) return true;
  if (tatoueur.isLinkedAccount) return true;
  if (tatoueur.isReadOnly) return true;
  if (tatoueur.isLinkedUser) return true;
  if (tatoueur.linkedUserId || tatoueur.tatoueurUserId) return true;
  if (tatoueur.role === "user_tatoueur") return true;
  return false;
};

export default function AddOrUpdateTatoueurPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const salonId = session?.user?.id;
  const isIndependentAccount = session?.user?.role === "user_tatoueur";
  const imageUploaderRef = useRef<TatoueurImageUploaderHandle>(null);

  const tatoueurId = searchParams.get("id");
  const isEditing = !!tatoueurId;
  const isBusinessPlan = session?.user?.saasPlan === "BUSINESS";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [existingTatoueur, setExistingTatoueur] =
    useState<TatoueurProps | null>(null);
  const [salonHours, setSalonHours] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    if (isIndependentAccount) {
      toast.error(
        "Compte indépendant: la gestion d'une équipe de tatoueurs n'est pas disponible.",
      );
      router.replace("/mon-compte");
    }
  }, [session?.user, isIndependentAccount, router]);

  useEffect(() => {
    const raw = session?.user?.salonHours as unknown;
    if (raw) {
      const normalized = typeof raw === "string" ? raw : JSON.stringify(raw);
      setSalonHours(normalized);
    }
  }, [session?.user?.salonHours]);

  useEffect(() => {
    const fetchSalonData = async () => {
      if (!salonId) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/users/${salonId}`,
        );
        if (response.ok) {
          const data = await response.json();
          const raw = (data as unknown as { salonHours?: unknown }).salonHours;
          const normalized =
            typeof raw === "string" ? raw : raw ? JSON.stringify(raw) : null;
          setSalonHours(normalized);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des données du salon:",
          error,
        );
      }
    };

    fetchSalonData();
  }, [salonId]);

  useEffect(() => {
    const fetchTatoueur = async () => {
      if (!tatoueurId) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs/${tatoueurId}`,
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

  const initialHours: Horaire =
    (existingTatoueur?.hours && parseHoursSafely(existingTatoueur.hours)) ||
    parseHoursSafely(salonHours) ||
    defaultTatoueurHours;

  const [editingHours, setEditingHours] = useState<Horaire>(initialHours);

  useEffect(() => {
    if (isEditing) return;

    const salonDefaultHours = parseHoursSafely(salonHours);

    if (!salonDefaultHours) {
      if (!isBusinessPlan) {
        setEditingHours(defaultTatoueurHours);
      }
      return;
    }

    if (!isBusinessPlan) {
      setEditingHours(salonDefaultHours);
      return;
    }

    setEditingHours((prev) => {
      const hasCustomHours = Object.values(prev).some(
        (value) => value && (value.start !== "" || value.end !== ""),
      );

      return hasCustomHours ? prev : salonDefaultHours;
    });
  }, [salonHours, isEditing, isBusinessPlan]);

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
      rdvBookingEnabled: existingTatoueur?.rdvBookingEnabled ?? true,
    },
  });

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
        rdvBookingEnabled: existingTatoueur.rdvBookingEnabled ?? true,
      });

      if (existingTatoueur.hours) {
        setEditingHours(JSON.parse(existingTatoueur.hours));
      }
    }
  }, [existingTatoueur, form, salonId]);

  useEffect(() => {
    if (!isEditing || !existingTatoueur) return;

    if (isReadOnlyLinkedTatoueur(existingTatoueur as TeamTatoueur)) {
      toast.info(
        "Ce tatoueur est lié à un compte indépendant. Ses informations sont modifiables uniquement depuis son compte.",
      );
      router.replace("/mon-compte");
    }
  }, [isEditing, existingTatoueur, router]);

  const [styleInput, setStyleInput] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [styleBadges, setStyleBadges] = useState<string[]>(
    form.watch("style") || [],
  );
  const [skillsBadges, setSkillsBadges] = useState<string[]>(
    form.watch("skills") || [],
  );

  useEffect(() => {
    setStyleBadges(form.watch("style") || []);
    setSkillsBadges(form.watch("skills") || []);
  }, [existingTatoueur, form]);

  const handleAddStyle = () => {
    const val = styleInput.trim();
    if (val && !styleBadges.includes(val)) {
      const updated = [...styleBadges, val];
      setStyleBadges(updated);
      form.setValue("style", updated);
    }
    setStyleInput("");
  };

  const handleAddSkill = () => {
    const val = skillsInput.trim();
    if (val && !skillsBadges.includes(val)) {
      const updated = [...skillsBadges, val];
      setSkillsBadges(updated);
      form.setValue("skills", updated);
    }
    setSkillsInput("");
  };

  const handleRemoveStyle = (val: string) => {
    const updated = styleBadges.filter((s) => s !== val);
    setStyleBadges(updated);
    form.setValue("style", updated);
  };

  const handleRemoveSkill = (val: string) => {
    const updated = skillsBadges.filter((s) => s !== val);
    setSkillsBadges(updated);
    form.setValue("skills", updated);
  };

  const setDayHours = (
    day: DayKey,
    value: { start: string; end: string } | null,
  ) => {
    setEditingHours((prev) => ({
      ...prev,
      [day]: value,
    }));
  };

  const updateDayTime = (day: DayKey, field: "start" | "end", time: string) => {
    setEditingHours((prev) => ({
      ...prev,
      [day]: {
        ...(prev[day] || { start: "09:00", end: "18:00" }),
        [field]: time,
      },
    }));
  };

  const applyMondayToAllDays = () => {
    setEditingHours((prev) => {
      const mondayHours = prev.monday
        ? { start: prev.monday.start ?? "", end: prev.monday.end ?? "" }
        : null;

      return {
        monday: mondayHours ? { ...mondayHours } : null,
        tuesday: mondayHours ? { ...mondayHours } : null,
        wednesday: mondayHours ? { ...mondayHours } : null,
        thursday: mondayHours ? { ...mondayHours } : null,
        friday: mondayHours ? { ...mondayHours } : null,
        saturday: mondayHours ? { ...mondayHours } : null,
        sunday: mondayHours ? { ...mondayHours } : null,
      };
    });
  };

  const openAllDays = () => {
    setEditingHours({
      monday: { start: "09:00", end: "18:00" },
      tuesday: { start: "09:00", end: "18:00" },
      wednesday: { start: "09:00", end: "18:00" },
      thursday: { start: "09:00", end: "18:00" },
      friday: { start: "09:00", end: "18:00" },
      saturday: { start: "09:00", end: "18:00" },
      sunday: { start: "09:00", end: "18:00" },
    });
  };

  const closeAllDays = () => {
    setEditingHours({
      monday: null,
      tuesday: null,
      wednesday: null,
      thursday: null,
      friday: null,
      saturday: null,
      sunday: null,
    });
  };

  const fieldLabelClass =
    "mb-1.5 block text-xs font-medium text-white/65 font-one";
  const fieldInputClass =
    "w-full min-w-0 rounded-xl border border-white/10 bg-black/15 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/45 focus:ring-2 focus:ring-tertiary-400/10 [color-scheme:dark] font-two";
  const badgeClass =
    "inline-flex items-center gap-1 rounded-2xl border border-tertiary-400/35 bg-tertiary-500/15 px-2.5 py-1 text-xs text-tertiary-400 font-one";

  const onSubmit = async (values: z.infer<typeof createTatoueurSchema>) => {
    if (!salonId || loading) return;

    if (isEditing && isReadOnlyLinkedTatoueur(existingTatoueur as TeamTatoueur)) {
      toast.error("Modification non autorisée pour ce profil lié.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (imageUploaderRef.current) {
        await imageUploaderRef.current.uploadImage();
      }

      const payload = {
        ...values,
        userId: salonId,
        hours: JSON.stringify(editingHours),
      };

      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs/update/${tatoueurId}`
        : `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs`;

      const result = await createOrUpdateTatoueur(
        payload,
        isEditing ? "PATCH" : "POST",
        url,
      );

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
      console.error("❌ Erreur:", error);
      setError("Une erreur est survenue lors de la création du tatoueur.");
    } finally {
      setLoading(false);
    }
  };

  if (!salonId) {
    return <div className="text-white">Chargement...</div>;
  }

  if (isIndependentAccount) {
    return <div className="text-white">Redirection...</div>;
  }

  return (
    <div className="wrapper-global pb-24 lg:pb-8">
      <section className="w-full space-y-5 pt-4">
        <header className="flex flex-col gap-4 px-1 py-3 sm:px-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-tertiary-400 font-one">Mon compte · Équipe</p>
            <h1 className="mt-1 text-xl font-semibold text-white font-one sm:text-2xl">{isEditing ? "Modifier le tatoueur" : "Ajouter un tatoueur"}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55 font-one">{isEditing ? "Actualisez son profil, ses spécialités et ses disponibilités." : "Présentez votre nouveau tatoueur et préparez ses disponibilités au salon."}</p>
          </div>
          <DashboardButton href="/mon-compte" variant="secondary" className="w-full sm:w-auto"><ArrowLeft size={15} aria-hidden="true" />Retour au salon</DashboardButton>
        </header>

        {!isEditing && <InviteRegisteredTatoueurSection />}

        <div className="w-full">
          <form onSubmit={form.handleSubmit(onSubmit)} className="create-rdv-form tablet-inputs space-y-4">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] xl:items-start">
              <div className="min-w-0">

                <div className="space-y-4">
                  <div className="dashboard-embedded-section min-w-0 rounded-[22px] p-4 sm:p-5">
                    <TatoueurSectionHeader eyebrow="01 · Identité" title="Le visage de votre équipe" description="Ajoutez une photo et présentez le tatoueur. Le nom est obligatoire." icon={<UserRound size={18} />} />
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-[180px_minmax(0,1fr)]">
                      <div className="space-y-1">
                        <label className={fieldLabelClass}>Photo du tatoueur</label>
                        <TatoueurImageUploader
                          currentImage={form.watch("img") || existingTatoueur?.img}
                          onImageUpload={(imageUrl) => {
                            form.setValue("img", imageUrl);
                          }}
                          onImageRemove={() => {
                            form.setValue("img", "");
                          }}
                          ref={imageUploaderRef}
                        />
                      </div>

                      <div className="space-y-2.5">
                        <div className="space-y-1">
                          <label htmlFor="tatoueur-name" className={fieldLabelClass}>Nom du tatoueur *</label>
                          <input id="tatoueur-name" aria-invalid={Boolean(form.formState.errors.name)} aria-describedby={form.formState.errors.name ? "tatoueur-name-error" : undefined}
                            placeholder="Nom du tatoueur"
                            {...form.register("name")}
                            className={fieldInputClass}
                          />
                          {form.formState.errors.name && <p id="tatoueur-name-error" role="alert" className="mt-1 text-xs text-red-300">{form.formState.errors.name?.message}</p>}
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="tatoueur-description" className={fieldLabelClass}>Description</label>
                          <textarea id="tatoueur-description" aria-invalid={Boolean(form.formState.errors.description)} aria-describedby={form.formState.errors.description ? "tatoueur-description-error" : undefined}
                            rows={5}
                            placeholder="Description du tatoueur, ses spécialités..."
                            {...form.register("description")}
                            className={`${fieldInputClass} resize-y`}
                          />
                          {form.formState.errors.description && <p id="tatoueur-description-error" role="alert" className="mt-1 text-xs text-red-300">{form.formState.errors.description?.message}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-embedded-section min-w-0 rounded-[22px] p-4 sm:p-5">
                    <TatoueurSectionHeader eyebrow="02 · Coordonnées" title="Comment le contacter ?" description="Renseignez ses coordonnées professionnelles et son compte Instagram." icon={<Phone size={18} />} />
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label htmlFor="tatoueur-phone" className={fieldLabelClass}>Téléphone</label>
                          <input type="tel" id="tatoueur-phone" aria-invalid={Boolean(form.formState.errors.phone)} aria-describedby={form.formState.errors.phone ? "tatoueur-phone-error" : undefined}
                            placeholder="Numéro de téléphone"
                          {...form.register("phone")}
                          className={fieldInputClass}
                        />
                          {form.formState.errors.phone && <p id="tatoueur-phone-error" role="alert" className="mt-1 text-xs text-red-300">{form.formState.errors.phone?.message}</p>}
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="tatoueur-instagram" className={fieldLabelClass}>Instagram</label>
                          <input id="tatoueur-instagram" aria-invalid={Boolean(form.formState.errors.instagram)} aria-describedby={form.formState.errors.instagram ? "tatoueur-instagram-error" : undefined}
                            placeholder="@nom_instagram"
                          {...form.register("instagram")}
                          className={fieldInputClass}
                        />
                          {form.formState.errors.instagram && <p id="tatoueur-instagram-error" role="alert" className="mt-1 text-xs text-red-300">{form.formState.errors.instagram?.message}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-embedded-section min-w-0 rounded-[22px] p-4 sm:p-5">
                    <TatoueurSectionHeader eyebrow="03 · Spécialités" title="Son savoir-faire" description="Ajoutez ses compétences et ses styles pour mettre en valeur son univers." icon={<Palette size={18} />} />
                    <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
                      <div className="space-y-1">
                        <label className={fieldLabelClass}>
                          Compétences (ex: tatouage, piercing)
                        </label>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input
                            type="text"
                            aria-label="Ajouter une compétence" value={skillsInput}
                            onChange={(e) => setSkillsInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddSkill();
                              }
                            }}
                            placeholder="Ajouter une compétence"
                            className={fieldInputClass}
                          />
                          <button
                            type="button"
                            disabled={!skillsInput.trim()} onClick={handleAddSkill}
                            className="cursor-pointer inline-flex min-h-11 items-center justify-center rounded-xl border border-tertiary-400/25 bg-tertiary-500/10 px-4 text-xs font-medium text-tertiary-400 transition hover:bg-tertiary-500/20 disabled:opacity-50 disabled:cursor-not-allowed font-one"
                          >
                            Ajouter
                          </button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {skillsBadges.map((skill) => (
                            <span key={skill} className={badgeClass}>
                              {skill}
                              <button
                                type="button"
                                aria-label={`Retirer la compétence ${skill}`} onClick={() => handleRemoveSkill(skill)}
                                className="ml-0.5 text-tertiary-300 hover:text-red-300"
                                title="Supprimer"
                              >
                                <IoClose size={14} className="cursor-pointer" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className={fieldLabelClass}>
                          Styles (ex: japonais, old school)
                        </label>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input
                            type="text"
                            aria-label="Ajouter un style" value={styleInput}
                            onChange={(e) => setStyleInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddStyle();
                              }
                            }}
                            placeholder="Ajouter un style"
                            className={fieldInputClass}
                          />
                          <button
                            type="button"
                            disabled={!styleInput.trim()} onClick={handleAddStyle}
                            className="cursor-pointer inline-flex min-h-11 items-center justify-center rounded-xl border border-tertiary-400/25 bg-tertiary-500/10 px-4 text-xs font-medium text-tertiary-400 transition hover:bg-tertiary-500/20 disabled:opacity-50 disabled:cursor-not-allowed font-one"
                          >
                            Ajouter
                          </button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {styleBadges.map((style) => (
                            <span key={style} className={badgeClass}>
                              {style}
                              <button
                                type="button"
                                aria-label={`Retirer le style ${style}`} onClick={() => handleRemoveStyle(style)}
                                className="ml-0.5 text-tertiary-300 hover:text-red-300"
                                title="Supprimer"
                              >
                                <IoClose size={14} className="cursor-pointer" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-embedded-section min-w-0 rounded-[22px] p-4 sm:p-5">
                    <TatoueurSectionHeader eyebrow="04 · Réservation" title="Disponibilité à la réservation" description="Choisissez si les clients peuvent prendre rendez-vous avec ce tatoueur." icon={<CalendarCheck size={18} />} />
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-[12px] uppercase tracking-wide text-white font-one">
                          Autoriser la prise de rendez-vous
                        </h4>
                        <p className="mt-1 text-[11px] text-white/60 font-one">
                          Si activé, les clients peuvent réserver avec ce tatoueur.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox" aria-label="Autoriser la prise de rendez-vous"
                          {...form.register("rdvBookingEnabled")}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-7 sm:w-11 sm:h-6 bg-white/20 peer-focus-visible:ring-2 peer-focus-visible:ring-tertiary-400/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-tertiary-400"></div>
                      </label>
                    </div>

                    <div className="mt-3 border-t border-white/10 pt-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${
                            form.watch("rdvBookingEnabled")
                              ? "bg-green-400"
                              : "bg-orange-400"
                          }`}
                        ></div>
                        <span className="text-[11px] font-one text-white/70">
                          {form.watch("rdvBookingEnabled") ? (
                            <span className="text-green-300">Ce tatoueur apparaîtra dans la liste de sélection pour les rendez-vous.</span>
                          ) : (
                            <span className="text-orange-300">Ce tatoueur ne sera pas disponible pour les prises de rendez-vous.</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dashboard-embedded-section min-w-0 rounded-[22px] p-4 sm:p-5">
                <div className="mb-4 space-y-3">
                  <TatoueurSectionHeader eyebrow="05 · Disponibilités" title="Son rythme au salon" description="Définissez les jours travaillés et les horaires de présence." icon={<CalendarDays size={18} />} />

                  <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
                    <button
                      type="button"
                      onClick={applyMondayToAllDays}
                      className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/8 px-3 text-xs text-white/85 transition-colors hover:bg-white/12 font-one"
                    >
                      Copier le lundi sur tous les jours
                    </button>
                    <button
                      type="button"
                      onClick={openAllDays}
                      className="cursor-pointer inline-flex min-h-11 items-center justify-center rounded-2xl border border-emerald-500/35 bg-emerald-500/12 px-3 text-xs text-emerald-300 transition-colors hover:bg-emerald-500/20 font-one"
                    >
                      Tout ouvrir · 09:00 – 18:00
                    </button>
                    <button
                      type="button"
                      onClick={closeAllDays}
                      className="cursor-pointer inline-flex min-h-11 items-center justify-center rounded-2xl border border-red-500/35 bg-red-500/12 px-3 text-xs text-red-300 transition-colors hover:bg-red-500/20 font-one"
                    >
                      Tout fermer
                    </button>
                  </div>
                </div>

                {/* <p className="mb-3 text-[11px] text-white/60 font-one">
                  Définissez les disponibilités puis utilisez les actions rapides
                  pour appliquer les mêmes horaires.
                </p> */}

                <div className="space-y-3">
                  {daysOfWeek.map(({ key, label }) => {
                    const value = editingHours[key];
                    const isOpen = Boolean(value);
                    return (
                      <div
                        key={key}
                        className="rounded-2xl border border-white/10 bg-black/15 p-4"
                      >
                        <div className="flex flex-col gap-2 sm:gap-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-white font-one">
                              {label}
                            </span>

                            <div className="flex items-center gap-1.5">
                              <span
                                className={`rounded-2xl border px-2 py-0.5 text-xs font-one ${
                                  isOpen
                                    ? "border-emerald-500/35 bg-emerald-500/12 text-emerald-300"
                                    : "border-red-500/35 bg-red-500/12 text-red-300"
                                }`}
                              >
                                {isOpen ? "Ouvert" : "Fermé"}
                              </span>

                              <button
                                type="button" aria-label={`${isOpen ? "Fermer" : "Ouvrir"} le ${label}`}
                                onClick={() =>
                                  setDayHours(
                                    key,
                                    isOpen ? null : { start: "09:00", end: "18:00" },
                                  )
                                }
                                className={`cursor-pointer min-h-11 px-3 py-1.5 rounded-xl text-xs border transition-colors font-one ${
                                  isOpen
                                    ? "bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30"
                                    : "bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30"
                                }`}
                              >
                                {isOpen ? "Fermer" : "Ouvrir"}
                              </button>
                            </div>
                          </div>

                          {value ? (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <input
                                type="time" aria-label={`Début de présence le ${label}`}
                                value={value.start}
                                onChange={(e) =>
                                  updateDayTime(key, "start", e.target.value)
                                }
                                className={fieldInputClass}
                              />
                              <input
                                type="time" aria-label={`Fin de présence le ${label}`}
                                value={value.end}
                                onChange={(e) =>
                                  updateDayTime(key, "end", e.target.value)
                                }
                                className={fieldInputClass}
                              />
                            </div>
                          ) : (
                            <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 px-2.5 py-2 text-xs text-white/60 font-one">
                              Ce jour est fermé. Activez Ouvrir pour définir des
                              horaires.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {error && error === "SAAS_LIMIT" ? (
              <div className="rounded-xl border border-orange-500/50 bg-gradient-to-r from-orange-500/20 to-red-500/20 p-3 sm:p-4">
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

                    <div className="bg-white/10 rounded-3xl p-3 mb-3">
                      <h4 className="text-white font-semibold font-one text-xs mb-2">
                        📈 Solutions disponibles :
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
                              <span className="hidden sm:inline">
                                Tatoueurs illimités + fonctionnalités avancées
                              </span>
                              <span className="sm:hidden">
                                Tatoueurs illimités
                              </span>
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
                              <span className="hidden sm:inline">
                                Solution complète multi-salons
                              </span>
                              <span className="sm:hidden">Multi-salons</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          router.push("/parametres");
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
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
                <p className="text-red-300 text-xs">{error}</p>
              </div>
            ) : null}

            <div className="sticky bottom-4 z-20 flex flex-col-reverse justify-end gap-3 rounded-2xl border border-white/10 bg-noir-700/90 p-4 backdrop-blur-xl sm:flex-row sm:items-center">
              <DashboardButton
                href="/mon-compte"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                Annuler
              </DashboardButton>
              <DashboardButton
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
                    <span>{isEditing ? "Enregistrement..." : "Création..."}</span>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-2"><Save size={15} aria-hidden="true" />
                    {isEditing
                      ? "Sauvegarder les modifications"
                      : "Créer le tatoueur"}
                  </span>
                )}
              </DashboardButton>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

function TatoueurSectionHeader({ eyebrow, title, description, icon }: { eyebrow: string; title: string; description: string; icon: ReactNode }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-tertiary-400/25 bg-tertiary-500/10 text-tertiary-400" aria-hidden="true">{icon}</span>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-tertiary-400/80 font-one">{eyebrow}</p>
        <h2 className="mt-1 text-base font-semibold text-white font-one">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-white/50 font-two">{description}</p>
      </div>
    </div>
  );
}
