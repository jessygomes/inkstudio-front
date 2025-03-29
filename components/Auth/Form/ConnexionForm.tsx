"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { userLoginSchema } from "@/lib/zod/validator.schema";
import { CardWrapper } from "../CardWrapper";
import { FormError } from "@/components/Shared/FormError";
import { FormSuccess } from "@/components/Shared/FormSuccess";
import Link from "next/link";
import { createSession } from "@/lib/session";

export const LoginForm = () => {
  const router = useRouter();

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

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
      await createSession(infos.userId);

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
      <CardWrapper headerLabel="Connectez-vous">
        <form method="post" onSubmit={form.handleSubmit(onSubmit)}>
          <>
            <div className="flex flex-col gap-2 font-krub">
              <label htmlFor="mail">Email</label>
              <input
                id="mail"
                placeholder="johndoe@domaine.com"
                type="text"
                required
                className=""
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 font-krub">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                placeholder="Mot de passe"
                type="password"
                required
                className=""
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
          </>

          <button
            className="cursor-pointer bg-gradient-to-r px-2 relative group/btn from-primary-700 to-primary-500 block w-full text-white font-krub rounded-md h-10 font-medium font-font1 uppercase tracking-widest"
            type="submit"
            disabled={isPending}
          >
            SE CONNECTER &rarr;
          </button>
        </form>
      </CardWrapper>
      <Link
        className="mt-2 text-center text-noir-100 text-xs hover:text-white/70 transition-all ease-in-out duration-150"
        href="/motdepasseoublie"
      >
        Mot de passe oublié ?
      </Link>
    </div>
  );
};
