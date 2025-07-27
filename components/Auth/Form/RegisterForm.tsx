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
      salonName: "",
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
            salonName: data.salonName,
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
      {/* <h2 className="text-center font-two text-white uppercase">InkStudio</h2> */}
      <CardWrapper headerLabel="Rejoignez INKSTUDIO gratuitement !">
        <form
          method="post"
          className="font-one text-white"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 ">
              <label htmlFor="salonName">Nom du salon</label>
              <input
                id="salonName"
                placeholder="John"
                type="text"
                required
                className="bg-white/30 py-2 px-4 rounded-[20px]"
                {...form.register("salonName")}
              />
              {form.formState.errors.salonName && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.salonName.message}
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
                className="bg-white/30 py-2 px-4 rounded-[20px]"
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
                className="bg-white/30 py-2 px-4 rounded-[20px]"
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
                className="bg-white/30 py-2 px-4 rounded-[20px]"
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
            <button
              className="relative cursor-pointer bg-gradient-to-l from-tertiary-400 to-tertiary-500 min-w-[400px] text-white font-one py-2 px-4 rounded-[20px] hover:scale-105 transition-all ease-in-out duration-300"
              style={{
                boxSizing: "border-box", // Bordure incluse dans les dimensions
              }}
              type="submit"
              disabled={isPending}
            >
              S'INSCRIRE &rarr;
            </button>
          </div>
        </form>
      </CardWrapper>
      <div className="relative flex flex-col gap-2 justify-center items-center">
        <p className="text-white text-sm text-center font-two mt-2">
          Vous avez déjà un compte ?{" "}
          <Link
            className="text-tertiary-400 hover:text-tertiary-500 transition-all ease-in-out duration-150"
            href="/connexion"
          >
            Connectez-vous
          </Link>
        </p>
        {/* <div className="h-[1px] bg-white w-[300px]"></div> */}
        {/* <Link
          className="relative text-center text-white text-xs hover:text-white/70 transition-all ease-in-out duration-150"
          href="/motdepasseoublie"
        >
          Mot de passe oublié ?
        </Link> */}
      </div>
    </div>
  );
};
