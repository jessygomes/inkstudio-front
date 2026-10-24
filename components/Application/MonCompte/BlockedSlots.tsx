/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { CalendarDays, CalendarCheck, Plus, X, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import CreateBlockedSlot from "./CreateBlockedSlot";
import DashboardButton from "@/components/Shared/DashboardButton";
import { deleteBlockedTimeSlotAction } from "@/lib/queries/blocked-time-slots";

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
  const confirmation = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDeleteModalOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    confirmation.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (!isDeleting) { setIsDeleteModalOpen(false); setSlotToDelete(null); }
      }
      if (event.key === "Tab") {
        const buttons = Array.from(confirmation.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") || []);
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (!first) { event.preventDefault(); return; }
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handleKey, true);
    return () => { document.removeEventListener("keydown", handleKey, true); previousFocus?.focus(); };
  }, [isDeleteModalOpen, isDeleting]);

  // Fetch des créneaux bloqués
  const fetchBlockedSlots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/blocked-slots/salon/${userId}`
      );

      const data = await response.json();

      if (!response.ok || data.error) {
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
  }, [userId]);

  useEffect(() => {
    fetchBlockedSlots();
  }, [fetchBlockedSlots]);

  // Supprimer un créneau bloqué
  const handleDeleteSlot = async () => {
    if (!slotToDelete) return;

    setIsDeleting(true);

    try {
      const res = await deleteBlockedTimeSlotAction(slotToDelete.id);

      if (!res.ok) {
        toast.error(
          res.message === "Unauthorized"
            ? "Non autorisé"
            : "Erreur lors de la suppression"
        );
        return;
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
  }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  // Grouper par date
  const groupedSlots = filteredSlots.reduce((acc, slot) => {
    const date = new Date(slot.startDate).toLocaleDateString("fr-FR");
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, BlockedSlot[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-tertiary-400" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 font-one [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed [&_select]:cursor-pointer">
        {/* Barre: filtre + compteur + bouton */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
          <label htmlFor="blocked-artist" className="sr-only">Afficher les indisponibilités de</label>
          <select
            id="blocked-artist"
            value={selectedTatoueur}
            onChange={(e) => setSelectedTatoueur(e.target.value)}
            className="min-w-0 max-w-56 min-h-9 cursor-pointer px-2.5 py-2 bg-noir-700/70 border border-white/10 rounded-lg text-white/70 text-[11px] font-one focus:outline-none focus:border-tertiary-400/50 transition-colors"
          >
            <option value="all" className="bg-noir-500">Tous les artistes et le salon</option>
            <option value="salon" className="bg-noir-500">Salon complet</option>
            {tatoueurs.map((tatoueur) => (
              <option key={tatoueur.id} value={tatoueur.id} className="bg-noir-500">
                {tatoueur.name}
              </option>
            ))}
          </select>
          <span role="status" className="text-white/35 text-[10px] shrink-0">
            {filteredSlots.length} bloqué{filteredSlots.length > 1 ? "s" : ""}
          </span>
          </div>
          <DashboardButton
            onClick={() => setIsCreateModalOpen((prev) => !prev)}
            variant="secondary"
            className="!min-h-9 !min-w-0 !rounded-lg !px-3 !py-2 !text-[11px]"
            aria-expanded={isCreateModalOpen}
          >
            {isCreateModalOpen ? <X size={13} aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
            <span>
              {isCreateModalOpen ? "Fermer" : "Bloquer un créneau"}
            </span>
          </DashboardButton>
        </div>

        {/* Formulaire de création inline */}
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

        {error && (
          <div className="flex items-center justify-between gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
            <p className="text-red-300 text-[11px] font-one">{error}</p>
            <button
              onClick={fetchBlockedSlots}
              className="cursor-pointer text-red-400 text-[10px] font-one border border-red-500/30 rounded-[10px] px-2 py-1 hover:bg-red-500/10 transition-colors shrink-0"
            >
              Réessayer
            </button>
          </div>
        )}

        {!error && (filteredSlots.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-white/10 bg-black/10 px-4 py-5"><CalendarCheck size={20} className="shrink-0 text-emerald-400/70" aria-hidden="true" /><div><p className="text-xs font-medium text-white/75">Aucun créneau bloqué</p><p className="mt-1 text-[11px] text-white/35">Aucune indisponibilité pour cette sélection.</p></div></div>
        ) : (
          <div className="space-y-3">
            {Object.entries(groupedSlots)
              .map(([date, slots]) => (
                <div key={date} className="space-y-1.5">
                  <h4 className="flex items-center gap-2 text-[10px] text-white/40"><CalendarDays size={12} aria-hidden="true" />{date}<span className="h-px flex-1 bg-white/[0.06]" /></h4>
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-start gap-2.5 bg-black/10 border border-white/[0.07] rounded-xl px-3 py-2.5 hover:bg-white/[0.025] transition-colors"
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                          slot.tatoueurId ? "bg-orange-400" : "bg-red-400"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white/80 font-one text-xs font-medium truncate">
                          {slot.tatoueur?.name || "Salon complet"}
                        </p>
                        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-white/45 font-one text-[11px] leading-5 mt-0.5">
                          <span>{formatDateTime(slot.startDate)}</span><ArrowRight size={11} className="text-white/25" aria-label="jusqu’au" /><span>{formatDateTime(slot.endDate)}</span>
                        </p>
                        {slot.reason && (
                          <p className="text-white/35 font-one text-[11px] break-words mt-1">
                            &ldquo;{slot.reason}&rdquo;
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => openDeleteModal(slot)}
                        className="cursor-pointer shrink-0 text-white/45 hover:text-white font-one text-[10px] border border-white/10 rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors"
                      >
                        Débloquer
                      </button>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        ))}

      </div>

      {/* Modale de suppression (overlay global) */}
      {isDeleteModalOpen && slotToDelete && (
        <div
          data-modal
          ref={confirmation}
          role="dialog"
          aria-modal="true"
          aria-label="Débloquer le créneau"
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-hidden"
          style={{ height: "100dvh", width: "100vw" }}
        >
          <div className="dashboard-embedded-panel rounded-2xl sm:rounded-3xl w-full max-w-lg max-h-[95vh] sm:max-h-none overflow-hidden flex flex-col border border-white/20 shadow-2xl min-h-0">
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-white font-one tracking-wide">
                    <span className="hidden sm:inline">
                      🔓 Débloquer le créneau
                    </span>
                    <span className="sm:hidden">🔓 Débloquer</span>
                  </h2>
                  <p className="text-white/70 mt-1 text-sm truncate">
                    Confirmer le déblocage de ce créneau
                  </p>
                </div>
                <button
                  aria-label="Fermer la confirmation de déblocage"
                  onClick={closeDeleteModal}
                  disabled={isDeleting}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 ml-2"
                >
                  <span className="cursor-pointer text-white text-xl">×</span>
                </button>
              </div>
            </div>

            {/* Contenu responsive */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-0">
              {/* Récapitulatif du créneau */}
              <div className="bg-white/5 rounded-2xl p-3 sm:p-4 border border-white/10 mb-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
                      slotToDelete.tatoueurId ? "bg-orange-400" : "bg-red-400"
                    }`}
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-one font-semibold mb-2 truncate">
                      {slotToDelete.tatoueur
                        ? slotToDelete.tatoueur.name
                        : "Salon complet"}
                    </h3>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2 text-white/80">
                        <span className="flex-shrink-0">📅</span>
                        <span className="font-one break-words">
                          {formatDateTime(slotToDelete.startDate)}
                        </span>
                      </div>

                      <div className="flex items-start gap-2 text-white/80">
                        <span className="flex-shrink-0">⏰</span>
                        <span className="font-one break-words">
                          Jusqu&apos;au {formatDateTime(slotToDelete.endDate)}
                        </span>
                      </div>

                      {slotToDelete.reason && (
                        <div className="flex items-start gap-2 text-white/80">
                          <span className="flex-shrink-0">💬</span>
                          <span className="font-one italic break-words">
                            "{slotToDelete.reason}"
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Message d'avertissement responsive */}
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
                      <span className="hidden sm:inline">
                        En débloquant ce créneau, il redeviendra disponible pour
                        la prise de rendez-vous.
                        {slotToDelete.tatoueurId === null &&
                          " Cela débloquera le salon complet pour cette période."}
                      </span>
                      <span className="sm:hidden">
                        Le créneau redeviendra disponible.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer responsive */}
            <div className="dashboard-embedded-footer p-3 sm:p-4 border-t border-white/10 bg-white/5 flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="cursor-pointer rounded-[14px] border border-white/20 bg-white/10 px-4 py-2 text-xs text-white transition-colors hover:bg-white/20 font-medium font-one disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteSlot}
                disabled={isDeleting}
                className="cursor-pointer rounded-[14px] px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transition-all duration-300 font-medium font-one text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
