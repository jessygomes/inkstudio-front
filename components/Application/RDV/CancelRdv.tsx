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
        className="cursor-pointer bg-red-900 text-white font-one text-[10px] px-4 py-1 rounded-[20px] hover:bg-red-800 transition"
        onClick={() => setShowModal(true)}
      >
        Annuler
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-noir-500 rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <h2 className="text-lg font-semibold font-one text-white tracking-widest mb-4 border-b border-white/10 pb-2">
              Annuler ce rendez-vous ?
            </h2>
            <p className="text-sm text-white font-one mb-4">
              Cette action confirmera définitivement le rendez-vous.
            </p>

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            {/* {success && (
              <p className="text-green-600 text-sm mb-2">{success}</p>
            )} */}

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs"
              >
                Revenir en arrière
              </button>
              <button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                className="cursor-pointer px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs"
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
