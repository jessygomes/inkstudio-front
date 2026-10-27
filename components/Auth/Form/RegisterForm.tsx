/* eslint-disable react/no-unescaped-entities */
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import styles from "../AuthForms.module.css";
import SignupProfileInfo from "../SignupProfileInfo";
import SignupPlanDetails from "../SignupPlanDetails";
import SignupAccessFields, { type SignupAccessValues } from "../SignupAccessFields";
import DashboardButton from "@/components/Shared/DashboardButton";
import { Building2, Check, Sparkles, UserRound } from "lucide-react";
import { FormError } from "@/components/Shared/FormError";
import { FormSuccess } from "@/components/Shared/FormSuccess";
import Link from "next/link";
import { toast } from "sonner";
import { step1Schema, step2Schema, step3Schema } from "@/lib/zod/validator.schema";
import { isSignupPlanAllowed, isInkeraTrialEligible, type SignupPlan, type SignupRole } from "@/lib/offers";
// import { createSession } from "@/lib/session";

interface RegisterProps {
  isTatoueurProOfferActive: boolean;
}

export const Register = ({ isTatoueurProOfferActive }: RegisterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawCallbackUrl = searchParams.get("callbackUrl");
  const safeCallbackUrl = rawCallbackUrl?.startsWith("/")
    ? rawCallbackUrl
    : null;

  const preselectedPlan = useMemo<SignupPlan>(() => {
    if (!safeCallbackUrl) {
      return "FREE";
    }

    try {
      const url = new URL(safeCallbackUrl, "https://inkera-studio.local");
      const checkoutPlan = url.searchParams.get("checkout");

      if (checkoutPlan === "PRO" || checkoutPlan === "BUSINESS") {
        return checkoutPlan;
      }

      return "FREE";
    } catch {
      return "FREE";
    }
  }, [safeCallbackUrl]);

  const connexionHref = safeCallbackUrl
    ? `/connexion?callbackUrl=${encodeURIComponent(safeCallbackUrl)}`
    : "/connexion";

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, setIsPending] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);


  // Données collectées à travers les étapes
  const [formData, setFormData] = useState(() => ({
    role: "user_salon" as SignupRole,
    salonName: "",
    saasPlan: preselectedPlan as SignupPlan,
    firstName: "",
    lastName: "",
    phone: "",
    website: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  }));

  // Formulaires pour chaque étape
  const step1Form = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: { role: formData.role, salonName: formData.salonName },
  });

  const step2Form = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: { saasPlan: formData.saasPlan },
  });

  const step3Form = useForm<SignupAccessValues>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      website: formData.website,
      email: formData.email,
      password: formData.password,
      passwordConfirmation: formData.passwordConfirmation,
    },
  });

  const previousStep = useRef(currentStep);
  useEffect(() => {
    if (previousStep.current !== currentStep) {
      document.getElementById(currentStep === 1 ? "salonName" : currentStep === 2 ? "saasPlan" : "firstName")?.focus();
      previousStep.current = currentStep;
    }
  }, [currentStep]);

  // Navigation entre les étapes
  const nextStep = () => {
    setError("");
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setError("");
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Gestionnaires pour chaque étape
  const handleStep1Submit = (data: { role: SignupRole; salonName: string }) => {
    const nextPlan =
      data.role === "user_tatoueur" &&
      isTatoueurProOfferActive
        ? "PRO"
        : data.role === "user_salon"
          ? preselectedPlan === "BUSINESS" ? "BUSINESS" : "FREE"
          : isSignupPlanAllowed(data.role, formData.saasPlan) ? formData.saasPlan : "FREE";

    setFormData({
      ...formData,
      role: data.role,
      salonName: data.salonName,
      saasPlan: nextPlan,
    });

    step2Form.setValue("saasPlan", nextPlan, {
      shouldDirty: true,
      shouldTouch: true,
    });

    nextStep();
  };

  const handleStep2Submit = (data: { saasPlan: SignupPlan }) => {
    let nextPlan: SignupPlan = data.saasPlan;

    if (!isSignupPlanAllowed(formData.role, nextPlan)) {
      nextPlan = "FREE";
    }

    // Quand l'offre est active, les indépendants restent sur PRO.
    if (formData.role === "user_tatoueur" && isTatoueurProOfferActive) {
      nextPlan = "PRO";
    }

    setFormData({ ...formData, saasPlan: nextPlan });
    nextStep();
  };

  const handleStep3Submit = async (data: SignupAccessValues) => {
    setError("");
    setSuccess("");
    setIsPending(true);

    try {
      let selectedPlan: SignupPlan = formData.saasPlan;

      if (!isSignupPlanAllowed(formData.role, selectedPlan)) {
        selectedPlan = "FREE";
      }

      if (formData.role === "user_tatoueur" && isTatoueurProOfferActive) {
        selectedPlan = "PRO";
      }

      const skipStripeCheckout = isInkeraTrialEligible(
        formData.role,
        selectedPlan,
      );

      const finalData = {
        ...formData,
        role: formData.role,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        website: data.website,
        email: data.email,
        password: data.password,
        saasPlan: selectedPlan,
        checkoutPlan:
          selectedPlan !== "FREE" && !skipStripeCheckout ? selectedPlan : null,
      };

      // Créer le compte utilisateur et obtenir la checkout URL si plan payant
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(finalData),
        },
      );

      const infos = await response.json();

      if (!response.ok || infos.error) {
        const errorMessage =
          infos.message ||
          infos.error ||
          "Une erreur est survenue lors de l'inscription.";
        setError(errorMessage);
        setIsPending(false);
        return;
      }

      toast.success("Un e-mail de vérification vous a été envoyé.", {
        id: "signup-email-verification",
        description: "Consultez votre boîte de réception et vos courriers indésirables pour activer votre compte Inkera Studio.",
        duration: 12000,
      });
      try {
        sessionStorage.setItem("signup_notice_pending", "1");
        sessionStorage.setItem("signup_notice_email", data.email);
        sessionStorage.setItem("signup_notice_plan", skipStripeCheckout ? "FREE" : selectedPlan);
      } catch {
        // Le toast global reste affiché pendant la navigation interne.
      }

      // L'utilisateur a choisi un plan payant (STUDIO ou PRO)
      const isPaymentPlanSelected =
        selectedPlan !== "FREE" && !skipStripeCheckout;

      if (isPaymentPlanSelected) {
        // Le backend a créé la checkout session et retourne l'URL
        const checkoutUrl = infos.checkoutUrl;
        const checkoutError = infos.checkoutError;

        if (checkoutError) {
          // Erreur Stripe : afficher le message mais ne pas bloquer l'inscription
          setError(`Erreur paiement: ${checkoutError}`);
          console.warn(
            "⚠️ Erreur lors de la création de la session Stripe:",
            checkoutError,
          );
          // Laisser l'utilisateur accéder à son compte en version gratuite
          setSuccess(
            infos.message ||
              "Inscription réussie ! (Plan payant non disponible pour le moment)",
          );
          setIsPending(false);
          setTimeout(() => router.push(connexionHref), 3000);
          return;
        }

        if (!checkoutUrl) {
          throw new Error(
            infos.message || "Impossible de créer la session de paiement",
          );
        }

        setSuccess("Compte créé. Redirection vers le paiement...");

        // Rediriger l'utilisateur vers Stripe
        setIsPending(false);
        window.location.href = checkoutUrl;
        return;
      }

      // Plan FREE: redirection après succès
      setSuccess(
        skipStripeCheckout
          ? `Inscription réussie ! Votre offre ${selectedPlan === "BUSINESS" ? "Business avec 60 jours" : "Pro avec 3 mois"} offerts est activée, sans carte bancaire.`
          : infos.message || "Inscription réussie !",
      );
      setIsPending(false);
      setTimeout(() => router.push(connexionHref), 3000);
    } catch (error) {
      console.error("❌ Erreur lors de l'inscription :", error);
      setError(
        error instanceof Error
          ? error.message
          : "Impossible de s'inscrire. Veuillez réessayer plus tard.",
      );
      setIsPending(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Choisissez votre profil";
      case 2:
        return "Choisissez votre plan";
      case 3:
        return "Vos informations";
      default:
        return "Inscription";
    }
  };

  return (
    <div>
      <div className={`${styles.card} ${styles.registration}`}>
        <header className={styles.heading}>
          <span className={styles.kicker}><Sparkles size={13} />Bienvenue chez Inkera</span>
          <h1>{getStepTitle()}</h1>
          <p>Un espace pour votre activité. Commençons par le vôtre.</p>
        </header>
        <ol className={styles.steps} aria-label="Étapes de création du compte">
          {["Votre profil", "Votre offre", "Vos accès"].map((label, index) => (
            <li key={label} aria-current={currentStep === index + 1 ? "step" : undefined} data-complete={currentStep > index + 1}>
              <span aria-hidden="true">{currentStep > index + 1 ? <Check size={12} /> : index + 1}</span>
              <span>{label}</span>
            </li>
          ))}
        </ol>
          <div>
            {/* Étape 1: Nom du salon */}
            {currentStep === 1 && (
              <form
                className="font-one text-white"
                onSubmit={step1Form.handleSubmit(handleStep1Submit)}
              >
                <div className="flex flex-col gap-4 p-2">
                  <div>
                    <p className={styles.profileHint}>
                      Un salon ou un tatoueur indépendant ? Choisissez le profil qui correspond à votre activité.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 font-one">
                    <fieldset className={styles.profileOptions}>
                      <legend>Votre activité</legend>
                      {([
                        { value: "user_salon", label: "Un salon", hint: "Un lieu, une équipe", icon: Building2 },
                        { value: "user_tatoueur", label: "Indépendant", hint: "Votre propre activité", icon: UserRound },
                      ] as const).map(({ value, label, hint, icon: Icon }) => (
                        <label key={value} className={styles.profileOption}>
                          <input type="radio" value={value} checked={step1Form.watch("role") === value} {...step1Form.register("role")} className="sr-only" />
                          <Icon size={21} aria-hidden="true" />
                          <span><strong>{label}</strong><small>{hint}</small></span>
                          <span className={styles.choiceMark} aria-hidden="true"><Check size={11} /></span>
                        </label>
                      ))}
                    </fieldset>
                    {step1Form.formState.errors.role && (
                      <p className="text-red-400 text-xs">
                        {step1Form.formState.errors.role.message}
                      </p>
                    )}
                  </div>

                  <SignupProfileInfo role={step1Form.watch("role")} />

                  <div className="flex flex-col gap-2 font-one">
                    <label htmlFor="salonName">{step1Form.watch("role") === "user_salon" ? "Nom du salon" : "Nom d’artiste"}</label>
                    <input
                      id="salonName"
                        autoComplete="organization"
                      placeholder={
                        step1Form.watch("role") === "user_salon"
                          ? "Ex: Ink Studio, Black Rose Tattoo..."
                          : "Ex: Nom d'artiste, pseudo professionnel..."
                      }
                      type="text"
                      required
                      className="bg-white/30 py-3 px-4 rounded-2xl text-sm w-full"
                      {...step1Form.register("salonName")}
                    />
                    {step1Form.formState.errors.salonName && (
                      <p className="text-red-400 text-xs">
                        {step1Form.watch("role") === "user_salon"
                          ? "Le nom du salon est requis."
                          : "Le nom affiché est requis."}
                      </p>
                    )}
                  </div>

                  <DashboardButton
                    className="!min-w-0 flex-1"
                    type="submit"
                  >
                    Continuer →
                  </DashboardButton>
                </div>
              </form>
            )}

            {/* Étape 2: Plan SaaS */}
            {currentStep === 2 && (
              <form
                className="font-one text-white"
                onSubmit={step2Form.handleSubmit(handleStep2Submit)}
              >
                <div className="flex flex-col gap-4 p-2">
                  <div className="text-center mb-4">
                    <p className="text-white/80 text-sm">
                      Sélectionnez le plan qui convient à vos besoins
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 font-one">
                    <label htmlFor="saasPlan" className="text-xs">
                      Plan d'abonnement *
                    </label>
                    <select
                      id="saasPlan"
                      required
                      className="bg-white/30 py-3 px-4 rounded-2xl text-white text-sm"
                      {...step2Form.register("saasPlan")}
                    >
                      <option value="FREE" className="bg-white text-black">
                        Free - 0€/mois
                      </option>
                      {formData.role === "user_tatoueur" && (
                        <option value="PRO" className="bg-white text-black">
                          Pro - 3 mois offerts puis 29,99€/mois
                        </option>
                      )}
                      {formData.role === "user_salon" && (
                        <option value="BUSINESS" className="bg-white text-black">
                          Business - 2 mois offerts puis 59,99€/mois
                        </option>
                      )}
                    </select>

                    {formData.role !== "user_tatoueur" && (
                      <p className="text-xs text-white/70">
                        Le plan Pro est actuellement réservé aux tatoueurs indépendants.
                      </p>
                    )}

                    {/* Détails du plan */}
                    <SignupPlanDetails plan={step2Form.watch("saasPlan")} role={formData.role} />
                  </div>

                  <div className="flex gap-3 mt-4">
                    <DashboardButton
                      type="button"
                      onClick={prevStep}
                      variant="secondary" className="!min-w-0 shrink-0"
                    >
                      ← Retour
                    </DashboardButton>
                    <DashboardButton
                      className="!min-w-0 flex-1"
                      type="submit"
                    >
                      Continuer →
                    </DashboardButton>
                  </div>
                </div>
              </form>
            )}

            {/* Étape 3: Informations utilisateur */}
            {currentStep === 3 && (
              <form
                className="font-one text-white"
                onSubmit={step3Form.handleSubmit(handleStep3Submit)}
              >
                <div className="flex flex-col gap-4 p-2">
                  <SignupAccessFields form={step3Form} disabled={isPending} />

                  {/* Messages d'erreur et de succès */}
                  <FormError message={error} />
                  <FormSuccess title="Votre compte est créé" message={success} />

                  <div className="flex gap-3 mt-4">
                    <DashboardButton
                      type="button"
                      onClick={prevStep}
                      disabled={isPending}
                      variant="secondary" className="!min-w-0 shrink-0"
                    >
                      ← Retour
                    </DashboardButton>
                    <DashboardButton
                      className="!min-w-0 flex-1"
                      type="submit"
                      disabled={isPending}
                    >
                      {isPending
                        ? "Création du compte…"
                        : "Créer mon compte →"}
                    </DashboardButton>
                  </div>
                </div>
              </form>
            )}
          </div>
      </div>

        {/* Lien de connexion */}
        <div className={styles.footnote}>
          <p>
            Vous avez déjà un compte ?{" "}
            <Link
              className="text-tertiary-400 hover:text-tertiary-500 transition-all ease-in-out duration-150"
              href={connexionHref}
            >
              Connectez-vous
            </Link>
          </p>
        </div>
    </div>
  );
};
