/* eslint-disable react/no-unescaped-entities */
"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CardWrapper } from "../CardWrapper";
// import { FormError } from "@/components/Shared/FormError";
// import { FormSuccess } from "@/components/Shared/FormSuccess";
import Link from "next/link";
// import { createSession } from "@/lib/session";

// Schémas pour chaque étape
const step1Schema = z.object({
  salonName: z.string().min(1, "Le nom du salon est requis"),
});

const step2Schema = z.object({
  saasPlan: z.enum(["FREE", "PRO", "BUSINESS", "TESTER"]),
});

const step3Schema = z
  .object({
    firstName: z.string().min(1, "Le prénom est requis"),
    lastName: z.string().min(1, "Le nom est requis"),
    phone: z.string().optional(),
    email: z.string().email("Email invalide"),
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Les mots de passe ne correspondent pas",
    path: ["passwordConfirmation"],
  });

export const Register = () => {
  const router = useRouter();

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, setIsPending] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  // Données collectées à travers les étapes
  const [formData, setFormData] = useState({
    salonName: "",
    saasPlan: "TESTER" as "FREE" | "PRO" | "BUSINESS" | "TESTER",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });

  // Formulaires pour chaque étape
  const step1Form = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: { salonName: formData.salonName },
  });

  const step2Form = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: { saasPlan: formData.saasPlan },
  });

  const step3Form = useForm({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      email: formData.email,
      password: formData.password,
      passwordConfirmation: formData.passwordConfirmation,
    },
  });

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
  const handleStep1Submit = (data: { salonName: string }) => {
    setFormData({ ...formData, salonName: data.salonName });
    nextStep();
  };

  const handleStep2Submit = (data: {
    saasPlan: "FREE" | "PRO" | "BUSINESS" | "TESTER";
  }) => {
    setFormData({ ...formData, saasPlan: data.saasPlan });
    nextStep();
  };

  const handleStep3Submit = async (data: {
    firstName: string;
    lastName: string;
    phone?: string;
    email: string;
    password: string;
    passwordConfirmation: string;
  }) => {
    setError("");
    setSuccess("");
    setIsPending(true);

    try {
      const finalData = {
        ...formData,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        password: data.password,
        // Convertir TESTER en FREE pour l'envoi au serveur
        saasPlan: formData.saasPlan === "TESTER" ? "FREE" : formData.saasPlan,
      };

      console.log("📤 Données finales envoyées:", finalData);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(finalData),
        }
      );

      const infos = await response.json();
      console.log("📥 Réponse du serveur:", infos);

      if (!response.ok || infos.error) {
        const errorMessage =
          infos.message ||
          infos.error ||
          "Une erreur est survenue lors de l'inscription.";
        setError(errorMessage);
        setIsPending(false);
        return;
      }

      setSuccess(infos.message || "Inscription réussie !");
      setIsPending(false);
      setTimeout(() => router.push("/connexion"), 3000);
    } catch (error) {
      console.error("❌ Erreur lors de l'inscription :", error);
      setError("Impossible de s'inscrire. Veuillez réessayer plus tard.");
      setIsPending(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Créez votre compte";
      case 2:
        return "Choisissez votre plan";
      case 3:
        return "Vos informations";
      default:
        return "Inscription";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-3 px-4">
      <div className="w-full">
        <CardWrapper headerLabel={getStepTitle()}>
          {/* Indicateur d'étapes */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      step <= currentStep
                        ? "bg-tertiary-500 text-white"
                        : "bg-white/20 text-white/50"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-8 h-0.5 mx-2 ${
                        step < currentStep ? "bg-tertiary-500" : "bg-white/20"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {/* Étape 1: Nom du salon */}
            {currentStep === 1 && (
              <form
                className="font-one text-white"
                onSubmit={step1Form.handleSubmit(handleStep1Submit)}
              >
                <div className="flex flex-col gap-4 p-2">
                  <div className="text-center mb-4">
                    <p className="text-white/80 text-sm">
                      Commençons par le nom de votre salon de tatouage
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 font-one">
                    <label htmlFor="salonName" className="text-xs">
                      Nom du salon *
                    </label>
                    <input
                      id="salonName"
                      placeholder="Ex: Ink Studio, Black Rose Tattoo..."
                      type="text"
                      required
                      className="bg-white/30 py-3 px-4 rounded-lg text-sm w-full"
                      {...step1Form.register("salonName")}
                    />
                    {step1Form.formState.errors.salonName && (
                      <p className="text-red-400 text-xs">
                        {step1Form.formState.errors.salonName.message}
                      </p>
                    )}
                  </div>

                  <button
                    className="cursor-pointer px-8 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-sm mt-4"
                    type="submit"
                  >
                    Continuer →
                  </button>
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
                      className="bg-white/30 py-3 px-4 rounded-lg text-white text-sm"
                      {...step2Form.register("saasPlan")}
                    >
                      <option
                        value="FREE"
                        className="bg-white text-black"
                        disabled
                      >
                        Gratuit - Fonctionnalités de base (Bientôt disponible)
                      </option>
                      <option
                        value="PRO"
                        className="bg-white text-black"
                        disabled
                      >
                        Pro - Fonctionnalités avancées (Bientôt disponible)
                      </option>
                      <option
                        value="BUSINESS"
                        className="bg-white text-black"
                        disabled
                      >
                        Business - Solution complète (Bientôt disponible)
                      </option>
                      <option value="TESTER" className="bg-white text-black">
                        Testeur - Accès anticipé au plan Business
                      </option>
                    </select>

                    {/* Détails du plan */}
                    <div className="mt-2 p-3 bg-white/10 rounded-lg border border-white/20">
                      {step2Form.watch("saasPlan") === "FREE" && (
                        <div className="text-xs text-white/80">
                          <p className="font-semibold mb-2 text-tertiary-400">
                            Plan Gratuit :
                          </p>
                          <div className="text-xs space-y-1">
                            <p>• Profil public professionnel</p>
                            <p>• Portfolio d’images</p>
                            <p>• Produits & services</p>
                            <p>• Profil tatoueur principal</p>
                            <p>• Lien direct de contact</p>
                          </div>
                        </div>
                      )}
                      {step2Form.watch("saasPlan") === "PRO" && (
                        <div className="text-xs text-white/80">
                          <p className="font-semibold mb-2 text-tertiary-400">
                            Plan Pro - 29€/mois :
                          </p>
                          <div className="text-xs space-y-1">
                            <p>• 1 tatoueur</p>
                            <p>• Gestion clients illimitée</p>
                            <p>• Réservation en ligne</p>
                            <p>• Profil public</p>
                            <p>• Support email</p>
                          </div>
                        </div>
                      )}
                      {step2Form.watch("saasPlan") === "BUSINESS" && (
                        <div className="text-xs text-white/80">
                          <p className="font-semibold mb-2 text-tertiary-400">
                            Plan Business - 69€/mois :
                          </p>
                          <div className="text-xs space-y-1">
                            <p>• Tatoueurs illimités</p>
                            <p>• Gestion du stock</p>
                            <p>• Tout du plan Pro</p>
                            <p>• Statistiques détaillées</p>
                            <p>• Support prioritaire</p>
                          </div>
                        </div>
                      )}
                      {step2Form.watch("saasPlan") === "TESTER" && (
                        <div className="text-xs text-white/80">
                          <p className="font-semibold mb-2 text-tertiary-400">
                            🧪 Programme Testeur :
                          </p>
                          <div className="text-xs space-y-1">
                            <p>• Accès GRATUIT au plan Business complet</p>
                            <p>• Tatoueurs illimités</p>
                            <p>• Gestion du stock</p>
                            <p>• Toutes les fonctionnalités premium</p>
                            <p>• Support direct avec l'équipe INKERA</p>
                            <p>• Participation au développement produit</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Note sur les plans payants */}
                    {(step2Form.watch("saasPlan") === "PRO" ||
                      step2Form.watch("saasPlan") === "BUSINESS") && (
                      <div className="bg-tertiary-500/10 border border-tertiary-500/30 rounded-lg p-3 mt-2">
                        <div className="flex items-start gap-2">
                          <svg
                            className="w-4 h-4 text-tertiary-400 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div>
                            <p className="text-tertiary-400 text-xs font-semibold mb-1">
                              🎁 Période d'essai gratuite
                            </p>
                            <p className="text-tertiary-400/80 text-xs">
                              14 jours d'essai gratuit. Aucune carte bancaire
                              requise.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Note spéciale pour les testeurs */}
                    {step2Form.watch("saasPlan") === "TESTER" && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mt-2">
                        <div className="flex items-start gap-2">
                          <svg
                            className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div>
                            <p className="text-green-400 text-xs font-semibold mb-1">
                              Validation INKERA Studio
                            </p>
                            <p className="text-green-400/80 text-xs">
                              Notre équipe prendra contact avec vous sous 48h
                              pour valider votre participation au programme
                              testeur.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="cursor-pointer px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-sm"
                    >
                      ← Retour
                    </button>
                    <button
                      className="cursor-pointer flex-1 px-8 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-sm"
                      type="submit"
                    >
                      Continuer →
                    </button>
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
                  <div className="text-center mb-4">
                    <p className="text-white/80 text-sm">
                      Finalisez votre inscription avec vos informations
                      personnelles
                    </p>
                  </div>

                  {/* Nom et prénom */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2 font-one">
                      <label htmlFor="firstName" className="text-xs">
                        Prénom *
                      </label>
                      <input
                        id="firstName"
                        placeholder="Votre prénom"
                        type="text"
                        required
                        className="bg-white/30 py-2 px-4 rounded-lg text-sm w-full"
                        {...step3Form.register("firstName")}
                      />
                      {step3Form.formState.errors.firstName && (
                        <p className="text-red-400 text-xs">
                          {step3Form.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 font-one">
                      <label htmlFor="lastName" className="text-xs">
                        Nom *
                      </label>
                      <input
                        id="lastName"
                        placeholder="Votre nom"
                        type="text"
                        required
                        className="bg-white/30 py-2 px-4 rounded-lg text-sm w-full"
                        {...step3Form.register("lastName")}
                      />
                      {step3Form.formState.errors.lastName && (
                        <p className="text-red-400 text-xs">
                          {step3Form.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email et téléphone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2 font-one">
                      <label htmlFor="email" className="text-xs">
                        Email *
                      </label>
                      <input
                        id="email"
                        placeholder="votre@email.com"
                        type="email"
                        required
                        className="bg-white/30 py-2 px-4 rounded-lg text-sm w-full"
                        {...step3Form.register("email")}
                      />
                      {step3Form.formState.errors.email && (
                        <p className="text-red-400 text-xs">
                          {step3Form.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 font-one">
                      <label htmlFor="phone" className="text-xs">
                        Téléphone (optionnel)
                      </label>
                      <input
                        id="phone"
                        placeholder="06 12 34 56 78"
                        type="tel"
                        className="bg-white/30 py-2 px-4 rounded-lg text-sm w-full"
                        {...step3Form.register("phone")}
                      />
                      {step3Form.formState.errors.phone && (
                        <p className="text-red-400 text-xs">
                          {step3Form.formState.errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Mots de passe */}
                  <div className="flex flex-col gap-2 font-one">
                    <label htmlFor="password" className="text-xs">
                      Mot de passe *
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        placeholder="Minimum 6 caractères"
                        type={showPassword ? "text" : "password"}
                        minLength={6}
                        required
                        className="bg-white/30 py-2 px-4 pr-10 rounded-lg text-sm w-full"
                        {...step3Form.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                      >
                        {showPassword ? (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    {step3Form.formState.errors.password && (
                      <p className="text-red-400 text-xs">
                        {step3Form.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 font-one">
                    <label htmlFor="passwordConfirmation" className="text-xs">
                      Confirmer le mot de passe *
                    </label>
                    <div className="relative">
                      <input
                        id="passwordConfirmation"
                        placeholder="Confirmer le mot de passe"
                        type={showPasswordConfirmation ? "text" : "password"}
                        minLength={6}
                        required
                        className="bg-white/30 py-2 px-4 pr-10 rounded-lg text-sm w-full"
                        {...step3Form.register("passwordConfirmation")}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswordConfirmation(!showPasswordConfirmation)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                      >
                        {showPasswordConfirmation ? (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    {step3Form.formState.errors.passwordConfirmation && (
                      <p className="text-red-400 text-xs">
                        {
                          step3Form.formState.errors.passwordConfirmation
                            .message
                        }
                      </p>
                    )}
                  </div>

                  {/* Messages d'erreur et de succès */}
                  {error && (
                    <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                      <p className="text-red-300 text-xs">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                      <p className="text-green-300 text-xs">{success}</p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={isPending}
                      className="cursor-pointer px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-sm disabled:opacity-50"
                    >
                      ← Retour
                    </button>
                    <button
                      className="cursor-pointer flex-1 px-8 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-sm"
                      type="submit"
                      disabled={isPending}
                    >
                      {isPending
                        ? "INSCRIPTION..."
                        : "FINALISER L'INSCRIPTION →"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </CardWrapper>

        {/* Lien de connexion */}
        <div className="relative flex flex-col gap-2 justify-center items-center mt-4">
          <p className="text-white text-xs text-center font-two">
            Vous avez déjà un compte ?{" "}
            <Link
              className="text-tertiary-400 hover:text-tertiary-500 transition-all ease-in-out duration-150"
              href="/connexion"
            >
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
