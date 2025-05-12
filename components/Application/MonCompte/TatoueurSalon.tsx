"use client";
import Image from "next/image";
import CreateTatoueurModal from "./CreateTatoueurModal";
import { useState } from "react";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

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
      <article className="flex flex-col items-center gap-4">
        <div className="grid grid-cols-3 gap-4">
          {tatoueurs.map((tatoueur) => (
            <div
              key={tatoueur.id}
              className="min-h-[400px] max-h-[400px] flex flex-col items-center bg-secondary-600 rounded-[20px]"
            >
              <Image
                src={tatoueur.img || "/default-tatoueur.jpg"}
                alt={tatoueur.name}
                width={100}
                height={100}
                className="object-cover min-h-[250px] w-full bg-primary-500 mb-2 rounded-t-[20px]"
              />
              <div className="flex flex-col gap-2 items-center pb-4">
                <h3 className="text-white font-bold">{tatoueur.name}</h3>
                <p className="px-2 text-white text-sm font-two">
                  {tatoueur.description}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedTatoueur(tatoueur);
                      setShowModal(true);
                    }}
                    className="text-xs cursor-pointer bg-gradient-to-l from-tertiary-400 to-tertiary-500 min-w-[100px] max-w-[100px] text-center text-white font-one py-1 px-4 rounded-[20px] hover:scale-105 transition-all ease-in-out duration-300"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => setTatoueurToDelete(tatoueur)}
                    className="text-xs cursor-pointer bg-gradient-to-l from-red-700 to-red-900 min-w-[100px] max-w-[100px] text-center text-white font-one py-1 px-4 rounded-[20px] hover:scale-105 transition-all ease-in-out duration-300"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="text-xs cursor-pointer bg-gradient-to-l from-tertiary-400 to-tertiary-500 min-w-[200px] max-w-[400px] text-center text-white font-one py-2 px-4 rounded-[20px] hover:scale-105 transition-all ease-in-out duration-300"
        >
          Ajouter un tatoueur
        </button>
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
