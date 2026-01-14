"use client";

import React, { useState } from "react";
import { MdDelete } from "react-icons/md";
import { deleteMessageAction } from "@/lib/queries/conversation.action";
import { extractUploadThingKey } from "@/lib/utils/uploadImg/extractUploadThingKey";
import { toast } from "sonner";

interface AttachmentDto {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

interface DeleteMessageButtonProps {
  messageId: string;
  conversationId: string;
  attachments?: AttachmentDto[];
  onDelete?: (messageId: string) => void;
}

export default function DeleteMessageButton({
  messageId,
  conversationId,
  attachments,
  onDelete,
}: DeleteMessageButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // 1. Supprimer le message de la base de données
      await deleteMessageAction(conversationId, messageId);

      // 2. Supprimer les fichiers UploadThing si présents
      if (attachments && attachments.length > 0) {
        for (const attachment of attachments) {
          if (attachment.fileUrl && attachment.fileUrl.includes("utfs.io")) {
            const fileKey = extractUploadThingKey(attachment.fileUrl);
            if (fileKey) {
              const uploadThingDeleted = await deleteFromUploadThing(fileKey);
              if (!uploadThingDeleted) {
                console.warn(
                  `Fichier ${attachment.fileName} non supprimé d'UploadThing`
                );
              }
            }
          }
        }
      }

      toast.success("Message supprimé avec succès");
      setIsModalOpen(false);

      if (onDelete) {
        onDelete(messageId);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression du message");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={isDeleting}
        className="cursor-pointer flex items-center gap-2 w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
      >
        <MdDelete className="w-4 h-4" />
        <span>Supprimer</span>
      </button>

      {/* Modal de Confirmation */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-noir-700 border border-white/10 rounded-xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="border-b border-white/10 px-6 py-4">
              <h2 className="text-white text-lg font-one">
                Supprimer le message
              </h2>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <p className="text-white/70 text-sm font-one">
                Êtes-vous sûr de vouloir supprimer ce message ? Cette action est
                irréversible.
              </p>
              {attachments && attachments.length > 0 && (
                <p className="text-red-400/80 text-xs font-one mt-2">
                  Les fichiers attachés seront également supprimés.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isDeleting}
                className="cursor-pointer px-4 py-2 rounded-lg bg-noir-700 border border-white/10 text-white/70 hover:text-white hover:bg-noir-700/80 transition-all duration-200 text-sm font-one disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="cursor-pointer px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 hover:border-red-500/70 transition-all duration-200 text-sm font-one disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
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
