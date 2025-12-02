"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { userLoginSchema } from "@/lib/zod/validator.schema";
import { CardWrapper } from "../CardWrapper";
import { FormError } from "@/components/Shared/FormError";
import { FormSuccess } from "@/components/Shared/FormSuccess";
import Link from "next/link";
import { createSession } from "@/lib/session";
import Image from "next/image";

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  // ✅ Vérifier si l'utilisateur arrive avec un token expiré
  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason === "expired") {
      setError("Votre session a expiré. Veuillez vous reconnecter.");
    }
  }, [searchParams]);

  const form = useForm<z.infer<typeof userLoginSchema>>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof userLoginSchema>) => {
    setError("");
    setSuccess("");
    setIsPending(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
          }),
        }
      );

      const infos = await response.json();

      if (infos.error) {
        setError(
          infos.message ||
            infos.error ||
            "Une erreur est survenue lors de l'inscription."
        );
        setIsPending(false);
        return;
      }

      setSuccess("Connexion réussie !");
      setIsPending(false);

      // Créez une session pour l'utilisateur connecté
      // console.log("Infos de l'utilisateur connecté :", infos);

      await createSession(infos);

      // Changement de texte pour la redirection
      setIsPending(true);
      setSuccess("Redirection vers l'app...");

      // Appeler l'API pour récupérer l'utilisateur authentifié
      // const userResponse = await fetch("/api/auth");

      // if (!userResponse.ok) {
      //   throw new Error("Impossible de récupérer l'utilisateur authentifié.");
      // }

      // const user = await userResponse.json();
      // console.log("Utilisateur authentifié :", user);

      // Redirigez l'utilisateur vers la page d'accueil
      router.push("/dashboard");
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      setError("Impossible de se connecter. Veuillez réessayer plus tard.");
      return;
    }
  };

  return (
    <div>
      <div className="flex justify-center items-center">
        <Image
          src="/images/logo_white_color.png"
          alt="Logo"
          width={100}
          height={100}
        />
      </div>
      <CardWrapper headerLabel="Connectez-vous et gérez votre salon">
        <form
          method="post"
          onSubmit={form.handleSubmit(onSubmit)}
          className="relative text-white"
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 font-one">
              <label htmlFor="mail" className="text-xs">
                Email
              </label>
              <input
                id="mail"
                placeholder="johndoe@domaine.com"
                type="text"
                required
                className="bg-white/30 py-2 px-4 rounded-lg"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.email.message}
                </p>
              )}
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
                <p className="text-red-500 text-sm">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <FormError message={error} />
            <FormSuccess message={success} />

            <button
              className="cursor-pointer px-8 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one lg:text-xs"
              type="submit"
              disabled={isPending}
            >
              {isPending
                ? success === "Redirection vers l'app..."
                  ? "Redirection vers l'app..."
                  : "Connexion..."
                : "Se connecter"}
            </button>
          </div>
        </form>
      </CardWrapper>
      <div className="relative flex flex-col gap-2 justify-center items-center">
        <p className="text-white text-xs text-center font-two mt-2">
          Pas encore de compte ?{" "}
          <Link
            className="text-tertiary-400 hover:text-tertiary-500 transition-all ease-in-out duration-150"
            href="/inscription"
          >
            Créer un compte
          </Link>
        </p>
        <div className="h-[1px] bg-white w-[300px]"></div>
        <Link
          className="relative text-center text-white text-xs hover:text-white/70 transition-all ease-in-out duration-150"
          href="/motdepasseoublie"
        >
          Mot de passe oublié ?
        </Link>
      </div>
    </div>
  );
};
