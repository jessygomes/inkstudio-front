"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { FormError } from "@/components/Shared/FormError";
import { FormSuccess } from "@/components/Shared/FormSuccess";
import { CardWrapper } from "../CardWrapper";
import Link from "next/link";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordData) => {
    if (!token) {
      setError("Token manquant. Veuillez utiliser le lien reçu par email.");
      return;
    }

    setError("");
    setSuccess("");
    setIsPending(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password: data.password,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok || result.error) {
        throw new Error(result.message || "Une erreur est survenue.");
      }

      setSuccess("Mot de passe réinitialisé avec succès ! Redirection...");

      // Redirection après 2 secondes
      setTimeout(() => {
        router.push("/connexion");
      }, 2000);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsPending(false);
    }
  };

  if (!token) {
    return (
      <div>
        <h2 className="text-center font-two text-white uppercase mb-6">InkStudio</h2>
        <CardWrapper headerLabel="Lien invalide">
          <div className="text-center text-white">
            <p className="mb-4">Le lien de réinitialisation est invalide ou a expiré.</p>
            <Link
              href="/motdepasseoublie"
              className="text-tertiary-400 hover:text-tertiary-500 transition-all ease-in-out duration-150 underline"
            >
              Demander un nouveau lien
            </Link>
          </div>
        </CardWrapper>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-center font-two text-white uppercase mb-6">InkStudio</h2>
      <CardWrapper headerLabel="Créez votre nouveau mot de passe">
        <form
          method="post"
          onSubmit={form.handleSubmit(onSubmit)}
          className="relative text-white"
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 font-one">
              <label htmlFor="password" className="text-xs">
                Nouveau mot de passe
              </label>
              <input
                id="password"
                placeholder="Votre nouveau mot de passe"
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

            <div className="flex flex-col gap-1 font-one">
              <label htmlFor="confirmPassword" className="text-xs">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                placeholder="Confirmez votre mot de passe"
                type="password"
                required
                className="bg-white/30 py-2 px-4 rounded-lg"
                {...form.register("confirmPassword")}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <FormError message={error} />
            <FormSuccess message={success} />

            <button
              className="cursor-pointer px-8 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs"
              type="submit"
              disabled={isPending}
            >
              RÉINITIALISER &rarr;
            </button>
          </div>
        </form>
      </CardWrapper>
      <div className="relative flex flex-col gap-2 justify-center items-center">
        <p className="text-white text-xs text-center font-two mt-2">
          Vous vous souvenez de votre mot de passe ?{" "}
          <Link
            className="text-tertiary-400 hover:text-tertiary-500 transition-all ease-in-out duration-150"
            href="/connexion"
          >
            Se connecter
          </Link>
        </p>
        <div className="h-[1px] bg-white w-[300px]"></div>
        <Link
          className="relative text-center text-white text-xs hover:text-white/70 transition-all ease-in-out duration-150"
          href="/inscription"
        >
          Créer un nouveau compte
        </Link>
      </div>
    </div>
  );
}
