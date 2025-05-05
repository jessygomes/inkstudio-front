"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { createTatoueurSchema } from "@/lib/zod/validator.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

type Horaire = {
  [key: string]: { start: string; end: string } | null;
};

const daysOfWeek = [
  { key: "monday", label: "Lundi" },
  { key: "tuesday", label: "Mardi" },
  { key: "wednesday", label: "Mercredi" },
  { key: "thursday", label: "Jeudi" },
  { key: "friday", label: "Vendredi" },
  { key: "saturday", label: "Samedi" },
  { key: "sunday", label: "Dimanche" },
];

export default function CreateTatoueurModal({
  salonId,
  onClose,
  onCreated,
  salonHours,
}: {
  salonId: string;
  onClose: () => void;
  onCreated: () => void;
  salonHours: string | null;
}) {
  const [loading, setLoading] = useState(false);

  //! Mettre en valeur  par défaut les horaires d'ouverture du salon
  const initialHours: Horaire = (salonHours &&
    JSON.parse(salonHours || "")) || {
    monday: { start: "", end: "" },
    tuesday: { start: "", end: "" },
    wednesday: { start: "", end: "" },
    thursday: { start: "", end: "" },
    friday: { start: "", end: "" },
    saturday: { start: "", end: "" },
    sunday: null,
  };

  const [editingHours, setEditingHours] = useState<Horaire>(initialHours);

  //! FORMULAIRE
  const form = useForm<z.infer<typeof createTatoueurSchema>>({
    resolver: zodResolver(createTatoueurSchema),
    defaultValues: {
      name: "",
      img: "",
      description: "",
      phone: "",
      instagram: "",
      hours: "",
      userId: salonId,
    },
  });

  const onSubmit = async (values: z.infer<typeof createTatoueurSchema>) => {
    console.log("values", values);
    const payload = {
      ...values,
      hours: JSON.stringify(editingHours), // très important !
    };
    console.log("payload", payload);
    setLoading(true);
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      onCreated();
      onClose();
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log("❌ Erreurs de validation Zod", errors);
        })}
        className="bg-primary-500 p-6 rounded-[20px] w-full max-w-[800px] h-[90%] space-y-4 text-white font-one text-sm overflow-auto"
      >
        <h2 className="text-xl font-bold text-center uppercase tracking-widest">
          Ajouter un tatoueur
        </h2>

        <div className="flex flex-col gap-2">
          <label htmlFor="name">Nom</label>
          <input
            placeholder="Nom"
            {...form.register("name")}
            className="w-full p-2 rounded-[12px] bg-white/20"
          />
        </div>
        {/* <label htmlFor="clientName">Image</label> */}
        {/* <input
          placeholder="URL de l'image"
          {...form.register("img")}
          className="w-full p-2 rounded-[12px] bg-white/20"
        /> */}

        <div className="flex flex-col gap-2">
          <label htmlFor="name">Description</label>
          <textarea
            rows={6}
            placeholder="Description"
            {...form.register("description")}
            className="w-full p-2 rounded-[12px] bg-white/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name">Téléphone</label>
            <input
              placeholder="Téléphone"
              {...form.register("phone")}
              className="w-full p-2 rounded-[12px] bg-white/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="name">Instagram</label>
            <input
              placeholder="Instagram"
              {...form.register("instagram")}
              className="w-full p-2 rounded-[12px] bg-white/20"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <label className="">Horaires (horaire du salon par défaut)</label>
          {daysOfWeek.map(({ key, label }) => {
            const value = editingHours[key];
            return (
              <div
                key={key}
                className="flex justify-between items-center gap-4"
              >
                <span className="w-1/4">{label}</span>
                {value ? (
                  <>
                    <input
                      type="time"
                      value={value.start}
                      onChange={(e) =>
                        setEditingHours((prev) => ({
                          ...prev,
                          [key]: {
                            ...(prev[key] || { start: "", end: "" }),
                            start: e.target.value,
                          },
                        }))
                      }
                    />
                    <input
                      type="time"
                      value={value.end}
                      onChange={(e) =>
                        setEditingHours((prev) => ({
                          ...prev,
                          [key]: {
                            ...(prev[key] || { start: "", end: "" }),
                            end: e.target.value,
                          },
                        }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditingHours((prev) => ({
                          ...prev,
                          [key]: null,
                        }))
                      }
                      className="bg-red-800 px-2 py-1 rounded-[12px] text-white text-xs"
                    >
                      Fermer
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setEditingHours((prev) => ({
                        ...prev,
                        [key]: { start: "", end: "" },
                      }))
                    }
                    className="bg-green-800 px-2 py-1 rounded-[12px] text-white text-xs"
                  >
                    Ouvrir
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-xs p-2 rounded-[20px] bg-red-900 text-white"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="text-xs cursor-pointer bg-gradient-to-l from-tertiary-400 to-tertiary-500 min-w-[200px] max-w-[400px] text-center text-white py-2 px-4 rounded-[20px] hover:scale-105 transition"
          >
            {loading ? "Création..." : "Créer"}
          </button>
        </div>
      </form>
    </div>
  );
}
