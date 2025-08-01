"use client";
import { useState } from "react";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import Link from "next/link";
import Image from "next/image";

export type TatoueurProps = {
  id: string;
  name: string;
  img?: string;
  description: string | null;
  phone?: string;
  instagram?: string;
  hours?: string | null;
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

  return (
    <div className="space-y-6">
      {/* Header avec bouton d'ajout */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <span className="text-sm">👥</span>
          </div> */}
          <div>
            <p className="text-white font-semibold font-one text-sm tracking-widest">
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
          className="px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium font-one text-xs"
        >
          Ajouter
        </Link>
      </div>

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

      {/* Modale de suppression seulement */}
      {isDeleteModalOpen && selectedTatoueur && (
        <DeleteConfirmationModal
          tatoueurName={selectedTatoueur.name}
          onCancel={() => setIsDeleteModalOpen(false)}
          onConfirm={async () => {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs/delete/${selectedTatoueur.id}`,
              {
                method: "DELETE",
              }
            );

            if (res.ok) {
              window.location.reload();
            } else {
              console.error("Erreur lors de la suppression");
            }

            setIsDeleteModalOpen(false);
            setSelectedTatoueur(null);
          }}
        />
      )}
    </div>
  );
}
