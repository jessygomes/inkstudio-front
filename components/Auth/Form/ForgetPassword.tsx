"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormError } from "@/components/Shared/FormError";
import { FormSuccess } from "@/components/Shared/FormSuccess";
import { CardWrapper } from "../CardWrapper";
import Link from "next/link";
import Image from "next/image";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    setError("");
    setSuccess("");
    setIsPending(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await res.json();

      if (!res.ok || result.error) {
        throw new Error(result.message || "Une erreur est survenue.");
      }

      setSuccess(
        "Si un compte existe avec cette adresse, un email a été envoyé."
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsPending(false);
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
      <CardWrapper headerLabel="Récupérez l'accès à votre compte">
        <form
          method="post"
          onSubmit={form.handleSubmit(onSubmit)}
          className="relative text-white"
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 font-one">
              <label htmlFor="email" className="text-xs">
                Adresse e-mail
              </label>
              <input
                id="email"
                placeholder="johndoe@domaine.com"
                type="email"
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

            <FormError message={error} />
            <FormSuccess message={success} />

            <button
              className="cursor-pointer px-8 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-3xl transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs"
              type="submit"
              disabled={isPending}
            >
              ENVOYER LE LIEN &rarr;
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
      </div>
    </div>
  );
}
