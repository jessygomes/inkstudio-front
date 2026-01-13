"use client";
import React, { useState } from "react";
import { deleteConversationAction } from "@/lib/queries/conversation.action";
import { toast } from "sonner";
import { MdDelete } from "react-icons/md";

interface DeleteConversationBtnProps {
  conversationId: string;
  onDeleteSuccess?: () => void;
}

export default function DeleteConversationBtn({
  conversationId,
  onDeleteSuccess,
}: DeleteConversationBtnProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await deleteConversationAction(conversationId);
      toast.success("Conversation supprimée avec succès");
      setIsOpen(false);
      onDeleteSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression";
      toast.error(message);
      console.error("Erreur lors de la suppression:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="cursor-pointer p-2 rounded-lg bg-noir-700/40 border border-white/10 hover:bg-noir-700/60 hover:border-white/20 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
        title="Supprimer la conversation"
      >
        <MdDelete className="text-red-200 group-hover:text-red-100 transition-colors" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-noir-800 border border-red-500/30 rounded-xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-white/10 px-6 py-4">
              <h2 className="text-white text-lg font-one">
                Supprimer la conversation
              </h2>
            </div>

            <div className="px-6 py-4 space-y-2">
              <p className="text-white/80 text-sm font-one">
                Cette action est définitive. Vous ne pourrez plus récupérer les
                messages ni les pièces jointes associées.
              </p>
              <p className="text-red-200 text-xs font-one">
                Confirmez la suppression si vous êtes certain de vouloir
                supprimer cette conversation.
              </p>
            </div>

            <div className="border-t border-white/10 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="cursor-pointer px-4 py-2 rounded-lg bg-noir-700 border border-white/10 text-white/70 hover:text-white hover:bg-noir-700/80 transition-all duration-200 text-sm font-one disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="cursor-pointer px-4 py-2 rounded-lg bg-red-600/20 border border-red-400/60 text-red-200 hover:bg-red-600/30 hover:border-red-300 transition-all duration-200 text-sm font-one disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <MdDelete />
                    Supprimer
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
