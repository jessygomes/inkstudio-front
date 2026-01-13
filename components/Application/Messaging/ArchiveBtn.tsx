"use client";
import React, { useState } from "react";
import { archiveConversationAction } from "@/lib/queries/conversation.action";
import { toast } from "sonner";
import { MdArchive } from "react-icons/md";

interface ArchiveBtnProps {
  conversationId: string;
  status: "ACTIVE" | "ARCHIVED" | "CLOSED";
  onArchiveSuccess?: () => void;
  onStatusChange?: (nextStatus: "ACTIVE" | "ARCHIVED") => void;
}

export default function ArchiveBtn({
  conversationId,
  status,
  onArchiveSuccess,
  onStatusChange,
}: ArchiveBtnProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isArchived = status === "ARCHIVED";
  const isClosed = status === "CLOSED";

  const handleToggleArchive = async () => {
    try {
      setIsLoading(true);
      await archiveConversationAction(conversationId);
      toast.success(
        isArchived
          ? "Conversation réactivée avec succès"
          : "Conversation archivée avec succès"
      );
      const nextStatus = isArchived ? "ACTIVE" : "ARCHIVED";
      onStatusChange?.(nextStatus);
      setIsOpen(false);
      onArchiveSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur lors de l'opération";
      toast.error(errorMessage);
      console.error("Erreur lors de l'opération:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Bouton Archive/Désarchive - Désactivé si conversation fermée */}
      <button
        onClick={() => setIsOpen(true)}
        disabled={isClosed}
        className="cursor-pointer p-2 rounded-lg bg-noir-700/40 border border-white/10 hover:bg-noir-700/60 hover:border-white/20 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
        title={
          isClosed
            ? "Impossible d'archiver une conversation fermée"
            : isArchived
            ? "Réactiver la conversation"
            : "Archiver la conversation"
        }
      >
        <MdArchive
          className={`transition-colors ${
            isArchived
              ? "text-white/40 group-hover:text-white/60"
              : "text-white/60 group-hover:text-white/80"
          }`}
        />
      </button>

      {/* Modal de Confirmation */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-noir-700 border border-white/10 rounded-xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="border-b border-white/10 px-6 py-4">
              <h2 className="text-white text-lg font-one">
                {isArchived
                  ? "Réactiver la conversation"
                  : "Archiver la conversation"}
              </h2>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <p className="text-white/70 text-sm font-one">
                {isArchived
                  ? "Êtes-vous sûr de vouloir réactiver cette conversation ? Elle réapparaîtra dans votre liste active."
                  : "Êtes-vous sûr de vouloir archiver cette conversation ? Vous pourrez la retrouver dans votre dossier des conversations archivées."}
              </p>
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="cursor-pointer px-4 py-2 rounded-lg bg-noir-700 border border-white/10 text-white/70 hover:text-white hover:bg-noir-700/80 transition-all duration-200 text-sm font-one disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={handleToggleArchive}
                disabled={isLoading}
                className="cursor-pointer px-4 py-2 rounded-lg bg-tertiary-400/20 border border-tertiary-400/50 text-tertiary-400 hover:bg-tertiary-400/30 hover:border-tertiary-400/70 transition-all duration-200 text-sm font-one disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                    {isArchived ? "Réactivation..." : "Archivage..."}
                  </>
                ) : (
                  <>
                    <MdArchive />
                    {isArchived ? "Réactiver" : "Archiver"}
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
