"use client";
import { paidAppointmentsAction } from "@/lib/queries/appointment";
import { FactureProps } from "@/lib/type";
import React, { useState } from "react";
import { toast } from "sonner";

interface FactureDetailsModalDesktopProps {
  facture: FactureProps;
  onClose: () => void;
  onUpdate?: (updatedFacture: FactureProps) => void; // Callback pour mettre à jour la liste parent
}

export default function FactureDetailsModalDesktop({
  facture,
  onClose,
  onUpdate,
}: FactureDetailsModalDesktopProps) {
  const [currentFacture, setCurrentFacture] = useState<FactureProps>(facture);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  //! Changer le statut de paiement
  const handlePaymentStatusChange = async () => {
    if (!currentFacture.id) {
      toast.error(
        "Impossible de modifier le statut : ID de rendez-vous manquant"
      );
      return;
    }

    try {
      setIsUpdatingPayment(true);

      // Inverser le statut de paiement actuel
      const newIsPayed = !currentFacture.isPayed;

      await paidAppointmentsAction(currentFacture.id, newIsPayed);

      // Mettre à jour la facture locale
      const updatedFacture = {
        ...currentFacture,
        isPayed: newIsPayed,
      };

      setCurrentFacture(updatedFacture);

      // Notifier le composant parent pour mettre à jour la liste
      if (onUpdate) {
        onUpdate(updatedFacture);
      }

      toast.success(
        newIsPayed
          ? "Facture marquée comme payée"
          : "Facture marquée comme non payée"
      );
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(
        "Une erreur est survenue lors de la mise à jour du statut de paiement"
      );
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-noir-800 rounded-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-noir-700 to-noir-600 p-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-tertiary-500/20 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-tertiary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white font-one">
                  Facture #{currentFacture.id.slice(-8)}
                </h1>
                <p className="text-white/60 font-one text-sm">
                  {currentFacture.title}
                </p>
                <div className="flex items-center gap-3 mt-1 text-sm">
                  <span className="text-white/50 font-one">
                    RDV le {formatDate(currentFacture.dateRdv)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Statut */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    currentFacture.isPayed ? "bg-green-400" : "bg-orange-400"
                  }`}
                ></div>
                <span
                  className={`text-sm font-one font-medium ${
                    currentFacture.isPayed
                      ? "text-green-400"
                      : "text-orange-400"
                  }`}
                >
                  {currentFacture.isPayed ? "Payé" : "En attente"}
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-3 overflow-y-auto max-h-[calc(90vh-70px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Colonne gauche */}
            <div className="space-y-3">
              {/* Badge prestation */}
              <div className="flex justify-center w-full">
                <span
                  className={`px-4 py-2 w-full text-center rounded-lg text-sm font-medium font-one ${
                    currentFacture.prestation === "TATTOO"
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : currentFacture.prestation === "PIERCING"
                      ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                      : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  }`}
                >
                  {currentFacture.prestation}
                </span>
              </div>

              {/* Prix et informations financières */}
              <div className="bg-noir-700 rounded-xl p-3 border border-white/10 text-center">
                <p className="text-white/60 text-xs font-one mb-1">
                  Montant total
                </p>
                <p className="text-2xl font-bold text-tertiary-400 font-one mb-2">
                  {formatPrice(currentFacture.price)}
                </p>

                {/* Détails financiers */}
                {/* <div className="grid grid-cols-2 gap-2 mt-3">
                  {currentFacture.depositAmount && (
                    <div className="bg-noir-600 p-3 rounded-lg">
                      <p className="text-white/60 text-xs font-one mb-1">
                        Acompte
                      </p>
                      <p className="text-green-400 font-one font-semibold">
                        {formatPrice(currentFacture.depositAmount)}
                      </p>
                    </div>
                  )}

                  {currentFacture.remainingAmount && (
                    <div className="bg-noir-600 p-3 rounded-lg">
                      <p className="text-white/60 text-xs font-one mb-1">
                        Restant
                      </p>
                      <p className="text-orange-400 font-one font-semibold">
                        {formatPrice(currentFacture.remainingAmount)}
                      </p>
                    </div>
                  )}
                </div> */}
              </div>

              {/* Informations client */}
              <div className="bg-noir-700 rounded-xl p-3 border border-white/10">
                <h3 className="text-sm font-bold text-white font-one mb-2 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-tertiary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Client
                </h3>

                {/* Avatar et nom */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-tertiary-500 to-tertiary-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {currentFacture.client.firstName.charAt(0).toUpperCase()}
                      {currentFacture.client.lastName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-bold font-one text-sm">
                      {currentFacture.client.firstName}{" "}
                      {currentFacture.client.lastName}
                    </p>
                  </div>
                </div>

                {/* Coordonnées */}
                <div className="space-y-1.5">
                  {currentFacture.client.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <svg
                        className="w-4 h-4 text-tertiary-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                        />
                      </svg>
                      <span className="text-white/80 font-one">
                        {currentFacture.client.email}
                      </span>
                    </div>
                  )}

                  {currentFacture.client.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <svg
                        className="w-4 h-4 text-tertiary-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span className="text-white/80 font-one">
                        {currentFacture.client.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Colonne droite */}
            <div className="space-y-3">
              {/* Informations RDV */}
              <div className="bg-noir-700 rounded-xl p-3 border border-white/10">
                <h3 className="text-sm font-bold text-white font-one mb-2 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-tertiary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Détails du rendez-vous
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-noir-600 p-2 rounded-lg">
                    <p className="text-white/60 text-xs font-one mb-1">
                      Date RDV
                    </p>
                    <p className="text-white font-one font-medium">
                      {formatDate(currentFacture.dateRdv)}
                    </p>
                  </div>

                  <div className="bg-noir-600 p-2 rounded-lg">
                    <p className="text-white/60 text-xs font-one mb-1">Durée</p>
                    <p className="text-white font-one font-medium text-sm">
                      {currentFacture.duration || "Non spécifiée"}
                    </p>
                  </div>

                  <div className="bg-noir-600 p-2 rounded-lg col-span-2">
                    <p className="text-white/60 text-xs font-one mb-1">
                      Tatoueur
                    </p>
                    <p className="text-white font-one font-medium">
                      {currentFacture.tatoueur}
                    </p>
                  </div>
                </div>
              </div>

              {/* Détails de la prestation */}
              {currentFacture.prestationDetails && (
                <div className="bg-noir-700 rounded-xl p-3 border border-white/10">
                  <h3 className="text-sm font-bold text-white font-one mb-2 flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-tertiary-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Spécifications
                  </h3>

                  <div className="">
                    {/* Caractéristiques en grid */}
                    <div className="grid grid-cols-2 gap-1">
                      {/* Informations communes */}
                      {currentFacture.prestationDetails.size && (
                        <div className="bg-noir-600 p-2 rounded-lg">
                          <p className="text-white/60 text-xs font-one">
                            Taille
                          </p>
                          <p className="text-white font-one font-medium">
                            {currentFacture.prestationDetails.size}
                          </p>
                        </div>
                      )}

                      {currentFacture.prestationDetails.colorStyle && (
                        <div className="bg-noir-600 p-2 rounded-lg">
                          <p className="text-white/60 text-xs font-one">
                            Style/Couleur
                          </p>
                          <p className="text-white font-one font-medium text-sm">
                            {currentFacture.prestationDetails.colorStyle}
                          </p>
                        </div>
                      )}

                      {/* Informations spécifiques aux piercings */}
                      {currentFacture.prestation === "PIERCING" &&
                        currentFacture.prestationDetails.piercingZone && (
                          <div className="bg-noir-600 p-3 rounded-lg">
                            <p className="text-white/60 text-xs font-one">
                              Zone globale
                            </p>
                            <p className="text-white font-one font-medium">
                              {currentFacture.prestationDetails.piercingZone}
                            </p>
                          </div>
                        )}

                      {currentFacture.prestation === "PIERCING" &&
                        currentFacture.prestationDetails.zone && (
                          <div className="bg-noir-600 p-3 rounded-lg">
                            <p className="text-white/60 text-xs font-one">
                              Zone détaillée
                            </p>
                            <p className="text-white font-one font-medium">
                              {currentFacture.prestationDetails.zone}
                            </p>
                          </div>
                        )}

                      {/* Informations spécifiques aux tattoos */}
                      {currentFacture.prestation === "TATTOO" &&
                        currentFacture.prestationDetails.zone && (
                          <div className="bg-noir-600 p-3 rounded-lg col-span-2">
                            <p className="text-white/60 text-xs font-one">
                              Emplacement
                            </p>
                            <p className="text-white font-one font-medium">
                              {currentFacture.prestationDetails.zone}
                            </p>
                          </div>
                        )}
                    </div>

                    {/* Description */}
                    {currentFacture.prestationDetails.description && (
                      <div className="bg-noir-600 p-4 rounded-lg">
                        <p className="text-white/60 text-xs font-one">
                          Description détaillée
                        </p>
                        <p className="text-white font-one text-sm leading-relaxed">
                          {currentFacture.prestationDetails.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes et informations supplémentaires */}
              {/* {(currentFacture.notes ||
                currentFacture.depositAmount ||
                currentFacture.remainingAmount) && (
                <div className="bg-noir-700 rounded-xl p-5 border border-white/10">
                  <h3 className="text-lg font-bold text-white font-one mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-tertiary-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                    Notes
                  </h3>

                  {currentFacture.notes && (
                    <div className="bg-noir-600 p-4 rounded-lg">
                      <p className="text-white font-one text-sm leading-relaxed">
                        {currentFacture.notes}
                      </p>
                    </div>
                  )}
                </div>
              )} */}

              {/* Actions */}
              <div className="bg-noir-700 rounded-xl p-3 border border-white/10">
                <h3 className="text-sm font-bold text-white font-one mb-2">
                  Actions
                </h3>
                <div className="grid grid-cols-2 gap-1">
                  <button className="py-1.5 px-2 bg-tertiary-600 text-white rounded-lg hover:bg-tertiary-700 transition-colors font-one font-medium text-xs flex items-center justify-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    PDF
                  </button>

                  <button className="py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-one font-medium text-xs flex items-center justify-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Email
                  </button>

                  {/* <button className="py-2 px-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-one font-medium text-xs flex items-center justify-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                      />
                    </svg>
                    Partager
                  </button> */}

                  {/* <button className="py-2 px-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-one font-medium text-xs flex items-center justify-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Modifier
                  </button> */}

                  <button
                    onClick={handlePaymentStatusChange}
                    disabled={isUpdatingPayment}
                    className={`cursor-pointer py-2 px-3 text-white rounded-lg transition-colors font-one font-medium text-xs flex items-center justify-center gap-1 col-span-2 ${
                      currentFacture.isPayed
                        ? "bg-orange-600 hover:bg-orange-700"
                        : "bg-green-600 hover:bg-green-700"
                    } ${
                      isUpdatingPayment ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isUpdatingPayment ? (
                      <>
                        <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                        Mise à jour...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              currentFacture.isPayed
                                ? "M6 18L18 6M6 6l12 12"
                                : "M5 13l4 4L19 7"
                            }
                          />
                        </svg>
                        {currentFacture.isPayed
                          ? "Marquer comme non payé"
                          : "Marquer comme payé"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
