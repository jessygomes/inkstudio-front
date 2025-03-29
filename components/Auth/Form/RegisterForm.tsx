/* eslint-disable react/no-unescaped-entities */
"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { userRegisterSchema } from "@/lib/zod/validator.schema";
import { CardWrapper } from "../CardWrapper";
import { FormError } from "@/components/Shared/FormError";
import { FormSuccess } from "@/components/Shared/FormSuccess";
import Link from "next/link";
// import { createSession } from "@/lib/session";

export const Register = () => {
  const router = useRouter();

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof userRegisterSchema>>({
    resolver: zodResolver(userRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof userRegisterSchema>) => {
    console.log("Début de la soumission...");
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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            password: data.password,
          }),
        }
      );

      const infos = await response.json();

      if (infos.error) {
        setError(
          infos.message || "Une erreur est survenue lors de l'inscription."
        );
        setIsPending(false);
        return;
      }

      setSuccess(infos.message || "Inscription réussie !");

      setIsPending(false);
      setTimeout(() => router.push("/connexion"), 5000); // redirige après 3s
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
      setError("Impossible de s'inscrire. Veuillez réessayer plus tard.");
      return;
    }
  };

  return (
    <div>
      <CardWrapper headerLabel="Inscrivez-vous">
        <form method="post" onSubmit={form.handleSubmit(onSubmit)}>
          <>
            <div className="flex flex-col gap-2 font-krub">
              <label htmlFor="name">Nom</label>
              <input
                id="name"
                placeholder="John"
                type="text"
                required
                className=""
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

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
                minLength={6}
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

            <div className="flex flex-col gap-2 font-krub">
              <label htmlFor="passwordConfirmation">
                Confirmation du Mot de passe
              </label>
              <input
                id="passwordConfirmation"
                placeholder="Mot de passe"
                type="password"
                minLength={6}
                required
                className=""
                {...form.register("passwordConfirmation")}
              />
              {form.formState.errors.passwordConfirmation && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.passwordConfirmation.message}
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
            S'INSCRIRE &rarr;
          </button>
        </form>
      </CardWrapper>
      <Link
        className="mt-2 text-center text-noir-100 text-xs hover:text-white/70 transition-all ease-in-out duration-150"
        href="/auth/reset"
      >
        Mot de passe oublié ?
      </Link>
    </div>
  );
};
