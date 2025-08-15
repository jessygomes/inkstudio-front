"use client";
import { useState } from "react";
// import DeleteConfirmationModal from "./DeleteConfirmationModal";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

export type TatoueurProps = {
  id: string;
  name: string;
  img?: string;
  description: string | null;
  phone?: string;
  instagram?: string;
  hours?: string | null;
  style: string[];
  skills: string[];
};

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

  const handleDeleteTatoueur = async () => {
    if (!selectedTatoueur) return;

    setIsDeleting(true);

    try {
      // 1. Supprimer de la base de données
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs/delete/${selectedTatoueur.id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
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

  console.log(tatoueurs);

  return (
    <div className="w-full flex flex-col">
      {/* Header avec bouton d'ajout */}
      <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-white font-semibold font-one text-lg tracking-widest">
              Équipe ({tatoueurs.length} tatoueur
              {tatoueurs.length > 1 ? "s" : ""})
            </p>
            <p className="text-xs text-white/60 font-two">
              Gérez votre équipe de tatoueurs
            </p>
          </div>
        </div>
        <Link
          href="/mon-compte/ajouter-tatoueur"
          className="cursor-pointer w-[175px] flex justify-center items-center gap-2 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs shadow-lg"
        >
          <span>+</span>
          Nouveau tatoueur
        </Link>
      </div>
      {/* Loader */}
      {tatoueurs === undefined && (
        <div className="w-full flex items-center justify-center py-20">
          <div className="w-full rounded-2xl p-10 flex flex-col items-center justify-center gap-6 mx-auto">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tertiary-400 mx-auto mb-4"></div>
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
        <div className="space-y-3">
          {tatoueurs.map((tatoueur) => (
            <div
              key={tatoueur.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-tertiary-400/20 to-tertiary-500/20 rounded-full flex items-center justify-center border border-tertiary-400/30 overflow-hidden">
                    {tatoueur.img ? (
                      <Image
                        src={tatoueur.img}
                        alt={tatoueur.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-tertiary-300 font-bold font-one text-sm">
                        {tatoueur.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold font-one text-sm">
                      {tatoueur.name}
                    </h4>
                    <p className="text-white/60 font-two text-xs">
                      {tatoueur.description
                        ? tatoueur.description.length > 100
                          ? `${tatoueur.description.substring(0, 100)}...`
                          : tatoueur.description
                        : "Aucune description"}
                    </p>
                    {tatoueur.phone && (
                      <p className="text-white/50 font-two text-xs mt-1">
                        📞 {tatoueur.phone}
                      </p>
                    )}
                    <div className="flex items-center gap-1 flex-wrap mt-1">
                      <p className="text-xs font-one text-white/50">
                        Compétences :
                      </p>
                      {tatoueur.skills && tatoueur.skills.length > 0 ? (
                        tatoueur.skills.map((skill) => (
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
                    </div>

                    <div className="flex items-center gap-1 flex-wrap mt-1">
                      <p className="text-xs font-one text-white/50">Style :</p>
                      {tatoueur.style && tatoueur.style.length > 0 ? (
                        tatoueur.style.map((style) => (
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
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/mon-compte/ajouter-tatoueur?id=${tatoueur.id}`}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs border border-white/20 transition-colors font-one"
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => {
                      setSelectedTatoueur(tatoueur);
                      setIsDeleteModalOpen(true);
                    }}
                    className="cursor-pointer px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs border border-red-500/30 transition-colors font-one"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">👤</span>
            </div>
            <div>
              <h3 className="text-white font-semibold font-one text-lg mb-2">
                Aucun tatoueur ajouté
              </h3>
              <p className="text-white/60 font-two text-sm">
                Commencez par ajouter un tatoueur à votre équipe
              </p>
            </div>
            <Link
              href="/mon-compte/ajouter-tatoueur"
              className="inline-block px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs"
            >
              Ajouter le premier tatoueur
            </Link>
          </div>
        </div>
      )}

      {/* Modale de suppression modifiée */}
      {isDeleteModalOpen && selectedTatoueur && (
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
                  Supprimer le tatoueur
                </h2>
              </div>
              <p className="text-white/70 text-sm">
                Cette action est irréversible
              </p>
            </div>

            {/* Contenu */}
            <div className="p-6">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-tertiary-400/20 to-tertiary-500/20 rounded-full flex items-center justify-center border border-tertiary-400/30 overflow-hidden">
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

                  <div>
                    <p className="text-white font-medium text-sm mb-1">
                      {selectedTatoueur.name}
                    </p>
                    {selectedTatoueur.description && (
                      <p className="text-white/70 text-xs">
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
                      Cette action supprimera définitivement ce tatoueur et sa
                      photo de profil. Tous les rendez-vous associés seront
                      également affectés.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-white/80 text-sm mb-4">
                Êtes-vous sûr de vouloir supprimer{" "}
                <strong>{selectedTatoueur.name}</strong> ?
              </p>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
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
                className="cursor-pointer px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs flex items-center gap-2"
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
