"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createTatoueurSchema } from "@/lib/zod/validator.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { TatoueurProps } from "@/lib/type";
import { ArrowLeft, UserRound, Users, Plus, Phone, Palette, CalendarDays, CalendarCheck, Save, LoaderCircle } from "lucide-react";
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
  const [mode, setMode] = useState<"create" | "invite">("create");
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
      phone: existingTatoueur?.phone || "",
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
    "mb-2 block text-xs font-medium text-white/75 font-one";
  const fieldInputClass =
    "w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/80 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/60 focus:ring-2 focus:ring-tertiary-400/10 [color-scheme:dark] font-two";
  const badgeClass =
    "inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/80 font-one";

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
        img: form.getValues("img"),
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
    <div className="wrapper-global pb-24 lg:pb-8 [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed [&_a]:cursor-pointer [&_input[type=time]]:cursor-pointer [&_button:focus-visible]:outline-none [&_button:focus-visible]:ring-2 [&_button:focus-visible]:ring-tertiary-400">
      <section className="w-full space-y-6 pt-5 font-one">
        <header className="flex flex-col gap-4 py-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs text-white/45"><Users size={14} />Mon compte <span className="text-white/20">/</span> Équipe</p>
            <div className="mt-3 flex items-center gap-3">
              <Link href="/mon-compte" aria-label="Retour à l’équipe" title="Retour à l’équipe" className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-white/60 transition hover:bg-tertiary-400/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400"><ArrowLeft size={22} aria-hidden="true" /></Link>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{isEditing ? "Modifier le tatoueur" : "Un nouveau talent au salon"}</h1>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">{isEditing ? "Ajustez son profil, ses spécialités et ses disponibilités." : "Créez son profil ou invitez un tatoueur qui possède déjà un compte Inkera."}</p>
          </div>
        </header>

        {!isEditing && <div className="flex flex-wrap border-b border-white/10" role="group" aria-label="Méthode d’ajout">
          <button type="button" aria-pressed={mode === "create"} onClick={() => setMode("create")} className={`inline-flex items-center gap-2 border-b-2 px-4 py-3.5 text-xs font-medium transition ${mode === "create" ? "border-tertiary-400 text-white" : "border-transparent text-white/45 hover:text-white"}`}><Plus size={15} />Créer un profil</button>
          <button type="button" aria-pressed={mode === "invite"} onClick={() => setMode("invite")} className={`inline-flex items-center gap-2 border-b-2 px-4 py-3.5 text-xs font-medium transition ${mode === "invite" ? "border-tertiary-400 text-white" : "border-transparent text-white/45 hover:text-white"}`}><Users size={15} />Inviter un tatoueur inscrit</button>
        </div>}
        {!isEditing && <div hidden={mode !== "invite"} className="mx-auto max-w-3xl py-4 sm:py-8"><InviteRegisteredTatoueurSection /></div>}

        <div hidden={!isEditing && mode !== "create"} className="w-full">
          <div className="grid items-start gap-5 xl:grid-cols-[210px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-white/10 bg-noir-600 p-3 xl:sticky xl:top-5 xl:p-4">
            <p className="mb-4 hidden px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35 xl:block">Le profil du tatoueur</p>
            <nav aria-label="Rubriques du profil" className="flex gap-1 overflow-x-auto xl:flex-col">
              {([{ id: "identity", label: "Profil", Icon: UserRound }, { id: "contact", label: "Coordonnées", Icon: Phone }, { id: "specialties", label: "Spécialités", Icon: Palette }, { id: "booking", label: "Réservation", Icon: CalendarCheck }, { id: "schedule", label: "Disponibilités", Icon: CalendarDays }]).map(({ id, label, Icon }) => <a key={id} href={`#tatoueur-${id}`} className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs text-white/60 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400"><Icon size={15} className="text-tertiary-400/80" />{label}</a>)}
            </nav>
            <div className="mt-5 hidden border-t border-white/10 px-2 pt-4 xl:block"><p className="text-xs font-medium text-white/75">À votre rythme</p><p className="mt-2 text-[11px] leading-5 text-white/40">Seul le nom est obligatoire. Vous pourrez compléter le profil à tout moment.</p></div>
          </aside>
          <form onSubmit={form.handleSubmit(onSubmit)} className="min-w-0 space-y-5">
            <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] 2xl:items-start">
              <div className="min-w-0">

                <div className="space-y-5">
                  <div id="tatoueur-identity" className="min-w-0 scroll-mt-5 rounded-2xl border border-white/10 bg-noir-600 p-5 sm:p-6">
                    <TatoueurSectionHeader eyebrow="01 · Identité" title="Faisons les présentations" description="Une photo, un nom et quelques mots pour présenter le tatoueur." icon={<UserRound size={18} />} />
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-[144px_minmax(0,1fr)]">
                      <div className="space-y-1">
                        <label className={fieldLabelClass}>Photo du tatoueur</label>
                        <TatoueurImageUploader
                          currentImage={form.watch("img")}
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
                          <label htmlFor="tatoueur-name" className={fieldLabelClass}>Nom ou nom d’artiste <span className="text-tertiary-400">*</span></label>
                          <input id="tatoueur-name" aria-invalid={Boolean(form.formState.errors.name)} aria-describedby={form.formState.errors.name ? "tatoueur-name-error" : undefined}
                            placeholder="Ex. Alex Tattoo" autoComplete="name"
                            {...form.register("name")}
                            className={fieldInputClass}
                          />
                          {form.formState.errors.name && <p id="tatoueur-name-error" role="alert" className="mt-1 text-xs text-red-300">{form.formState.errors.name?.message}</p>}
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="tatoueur-description" className={fieldLabelClass}>Description</label>
                          <textarea id="tatoueur-description" aria-invalid={Boolean(form.formState.errors.description)} aria-describedby={form.formState.errors.description ? "tatoueur-description-error" : undefined}
                            rows={4}
                            placeholder="Son expérience, ses inspirations, ce qui rend son travail unique…"
                            {...form.register("description")}
                            className={`${fieldInputClass} resize-y`}
                          />
                          {form.formState.errors.description && <p id="tatoueur-description-error" role="alert" className="mt-1 text-xs text-red-300">{form.formState.errors.description?.message}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div id="tatoueur-contact" className="min-w-0 scroll-mt-5 rounded-2xl border border-white/10 bg-noir-600 p-5 sm:p-6">
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

                  <div id="tatoueur-specialties" className="min-w-0 scroll-mt-5 rounded-2xl border border-white/10 bg-noir-600 p-5 sm:p-6">
                    <TatoueurSectionHeader eyebrow="03 · Spécialités" title="Son savoir-faire" description="Ajoutez ses compétences et ses styles pour mettre en valeur son univers." icon={<Palette size={18} />} />
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <label htmlFor="tatoueur-skills" className={fieldLabelClass}>
                          Compétences et techniques
                        </label>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input
                            type="text" id="tatoueur-skills"
                            aria-label="Ajouter une compétence" value={skillsInput}
                            onChange={(e) => setSkillsInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddSkill();
                              }
                            }}
                            placeholder="Ex. Tatouage, piercing, cover-up"
                            className={fieldInputClass}
                          />
                          <button
                            type="button"
                            disabled={!skillsInput.trim()} onClick={handleAddSkill}
                            className="cursor-pointer inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-medium text-tertiary-400 transition hover:bg-tertiary-500/20 disabled:opacity-50 disabled:cursor-not-allowed font-one"
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
                        <label htmlFor="tatoueur-styles" className={fieldLabelClass}>
                          Styles artistiques
                        </label>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input
                            type="text" id="tatoueur-styles"
                            aria-label="Ajouter un style" value={styleInput}
                            onChange={(e) => setStyleInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddStyle();
                              }
                            }}
                            placeholder="Ex. Fine line, japonais, réalisme"
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

                  <div id="tatoueur-booking" className="min-w-0 scroll-mt-5 rounded-2xl border border-white/10 bg-noir-600 p-5 sm:p-6">
                    <TatoueurSectionHeader eyebrow="04 · Réservation" title="Disponibilité à la réservation" description="Choisissez si les clients peuvent prendre rendez-vous avec ce tatoueur." icon={<CalendarCheck size={18} />} />
                    <div className="flex items-center justify-between">
                      <div className="pr-3">
                        <h4 className="text-sm font-medium text-white font-one">
                          Autoriser la prise de rendez-vous
                        </h4>
                        <p className="mt-1 text-[11px] text-white/60 font-one">
                          Si activé, les clients peuvent réserver avec ce tatoueur.
                        </p>
                      </div>
                      <label className="relative inline-flex shrink-0 items-center cursor-pointer">
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

              <div id="tatoueur-schedule" className="min-w-0 scroll-mt-5 rounded-2xl border border-white/10 bg-noir-600 p-5 sm:p-6">
                <div className="mb-4 space-y-3">
                  <TatoueurSectionHeader eyebrow="05 · Disponibilités" title="Son rythme au salon" description="Définissez les jours travaillés et les horaires de présence." icon={<CalendarDays size={18} />} />

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={applyMondayToAllDays}
                      className="inline-flex min-h-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-[11px] text-white/75 transition-colors hover:bg-white/10 font-one"
                    >
                      Copier le lundi sur la semaine
                    </button>
                    <button
                      type="button"
                      onClick={openAllDays}
                      className="inline-flex min-h-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-[11px] text-white/75 transition-colors hover:bg-white/10 font-one"
                    >
                      Tout ouvrir · 09:00 – 18:00
                    </button>
                    <button
                      type="button"
                      onClick={closeAllDays}
                      className="inline-flex min-h-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-[11px] text-white/75 transition-colors hover:bg-white/10 font-one"
                    >
                      Tout fermer
                    </button>
                  </div>
                </div>

                <p className="mb-4 text-[11px] leading-5 text-white/40">Les horaires du salon sont repris par défaut. Activez les jours travaillés, puis ajustez les heures de présence.</p>
                <div className="overflow-hidden rounded-xl border border-white/10 divide-y divide-white/[0.06]">
                  {daysOfWeek.map(({ key, label }) => {
                    const value = editingHours[key];
                    const isOpen = Boolean(value);
                    return (
                      <div
                        key={key}
                        className="bg-black/10 px-3 py-3 sm:px-4"
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-white font-one">
                              {label}
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button" aria-pressed={isOpen} aria-label={`${isOpen ? "Fermer" : "Ouvrir"} le ${label}`}
                                onClick={() =>
                                  setDayHours(
                                    key,
                                    isOpen ? null : { start: "09:00", end: "18:00" },
                                  )
                                }
                                className={`min-h-8 min-w-20 px-3 py-1 rounded-lg text-[11px] border transition-colors font-one ${
                                  isOpen
                                    ? "bg-emerald-400/10 text-emerald-300 border-emerald-400/15 hover:bg-emerald-400/20"
                                    : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"
                                }`}
                              >
                                {isOpen ? "Ouvert" : "Fermé"}
                              </button>
                            </div>
                          </div>

                          {value ? (
                            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                              <input
                                type="time" aria-label={`Début de présence le ${label}`}
                                value={value.start}
                                onChange={(e) =>
                                  updateDayTime(key, "start", e.target.value)
                                }
                                className={`${fieldInputClass} !px-2.5 !py-2 !text-xs`}
                              />
                              <span className="text-xs text-white/30">à</span>
                              <input
                                type="time" aria-label={`Fin de présence le ${label}`}
                                value={value.end}
                                onChange={(e) =>
                                  updateDayTime(key, "end", e.target.value)
                                }
                                className={`${fieldInputClass} !px-2.5 !py-2 !text-xs`}
                              />
                            </div>
                          ) : (
                            <p className="text-[11px] text-white/30">Aucune disponibilité ce jour.</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {error && <div role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="text-sm font-medium text-red-200">{error === "SAAS_LIMIT" ? "La limite de votre abonnement est atteinte" : "Le profil n’a pas pu être enregistré"}</p><p className="mt-1 text-xs leading-5 text-red-200/70">{error === "SAAS_LIMIT" ? "Consultez votre abonnement pour ajouter davantage de tatoueurs à votre équipe." : error}</p></div>
                {error === "SAAS_LIMIT" && <DashboardButton href="/parametres" variant="secondary" className="!min-w-0 !rounded-xl">Voir mon abonnement</DashboardButton>}
              </div>
            </div>}

            <div className="sticky bottom-4 z-20 flex flex-col gap-4 rounded-2xl border border-white/10 bg-noir-600/95 p-4 shadow-xl shadow-black/20 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-white/40"></p> 
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <DashboardButton
                href="/mon-compte"
                variant="secondary"
                className="w-full !min-w-0 !rounded-xl sm:w-auto"
              >
                Annuler
              </DashboardButton>
              <DashboardButton
                type="submit"
                disabled={loading}
                className="w-full !min-w-0 !rounded-xl !shadow-none sm:w-auto"
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
            </div>
          </form>
          </div>
        </div>
      </section>
    </div>
  );
}

function TatoueurSectionHeader({ eyebrow, title, description, icon }: { eyebrow: string; title: string; description: string; icon: ReactNode }) {
  return (
    <div className="mb-6 flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-tertiary-400/20 bg-tertiary-400/10 text-tertiary-400" aria-hidden="true">{icon}</span>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35 font-one">{eyebrow}</p>
        <h2 className="mt-1 text-base font-semibold tracking-tight text-white font-one">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-white/50 font-two">{description}</p>
      </div>
    </div>
  );
}
