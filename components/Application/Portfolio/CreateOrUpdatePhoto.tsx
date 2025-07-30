"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FormError } from "@/components/Shared/FormError";
import { FormSuccess } from "@/components/Shared/FormSuccess";
import { PortfolioProps } from "@/lib/type";
import { portfolioSchema } from "@/lib/zod/validator.schema";
import SalonImageUploader from "@/components/Application/MonCompte/SalonImageUploader";

export default function CreateOrUpdatePhoto({
  userId,
  onCreate,
  existingPhoto,
  setIsOpen = () => {},
}: {
  userId: string;
  onCreate: () => void;
  existingPhoto?: PortfolioProps | null;
  setIsOpen?: (isOpen: boolean) => void;
}) {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof portfolioSchema>>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      title: existingPhoto?.title || "",
      description: existingPhoto?.description || "",
      imageUrl: existingPhoto?.imageUrl || "",
    },
  });

  const onSubmit = async (data: z.infer<typeof portfolioSchema>) => {
    setLoading(true);
    setError(undefined);
    setSuccess(undefined);

    const url = existingPhoto
      ? `${process.env.NEXT_PUBLIC_BACK_URL}/portfolio/${existingPhoto.id}`
      : `${process.env.NEXT_PUBLIC_BACK_URL}/portfolio`;

    try {
      const response = await fetch(url, {
        method: existingPhoto ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Une erreur est survenue.");
        return;
      }

      const result = await response.json();
      setSuccess(result.message || "Photo enregistrée avec succès !");
      toast.success("Photo enregistrée avec succès !");
      form.reset();
      onCreate();
      setIsOpen(false);
    } catch (error) {
      console.error("Erreur:", error);
      setError(
        error instanceof Error ? error.message : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-primary-500 rounded-lg p-6 w-full max-w-[80%] max-h-[80%] overflow-y-auto shadow-lg relative">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Section: Image */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-white/30 pb-2">
                Image du portfolio
              </h3>

              <SalonImageUploader
                currentImage={
                  form.watch("imageUrl") || existingPhoto?.imageUrl || undefined
                }
                onImageUpload={(imageUrl) => {
                  form.setValue("imageUrl", imageUrl);
                }}
                onImageRemove={() => {
                  form.setValue("imageUrl", "");
                }}
              />

              {form.formState.errors.imageUrl && (
                <p className="text-red-400 text-sm">
                  {form.formState.errors.imageUrl.message}
                </p>
              )}
            </div>

            {/* Section: Informations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-white/30 pb-2">
                Informations
              </h3>

              <div>
                <label className="block text-sm font-one font-medium text-white mb-2">
                  Titre du tatouage
                </label>
                <input
                  placeholder="Donnez un titre à votre tatouage"
                  {...form.register("title")}
                  className="w-full mt-1 rounded-4xl border border-gray-300 px-3 py-2 text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                />
                {form.formState.errors.title && (
                  <p className="text-red-400 text-xs mt-1">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-one font-medium text-white mb-2">
                  Description (optionnelle)
                </label>
                <textarea
                  placeholder="Décrivez votre œuvre, le style, la technique utilisée..."
                  {...form.register("description")}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-[15px] text-xs text-white focus:outline-none focus:border-tertiary-400 transition-colors resize-none"
                />
                {form.formState.errors.description && (
                  <p className="text-red-400 text-sm mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
            </div>

            {/* Messages d'erreur et de succès */}
            <FormError message={error} />
            <FormSuccess message={success} />

            {/* Boutons d'action */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="relative text-xs cursor-pointer bg-secondary-500 w-[150px] text-center text-white font-one py-2 px-4 rounded-[20px] hover:bg-secondary-600 transition-all ease-in-out duration-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="relative text-xs cursor-pointer bg-gradient-to-l from-tertiary-400 to-tertiary-500 w-full text-center text-white font-one py-2 px-4 rounded-[20px] hover:bg-tertiary-500 transition-all ease-in-out duration-300"
              >
                {loading
                  ? "Enregistrement..."
                  : existingPhoto
                  ? "Modifier"
                  : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
