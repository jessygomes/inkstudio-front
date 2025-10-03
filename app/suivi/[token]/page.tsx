/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { followUpSubmissionSchema } from "@/lib/zod/validator.schema";
import { toast } from "sonner";
import SinglePhotoUploader from "@/components/Shared/UploadImage/SinglePhotoUploader";
import { useUploadThing } from "@/lib/utils/uploadthing";
import imageCompression from "browser-image-compression";

interface SuiviPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default function SuiviPage({ params }: SuiviPageProps) {
  const [token, setToken] = useState<string>("");

  // Récupérer les params de manière asynchrone
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setToken(resolvedParams.token);
    };
    getParams();
  }, [params]);

  const [tokenValidation, setTokenValidation] = useState<{
    isLoading: boolean;
    isValid: boolean;
    error: string | null;
  }>({
    isLoading: true,
    isValid: false,
    error: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false); // Nouvel état

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: () => {
      // Optionally, you can show a toast or perform side effects here
      // The uploaded URL should be handled in the uploadPhoto function
    },
    onUploadError: (error: Error) => {
      console.error("Upload error:", error);
      throw error;
    },
  });

  const form = useForm<z.infer<typeof followUpSubmissionSchema>>({
    resolver: zodResolver(followUpSubmissionSchema),
    defaultValues: {
      rating: 0,
      review: "",
      isPhotoPublic: false,
    },
    shouldFocusError: false,
  });

  const uploadPhoto = async (file: File): Promise<string> => {
    try {
      // Compresser l'image
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.8,
      });

      const result = await startUpload([compressedFile]);
      if (result && result.length > 0) {
        return result[0].url;
      }
      throw new Error("Aucune URL retournée par l'upload");
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      throw new Error("Erreur lors de l'upload de l'image");
    }
  };

  const onSubmit = async (data: z.infer<typeof followUpSubmissionSchema>) => {
    if (!selectedPhoto) {
      toast.error("Veuillez sélectionner une photo");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload de l'image
      console.log("Uploading photo...");
      const photoUrl = await uploadPhoto(selectedPhoto);
      console.log("Photo uploaded, URL:", photoUrl);

      // Soumission des données
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/follow-up/submissions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            rating: data.rating,
            review: data.review || undefined,
            photoUrl: photoUrl,
            isPhotoPublic: data.isPhotoPublic, // Plus besoin de conversion, c'est déjà un boolean
          }),
        }
      );

      console.log("Submission response status:", response.status);

      if (response.ok) {
        toast.success(
          "Merci pour votre suivi ! Votre photo et avis ont été envoyés."
        );
        setIsSubmitted(true); // Marquer comme envoyé
      } else {
        const errorData = await response.json();
        console.error("Submission error:", errorData);
        toast.error(`Erreur: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValidation({
          isLoading: false,
          isValid: false,
          error: "Token manquant dans l'URL",
        });
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/follow-up/requests/${token}`
        );

        if (response.ok) {
          setTokenValidation({
            isLoading: false,
            isValid: true,
            error: null,
          });
        } else {
          const errorData = await response.json();
          setTokenValidation({
            isLoading: false,
            isValid: false,
            error: errorData.message || "Lien invalide",
          });
        }
      } catch {
        setTokenValidation({
          isLoading: false,
          isValid: false,
          error: "Erreur de connexion",
        });
      }
    };

    validateToken();
  }, [token]);

  // Loading state
  if (!token || tokenValidation.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-noir-700 to-noir-500 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-tertiary-400 mx-auto mb-4"></div>
          <p className="text-white font-one text-sm sm:text-base">
            Vérification du lien...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (!tokenValidation.isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-noir-700 to-noir-500 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center bg-white/5 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-red-500/30">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-white font-one mb-4">
            Accès refusé
          </h1>
          <p className="text-red-300 font-one mb-4 sm:mb-6 text-sm sm:text-base">
            {tokenValidation.error}
          </p>
          <div className="text-white/70 text-xs sm:text-sm font-one">
            {tokenValidation.error === "Déjà soumis" && (
              <p>Vous avez déjà envoyé votre suivi de cicatrisation.</p>
            )}
            {tokenValidation.error === "Lien expiré" && (
              <p>Ce lien a expiré. Contactez le studio pour un nouveau lien.</p>
            )}
            {tokenValidation.error === "Lien invalide" && (
              <p>Ce lien n'est pas valide. Vérifiez l'URL reçue par email.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Success state - Afficher le message de confirmation
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-noir-700 to-noir-500 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-noir-500/20 to-noir-500/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl">
          {/* Icône de succès */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Message principal */}
          <h1 className="text-xl sm:text-2xl font-bold text-white font-one tracking-wide mb-4">
            Suivi envoyé avec succès !
          </h1>

          <div className="space-y-3 sm:space-y-4 text-white/80 font-one">
            <p className="text-sm sm:text-base">
              Merci d'avoir partagé votre photo de cicatrisation et votre avis
              avec nous.
            </p>

            <div className="bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
              <h2 className="text-base sm:text-lg font-semibold text-white mb-3">
                📋 Prochaines étapes
              </h2>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-left">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-tertiary-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-tertiary-400 text-xs font-bold">
                      1
                    </span>
                  </div>
                  <p>Notre équipe va examiner votre photo et votre avis</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-tertiary-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-tertiary-400 text-xs font-bold">
                      2
                    </span>
                  </div>
                  <p>
                    Si nécessaire, nous vous contacterons pour des conseils
                    personnalisés
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-tertiary-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-tertiary-400 text-xs font-bold">
                      3
                    </span>
                  </div>
                  <p>Vous recevrez une réponse de notre salon sous 24-48h</p>
                </div>
              </div>
            </div>

            <div className="bg-tertiary-500/10 border border-tertiary-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-tertiary-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-tertiary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-white font-medium mb-2 text-xs sm:text-sm">
                    💡 En attendant notre réponse
                  </h3>
                  <ul className="text-white/70 text-xs space-y-1">
                    <li>
                      • Continuez à suivre les conseils de soin donnés lors de
                      votre séance
                    </li>
                    <li>• Gardez votre tatouage propre et hydraté</li>
                    <li>• Évitez l'exposition prolongée au soleil</li>
                    <li>• Contactez-nous en cas de problème urgent</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-white/60 mt-4 sm:mt-6">
              Merci de votre confiance et à bientôt ! 🎨
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-noir-700 to-noir-500">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-one tracking-wide mb-2 sm:mb-4">
              Suivi de Cicatrisation
            </h1>
            <p className="text-white/70 text-sm sm:text-base font-one">
              Partagez une photo de votre tatouage et donnez-nous votre avis
            </p>
          </div>

          {/* Main Form */}
          <div className="bg-gradient-to-br from-noir-500/20 to-noir-500/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/20 shadow-2xl">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 sm:space-y-8"
            >
              {/* Photo Upload Section */}
              <SinglePhotoUploader
                onFileSelect={(file) => {
                  setSelectedPhoto(file);
                  form.setValue("photo", file as any);
                  if (file) form.clearErrors("photo");
                }}
                selectedFile={selectedPhoto}
                error={form.formState.errors.photo?.message}
                disabled={isSubmitting}
                title="📸 Photo de cicatrisation"
                description="Partagez une photo de votre tatouage et donnez-nous votre avis"
              />

              {/* Error message for photo */}
              {form.formState.errors.photo && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-300 text-xs sm:text-sm">
                    {form.formState.errors.photo.message}
                  </p>
                </div>
              )}

              {/* Rating Section */}
              <div className="bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
                <h2 className="text-base sm:text-lg font-semibold font-one tracking-widest text-white mb-4 sm:mb-6">
                  ⭐ Votre satisfaction
                </h2>
                <div className="flex justify-center space-x-1 sm:space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        form.setValue("rating", star);
                        form.clearErrors("rating");
                      }}
                      className={`cursor-pointer text-xl sm:text-2xl transition-colors ${
                        star <= form.watch("rating")
                          ? "text-yellow-400"
                          : "text-white/30"
                      } hover:text-yellow-400`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                {form.watch("rating") > 0 && (
                  <p className="text-center text-white/70 mt-3 sm:mt-4 font-one text-sm">
                    {form.watch("rating") === 1 && "Très insatisfait"}
                    {form.watch("rating") === 2 && "Insatisfait"}
                    {form.watch("rating") === 3 && "Neutre"}
                    {form.watch("rating") === 4 && "Satisfait"}
                    {form.watch("rating") === 5 && "Très satisfait"}
                  </p>
                )}
                {form.formState.errors.rating && (
                  <p className="text-red-300 text-xs mt-2 text-center">
                    {form.formState.errors.rating.message}
                  </p>
                )}
              </div>

              {/* Review Section */}
              <div className="bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
                <h2 className="text-base sm:text-lg font-semibold font-one tracking-widest text-white mb-4 sm:mb-6">
                  💬 Votre avis
                </h2>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm text-white/70 font-one">
                    Partagez votre expérience avec nous
                  </label>
                  <textarea
                    {...form.register("review")}
                    placeholder="Comment s'est passé votre expérience ? Comment se déroule la cicatrisation ?"
                    className="w-full h-24 sm:h-32 mt-2 p-3 sm:p-4 bg-white/10 border border-white/20 rounded-lg text-white text-xs sm:text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-tertiary-400 focus:border-transparent resize-none transition-colors"
                  />
                </div>
              </div>

              {/* Privacy Section */}
              <div className="bg-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
                <h2 className="text-base sm:text-lg font-semibold font-one tracking-widest text-white mb-4 sm:mb-6">
                  🔒 Confidentialité de votre photo
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-white/70 text-xs sm:text-sm font-one">
                    Souhaitez-vous que votre photo de cicatrisation puisse être
                    utilisée publiquement par le salon ?
                  </p>

                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer p-2 sm:p-3 rounded-lg hover:bg-white/5 transition-colors">
                      <input
                        type="radio"
                        value="false"
                        checked={form.watch("isPhotoPublic") === false}
                        onChange={() => form.setValue("isPhotoPublic", false)}
                        className="mt-1 w-3 h-3 sm:w-4 sm:h-4 text-tertiary-400 bg-white/10 border-white/30 focus:ring-tertiary-400 focus:ring-1"
                      />
                      <div>
                        <div className="text-white font-medium text-xs sm:text-sm font-one mb-1">
                          🔒 Privée (recommandé)
                        </div>
                        <div className="text-white/60 text-xs font-one">
                          Votre photo restera confidentielle et ne sera utilisée
                          que pour votre suivi médical
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer p-2 sm:p-3 rounded-lg hover:bg-white/5 transition-colors">
                      <input
                        type="radio"
                        value="true"
                        checked={form.watch("isPhotoPublic") === true}
                        onChange={() => form.setValue("isPhotoPublic", true)}
                        className="mt-1 w-3 h-3 sm:w-4 sm:h-4 text-tertiary-400 bg-white/10 border-white/30 focus:ring-tertiary-400 focus:ring-1"
                      />
                      <div>
                        <div className="text-white font-medium text-xs sm:text-sm font-one mb-1">
                          🌐 Publique
                        </div>
                        <div className="text-white/60 text-xs font-one">
                          Le salon pourra utiliser votre photo (anonymement)
                          dans sa galerie ou sur ses réseaux sociaux
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="bg-tertiary-500/10 border border-tertiary-500/30 rounded-lg p-3 mt-3 sm:mt-4">
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 text-tertiary-400 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p className="text-tertiary-400 text-xs font-semibold mb-1">
                          À propos de la confidentialité
                        </p>
                        <p className="text-tertiary-400/80 text-xs">
                          Même si vous choisissez "Publique", vos informations
                          personnelles ne seront jamais partagées. Seule la
                          photo de votre tatouage cicatrisé pourrait être
                          utilisée à des fins promotionnelles.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-2 sm:pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedPhoto || isUploading}
                  className="cursor-pointer flex gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-sm"
                >
                  {isSubmitting || isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                      <span>
                        {isUploading ? "Upload..." : "Envoi en cours..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      <span>Envoyer le suivi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Info Section */}
          <div className="mt-6 sm:mt-8 bg-tertiary-500/10 border border-tertiary-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-tertiary-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 text-tertiary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold font-one mb-2 sm:mb-3 text-sm sm:text-base">
                  Conseils pour la photo
                </h3>
                <ul className="text-white/70 text-xs sm:text-sm space-y-1 sm:space-y-2 font-one">
                  <li>
                    • Photo dans un endroit bien éclairé (lumière naturelle de
                    préférence)
                  </li>
                  <li>
                    • Assurez-vous que le tatouage soit bien visible et net
                  </li>
                  <li>• Évitez les photos floues ou trop sombres</li>
                  <li>
                    • Prenez la photo à une distance raisonnable pour voir les
                    détails
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
