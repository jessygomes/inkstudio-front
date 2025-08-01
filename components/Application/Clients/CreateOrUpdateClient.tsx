"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { clientSchema } from "@/lib/zod/validator.schema";
import { toast } from "sonner";
// import { FormError } from "@/components/Shared/FormError";
// import { FormSuccess } from "@/components/Shared/FormSuccess";
import { ClientProps } from "@/lib/type";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import { RiHealthBookLine } from "react-icons/ri";
import { CiUser } from "react-icons/ci";

export default function CreateOrUpdateClient({
  userId,
  onCreate,
  existingClient,
  setIsOpen = () => {},
}: {
  userId: string;
  onCreate: () => void;
  existingClient?: ClientProps | null;
  setIsOpen?: (isOpen: boolean) => void;
}) {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [loading, setLoading] = useState(false);

  // États pour les sections dépliantes
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);

  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      firstName: existingClient?.firstName || "",
      lastName: existingClient?.lastName || "",
      phone: existingClient?.phone || "",
      email: existingClient?.email || "",
      birthDate: existingClient?.birthDate
        ? new Date(existingClient.birthDate).toISOString().split("T")[0]
        : "",
      address: existingClient?.address || "",

      // Historique médical
      allergies: existingClient?.medicalHistory?.allergies || "",
      healthIssues: existingClient?.medicalHistory?.healthIssues || "",
      medications: existingClient?.medicalHistory?.medications || "",
      pregnancy: existingClient?.medicalHistory?.pregnancy || false,
      tattooHistory: existingClient?.medicalHistory?.tattooHistory || "",
    },
  });

  const onSubmit = async (data: z.infer<typeof clientSchema>) => {
    setLoading(true);
    setError("");
    setSuccess("");

    console.log("USER ID :", userId);
    console.log("Données du formulaire :", data, userId);

    // Convertir la date de naissance au format ISO si elle existe
    const processedData = {
      ...data,
      birthDate: data.birthDate
        ? new Date(data.birthDate).toISOString()
        : undefined,
      userId,
    };

    console.log("Données traitées :", processedData);

    const url = existingClient
      ? `${process.env.NEXT_PUBLIC_BACK_URL}/clients/update/${existingClient.id}`
      : `${process.env.NEXT_PUBLIC_BACK_URL}/clients`;

    try {
      const response = await fetch(url, {
        method: existingClient ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Une erreur est survenue.");
        return;
      }

      const result = await response.json();
      setSuccess(result.message || "Client créé avec succès !");
      form.reset();
      onCreate();
    } catch (error) {
      console.error("Erreur lors de la création du client :", error);
      setError("Une erreur est survenue lors de la création du client.");
    } finally {
      toast.success(
        existingClient
          ? "Client modifié avec succès !"
          : "Client créé avec succès !"
      );
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-noir-500 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20 shadow-2xl">
          {/* Header fixe */}
          <div className="p-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white font-one tracking-wide">
                {existingClient
                  ? `Modifier ${existingClient.firstName} ${existingClient.lastName}`
                  : "Nouveau client"}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <span className="cursor-pointer text-white text-xl">×</span>
              </button>
            </div>
            <p className="text-white/70 mt-2 text-sm">
              {existingClient
                ? "Modifiez les informations du client"
                : "Ajout d'un nouveau client à votre base de données"}
            </p>
          </div>

          {/* Form Content scrollable */}
          <div className="flex-1 overflow-y-auto p-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Informations personnelles */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-one uppercase tracking-wide mb-2">
                  <CiUser size={20} /> Informations personnelles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-white/70 font-one">
                      Prénom
                    </label>
                    <input
                      {...form.register("firstName")}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-red-300 text-xs mt-1">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-white/70 font-one">
                      Nom
                    </label>
                    <input
                      {...form.register("lastName")}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-red-300 text-xs mt-1">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-white/70 font-one">
                      Email
                    </label>
                    <input
                      {...form.register("email")}
                      type="email"
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                    />
                    {form.formState.errors.email && (
                      <p className="text-red-300 text-xs mt-1">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-white/70 font-one">
                      Téléphone (optionnel)
                    </label>
                    <input
                      {...form.register("phone")}
                      type="tel"
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                    />
                    {form.formState.errors.phone && (
                      <p className="text-red-300 text-xs mt-1">
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-white/70 font-one">
                      Date de naissance (optionnelle)
                    </label>
                    <input
                      {...form.register("birthDate")}
                      type="date"
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                    />
                    {form.formState.errors.birthDate && (
                      <p className="text-red-300 text-xs mt-1">
                        {form.formState.errors.birthDate.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-white/70 font-one">
                      Adresse (optionnel)
                    </label>
                    <input
                      {...form.register("address")}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
                      placeholder="Adresse complète"
                    />
                    {form.formState.errors.address && (
                      <p className="text-red-300 text-xs mt-1">
                        {form.formState.errors.address.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section Historique médical */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <button
                  type="button"
                  onClick={() => setShowMedicalHistory(!showMedicalHistory)}
                  className="cursor-pointer w-full flex items-center justify-between mb-4"
                >
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-white font-one uppercase tracking-wide">
                    <RiHealthBookLine size={20} /> Historique médical
                    <span className="text-white/50 font-normal">
                      (optionnel)
                    </span>
                  </h3>
                  {showMedicalHistory ? (
                    <IoChevronUp className="text-white/70" />
                  ) : (
                    <IoChevronDown className="text-white/70" />
                  )}
                </button>

                {showMedicalHistory && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-white/70 font-one">
                          Allergies
                        </label>
                        <textarea
                          {...form.register("allergies")}
                          className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors resize-none"
                          rows={2}
                          placeholder="Allergies connues"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-white/70 font-one">
                          Problèmes de santé
                        </label>
                        <textarea
                          {...form.register("healthIssues")}
                          className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors resize-none"
                          rows={2}
                          placeholder="Problèmes de santé actuels"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-white/70 font-one">
                          Médicaments
                        </label>
                        <textarea
                          {...form.register("medications")}
                          className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors resize-none"
                          rows={2}
                          placeholder="Médicaments pris actuellement"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-white/70 font-one">
                          Historique des tatouages
                        </label>
                        <textarea
                          {...form.register("tattooHistory")}
                          className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors resize-none"
                          rows={2}
                          placeholder="Tatouages précédents, réactions..."
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        {...form.register("pregnancy")}
                        type="checkbox"
                        className="w-4 h-4 text-tertiary-400 bg-white/10 border-white/20 rounded focus:ring-tertiary-400"
                      />
                      <label className="text-xs text-white/70 font-one">
                        Enceinte ou allaite actuellement
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Messages d'erreur et de succès */}
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
                  <p className="text-red-300 text-xs">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-xl">
                  <p className="text-green-300 text-xs">{success}</p>
                </div>
              )}
            </form>
          </div>

          {/* Footer fixe */}
          <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={form.handleSubmit(onSubmit)}
              className="cursor-pointer px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs"
            >
              {loading
                ? existingClient
                  ? "Modification..."
                  : "Création..."
                : existingClient
                ? "Modifier le client"
                : "Créer le client"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
