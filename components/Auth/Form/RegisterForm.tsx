/* eslint-disable react/no-unescaped-entities */
"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { userRegisterSchema } from "@/lib/zod/validator.schema";
import { CardWrapper } from "../CardWrapper";
// import { FormError } from "@/components/Shared/FormError";
// import { FormSuccess } from "@/components/Shared/FormSuccess";
import Link from "next/link";
// import { createSession } from "@/lib/session";

export const Register = () => {
  const router = useRouter();

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, setIsPending] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  const form = useForm<z.infer<typeof userRegisterSchema>>({
    resolver: zodResolver(userRegisterSchema),
    defaultValues: {
      salonName: "",
      email: "",
      saasPlan: "FREE",
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof userRegisterSchema>) => {
    console.log("Début de la soumission...");
    console.log("📋 Données du formulaire:", data);
    setError("");
    setSuccess("");
    setIsPending(true);

    try {
      const isSamePassword = data.password === data.passwordConfirmation;

      if (!isSamePassword) {
        console.log("Erreur : Les mots de passe ne correspondent pas.");
        setError("Les mots de passe ne correspondent pas.");
        setIsPending(false);
        return;
      }

      const requestBody = {
        salonName: data.salonName,
        email: data.email,
        saasPlan: data.saasPlan,
        password: data.password,
      };

      console.log("📤 Corps de la requête envoyé:", requestBody);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log("📥 Statut de la réponse:", response.status);

      const infos = await response.json();
      console.log("📥 Réponse complète du serveur:", infos);

      if (!response.ok || infos.error) {
        // Afficher l'erreur détaillée du serveur
        const errorMessage =
          infos.message ||
          infos.error ||
          "Une erreur est survenue lors de l'inscription.";
        console.error("❌ Erreur serveur:", errorMessage);

        // Si c'est une erreur de validation, afficher les détails
        if (infos.details) {
          console.error("📋 Détails de validation:", infos.details);
        }

        setError(errorMessage);
        setIsPending(false);
        return;
      }

      setSuccess(infos.message || "Inscription réussie !");
      setIsPending(false);
      setTimeout(() => router.push("/connexion"), 5000);
    } catch (error) {
      console.error("❌ Erreur lors de l'inscription :", error);
      setError("Impossible de s'inscrire. Veuillez réessayer plus tard.");
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-4 px-4">
      <div className="w-full">
        <CardWrapper headerLabel="Rejoignez INKSTUDIO gratuitement !">
          <div className="max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            <form
              method="post"
              className="font-one text-white"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="flex flex-col gap-4 p-2">
                <div className="flex gap-2">
                  <div className="flex flex-col gap-2 font-one w-full">
                    <label htmlFor="salonName" className="text-xs">
                      Nom du salon
                    </label>
                    <input
                      id="salonName"
                      placeholder="Nom de votre salon"
                      type="text"
                      required
                      className="bg-white/30 py-2 px-4 rounded-lg text-sm w-full"
                      {...form.register("salonName")}
                    />
                    {form.formState.errors.salonName && (
                      <p className="text-red-400 text-xs">
                        {form.formState.errors.salonName.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 font-one w-full">
                    <label htmlFor="mail" className="text-xs">
                      Email
                    </label>
                    <input
                      id="mail"
                      placeholder="johndoe@domaine.com"
                      type="text"
                      required
                      className="bg-white/30 py-2 px-4 rounded-lg text-sm w-full"
                      {...form.register("email")}
                    />
                    {form.formState.errors.email && (
                      <p className="text-red-400 text-xs">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Plan SaaS */}
                <div className="flex flex-col gap-2 font-one">
                  <label htmlFor="saasPlan" className="text-xs">
                    Plan d'abonnement
                  </label>
                  <select
                    id="saasPlan"
                    required
                    className="bg-white/30 py-2 px-4 rounded-lg text-white text-sm"
                    {...form.register("saasPlan")}
                  >
                    <option value="FREE" className="bg-white text-black">
                      Gratuit - Fonctionnalités de base
                    </option>
                    <option value="PRO" className="bg-white text-black">
                      Pro - Fonctionnalités avancées (29€/mois)
                    </option>
                    <option value="BUSINESS" className="bg-white text-black">
                      Business - Solution complète (69€/mois)
                    </option>
                  </select>
                  {form.formState.errors.saasPlan && (
                    <p className="text-red-400 text-xs">
                      {form.formState.errors.saasPlan.message}
                    </p>
                  )}

                  {/* Détails du plan - version compacte */}
                  <div className="mt-1 p-2 bg-white/10 rounded-lg border border-white/20">
                    {form.watch("saasPlan") === "FREE" && (
                      <div className="text-xs text-white/80">
                        <p className="font-semibold mb-1">Plan Gratuit :</p>
                        <div className="text-[11px] space-y-0.5">
                          <p>• 5 clients max • 10 RDV/mois</p>
                          <p>• Support email • Fonctionnalités de base</p>
                        </div>
                      </div>
                    )}
                    {form.watch("saasPlan") === "PRO" && (
                      <div className="text-xs text-white/80">
                        <p className="font-semibold mb-1">
                          Plan Pro - 29€/mois :
                        </p>
                        <div className="text-[11px] space-y-0.5">
                          <p>• Clients illimités • RDV illimités</p>
                          <p>
                            • Support prioritaire • Analytics • Suivi
                            cicatrisation
                          </p>
                        </div>
                      </div>
                    )}
                    {form.watch("saasPlan") === "BUSINESS" && (
                      <div className="text-xs text-white/80">
                        <p className="font-semibold mb-1">
                          Plan Business - 69€/mois :
                        </p>
                        <div className="text-[11px] space-y-0.5">
                          <p>• Tout du plan Pro • Multi-salons</p>
                          <p>• API • Support téléphonique • Personnalisation</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 font-krub">
                  <label htmlFor="password" className="text-xs">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      placeholder="Mot de passe"
                      type={showPassword ? "text" : "password"}
                      minLength={6}
                      required
                      className="bg-white/30 py-2 px-4 pr-10 rounded-lg text-sm w-full"
                      {...form.register("password")}
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
                  {form.formState.errors.password && (
                    <p className="text-red-400 text-xs">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 font-krub">
                  <label htmlFor="passwordConfirmation" className="text-xs">
                    Confirmation du Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="passwordConfirmation"
                      placeholder="Confirmer le mot de passe"
                      type={showPasswordConfirmation ? "text" : "password"}
                      minLength={6}
                      required
                      className="bg-white/30 py-2 px-4 pr-10 rounded-lg text-sm w-full"
                      {...form.register("passwordConfirmation")}
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
                  {form.formState.errors.passwordConfirmation && (
                    <p className="text-red-400 text-xs">
                      {form.formState.errors.passwordConfirmation.message}
                    </p>
                  )}
                </div>

                {/* Note sur les plans payants - version compacte */}
                {(form.watch("saasPlan") === "PRO" ||
                  form.watch("saasPlan") === "BUSINESS") && (
                  <div className="bg-tertiary-500/10 border border-tertiary-500/30 rounded-lg p-2">
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-3 h-3 text-tertiary-400 mt-0.5 flex-shrink-0"
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
                        <p className="text-tertiary-400/80 text-[11px]">
                          14 jours d'essai gratuit. Aucune carte bancaire
                          requise.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages d'erreur et de succès - version compacte */}
                {error && (
                  <div className="p-2 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-red-300 text-xs">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-2 bg-green-500/20 border border-green-500/50 rounded-lg">
                    <p className="text-green-300 text-xs">{success}</p>
                  </div>
                )}

                <button
                  className="cursor-pointer px-8 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs"
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? "INSCRIPTION..." : "S'INSCRIRE →"}
                </button>
              </div>
            </form>
          </div>
        </CardWrapper>

        {/* Lien de connexion - en dehors du scroll */}
        <div className="relative flex flex-col gap-2 justify-center items-center">
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
