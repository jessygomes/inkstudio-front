"use client";

import { useSession } from "next-auth/react";
import { UpdateSalonUserProps } from "@/lib/type";
import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateSalonSchema } from "@/lib/zod/validator.schema";
import { z } from "zod";
import SalonImageUploader from "@/components/Application/MonCompte/SalonImageUploader";
import CreationWorkspace, { CreationPageHeader } from "@/components/Shared/CreationWorkspace";
import DashboardButton from "@/components/Shared/DashboardButton";
import SkeletonForm from "@/components/Skeleton/SkeletonForm";
import { useRouter } from "next/navigation";
import {
  updateUserInfoAction,
  getUserInfoAction,
  updateProjectAppointmentBookingAction,
} from "@/lib/queries/user";
import { toast } from "sonner";
import { ImagePlus, UserRound, MapPin, Globe, FileText, Sparkles, Palette, Save, LoaderCircle, CalendarClock, Mail, Gem, ArrowRight } from "lucide-react";
import { IoClose } from "react-icons/io5";
import FrenchCitySelect from "@/components/Shared/FrenchCitySelect";

export default function UpdateAccountPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [salon, setSalon] = useState<UpdateSalonUserProps | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [styleInput, setStyleInput] = useState("");
  const [styleBadges, setStyleBadges] = useState<string[]>([]);

  const form = useForm<z.infer<typeof updateSalonSchema>>({
    resolver: zodResolver(updateSalonSchema),
    defaultValues: {
      prestations: [],
      style: [],
      projectAppointmentIsFree: false,
      followUpEmailDelayDays: 3,
      retouchEmailDelayDays: 30,
    },
  });

  useEffect(() => {
    form.register("style");
  }, [form]);

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
            profileImage: result.data.profileImage ?? undefined,
            prestations: result.data.prestations ?? [],
            style: result.data.style ?? [],
            projectAppointmentDurationMinutes: result.data.projectAppointmentDurationMinutes ?? undefined,
            projectAppointmentIsFree: result.data.projectAppointmentIsFree ?? undefined,
            projectAppointmentPrice: result.data.projectAppointmentPrice ?? undefined,
            followUpEmailDelayDays: result.data.followUpEmailDelayDays ?? undefined,
            retouchEmailDelayDays: result.data.retouchEmailDelayDays ?? undefined,
          });
          setStyleBadges(result.data.style ?? []);
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
    if (!salon || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const selectedPrestations = data.prestations ?? [];
      const hasProjectService = selectedPrestations.includes("PROJET");
      const projectDuration = data.projectAppointmentDurationMinutes;
      const projectIsFree = data.projectAppointmentIsFree ?? false;
      const projectPrice = data.projectAppointmentPrice;
      const requiresFollowUpSettings = selectedPrestations.some((prestation) =>
        ["TATTOO", "RETOUCHE", "PIERCING"].includes(prestation),
      );
      const requiresRetouchDelay = selectedPrestations.includes("RETOUCHE");
      const followUpDelay = data.followUpEmailDelayDays;
      const retouchDelay = data.retouchEmailDelayDays;

      if (hasProjectService) {
        if (!projectDuration || projectDuration <= 0) {
          toast.error("Veuillez renseigner la duree d'une prestation projet.");
          return;
        }

        if (!projectIsFree && (!projectPrice || projectPrice <= 0)) {
          toast.error("Veuillez renseigner un prix projet valide.");
          return;
        }
      }

      if (requiresFollowUpSettings && (!followUpDelay || followUpDelay <= 0)) {
        toast.error("Veuillez renseigner le delai d'email de suivi.");
        return;
      }

      if (requiresRetouchDelay && (!retouchDelay || retouchDelay <= 0)) {
        toast.error("Veuillez renseigner le delai d'email de retouche.");
        return;
      }

      const payload = {
        ...data,
        style: styleBadges,
      };
      delete payload.projectAppointmentDurationMinutes;
      delete payload.projectAppointmentIsFree;
      delete payload.projectAppointmentPrice;
      delete payload.followUpEmailDelayDays;
      delete payload.retouchEmailDelayDays;

      const result = await updateUserInfoAction(payload);

      if (!result.ok) {
        console.error("Erreur lors de la mise à jour:", result.message);
        toast.error(result.message || "Erreur lors de la mise à jour du salon.");
        return;
      }

      if (hasProjectService || requiresFollowUpSettings) {
        const appointmentResult = await updateProjectAppointmentBookingAction({
          projectAppointmentDurationMinutes: hasProjectService
            ? projectDuration
            : undefined,
          projectAppointmentIsFree: hasProjectService ? projectIsFree : undefined,
          projectAppointmentPrice: hasProjectService
            ? projectIsFree
              ? undefined
              : projectPrice
            : undefined,
          followUpEmailDelayDays: requiresFollowUpSettings
            ? followUpDelay
            : undefined,
          retouchEmailDelayDays: requiresRetouchDelay ? retouchDelay : undefined,
        });

        if (!appointmentResult.ok) {
          toast.error(
            appointmentResult.message ||
              "Salon mis a jour, mais la configuration PROJET a echoue.",
          );
          return;
        }
      }

      toast.success("Salon mis à jour avec succès !");
      router.push("/mon-compte");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast.error("Erreur lors de la mise à jour du salon.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const persistImageRemoval = async (field: "image" | "profileImage") => {
    if (!salon) return;

    const previousValue = form.getValues(field);
    const clearedValue = "";

    form.setValue(field, clearedValue, { shouldDirty: true, shouldTouch: true });
    setSalon((prev) => (prev ? { ...prev, [field]: null } : prev));

    try {
      const payload = {
        ...form.getValues(),
        [field]: clearedValue,
        style: styleBadges,
      };
      delete payload.projectAppointmentDurationMinutes;
      delete payload.projectAppointmentIsFree;
      delete payload.projectAppointmentPrice;
      delete payload.followUpEmailDelayDays;
      delete payload.retouchEmailDelayDays;

      const result = await updateUserInfoAction(payload);
      if (!result.ok) {
        form.setValue(field, previousValue);
        setSalon((prev) => (prev ? { ...prev, [field]: previousValue ?? null } : prev));
        toast.error("Suppression impossible. Veuillez reessayer.");
        return;
      }

      toast.success("Image supprimee avec succes");
    } catch (error) {
      console.error("Erreur lors de la suppression persistante:", error);
      form.setValue(field, previousValue ?? undefined);
      setSalon((prev) => (prev ? { ...prev, [field]: previousValue ?? null } : prev));
      toast.error("Suppression impossible. Veuillez reessayer.");
    }
  };

  const labelClass =
    "mb-2 block text-xs font-medium text-white/70 font-one";
  const inputClass =
    "w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/45 focus:bg-white/[0.045] focus:ring-2 focus:ring-tertiary-400/10 font-two";
  const badgeClass =
    "inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/75 font-one";
  const selectedPrestations = form.watch("prestations") ?? [];
  const showProjectConfig = selectedPrestations.includes("PROJET");
  const showFollowUpEmailConfig = selectedPrestations.some((prestation) =>
    ["TATTOO", "RETOUCHE", "PIERCING"].includes(prestation),
  );
  const showRetouchEmailDelay = selectedPrestations.includes("RETOUCHE");
  const projectIsFree = form.watch("projectAppointmentIsFree") ?? false;
  const projectDuration = form.watch("projectAppointmentDurationMinutes");

  const projectDurationOptions = [30, 60, 90, 120, 150, 180, 210, 240];
  const formatDurationLabel = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const rem = minutes % 60;
    return rem === 0 ? `${hours} h` : `${hours} h ${rem}`;
  };

  const handleAddStyle = () => {
    const val = styleInput.trim();
    if (val && !styleBadges.includes(val)) {
      const updated = [...styleBadges, val];
      setStyleBadges(updated);
      form.setValue("style", updated, { shouldDirty: true, shouldTouch: true });
    }
    setStyleInput("");
  };

  const handleRemoveStyle = (val: string) => {
    const updated = styleBadges.filter((s) => s !== val);
    setStyleBadges(updated);
    form.setValue("style", updated, { shouldDirty: true, shouldTouch: true });
  };

  if (!salon) {
    return <SkeletonForm />;
  }

  return (
    <div className="wrapper-global pb-24 pt-5 lg:pb-8">
      <section className="w-full">
        <CreationPageHeader category="Mon compte" context="Profil du salon" title="Modifier les informations du salon" description="Présentez votre univers, mettez à jour vos coordonnées et préparez l’accueil de vos clients." backHref="/mon-compte" backLabel="Retour au profil du salon" />
        <CreationWorkspace sections={[
          { id: "salon-visual", label: "Photos du salon", hint: "Profil et couverture" },
          { id: "salon-identity", label: "Identité", hint: "Le salon et son propriétaire" },
          { id: "salon-contact", label: "Coordonnées", hint: "Téléphone et localisation" },
          { id: "salon-description-section", label: "Présentation", hint: "Votre univers en quelques mots" },
          { id: "salon-online", label: "Présence en ligne", hint: "Réseaux sociaux et site web" },
          { id: "salon-services", label: "Prestations", hint: "Votre offre" },
          { id: "salon-specialties", label: "Spécialités", hint: "Vos styles de tatouage" },
          ...(showProjectConfig ? [{ id: "salon-booking", label: "Rendez-vous projet", hint: "Durée et tarif" }] : []),
          ...(showFollowUpEmailConfig ? [{ id: "salon-followup", label: "Suivi client", hint: "Les emails après la séance" }] : []),
          ...(selectedPrestations.includes("PIERCING") ? [{ id: "salon-piercing", label: "Catalogue piercing", hint: "Zones, services et tarifs" }] : []),
        ]} summary={<div className="space-y-4"><div><p className="break-words text-sm font-medium text-white/85">{form.watch("salonName") || "Votre salon"}</p><p className="mt-1 text-[11px] text-white/40">{[form.watch("postalCode"), form.watch("city")].filter(Boolean).join(" ") || "Localisation à compléter"}</p></div><div className="flex flex-wrap gap-1.5">{selectedPrestations.map((service) => <span key={service} className="rounded-md bg-white/5 px-2 py-1 text-[10px] text-white/55">{{ TATTOO: "Tatouage", PROJET: "Projet", RETOUCHE: "Retouche", PIERCING: "Piercing" }[service]}</span>)}</div><p className="text-[11px] leading-5 text-white/35">Complétez chaque rubrique pour aider vos clients à découvrir le salon et préparer leur visite.</p></div>}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid min-w-0 grid-cols-12 gap-4"
          >
            <div id="salon-visual" className="col-span-12 min-w-0 scroll-mt-5 rounded-2xl border border-white/10 bg-noir-600 p-4 sm:p-5">
              <FormSectionHeader eyebrow="01 · Identité visuelle" title="L’image de votre salon" description="Votre photo de profil et votre couverture donnent le premier aperçu de votre univers." icon={<ImagePlus size={18} />} />
              <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]">
              <div className="flex min-w-0 flex-col rounded-xl border border-white/[0.07] bg-black/10 p-3 sm:p-4">
                <div className="mb-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white font-one">Photo de profil</h3>
                    <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/45 font-one">Format carré</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-white/50 font-two">Le repère visuel pour reconnaître votre salon au premier regard.</p>
                </div>
                <SalonImageUploader
                  appearance="identity"
                  variant="profile"
                  currentImage={form.watch("profileImage") ?? undefined}
                  onImageUpload={(imageUrl) => {
                    form.setValue("profileImage", imageUrl);
                  }}
                  onImageRemove={() => persistImageRemoval("profileImage")}
                />
              </div>

              <div className="flex min-w-0 flex-col rounded-xl border border-white/[0.07] bg-black/10 p-3 sm:p-4">
                <div className="mb-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white font-one">Couverture du salon</h3>
                    <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/45 font-one">Paysage · 16:6</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-white/50 font-two">Mettez en scène votre espace, vos créations ou l’ambiance du salon.</p>
                </div>
                <SalonImageUploader
                  appearance="identity"
                  variant="banner"
                  currentImage={form.watch("image") ?? undefined}
                  onImageUpload={(imageUrl) => {
                    form.setValue("image", imageUrl);
                  }}
                  onImageRemove={() => persistImageRemoval("image")}
                />
              </div>
            </div>

            </div>
            <div id="salon-identity" className="scroll-mt-5 border border-white/10 bg-noir-600 col-span-12 min-w-0 rounded-2xl p-4 sm:p-5 2xl:col-span-6">
              <FormSectionHeader eyebrow="02 · Identité" title="Votre salon et son propriétaire" description="Les informations essentielles de votre compte professionnel." icon={<UserRound size={18} />} />
              <div className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="salon-salonName" className={labelClass}>Nom du salon</label>
                  <input id="salon-salonName" aria-invalid={Boolean(form.formState.errors.salonName)} aria-describedby={form.formState.errors.salonName ? "salon-salonName-error" : undefined}
                    placeholder="Nom du salon"
                    {...form.register("salonName")}
                    className={inputClass}
                  />
                    {form.formState.errors.salonName && <p id="salon-salonName-error" role="alert" className="mt-1 text-xs text-red-300">{form.formState.errors.salonName?.message}</p>}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label htmlFor="salon-firstName" className={labelClass}>Prénom du propriétaire</label>
                    <input id="salon-firstName" aria-invalid={Boolean(form.formState.errors.firstName)} aria-describedby={form.formState.errors.firstName ? "salon-firstName-error" : undefined}
                      placeholder="Prénom"
                      {...form.register("firstName")}
                      className={inputClass}
                    />
                    {form.formState.errors.firstName && <p id="salon-firstName-error" role="alert" className="mt-1 text-xs text-red-300">{form.formState.errors.firstName?.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="salon-lastName" className={labelClass}>Nom du propriétaire</label>
                    <input id="salon-lastName" aria-invalid={Boolean(form.formState.errors.lastName)} aria-describedby={form.formState.errors.lastName ? "salon-lastName-error" : undefined}
                      placeholder="Nom"
                      {...form.register("lastName")}
                      className={inputClass}
                    />
                    {form.formState.errors.lastName && <p id="salon-lastName-error" role="alert" className="mt-1 text-xs text-red-300">{form.formState.errors.lastName?.message}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div id="salon-contact" className="scroll-mt-5 border border-white/10 bg-noir-600 col-span-12 min-w-0 rounded-2xl p-4 sm:p-5 2xl:col-span-6">
              <FormSectionHeader eyebrow="03 · Coordonnées" title="Où vous trouver ?" description="Renseignez les coordonnées utiles pour vous contacter et vous rendre visite." icon={<MapPin size={18} />} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="salon-phone" className={labelClass}>Téléphone</label>
                  <input id="salon-phone" aria-invalid={Boolean(form.formState.errors.phone)} aria-describedby={form.formState.errors.phone ? "salon-phone-error" : undefined}
                    placeholder="Téléphone"
                    {...form.register("phone")}
                    className={inputClass}
                  />
                    {form.formState.errors.phone && <p id="salon-phone-error" role="alert" className="mt-1 text-xs text-red-300">{form.formState.errors.phone?.message}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="salon-address" className={labelClass}>Adresse</label>
                  <input id="salon-address" aria-invalid={Boolean(form.formState.errors.address)} aria-describedby={form.formState.errors.address ? "salon-address-error" : undefined}
                    placeholder="Adresse"
                    {...form.register("address")}
                    className={inputClass}
                  />
                    {form.formState.errors.address && <p id="salon-address-error" role="alert" className="mt-1 text-xs text-red-300">{form.formState.errors.address?.message}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="salon-city" className={labelClass}>Ville</label>
                  <FrenchCitySelect id="salon-city" city={form.watch("city")} postalCode={form.watch("postalCode")}
                    disabled={isSubmitting}
                    onChange={(city, postalCode) => {
                      form.setValue("city", city, { shouldDirty: true, shouldValidate: true });
                      form.setValue("postalCode", postalCode, { shouldDirty: true, shouldValidate: true });
                    }}
                    className={inputClass}
                  />
                    {form.formState.errors.city && <p id="salon-city-error" role="alert" className="mt-1 text-xs text-red-300">{form.formState.errors.city?.message}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="salon-postalCode" className={labelClass}>Code postal</label>
                  <input id="salon-postalCode" aria-invalid={Boolean(form.formState.errors.postalCode)} aria-describedby={form.formState.errors.postalCode ? "salon-postalCode-error" : undefined}
                    placeholder="Code postal"
                    readOnly
                    {...form.register("postalCode")}
                    className={inputClass}
                  />
                    {form.formState.errors.postalCode && <p id="salon-postalCode-error" role="alert" className="mt-1 text-xs text-red-300">{form.formState.errors.postalCode?.message}</p>}
                </div>
              </div>
            </div>

            <div id="salon-description-section" className="scroll-mt-5 border border-white/10 bg-noir-600 col-span-12 min-w-0 rounded-2xl p-4 sm:p-5">
              <FormSectionHeader eyebrow="04 · Présentation" title="Racontez votre univers" description="Présentez votre approche, votre ambiance et ce qui vous distingue." icon={<FileText size={18} />} />
              <div className="space-y-1">
                <label htmlFor="salon-description" className={labelClass}>Description du salon</label>
                <textarea id="salon-description" aria-invalid={Boolean(form.formState.errors.description)} aria-describedby={form.formState.errors.description ? "salon-description-error" : undefined}
                  placeholder="Décrivez votre salon, votre style, votre ambiance..."
                  {...form.register("description")}
                  rows={4}
                  className={`${inputClass} resize-y`}
                />
              </div>
            </div>

            <div id="salon-online" className="scroll-mt-5 border border-white/10 bg-noir-600 col-span-12 min-w-0 rounded-2xl p-4 sm:p-5 2xl:col-span-6">
              <FormSectionHeader eyebrow="05 · Présence en ligne" title="Gardez le contact" description="Ajoutez les liens de vos réseaux sociaux et de votre site." icon={<Globe size={18} />} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="salon-instagram" className={labelClass}>Instagram</label>
                  <input id="salon-instagram" aria-invalid={Boolean(form.formState.errors.instagram)} aria-describedby={form.formState.errors.instagram ? "salon-instagram-error" : undefined}
                    placeholder="Lien Instagram"
                    {...form.register("instagram")}
                    className={inputClass}
                  />
                    {form.formState.errors.instagram && <p id="salon-instagram-error" role="alert" className="mt-1 text-xs text-red-300">{form.formState.errors.instagram?.message}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="salon-facebook" className={labelClass}>Facebook</label>
                  <input id="salon-facebook" aria-invalid={Boolean(form.formState.errors.facebook)} aria-describedby={form.formState.errors.facebook ? "salon-facebook-error" : undefined}
                    placeholder="Lien Facebook"
                    {...form.register("facebook")}
                    className={inputClass}
                  />
                    {form.formState.errors.facebook && <p id="salon-facebook-error" role="alert" className="mt-1 text-xs text-red-300">{form.formState.errors.facebook?.message}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="salon-tiktok" className={labelClass}>TikTok</label>
                  <input id="salon-tiktok" aria-invalid={Boolean(form.formState.errors.tiktok)} aria-describedby={form.formState.errors.tiktok ? "salon-tiktok-error" : undefined}
                    placeholder="Lien TikTok"
                    {...form.register("tiktok")}
                    className={inputClass}
                  />
                    {form.formState.errors.tiktok && <p id="salon-tiktok-error" role="alert" className="mt-1 text-xs text-red-300">{form.formState.errors.tiktok?.message}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="salon-website" className={labelClass}>Site web</label>
                  <input id="salon-website" aria-invalid={Boolean(form.formState.errors.website)} aria-describedby={form.formState.errors.website ? "salon-website-error" : undefined}
                    placeholder="URL de votre site"
                    {...form.register("website")}
                    className={inputClass}
                  />
                    {form.formState.errors.website && <p id="salon-website-error" role="alert" className="mt-1 text-xs text-red-300">{form.formState.errors.website?.message}</p>}
                </div>
              </div>
            </div>

            <div id="salon-services" className="col-span-12 2xl:col-span-6 scroll-mt-5 border border-white/10 bg-noir-600 min-w-0 rounded-2xl p-4 sm:p-5">
              <FormSectionHeader eyebrow="06 · Prestations" title="Que proposez-vous ?" description="Les réglages de réservation apparaissent selon votre sélection." icon={<Sparkles size={18} />} />

              <p className="mb-3 text-xs leading-5 text-white/60 font-one">
                Sélectionnez une ou plusieurs prestations proposées par le salon.
              </p>

              {(() => {
                const options = [
                  "TATTOO",
                  "RETOUCHE",
                  "PROJET",
                  "PIERCING",
                ] as const;
                const selected = selectedPrestations;

                return (
                  <div className="flex flex-wrap gap-1.5">
                    {options.map((opt) => {
                      const isActive = selected.includes(opt);
                      return (
                        <label
                          key={opt}
                          className={`cursor-pointer inline-flex min-h-10 items-center rounded-xl border px-4 py-2 text-sm font-one transition focus-within:ring-2 focus-within:ring-tertiary-400/50
                ${
                  isActive
                    ? "border-tertiary-400/40 bg-tertiary-500/10 text-tertiary-400"
                    : "border-white/15 bg-white/10 text-white/80 hover:bg-white/15"
                }`}
                        >
                          <input
                            type="checkbox"
                            value={opt}
                            {...form.register("prestations")}
                            className="sr-only"
                          />
                          {{ TATTOO: "Tatouage", RETOUCHE: "Retouche", PROJET: "Projet", PIERCING: "Piercing" }[opt]}
                        </label>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div id="salon-specialties" className="col-span-12 scroll-mt-5 border border-white/10 bg-noir-600 min-w-0 rounded-2xl p-4 sm:p-5">
              <FormSectionHeader eyebrow="07 · Spécialités" title="Vos styles de tatouage" description="Aidez les clients à reconnaître votre savoir-faire." icon={<Palette size={18} />} />

              <p className="mb-3 text-xs leading-5 text-white/60 font-one">
                Ajoutez les styles pratiqués (ex: japonais, old school, realism).
              </p>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  aria-label="Ajouter un style de tatouage"
                  type="text"
                  value={styleInput}
                  onChange={(e) => setStyleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddStyle();
                    }
                  }}
                  placeholder="Ajouter un style"
                  className={inputClass}
                />
                <DashboardButton variant="secondary" onClick={handleAddStyle} disabled={!styleInput.trim()} className="min-w-0">Ajouter</DashboardButton>
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {styleBadges.map((style) => (
                  <span key={style} className={badgeClass}>
                    {style}
                    <button
                      type="button"
                      onClick={() => handleRemoveStyle(style)}
                      className="ml-0.5 text-tertiary-300 hover:text-red-300"
                      title="Supprimer"
                      aria-label={`Retirer le style ${style}`}
                    >
                      <IoClose size={14} className="cursor-pointer" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {showProjectConfig ? (
              <div id="salon-booking" className={`scroll-mt-5 border border-white/10 bg-noir-600 col-span-12 min-w-0 rounded-2xl p-4 sm:p-5 ${showFollowUpEmailConfig ? "2xl:col-span-6" : ""}`}>
                <FormSectionHeader eyebrow="Réservation · Projet" title="Préparez le premier échange" description="Définissez la durée et le tarif du rendez-vous consacré au projet de votre client." icon={<CalendarClock size={18} />} />
                <div className="mb-5 flex flex-wrap gap-2">
                  <span className={badgeClass}>{projectDuration ? formatDurationLabel(projectDuration) : "Durée à définir"}</span>
                  <span className={badgeClass}>{projectIsFree ? "Rendez-vous gratuit" : "Rendez-vous payant"}</span>
                </div>
                <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label htmlFor="salon-projectAppointmentDurationMinutes" className={labelClass}>Durée (minutes)</label>
                    <select id="salon-projectAppointmentDurationMinutes" aria-invalid={Boolean(form.formState.errors.projectAppointmentDurationMinutes)} aria-describedby={form.formState.errors.projectAppointmentDurationMinutes ? "salon-projectAppointmentDurationMinutes-error" : undefined}
                      {...form.register("projectAppointmentDurationMinutes", {
                        setValueAs: (val) =>
                          val === "" ? undefined : Number(val),
                      })}
                      className={inputClass}
                    >
                      <option value="" className="bg-noir-500">Choisir</option>
                      {projectDurationOptions.map((minutes) => (
                        <option key={minutes} value={minutes} className="bg-noir-500">
                          {formatDurationLabel(minutes)} ({minutes} min)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className={labelClass}>Tarification</label>
                    <label className="inline-flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl border border-tertiary-400/20 bg-tertiary-500/5 px-3.5 py-2.5 text-sm text-white font-one focus-within:ring-2 focus-within:ring-tertiary-400/40">
                      <input
                        type="checkbox"
                        className="size-4 accent-tertiary-500" checked={projectIsFree}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          form.setValue("projectAppointmentIsFree", checked, {
                            shouldDirty: true,
                            shouldTouch: true,
                          });

                          if (checked) {
                            form.setValue("projectAppointmentPrice", undefined, {
                              shouldDirty: true,
                              shouldTouch: true,
                            });
                          }
                        }}
                      />
                      Prestation gratuite
                    </label>
                  </div>

                  {!projectIsFree ? (
                    <div className="space-y-1">
                    <label htmlFor="salon-projectAppointmentPrice" className={labelClass}>Prix (EUR)</label>
                    <input id="salon-projectAppointmentPrice" aria-invalid={Boolean(form.formState.errors.projectAppointmentPrice)} aria-describedby={form.formState.errors.projectAppointmentPrice ? "salon-projectAppointmentPrice-error" : undefined}
                      type="number"
                      min={0}
                      step={1}
                      placeholder="Ex: 50"
                      {...form.register("projectAppointmentPrice", {
                        valueAsNumber: true,
                      })}
                      className={inputClass}
                    />
                    {form.formState.errors.projectAppointmentPrice && <p id="salon-projectAppointmentPrice-error" role="alert" className="mt-1 text-xs text-red-300">{form.formState.errors.projectAppointmentPrice?.message}</p>}
                  </div>
                  ) : (
                    <div className="flex justify-center items-center rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100 font-one">
                      <p>Le client ne paie pas la prestation projet.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {showFollowUpEmailConfig ? (
              <div id="salon-followup" className={`scroll-mt-5 border border-white/10 bg-noir-600 col-span-12 min-w-0 rounded-2xl p-4 sm:p-5 ${showProjectConfig ? "2xl:col-span-6" : ""}`}>
                <FormSectionHeader eyebrow="Relation client · Suivi" title="Gardez le contact après la séance" description="Personnalisez le délai d’envoi de vos emails de suivi, en jours après le rendez-vous." icon={<Mail size={18} />} />
                <div className={`grid grid-cols-1 gap-4 ${showRetouchEmailDelay ? "sm:grid-cols-2" : "sm:max-w-lg"}`}>
                  <div className="rounded-2xl border border-white/10 bg-black/10 p-4"><p className="mb-3 text-xs leading-5 text-white/50 font-two">Prenez des nouvelles de votre client après sa séance.</p><label htmlFor="salon-followUpEmailDelayDays" className={labelClass}>Suivi général (jours)</label>
                    <input id="salon-followUpEmailDelayDays" aria-invalid={Boolean(form.formState.errors.followUpEmailDelayDays)} aria-describedby={form.formState.errors.followUpEmailDelayDays ? "salon-followUpEmailDelayDays-error" : undefined}
                      type="number"
                      min={1}
                      step={1}
                      placeholder="Ex: 3"
                      {...form.register("followUpEmailDelayDays", {
                        valueAsNumber: true,
                      })}
                      className={inputClass}
                    />
                    {form.formState.errors.followUpEmailDelayDays && <p id="salon-followUpEmailDelayDays-error" role="alert" className="mt-1 text-xs text-red-300">{form.formState.errors.followUpEmailDelayDays?.message}</p>}
                  </div>

                  {showRetouchEmailDelay ? (
                    <div className="rounded-2xl border border-white/10 bg-black/10 p-4"><p className="mb-3 text-xs leading-5 text-white/50 font-two">Programmez un suivi dédié aux retouches.</p><label htmlFor="salon-retouchEmailDelayDays" className={labelClass}>Suivi retouche (jours)</label>
                      <input id="salon-retouchEmailDelayDays" aria-invalid={Boolean(form.formState.errors.retouchEmailDelayDays)} aria-describedby={form.formState.errors.retouchEmailDelayDays ? "salon-retouchEmailDelayDays-error" : undefined}
                        type="number"
                        min={1}
                        step={1}
                        placeholder="Ex: 30"
                        {...form.register("retouchEmailDelayDays", {
                          valueAsNumber: true,
                        })}
                        className={inputClass}
                      />
                    {form.formState.errors.retouchEmailDelayDays && <p id="salon-retouchEmailDelayDays-error" role="alert" className="mt-1 text-xs text-red-300">{form.formState.errors.retouchEmailDelayDays?.message}</p>}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

          {(() => {
            const showPiercing = selectedPrestations.includes("PIERCING");

            if (!showPiercing) return null;

            return (
              <div className="scroll-mt-5 border border-white/10 bg-noir-600 col-span-12 min-w-0 rounded-2xl p-4 sm:p-5">
                <div id="salon-piercing" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <FormSectionHeader eyebrow="Catalogue · Piercing" title="Vos zones, services et tarifs" description="Composez votre offre de piercing et ajustez les prestations disponibles pour vos clients." icon={<Gem size={18} />} />
                  <DashboardButton
                    href="/mon-compte/piercing"
                    className="!min-w-0 !rounded-xl !shadow-none"
                  >
                    Configurer les piercings <ArrowRight size={15} aria-hidden="true" />
                  </DashboardButton>
                </div>
              </div>
            );
          })()}

            <div className="sticky bottom-4 z-20 col-span-12 flex flex-wrap items-center justify-end gap-2 rounded-2xl border border-white/10 bg-noir-600/95 p-4 shadow-xl shadow-black/20 backdrop-blur-xl">
              <DashboardButton
                variant="secondary"
                onClick={() => router.push("/mon-compte")}
                disabled={isSubmitting}
                className="!min-w-0 !rounded-xl !shadow-none"
              >
                Annuler
              </DashboardButton>
              <DashboardButton
                type="submit"
                disabled={isSubmitting}
                className="!min-w-0 !rounded-xl !shadow-none"
              >
                {isSubmitting ? (
                  <><LoaderCircle size={15} className="animate-spin" aria-hidden="true" /><span>Enregistrement…</span></>
                ) : (
                  <><Save size={15} aria-hidden="true" /><span>Enregistrer les modifications</span></>
                )}
              </DashboardButton>
            </div>
          </form>
        </CreationWorkspace>
      </section>
    </div>
  );
}

function FormSectionHeader({ eyebrow, title, description, icon }: { eyebrow: string; title: string; description: string; icon: ReactNode }) {
  return <div className="mb-5 flex items-start gap-3">
    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-tertiary-400/20 bg-tertiary-400/10 text-tertiary-400" aria-hidden="true">{icon}</span>
    <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35 font-one">{eyebrow}</p><h3 className="mt-1 text-base font-semibold tracking-tight text-white font-one">{title}</h3><p className="mt-1 text-xs leading-5 text-white/50 font-two">{description}</p></div>
  </div>;
}
