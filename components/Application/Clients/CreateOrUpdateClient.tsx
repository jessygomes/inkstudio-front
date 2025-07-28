"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { clientSchema } from "@/lib/zod/validator.schema";
import { toast } from "sonner";
import { FormError } from "@/components/Shared/FormError";
import { FormSuccess } from "@/components/Shared/FormSuccess";
import { ClientProps } from "@/lib/type";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

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
      allergies: existingClient?.medicalHistory.allergies || "",
      healthIssues: existingClient?.medicalHistory.healthIssues || "",
      medications: existingClient?.medicalHistory.medications || "",
      pregnancy: existingClient?.medicalHistory.pregnancy || false,
      tattooHistory: existingClient?.medicalHistory.tattooHistory || "",
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
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-full max-w-[80%] max-h-[80%] overflow-y-auto shadow-lg relative">
          <h2 className="text-lg font-semibold font-two uppercase text-noir-500 mb-4">
            {existingClient
              ? `${existingClient.firstName} ${existingClient.lastName}`
              : "Nouveau client"}
          </h2>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informations personnelles */}
            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">
                👤 Informations personnelles
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium font-one text-secondary-500">
                    Prénom
                  </label>
                  <input
                    {...form.register("firstName")}
                    className="w-full mt-1 rounded-4xl border border-gray-300 px-3 py-2 text-black text-sm"
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium font-one text-secondary-500">
                    Nom
                  </label>
                  <input
                    {...form.register("lastName")}
                    className="w-full mt-1 rounded-4xl border border-gray-300 px-3 py-2 text-black text-sm"
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.lastName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium font-one text-secondary-500">
                    Email
                  </label>
                  <input
                    {...form.register("email")}
                    type="email"
                    className="w-full mt-1 rounded-4xl border border-gray-300 px-3 py-2 text-black text-sm"
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium font-one text-secondary-500">
                    Téléphone (optionnel)
                  </label>
                  <input
                    {...form.register("phone")}
                    type="tel"
                    className="w-full mt-1 rounded-4xl border border-gray-300 px-3 py-2 text-black text-sm"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium font-one text-secondary-500">
                    Date de naissance (optionnel)
                  </label>
                  <input
                    {...form.register("birthDate")}
                    type="date"
                    className="w-full mt-1 rounded-4xl border border-gray-300 px-3 py-2 text-black text-sm"
                  />
                  {form.formState.errors.birthDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.birthDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium font-one text-secondary-500">
                    Adresse (optionnel)
                  </label>
                  <input
                    {...form.register("address")}
                    className="w-full mt-1 rounded-4xl border border-gray-300 px-3 py-2 text-black text-sm"
                    placeholder="Adresse complète"
                  />
                  {form.formState.errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.address.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section Historique médical */}
            <div>
              <button
                type="button"
                onClick={() => setShowMedicalHistory(!showMedicalHistory)}
                className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <span className="text-gray-800 font-semibold text-sm">
                  🏥 Historique médical (optionnel)
                </span>
                {showMedicalHistory ? (
                  <IoChevronUp className="text-gray-600" />
                ) : (
                  <IoChevronDown className="text-gray-600" />
                )}
              </button>

              {showMedicalHistory && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium font-one text-secondary-500">
                        Allergies
                      </label>
                      <textarea
                        {...form.register("allergies")}
                        className="w-full mt-1 rounded-4xl border border-gray-300 px-3 py-2 text-black text-sm"
                        rows={2}
                        placeholder="Allergies connues"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium font-one text-secondary-500">
                        Problèmes de santé
                      </label>
                      <textarea
                        {...form.register("healthIssues")}
                        className="w-full mt-1 rounded-4xl border border-gray-300 px-3 py-2 text-black text-sm"
                        rows={2}
                        placeholder="Problèmes de santé actuels"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium font-one text-secondary-500">
                        Médicaments
                      </label>
                      <textarea
                        {...form.register("medications")}
                        className="w-full mt-1 rounded-4xl border border-gray-300 px-3 py-2 text-black text-sm"
                        rows={2}
                        placeholder="Médicaments pris actuellement"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium font-one text-secondary-500">
                        Historique des tatouages
                      </label>
                      <textarea
                        {...form.register("tattooHistory")}
                        className="w-full mt-1 rounded-4xl border border-gray-300 px-3 py-2 text-black text-sm"
                        rows={2}
                        placeholder="Tatouages précédents, réactions..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      {...form.register("pregnancy")}
                      type="checkbox"
                      className="mr-2"
                    />
                    <label className="text-sm font-medium font-one text-secondary-500">
                      Enceinte ou allaite actuellement
                    </label>
                  </div>
                </div>
              )}
            </div>

            <FormError message={error} />
            <FormSuccess message={success} />

            <div className="flex gap-4">
              <button
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
                  ? existingClient
                    ? "Modification en cours..."
                    : "Création en cours..."
                  : existingClient
                  ? "Modifier"
                  : "Créer un client"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
