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

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

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
      console.log("Infos de l'utilisateur connecté :", infos);

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
      <h2 className="text-center font-two text-white uppercase">InkStudio</h2>
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
              <input
                id="password"
                placeholder="Mot de passe"
                type="password"
                required
                className="bg-white/30 py-2 px-4 rounded-lg"
                {...form.register("password")}
              />
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
