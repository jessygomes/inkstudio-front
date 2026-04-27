"use client";
import { useEffect, useState } from "react";
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => {
      mediaQuery.removeEventListener("change", updateIsMobile);
    };
  }, []);

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

  const rdvEnabledCount = tatoueurs.filter(
    (tatoueur) => tatoueur.rdvBookingEnabled
  ).length;

  return (
    <div className="w-full flex flex-col">
      {/* Header */}
      <div className="mb-3 rounded-2xl bg-noir-700/6 p-3 sm:p-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-white/50 font-one text-[10px] uppercase tracking-wider">
              Équipe du salon
            </p>
            <div className="flex gap-2 items-end">

            <h3 className="text-white font-one text-base sm:text-lg font-semibold leading-tight">
              {tatoueurs.length} tatoueur{tatoueurs.length > 1 ? "s" : ""}
            </h3>
            <p className="text-white/55 font-two text-xs">
              {rdvEnabledCount} profil{rdvEnabledCount > 1 ? "s" : ""} avec
              prise de RDV active
            </p>
            </div>
          </div>

          <Link
            href="/mon-compte/ajouter-tatoueur"
            className="cursor-pointer w-full sm:w-[190px] flex justify-center items-center gap-2 px-3 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-[14px] transition-all duration-300 font-medium font-one text-xs"
          >
            <span>+</span>
            <span className="hidden sm:inline">Ajouter un tatoueur</span>
            <span className="sm:hidden">Ajouter</span>
          </Link>
        </div>
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
      {/* Liste des tatoueurs */}
      {tatoueurs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {tatoueurs.map((tatoueur) => {
            const visibleSkills = tatoueur.skills?.slice(
              0,
              isMobile ? 2 : tatoueur.skills.length
            );
            const visibleStyles = tatoueur.style?.slice(
              0,
              isMobile ? 2 : tatoueur.style.length
            );

            return (
              <article
                key={tatoueur.id}
                className="dashboard-list-item border border-white/10 p-3 flex flex-col gap-3"
              >
                {/* Identité */}
                <div className="flex items-start gap-2.5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-tertiary-400/25 to-tertiary-500/20 border border-tertiary-400/25 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {tatoueur.img ? (
                      <Image
                        src={tatoueur.img}
                        alt={tatoueur.name}
                        width={44}
                        height={44}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-tertiary-300 font-bold font-one text-sm">
                        {tatoueur.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-white font-one text-sm font-semibold truncate">
                        {tatoueur.name}
                      </h4>
                      {tatoueur.rdvBookingEnabled ? (
                        <span className="shrink-0 rounded-[8px] border border-green-500/30 bg-green-500/15 px-1.5 py-0.5 text-[9px] font-one text-green-300">
                          RDV actifs
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-[8px] border border-red-500/30 bg-red-500/15 px-1.5 py-0.5 text-[9px] font-one text-red-300">
                          RDV off
                        </span>
                      )}
                    </div>
                    <p className="text-white/50 font-two text-xs mt-0.5 line-clamp-2">
                      {tatoueur.description || "Aucune description"}
                    </p>
                    {tatoueur.phone && (
                      <p className="text-white/40 font-one text-[10px] mt-1">
                        {tatoueur.phone}
                      </p>
                    )}
                  </div>
                </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/8 bg-white/4 px-2.5 py-2">
                      <p className="text-white/40 font-one text-[10px] uppercase tracking-wider mb-1">
                        Compétences
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {visibleSkills && visibleSkills.length > 0 ? (
                          visibleSkills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-[10px] bg-tertiary-500/15 border border-tertiary-500/20 px-2 py-1 text-[10px] text-tertiary-500 font-one"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-white/35 text-[11px] font-one">
                            Aucune compétence
                          </span>
                        )}
                        {tatoueur.skills && tatoueur.skills.length > 2 && isMobile && (
                          <span className="text-white/35 text-[11px] font-one px-1">
                            +{tatoueur.skills.length - 2}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/8 bg-white/4 px-2.5 py-2">
                      <p className="text-white/40 font-one text-[10px] uppercase tracking-wider mb-1">
                        Styles
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {visibleStyles && visibleStyles.length > 0 ? (
                          visibleStyles.map((style) => (
                            <span
                              key={style}
                              className="rounded-[10px] bg-tertiary-500/15 border border-tertiary-500/20 px-2 py-1 text-[10px] text-tertiary-500 font-one"
                            >
                              {style}
                            </span>
                          ))
                        ) : (
                          <span className="text-white/35 text-[11px] font-one">
                            Aucun style
                          </span>
                        )}
                        {tatoueur.style && tatoueur.style.length > 2 && isMobile && (
                          <span className="text-white/35 text-[11px] font-one px-1">
                            +{tatoueur.style.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-auto">
                  <Link
                    href={`/mon-compte/ajouter-tatoueur?id=${tatoueur.id}`}
                    className="flex-1 w-fit rounded-[14px] border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] text-white transition-colors hover:bg-white/20 font-one text-center"
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => {
                      setSelectedTatoueur(tatoueur);
                      setIsDeleteModalOpen(true);
                    }}
                    className="cursor-pointer rounded-[14px] border border-red-500/35 bg-red-500/20 px-3 py-1.5 text-[11px] text-red-300 transition-colors hover:bg-red-500/30 font-one"
                  >
                    Supprimer
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/4 p-6 sm:p-8 text-center">
          <p className="text-white font-one text-base sm:text-lg font-semibold">
            Aucun tatoueur ajouté
          </p>
          <p className="text-white/60 font-two text-sm mt-1.5">
            Ajoutez votre premier profil pour commencer la gestion de l&apos;équipe.
          </p>
          <Link
            href="/mon-compte/ajouter-tatoueur"
            className="inline-flex mt-4 rounded-[14px] px-5 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white transition-all duration-300 font-medium font-one text-xs"
          >
            Ajouter le premier tatoueur
          </Link>
        </div>
      )}

      {/* Modale de suppression */}
      {isDeleteModalOpen && selectedTatoueur && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="dashboard-embedded-panel rounded-2xl w-full max-w-md max-h-[95vh] sm:max-h-none overflow-y-auto border border-white/20 shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-white/10 bg-white/5">
              <p className="text-white/50 font-one text-[10px] uppercase tracking-wider">
                Confirmation
              </p>
              <h2 className="text-white font-one text-base sm:text-lg font-semibold mt-1">
                Supprimer ce tatoueur
              </h2>
              <p className="text-white/60 font-two text-xs mt-1">
                Cette action est définitive et retirera aussi la photo distante.
              </p>
            </div>

            <div className="p-4 sm:p-5 space-y-3">
              <div className="rounded-xl border border-white/10 bg-white/4 p-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-tertiary-400/25 to-tertiary-500/20 border border-tertiary-400/25 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {selectedTatoueur.img ? (
                      <Image
                        src={selectedTatoueur.img}
                        alt={selectedTatoueur.name}
                        width={44}
                        height={44}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-tertiary-300 font-bold font-one text-sm">
                        {selectedTatoueur.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-one text-sm font-medium truncate">
                      {selectedTatoueur.name}
                    </p>
                    {selectedTatoueur.description && (
                      <p className="text-white/50 text-xs line-clamp-2 mt-0.5">
                        {selectedTatoueur.description}
                      </p>
                    )}
                    {selectedTatoueur.phone && (
                      <p className="text-white/40 text-xs mt-1">
                        {selectedTatoueur.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-white/80 text-sm">
                Confirmer la suppression de <strong>{selectedTatoueur.name}</strong>
                ?
              </p>
            </div>

            <div className="dashboard-embedded-footer p-4 sm:p-5 border-t border-white/10 flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedTatoueur(null);
                }}
                disabled={isDeleting}
                className="cursor-pointer rounded-[14px] border border-white/20 bg-white/10 px-4 py-2 text-xs text-white transition-colors hover:bg-white/20 font-medium font-one disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteTatoueur}
                disabled={isDeleting}
                className="cursor-pointer rounded-[14px] bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-4 py-2 text-white transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>Suppression...</span>
                  </>
                ) : (
                  <span>Supprimer</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
