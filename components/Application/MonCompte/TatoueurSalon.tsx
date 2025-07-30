"use client";
import Image from "next/image";
import CreateTatoueurModal from "./CreateTatoueurModal";
import { useState } from "react";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { AiOutlineDelete } from "react-icons/ai";
import { IoCreateOutline } from "react-icons/io5";

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
  salonId,
  salonHours,
}: {
  tatoueurs: TatoueurProps[];
  salonId: string;
  salonHours: string | null;
}) {
  const [showModal, setShowModal] = useState(false);

  const [selectedTatoueur, setSelectedTatoueur] =
    useState<TatoueurProps | null>(null);

  const [tatoueurToDelete, setTatoueurToDelete] =
    useState<TatoueurProps | null>(null);

  return (
    <>
      <article className="flex flex-col items-center gap-6">
        {/* Titre de la section */}
        <div className="flex items-center justify-between w-full">
          <h2 className="text-white text-2xl font-one font-bold tracking-wide">
            💼 Équipe de tatoueurs
          </h2>
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <span>{tatoueurs.length}</span>
            <span>tatoueur{tatoueurs.length > 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Grille des tatoueurs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {tatoueurs.map((tatoueur) => (
            <div
              key={tatoueur.id}
              className="group relative bg-gradient-to-br from-noir-600/90 to-secondary-700/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 border border-white/10 h-full flex flex-col"
            >
              {/* Image du tatoueur */}
              <div className="relative h-40 overflow-hidden flex-shrink-0">
                <Image
                  src={tatoueur.img || "/default-tatoueur.jpg"}
                  alt={tatoueur.name}
                  width={300}
                  height={160}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Badge de statut repositionné */}
                <div className="absolute top-2 right-2">
                  <div className="bg-green-500/30 w-10 text-center font-one backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-full shadow-lg">
                    Actif
                  </div>
                </div>
              </div>

              {/* Contenu avec flex-grow pour équilibrer */}
              <div className="p-4 flex flex-col flex-grow">
                {/* Informations principales */}
                <div className="text-center flex-grow">
                  <h3 className="text-white text-lg font-bold font-one mb-1">
                    {tatoueur.name}
                  </h3>
                  <p className="text-white/80 text-xs font-two leading-relaxed line-clamp-2 mb-3">
                    {tatoueur.description || "Tatoueur passionné"}
                  </p>
                </div>

                {/* Informations complémentaires */}
                <div className="flex flex-col gap-1 text-xs text-white/70 mb-4 min-h-[32px]">
                  {tatoueur.phone && (
                    <div className="flex items-center gap-2">
                      <span>📱</span>
                      <span className="truncate">{tatoueur.phone}</span>
                    </div>
                  )}
                  {tatoueur.instagram && (
                    <div className="flex items-center gap-2">
                      <span>📸</span>
                      <span className="truncate">@{tatoueur.instagram}</span>
                    </div>
                  )}
                </div>

                {/* Boutons d'action - toujours en bas */}
                <div className="flex justify-end gap-2 mt-auto w-full">
                  <button
                    onClick={() => {
                      setSelectedTatoueur(tatoueur);
                      setShowModal(true);
                    }}
                    className="text-xs cursor-pointer"
                  >
                    <IoCreateOutline
                      size={20}
                      className="text-white text-center hover:text-tertiary-500 transition-colors duration-200"
                    />
                  </button>
                  <button
                    onClick={() => setTatoueurToDelete(tatoueur)}
                    className="text-xs cursor-pointer"
                  >
                    <AiOutlineDelete
                      size={20}
                      className="text-white text-center hover:text-red-800 transition-colors duration-200"
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bouton d'ajout modernisé */}
        <div className="w-full flex justify-center mt-8">
          <button
            onClick={() => setShowModal(true)}
            className="text-xs cursor-pointer bg-gradient-to-l from-tertiary-400 to-tertiary-500 min-w-[200px] max-w-[200px] text-center text-white font-one py-2 px-4 rounded-[20px] hover:scale-105 transition-all ease-in-out duration-300"
          >
            <span className="flex items-center justify-center gap-3">
              <span>Nouveau tatoueur</span>
              <span className="transform group-hover:translate-x-1 transition-transform duration-200">
                →
              </span>
            </span>
          </button>
        </div>
      </article>

      {showModal && (
        <CreateTatoueurModal
          salonId={salonId} // à récupérer dynamiquement ou passer en prop
          onClose={() => {
            setShowModal(false);
            setSelectedTatoueur(null);
          }}
          onCreated={() => window.location.reload()} // ou refetch via React Query
          salonHours={salonHours} // à récupérer dynamiquement ou passer en prop
          existingTatoueur={selectedTatoueur}
        />
      )}

      {tatoueurToDelete && (
        <DeleteConfirmationModal
          tatoueurName={tatoueurToDelete.name}
          onCancel={() => setTatoueurToDelete(null)}
          onConfirm={async () => {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs/delete/${tatoueurToDelete.id}`,
              {
                method: "DELETE",
              }
            );

            if (res.ok) {
              window.location.reload(); // ou refetch les données avec React Query
            } else {
              console.error("Erreur lors de la suppression");
            }

            setTatoueurToDelete(null);
          }}
        />
      )}
    </>
  );
}
