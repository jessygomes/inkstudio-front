"use client";
import { useState } from "react";
// import DeleteConfirmationModal from "./DeleteConfirmationModal";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { extractUploadThingKey } from "@/lib/utils/uploadImg/extractUploadThingKey";
import { deleteTatoueurAction } from "@/lib/queries/tatoueur";
import { TatoueurProps } from "@/lib/type"; // Utiliser le type centralisé

export default function TatoueurSalon({
  tatoueurs,
}: {
  tatoueurs: TatoueurProps[];
  salonId: string;
  salonHours: string | null;
}) {
  const [selectedTatoueur, setSelectedTatoueur] =
    useState<TatoueurProps | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteTatoueur = async () => {
    if (!selectedTatoueur) return;

    setIsDeleting(true);

    try {
      const response = await deleteTatoueurAction(selectedTatoueur.id);

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du tatoueur");
      }

      // 2. Supprimer de UploadThing si l'image provient d'UploadThing
      if (selectedTatoueur.img && selectedTatoueur.img.includes("utfs.io")) {
        const fileKey = extractUploadThingKey(selectedTatoueur.img);
        if (fileKey) {
          const uploadThingDeleted = await deleteFromUploadThing(fileKey);
          if (!uploadThingDeleted) {
            console.warn(
              "Le tatoueur a été supprimé de la base de données mais pas d'UploadThing"
            );
            toast.warning(
              "Tatoueur supprimé mais fichier distant non supprimé"
            );
          }
        }
      }

      toast.success("Tatoueur supprimé avec succès");
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression du tatoueur");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setSelectedTatoueur(null);
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* Header responsive avec bouton d'ajout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10 gap-3">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-white font-semibold font-one text-base sm:text-lg tracking-widest">
              <span className="hidden sm:inline">
                Équipe ({tatoueurs.length} tatoueur
                {tatoueurs.length > 1 ? "s" : ""})
              </span>
              <span className="sm:hidden">Équipe ({tatoueurs.length})</span>
            </p>
            <p className="text-xs text-white/60 font-two">
              <span className="hidden sm:inline">
                Gérez votre équipe de tatoueurs
              </span>
              <span className="sm:hidden">Gérez votre équipe</span>
            </p>
          </div>
        </div>
        <Link
          href="/mon-compte/ajouter-tatoueur"
          className="cursor-pointer w-full sm:w-[175px] flex justify-center items-center gap-2 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs shadow-lg"
        >
          <span>+</span>
          <span className="hidden sm:inline">Nouveau tatoueur</span>
          <span className="sm:hidden">Ajouter</span>
        </Link>
      </div>

      {/* Loader responsive */}
      {tatoueurs === undefined && (
        <div className="w-full flex items-center justify-center py-16 sm:py-20">
          <div className="w-full rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center gap-6 mx-auto">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-tertiary-400 mx-auto mb-4"></div>
            <p className="text-white/60 font-two text-xs text-center">
              Chargement des tatoueurs...
            </p>
          </div>
        </div>
      )}
      {/* Erreur */}
      {/* Ajoute ici une gestion d'erreur si tu as un state d'erreur */}
      {/* {error && (
        <div className="w-full flex items-center justify-center py-20">
          <div className="w-full rounded-2xl p-10 flex flex-col items-center justify-center gap-6 mx-auto">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">⚠️</span>
            </div>
            <p className="text-white text-xl font-one">Erreur de chargement</p>
            <p className="text-white/60 text-sm max-w-md text-center">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-tertiary-400 hover:bg-tertiary-500 text-white rounded-lg transition-colors text-sm"
            >
              Réessayer
            </button>
          </div>
        </div>
      )} */}
      {/* Liste des tatoueurs responsive */}
      {tatoueurs.length > 0 ? (
        <div className="space-y-3">
          {tatoueurs.map((tatoueur) => (
            <div
              key={tatoueur.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex items-start gap-3 sm:gap-4 w-full sm:w-auto">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-tertiary-400/20 to-tertiary-500/20 rounded-full flex items-center justify-center border border-tertiary-400/30 overflow-hidden flex-shrink-0">
                    {tatoueur.img ? (
                      <Image
                        src={tatoueur.img}
                        alt={tatoueur.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-tertiary-300 font-bold font-one text-xs sm:text-sm">
                        {tatoueur.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-semibold font-one text-sm break-words">
                      {tatoueur.name}
                    </h4>
                    <p className="text-white/60 font-two text-xs mt-1 break-words">
                      {tatoueur.description
                        ? tatoueur.description.length > 80
                          ? `${tatoueur.description.substring(0, 80)}...`
                          : tatoueur.description
                        : "Aucune description"}
                    </p>
                    {tatoueur.phone && (
                      <p className="text-white/50 font-two text-xs mt-1">
                        📞 {tatoueur.phone}
                      </p>
                    )}

                    {/* Compétences responsive */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 flex-wrap mt-2">
                      <p className="text-xs font-one text-white/50">
                        Compétences :
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {tatoueur.skills && tatoueur.skills.length > 0 ? (
                          tatoueur.skills
                            .slice(
                              0,
                              window.innerWidth < 640
                                ? 2
                                : tatoueur.skills.length
                            )
                            .map((skill) => (
                              <span
                                key={skill}
                                className="bg-gradient-to-br from-tertiary-400/20 to-tertiary-500/20 text-tertiary-400 px-2 py-1 rounded-lg text-xs font-one"
                              >
                                {skill}
                              </span>
                            ))
                        ) : (
                          <span className="text-white/50 text-xs">
                            Aucune compétence
                          </span>
                        )}
                        {tatoueur.skills &&
                          tatoueur.skills.length > 2 &&
                          window.innerWidth < 640 && (
                            <span className="text-white/50 text-xs">
                              +{tatoueur.skills.length - 2}
                            </span>
                          )}
                      </div>
                    </div>

                    {/* Style responsive */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 flex-wrap mt-1">
                      <p className="text-xs font-one text-white/50">Style :</p>
                      <div className="flex flex-wrap gap-1">
                        {tatoueur.style && tatoueur.style.length > 0 ? (
                          tatoueur.style
                            .slice(
                              0,
                              window.innerWidth < 640
                                ? 2
                                : tatoueur.style.length
                            )
                            .map((style) => (
                              <span
                                key={style}
                                className="bg-gradient-to-br from-tertiary-400/20 to-tertiary-500/20 text-tertiary-400 px-2 py-1 rounded-lg text-xs font-one"
                              >
                                {style}
                              </span>
                            ))
                        ) : (
                          <span className="text-white/50 text-xs">
                            Aucun style
                          </span>
                        )}
                        {tatoueur.style &&
                          tatoueur.style.length > 2 &&
                          window.innerWidth < 640 && (
                            <span className="text-white/50 text-xs">
                              +{tatoueur.style.length - 2}
                            </span>
                          )}
                      </div>
                    </div>

                    {/* Badge RDV */}
                    <div className="mt-2">
                      {tatoueur.rdvBookingEnabled ? (
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 px-2 py-1 rounded-lg text-xs font-one border border-green-500/30">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          RDV autorisés
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 px-2 py-1 rounded-lg text-xs font-one border border-red-500/30">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          RDV désactivés
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions responsive */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <Link
                    href={`/mon-compte/ajouter-tatoueur?id=${tatoueur.id}`}
                    className="px-3 py-2 sm:py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs border border-white/20 transition-colors font-one text-center"
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => {
                      setSelectedTatoueur(tatoueur);
                      setIsDeleteModalOpen(true);
                    }}
                    className="cursor-pointer px-3 py-2 sm:py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs border border-red-500/30 transition-colors font-one"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-white/10 text-center">
          <div className="space-y-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl sm:text-3xl">👤</span>
            </div>
            <div>
              <h3 className="text-white font-semibold font-one text-base sm:text-lg mb-2">
                Aucun tatoueur ajouté
              </h3>
              <p className="text-white/60 font-two text-sm">
                Commencez par ajouter un tatoueur à votre équipe
              </p>
            </div>
            <Link
              href="/mon-compte/ajouter-tatoueur"
              className="inline-block px-4 sm:px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs"
            >
              <span className="hidden sm:inline">
                Ajouter le premier tatoueur
              </span>
              <span className="sm:hidden">Ajouter tatoueur</span>
            </Link>
          </div>
        </div>
      )}

      {/* Modale de suppression responsive */}
      {isDeleteModalOpen && selectedTatoueur && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-noir-500 rounded-xl sm:rounded-2xl w-full max-w-md max-h-[95vh] sm:max-h-none overflow-y-auto border border-white/20 shadow-2xl">
            {/* Header responsive */}
            <div className="p-4 sm:p-6 border-b border-white/10">
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
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-white font-one">
                    Supprimer le tatoueur
                  </h2>
                  <p className="text-white/70 text-sm">
                    Cette action est irréversible
                  </p>
                </div>
              </div>
            </div>

            {/* Contenu responsive */}
            <div className="p-4 sm:p-6">
              <div className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-tertiary-400/20 to-tertiary-500/20 rounded-full flex items-center justify-center border border-tertiary-400/30 overflow-hidden flex-shrink-0">
                    {selectedTatoueur.img ? (
                      <Image
                        src={selectedTatoueur.img}
                        alt={selectedTatoueur.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-tertiary-300 font-bold font-one text-sm">
                        {selectedTatoueur.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm mb-1 break-words">
                      {selectedTatoueur.name}
                    </p>
                    {selectedTatoueur.description && (
                      <p className="text-white/70 text-xs break-words">
                        {selectedTatoueur.description.length > 50
                          ? `${selectedTatoueur.description.substring(
                              0,
                              50
                            )}...`
                          : selectedTatoueur.description}
                      </p>
                    )}
                    {selectedTatoueur.phone && (
                      <p className="text-white/50 text-xs mt-1">
                        📞 {selectedTatoueur.phone}
                      </p>
                    )}
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
                      <span className="hidden sm:inline">
                        Cette action supprimera définitivement ce tatoueur et sa
                        photo de profil. Tous les rendez-vous associés seront
                        également affectés.
                      </span>
                      <span className="sm:hidden">
                        Le tatoueur sera définitivement supprimé.
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-white/80 text-sm mb-4">
                Êtes-vous sûr de vouloir supprimer{" "}
                <strong>{selectedTatoueur.name}</strong> ?
              </p>
            </div>

            {/* Footer responsive */}
            <div className="p-4 sm:p-6 border-t border-white/10 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedTatoueur(null);
                }}
                disabled={isDeleting}
                className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteTatoueur}
                disabled={isDeleting}
                className="cursor-pointer px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs flex items-center justify-center gap-2"
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
  );
}
