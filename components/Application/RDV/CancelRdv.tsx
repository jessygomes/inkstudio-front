"use client";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function CancelRdv({ rdvId }: { rdvId: string }) {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/cancel/${rdvId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.message || "Erreur inconnue");
      return data;
    },
    onSuccess: () => {
      // Invalider la liste des rendez-vous pour forcer le refetch
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setShowModal(false);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      setError(error.message);
    },
  });

  return (
    <>
      <button
        className="cursor-pointer bg-red-900 text-white text-[10px] px-4 py-1 rounded-[20px] hover:bg-red-800 transition"
        onClick={() => setShowModal(true)}
      >
        Annuler RDV
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-secondary-500 rounded-[20px] p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-white mb-4">
              Annuler ce rendez-vous ?
            </h2>
            <p className="text-sm text-white mb-6">
              Cette action confirmera définitivement le rendez-vous.
            </p>

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            {/* {success && (
              <p className="text-green-600 text-sm mb-2">{success}</p>
            )} */}

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="cursor-pointer px-4 py-2 text-xs bg-red-900 rounded-[20px] hover:bg-red-700 transition"
              >
                Revenir en arrière
              </button>
              <button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                className="cursor-pointer px-4 py-2 text-sm bg-green-700 text-white rounded-[20px] hover:bg-green-800 transition"
              >
                {mutation.isPending ? "Annulation..." : "Oui, annuler"}
              </button>
            </div>

            {mutation.isError && (
              <p className="text-red-500 text-sm mt-4">
                {(mutation.error as Error).message}
              </p>
            )}
            {mutation.isSuccess && (
              <p className="text-green-400 text-sm mt-4">
                Rendez-vous annulé !
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
