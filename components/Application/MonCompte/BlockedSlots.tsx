/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import CreateBlockedSlot from "./CreateBlockedSlot";

interface Tatoueur {
  id: string;
  name: string;
}

interface BlockedSlot {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  tatoueurId: string | null;
  userId: string;
  tatoueur: Tatoueur | null;
  createdAt: string;
  updatedAt: string;
}

interface BlockedSlotsProps {
  userId: string;
  tatoueurs: Tatoueur[];
}

export default function BlockedSlots({ userId, tatoueurs }: BlockedSlotsProps) {
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTatoueur, setSelectedTatoueur] = useState<string>("all");

  // États pour la modale de déblocage
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<BlockedSlot | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch des créneaux bloqués
  const fetchBlockedSlots = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/blocked-slots/salon/${userId}`
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(
          data.message || "Erreur lors de la récupération des créneaux bloqués"
        );
      }

      setBlockedSlots(data.blockedSlots || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedSlots();
  }, [userId]);

  // Supprimer un créneau bloqué
  const handleDeleteSlot = async () => {
    if (!slotToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/blocked-slots/${slotToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.message || "Erreur lors de la suppression");
      }

      toast.success("Créneau débloqué avec succès");
      fetchBlockedSlots(); // Refresh la liste
      setIsDeleteModalOpen(false);
      setSlotToDelete(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Ouvrir la modale de confirmation
  const openDeleteModal = (slot: BlockedSlot) => {
    setSlotToDelete(slot);
    setIsDeleteModalOpen(true);
  };

  // Fermer la modale de confirmation
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSlotToDelete(null);
  };

  // Formater les dates
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filtrer par tatoueur
  const filteredSlots = blockedSlots.filter((slot) => {
    if (selectedTatoueur === "all") return true;
    if (selectedTatoueur === "salon") return slot.tatoueurId === null;
    return slot.tatoueurId === selectedTatoueur;
  });

  // Grouper par date
  const groupedSlots = filteredSlots.reduce((acc, slot) => {
    const date = new Date(slot.startDate).toLocaleDateString("fr-FR");
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, BlockedSlot[]>);

  if (loading) {
    return (
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white font-one">
            🚫 Créneaux bloqués
          </h3>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-tertiary-400"></div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse h-16 bg-white/10 rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white font-one">
              🚫 Créneaux bloqués
            </h3>
            <p className="text-white/60 text-sm font-one mt-1">
              Gérez les indisponibilités et congés
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="cursor-pointer px-4 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-sm flex items-center gap-2"
          >
            <span>+</span>
            Bloquer un créneau
          </button>
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-xs text-white/70 font-one">
              Filtrer par :
            </label>
            <select
              value={selectedTatoueur}
              onChange={(e) => setSelectedTatoueur(e.target.value)}
              className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors"
            >
              <option value="all" className="bg-noir-500">
                Tous les créneaux
              </option>
              <option value="salon" className="bg-noir-500">
                Salon complet
              </option>
              {tatoueurs.map((tatoueur) => (
                <option
                  key={tatoueur.id}
                  value={tatoueur.id}
                  className="bg-noir-500"
                >
                  {tatoueur.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-white/60 font-one">
            {filteredSlots.length} créneau{filteredSlots.length > 1 ? "x" : ""}{" "}
            bloqué{filteredSlots.length > 1 ? "s" : ""}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
            <p className="text-red-300 text-sm">{error}</p>
            <button
              onClick={fetchBlockedSlots}
              className="cursor-pointer mt-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs border border-red-500/50"
            >
              Réessayer
            </button>
          </div>
        )}

        {filteredSlots.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔓</span>
            </div>
            <p className="text-white/60 font-one">
              {selectedTatoueur === "all"
                ? "Aucun créneau bloqué"
                : selectedTatoueur === "salon"
                ? "Aucun blocage salon"
                : `Aucun blocage pour ${
                    tatoueurs.find((t) => t.id === selectedTatoueur)?.name
                  }`}
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(groupedSlots)
              .sort(
                ([dateA], [dateB]) =>
                  new Date(dateA).getTime() - new Date(dateB).getTime()
              )
              .map(([date, slots]) => (
                <div key={date} className="space-y-2">
                  <div className="sticky top-0 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                    <h4 className="text-white font-semibold text-sm font-one">
                      {date}
                    </h4>
                  </div>

                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="bg-white/10 rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                slot.tatoueurId ? "bg-orange-400" : "bg-red-400"
                              }`}
                            />
                            <span className="text-white font-medium text-sm font-one">
                              {slot.tatoueur
                                ? slot.tatoueur.name
                                : "Salon complet"}
                            </span>
                            <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs border border-red-500/30">
                              Bloqué
                            </span>
                          </div>

                          <div className="space-y-1 text-xs text-white/80 font-one">
                            <div className="flex items-center gap-4">
                              <span>⏰ {formatDateTime(slot.startDate)}</span>
                              <span>→</span>
                              <span>{formatDateTime(slot.endDate)}</span>
                            </div>

                            {slot.reason && (
                              <div className="flex items-start gap-2 mt-2">
                                <span>💬</span>
                                <span className="text-white/70">
                                  {slot.reason}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => openDeleteModal(slot)}
                          className="cursor-pointer ml-4 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs border border-red-500/30 transition-colors"
                        >
                          Débloquer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Modal de création */}
      {isCreateModalOpen && (
        <CreateBlockedSlot
          userId={userId}
          tatoueurs={tatoueurs}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchBlockedSlots();
          }}
        />
      )}

      {/* Modal de déblocage */}
      {isDeleteModalOpen && slotToDelete && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-noir-500 rounded-3xl w-full max-w-lg overflow-hidden flex flex-col border border-white/20 shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white font-one tracking-wide">
                  🔓 Débloquer le créneau
                </h2>
                <button
                  onClick={closeDeleteModal}
                  disabled={isDeleting}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                >
                  <span className="cursor-pointer text-white text-xl">×</span>
                </button>
              </div>
              <p className="text-white/70 mt-1 text-sm">
                Confirmer le déblocage de ce créneau
              </p>
            </div>

            {/* Contenu */}
            <div className="p-4">
              {/* Récapitulatif du créneau */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-3 h-3 rounded-full mt-1.5 ${
                      slotToDelete.tatoueurId ? "bg-orange-400" : "bg-red-400"
                    }`}
                  />

                  <div className="flex-1">
                    <h3 className="text-white font-one font-semibold mb-2">
                      {slotToDelete.tatoueur
                        ? slotToDelete.tatoueur.name
                        : "Salon complet"}
                    </h3>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-white/80">
                        <span>📅</span>
                        <span className="font-one">
                          {formatDateTime(slotToDelete.startDate)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-white/80">
                        <span>⏰</span>
                        <span className="font-one">
                          Jusqu&apos;au {formatDateTime(slotToDelete.endDate)}
                        </span>
                      </div>

                      {slotToDelete.reason && (
                        <div className="flex items-start gap-2 text-white/80">
                          <span>💬</span>
                          <span className="font-one italic">
                            "{slotToDelete.reason}"
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Message d'avertissement */}
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0"
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
                  <div>
                    <p className="text-orange-400 text-xs font-semibold mb-1">
                      ⚠️ Attention
                    </p>
                    <p className="text-orange-400/80 text-xs">
                      En débloquant ce créneau, il redeviendra disponible pour
                      la prise de rendez-vous.
                      {slotToDelete.tatoueurId === null &&
                        " Cela débloquera le salon complet pour cette période."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end gap-2">
              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteSlot}
                disabled={isDeleting}
                className="cursor-pointer px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>Déblocage...</span>
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
                        d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Débloquer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
