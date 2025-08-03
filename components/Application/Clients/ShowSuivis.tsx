/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useUser } from "@/components/Auth/Context/UserContext";
import BarLoader from "react-spinners/BarLoader";
import { MdOutlineRateReview, MdFilterList } from "react-icons/md";
import { IoChevronDown } from "react-icons/io5";
import { toast } from "sonner";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
}

interface Tatoueur {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  title: string;
  start: string;
  end: string;
  client: Client;
  tatoueur: Tatoueur;
}

interface FollowUpSubmission {
  id: string;
  rating: number;
  review?: string;
  photoUrl: string;
  createdAt: string;
  isAnswered: boolean;
  isPhotoPublic: boolean;
  appointmentId: string;
  clientId: string;
  appointment: Appointment;
}

type StatusFilter = "all" | "answered" | "unanswered";
type TatoueurFilter = "all" | string;

export default function ShowSuivis() {
  const user = useUser();
  const [loading, setLoading] = useState(true);
  const [followUps, setFollowUps] = useState<FollowUpSubmission[]>([]);
  const [filteredFollowUps, setFilteredFollowUps] = useState<
    FollowUpSubmission[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  // États pour la modale de réponse
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] =
    useState<FollowUpSubmission | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  // États pour la modale de suppression
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [followUpToDelete, setFollowUpToDelete] =
    useState<FollowUpSubmission | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtres
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [tatoueurFilter, setTatoueurFilter] = useState<TatoueurFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Liste unique des tatoueurs pour le filtre
  const [tatoueurs, setTatoueurs] = useState<Tatoueur[]>([]);

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/follow-up/all/${user.id}`
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des suivis");
      }

      const data = await response.json();
      setFollowUps(data.followUps || []);

      // Extraire la liste unique des tatoueurs
      const uniqueTatoueurs: any = Array.from(
        new Map(
          data.followUps
            .filter(
              (followUp: FollowUpSubmission) => followUp.appointment?.tatoueur
            )
            .map((followUp: FollowUpSubmission) => [
              followUp.appointment.tatoueur.id,
              followUp.appointment.tatoueur,
            ])
        ).values()
      );
      setTatoueurs(uniqueTatoueurs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...followUps];

    // Filtre par statut
    if (statusFilter === "answered") {
      filtered = filtered.filter((followUp) => followUp.isAnswered);
    } else if (statusFilter === "unanswered") {
      filtered = filtered.filter((followUp) => !followUp.isAnswered);
    }

    // Filtre par tatoueur
    if (tatoueurFilter !== "all") {
      filtered = filtered.filter(
        (followUp) => followUp.appointment?.tatoueur?.id === tatoueurFilter
      );
    }

    // Filtre par recherche (nom du client)
    if (searchTerm) {
      filtered = filtered.filter((followUp) => {
        const clientName =
          `${followUp.appointment?.client?.firstName} ${followUp.appointment?.client?.lastName}`.toLowerCase();
        return clientName.includes(searchTerm.toLowerCase());
      });
    }

    setFilteredFollowUps(filtered);
  }, [followUps, statusFilter, tatoueurFilter, searchTerm]);

  useEffect(() => {
    if (user.id) {
      fetchFollowUps();
    }
  }, [user.id]);

  const getRatingStars = (rating: number) => {
    return "⭐".repeat(rating) + "☆".repeat(5 - rating);
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1:
        return "Très insatisfait";
      case 2:
        return "Insatisfait";
      case 3:
        return "Neutre";
      case 4:
        return "Satisfait";
      case 5:
        return "Très satisfait";
      default:
        return "";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "À l'instant";
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays}j`;
  };

  const handleReplyClick = (followUp: FollowUpSubmission) => {
    setSelectedFollowUp(followUp);
    setReplyText("");
    setIsReplyModalOpen(true);
  };

  const handleReplySubmit = async () => {
    if (!selectedFollowUp || !replyText.trim()) {
      toast.error("Veuillez saisir une réponse");
      return;
    }

    setIsReplying(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/follow-up/reply/${selectedFollowUp.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            response: replyText,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de l'envoi de la réponse"
        );
      }

      toast.success(
        "Réponse envoyée avec succès ! Le client va recevoir un email."
      );

      // Mettre à jour la liste des suivis
      await fetchFollowUps();

      // Fermer la modale
      setIsReplyModalOpen(false);
      setSelectedFollowUp(null);
      setReplyText("");
    } catch (error) {
      console.error("Erreur lors de l'envoi de la réponse:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'envoi de la réponse"
      );
    } finally {
      setIsReplying(false);
    }
  };

  const handleCloseReplyModal = () => {
    setIsReplyModalOpen(false);
    setSelectedFollowUp(null);
    setReplyText("");
  };

  const handleDeleteClick = (followUp: FollowUpSubmission) => {
    setFollowUpToDelete(followUp);
    setIsDeleteModalOpen(true);
  };

  // Extraire la clé UploadThing de l'URL
  const extractUploadThingKey = (url: string): string | null => {
    try {
      // Format UploadThing: https://utfs.io/f/[key]
      const match = url.match(/\/f\/([^\/\?]+)/);
      return match ? match[1] : null;
    } catch (error) {
      console.error(
        "Erreur lors de l'extraction de la clé UploadThing:",
        error
      );
      return null;
    }
  };

  const deleteFromUploadThing = async (fileKey: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/uploadthing/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileKeys: [fileKey],
        }),
      });

      if (!response.ok) {
        console.error(
          "Erreur lors de la suppression UploadThing:",
          response.statusText
        );
        return false;
      }

      const result = await response.json();
      console.log("Suppression UploadThing réussie:", result);
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression UploadThing:", error);
      return false;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!followUpToDelete) return;

    setIsDeleting(true);

    try {
      // 1. Supprimer de la base de données
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/follow-up/delete/${followUpToDelete.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la suppression");
      }

      // 2. Supprimer de UploadThing si l'URL provient d'UploadThing
      if (
        followUpToDelete.photoUrl &&
        followUpToDelete.photoUrl.includes("utfs.io")
      ) {
        const fileKey = extractUploadThingKey(followUpToDelete.photoUrl);
        if (fileKey) {
          const uploadThingDeleted = await deleteFromUploadThing(fileKey);
          if (!uploadThingDeleted) {
            console.warn(
              "Le suivi a été supprimé de la base de données mais pas d'UploadThing"
            );
            toast.warning("Suivi supprimé mais fichier distant non supprimé");
          }
        }
      }

      toast.success("Suivi supprimé avec succès");

      // Mettre à jour la liste des suivis
      await fetchFollowUps();

      // Fermer la modale
      setIsDeleteModalOpen(false);
      setFollowUpToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la suppression"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setFollowUpToDelete(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-noir-700 pt-20">
        <div className="px-6 lg:px-20 mx-auto py-8">
          <div className="flex items-center justify-center">
            <BarLoader
              color="#ff5500"
              loading={loading}
              width={300}
              height={5}
              aria-label="Loading Spinner"
            />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-noir-700 pt-20">
        <div className="px-6 lg:px-20 mx-auto py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-red-400 mb-4 text-lg font-medium">{error}</p>
            <button
              onClick={fetchFollowUps}
              className="px-6 py-3 bg-tertiary-500 text-white rounded-lg hover:bg-tertiary-600 transition-colors font-medium"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir-700">
      <div className="px-6 lg:px-20 mx-auto py-8">
        {/* Filtres */}
        <div className="bg-noir-500 rounded-xl border border-white/20 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <MdFilterList className="text-white w-5 h-5" />
            <h2 className="text-white font-one font-semibold">Filtres</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recherche par client */}
            <div>
              <label className="block text-xs text-white/70 font-one mb-2">
                Rechercher par client
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom du client..."
                className="w-full text-sm text-white bg-white/10 placeholder:text-white/30 py-2 px-3 font-one border border-white/20 rounded-lg focus:outline-none focus:border-tertiary-400 transition-colors"
              />
            </div>

            {/* Filtre par statut */}
            <div>
              <label className="block text-xs text-white/70 font-one mb-2">
                Statut de réponse
              </label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as StatusFilter)
                  }
                  className="w-full text-sm text-white bg-noir-500/80 py-2 px-3 font-one border border-white/20 rounded-lg focus:outline-none focus:border-tertiary-400 transition-colors appearance-none cursor-pointer"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="unanswered">En attente</option>
                  <option value="answered">Répondus</option>
                </select>
                <IoChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Filtre par tatoueur */}
            <div>
              <label className="block text-xs text-white/70 font-one mb-2">
                Tatoueur
              </label>
              <div className="relative">
                <select
                  value={tatoueurFilter}
                  onChange={(e) => setTatoueurFilter(e.target.value)}
                  className="w-full text-sm text-white bg-noir-500/80 py-2 px-3 font-one border border-white/20 rounded-lg focus:outline-none focus:border-tertiary-400 transition-colors appearance-none cursor-pointer"
                >
                  <option value="all">Tous les tatoueurs</option>
                  {tatoueurs.map((tatoueur) => (
                    <option key={tatoueur.id} value={tatoueur.id}>
                      {tatoueur.name}
                    </option>
                  ))}
                </select>
                <IoChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Compteur de résultats */}
            <div className="flex items-end">
              <div className="text-center">
                <p className="text-xs text-white/70 font-one">Résultats</p>
                <p className="text-lg font-bold text-tertiary-400 font-one">
                  {filteredFollowUps.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des suivis */}
        {filteredFollowUps.length === 0 ? (
          <div className="bg-noir-500 rounded-xl border border-white/20 p-12 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdOutlineRateReview className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-white/60 text-lg mb-2">Aucun suivi trouvé</p>
            <p className="text-white/40 text-sm">
              {followUps.length === 0
                ? "Aucun client n'a encore envoyé de suivi"
                : "Essayez de modifier vos filtres"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredFollowUps.map((followUp) => (
              <div
                key={followUp.id}
                className="bg-noir-500 rounded-xl border border-white/20 p-6 hover:border-tertiary-400/30 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  {/* Photo de cicatrisation */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-white/10 flex-shrink-0 border border-white/20">
                    {followUp.photoUrl ? (
                      <Image
                        src={followUp.photoUrl}
                        alt="Photo de cicatrisation"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => window.open(followUp.photoUrl, "_blank")}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Informations du suivi */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-semibold font-one text-lg mb-1">
                          {followUp.appointment?.client?.firstName}{" "}
                          {followUp.appointment?.client?.lastName}
                        </h3>
                        <p className="text-white/70 text-sm font-one mb-1">
                          {followUp.appointment?.title}
                        </p>
                        <p className="text-white/50 text-xs font-one">
                          Tatoueur: {followUp.appointment?.tatoueur?.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            followUp.isAnswered
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                          }`}
                        >
                          {followUp.isAnswered ? "Répondu" : "En attente"}
                        </span>

                        <span className="text-white/50 text-xs font-one">
                          {getTimeAgo(followUp.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Évaluation */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-yellow-400">
                        {getRatingStars(followUp.rating)}
                      </span>
                      <span className="text-white/80 text-sm font-one">
                        {getRatingLabel(followUp.rating)}
                      </span>
                    </div>

                    {/* Avis du client */}
                    {followUp.review && (
                      <div className="bg-white/5 p-3 rounded-lg border border-white/10 mb-3">
                        <p className="text-white/90 text-sm font-one italic">
                          "{followUp.review}"
                        </p>
                      </div>
                    )}

                    {/* Métadonnées */}
                    <div className="flex items-center justify-between text-xs text-white/50 font-one">
                      <span>Envoyé le {formatDate(followUp.createdAt)}</span>
                      <div className="flex items-center gap-4">
                        <span
                          className={`${
                            followUp.isPhotoPublic
                              ? "text-blue-400"
                              : "text-gray-400"
                          }`}
                        >
                          Photo {followUp.isPhotoPublic ? "publique" : "privée"}
                        </span>

                        <div className="flex items-center gap-2">
                          {!followUp.isAnswered && (
                            <button
                              onClick={() => handleReplyClick(followUp)}
                              className="text-tertiary-400 hover:text-tertiary-300 transition-colors font-medium"
                            >
                              Répondre →
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteClick(followUp)}
                            className="cursor-pointer text-red-400 hover:text-red-300 transition-colors font-medium ml-2"
                            title="Supprimer ce suivi"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modale de réponse */}
        {isReplyModalOpen && selectedFollowUp && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-noir-500 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20 shadow-2xl">
              {/* Header */}
              <div className="p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white font-one tracking-wide">
                    Répondre au suivi
                  </h2>
                  <button
                    onClick={handleCloseReplyModal}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <span className="cursor-pointer text-white text-xl">×</span>
                  </button>
                </div>
                <p className="text-white/70 mt-2 text-sm">
                  Réponse à {selectedFollowUp.appointment?.client?.firstName}{" "}
                  {selectedFollowUp.appointment?.client?.lastName}
                </p>
              </div>

              {/* Contenu */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Récapitulatif du suivi */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-6">
                  <h3 className="text-white font-semibold font-one mb-3">
                    📋 Récapitulatif du suivi
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-white/70 font-one">Client</p>
                      <p className="text-white font-one text-sm">
                        {selectedFollowUp.appointment?.client?.firstName}{" "}
                        {selectedFollowUp.appointment?.client?.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/70 font-one">
                        Prestation
                      </p>
                      <p className="text-white font-one text-sm">
                        {selectedFollowUp.appointment?.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/70 font-one">Tatoueur</p>
                      <p className="text-white font-one text-sm">
                        {selectedFollowUp.appointment?.tatoueur?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/70 font-one">
                        Date d'envoi
                      </p>
                      <p className="text-white font-one text-sm">
                        {formatDate(selectedFollowUp.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Évaluation du client */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs text-white/70 font-one">
                      Satisfaction:
                    </span>
                    <span className="text-yellow-400 text-sm">
                      {getRatingStars(selectedFollowUp.rating)}
                    </span>
                    <span className="text-white/80 text-xs font-one">
                      {getRatingLabel(selectedFollowUp.rating)}
                    </span>
                  </div>

                  {/* Avis du client */}
                  {selectedFollowUp.review && (
                    <div className="mt-3">
                      <p className="text-xs text-white/70 font-one mb-2">
                        Avis du client:
                      </p>
                      <div className="bg-white/10 p-3 rounded-lg border border-white/20">
                        <p className="text-white/90 text-sm font-one italic">
                          "{selectedFollowUp.review}"
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Photo du client */}
                  {selectedFollowUp.photoUrl && (
                    <div className="mt-4">
                      <p className="text-xs text-white/70 font-one mb-2">
                        Photo de cicatrisation:
                      </p>
                      <div className="w-32 h-32 rounded-lg overflow-hidden bg-white/10 border border-white/20">
                        <Image
                          src={selectedFollowUp.photoUrl}
                          alt="Photo de cicatrisation"
                          width={128}
                          height={128}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() =>
                            window.open(selectedFollowUp.photoUrl, "_blank")
                          }
                        />
                      </div>
                      <p className="text-xs text-white/50 font-one mt-1">
                        Cliquez pour voir en grand
                      </p>
                    </div>
                  )}
                </div>

                {/* Zone de réponse */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <h3 className="text-white font-semibold font-one mb-3">
                    ✍️ Votre réponse
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-white/70 font-one mb-2">
                        Message pour le client
                      </label>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Rédigez votre réponse personnalisée pour le client..."
                        className="w-full h-32 p-4 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-tertiary-400 focus:border-transparent resize-none transition-colors"
                        maxLength={1000}
                        disabled={isReplying}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-white/50 font-one">
                          Le client recevra votre réponse par email
                        </p>
                        <p className="text-xs text-white/50 font-one">
                          {replyText.length}/1000
                        </p>
                      </div>
                    </div>

                    {/* Suggestions de réponse */}
                    <div className="border-t border-white/10 pt-3">
                      <p className="text-xs text-white/70 font-one mb-2">
                        💡 Suggestions de réponse :
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {/*
                          TODO: Récupérer les suggestions de réponse depuis l'API
                        */}
                        {[
                          "Votre tatouage cicatrise parfaitement ! Continuez les soins comme indiqué.",
                          "Merci pour cette belle photo ! La cicatrisation suit son cours normal.",
                          "Excellent ! Votre tatouage guérit très bien. N'hésitez pas si vous avez des questions.",
                        ].map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => setReplyText(suggestion)}
                            disabled={isReplying}
                            className="cursor-pointer text-left p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-tertiary-400/30 transition-all text-xs text-white/80 font-one disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                <button
                  onClick={handleCloseReplyModal}
                  disabled={isReplying}
                  className="cursor-pointer px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReplySubmit}
                  disabled={isReplying || !replyText.trim()}
                  className="cursor-pointer px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-sm flex items-center gap-2"
                >
                  {isReplying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Envoi...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
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
                      <span>Envoyer la réponse</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modale de confirmation de suppression */}
        {isDeleteModalOpen && followUpToDelete && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-noir-500 rounded-2xl w-full max-w-md border border-white/20 shadow-2xl">
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-red-400"
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
                  <h2 className="text-lg font-bold text-white font-one">
                    Supprimer le suivi
                  </h2>
                </div>
                <p className="text-white/70 text-sm">
                  Cette action est irréversible
                </p>
              </div>

              {/* Contenu */}
              <div className="p-6">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 border border-white/20">
                      {followUpToDelete.photoUrl ? (
                        <Image
                          src={followUpToDelete.photoUrl}
                          alt="Photo de cicatrisation"
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-white font-medium text-sm mb-1">
                        {followUpToDelete.appointment?.client?.firstName}{" "}
                        {followUpToDelete.appointment?.client?.lastName}
                      </p>
                      <p className="text-white/70 text-xs mb-1">
                        {followUpToDelete.appointment?.title}
                      </p>
                      <p className="text-white/50 text-xs">
                        {formatDate(followUpToDelete.createdAt)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-yellow-400 text-xs">
                          {getRatingStars(followUpToDelete.rating)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                            followUpToDelete.isAnswered
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                          }`}
                        >
                          {followUpToDelete.isAnswered
                            ? "Répondu"
                            : "En attente"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-red-300 text-xs font-semibold mb-1">
                        Attention !
                      </p>
                      <p className="text-red-300/80 text-xs">
                        Cette action supprimera définitivement ce suivi de
                        cicatrisation.
                        {!followUpToDelete.isAnswered &&
                          " Le client ne pourra plus recevoir de réponse."}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-white/80 text-sm mb-4">
                  Êtes-vous sûr de vouloir supprimer ce suivi ?
                </p>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="cursor-pointer px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-sm flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      <span>Suppression...</span>
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span>Supprimer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
