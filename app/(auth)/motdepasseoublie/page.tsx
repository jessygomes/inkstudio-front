"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { FormError } from "@/components/Shared/FormError";
import { FormSuccess } from "@/components/Shared/FormSuccess";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.form
        onSubmit={form.handleSubmit(onSubmit)}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-center mb-4 text-black">
          Mot de passe oublié
        </h1>

        <FormError message={error} />
        <FormSuccess message={success} />

        <div className="flex flex-col gap-2 font-krub mb-4 text-black">
          <label htmlFor="email">Adresse e-mail</label>
          <input
            id="email"
            type="email"
            className="w-full border rounded-md p-2"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-red-500 text-sm">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="cursor-pointer w-full bg-gray-500 text-white py-2 rounded-md hover:bg-primary-700 transition font-krub"
        >
          Envoyer le lien de réinitialisation
        </button>
      </motion.form>
    </div>
  );
}
