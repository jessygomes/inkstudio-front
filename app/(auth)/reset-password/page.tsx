"use client";

import { useSearchParams, useRouter, redirect } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { FormError } from "@/components/Shared/FormError";
import { FormSuccess } from "@/components/Shared/FormSuccess";
import { useUser } from "@/components/Auth/Context/UserContext";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Les mots de passe ne correspondent pas",
    path: ["passwordConfirmation"],
  });

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const user = useUser();
  if (user) {
    redirect("/dashboard");
  }

  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = async (data: ResetPasswordData) => {
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
            email,
            password: data.password,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok || result.error) {
        throw new Error(result.message || "Une erreur est survenue.");
      }

      setSuccess(result.message || "Mot de passe réinitialisé avec succès.");
      setTimeout(() => router.push("/connexion"), 3000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.form
        onSubmit={form.handleSubmit(onSubmit)}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-center mb-4 font-krub">
          Réinitialisation du mot de passe
        </h1>

        <FormError message={error} />
        <FormSuccess message={success} />

        <div className="flex flex-col gap-2 font-krub mb-4">
          <label htmlFor="password">Nouveau mot de passe</label>
          <input
            id="password"
            type="password"
            className="w-full border rounded-md p-2"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-red-500 text-sm">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 font-krub mb-4">
          <label htmlFor="passwordConfirmation">
            Confirmation du mot de passe
          </label>
          <input
            id="passwordConfirmation"
            type="password"
            className="w-full border rounded-md p-2"
            {...form.register("passwordConfirmation")}
          />
          {form.formState.errors.passwordConfirmation && (
            <p className="text-red-500 text-sm">
              {form.formState.errors.passwordConfirmation.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 transition font-krub"
        >
          Réinitialiser
        </button>
      </motion.form>
    </div>
  );
}
