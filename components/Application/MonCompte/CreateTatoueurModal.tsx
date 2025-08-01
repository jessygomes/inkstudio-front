// Ce fichier peut être supprimé car il n'est plus utilisé
// La fonctionnalité a été déplacée vers la page AddOrUpdateTatoueurPage
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createTatoueurSchema } from "@/lib/zod/validator.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { TatoueurProps } from "./TatoueurSalon";

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
  existingTatoueur,
}: {
  salonId: string;
  onClose: () => void;
  onCreated: () => void;
  salonHours: string | null;
  existingTatoueur?: TatoueurProps | null;
}) {
  const [loading, setLoading] = useState(false);

  //! Mettre en valeur  par défaut les horaires d'ouverture du salon
  const initialHours: Horaire = (existingTatoueur?.hours &&
    JSON.parse(existingTatoueur.hours)) ||
    (salonHours && JSON.parse(salonHours)) || {
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
      name: existingTatoueur?.name || "",
      img: existingTatoueur?.img || "",
      description: existingTatoueur?.description || "",
      instagram: existingTatoueur?.instagram || "",
      hours: existingTatoueur?.hours || "",
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

    const url = existingTatoueur
      ? `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs/update/${existingTatoueur.id}`
      : `${process.env.NEXT_PUBLIC_BACK_URL}/tatoueurs`;

    const res = await fetch(url, {
      method: existingTatoueur ? "PATCH" : "POST",
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
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-noir-500 rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col border border-white/20 shadow-2xl">
        {/* Header fixe */}
        <div className="p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white font-one tracking-wide">
              {existingTatoueur
                ? "Modifier le tatoueur"
                : "Ajouter un tatoueur"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <span className="cursor-pointer text-white text-xl">×</span>
            </button>
          </div>
          <p className="text-white/70 mt-2 text-sm">
            {existingTatoueur
              ? "Modifiez les informations du tatoueur"
              : "Ajoutez un nouveau tatoueur à votre équipe"}
          </p>
        </div>

        {/* Form Content scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Section: Informations générales */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                👤 Informations générales
              </h3>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">Nom</label>
                  <input
                    placeholder="Nom du tatoueur"
                    {...form.register("name")}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/70 font-one">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Description du tatoueur, ses spécialités..."
                    {...form.register("description")}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors resize-none placeholder-white/50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-white/70 font-one">
                      Téléphone
                    </label>
                    <input
                      placeholder="Numéro de téléphone"
                      {...form.register("phone")}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-white/70 font-one">
                      Instagram
                    </label>
                    <input
                      placeholder="@nom_instagram"
                      {...form.register("instagram")}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-xs focus:outline-none focus:border-tertiary-400 transition-colors placeholder-white/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Horaires */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="text-sm font-semibold text-tertiary-400 mb-3 font-one uppercase tracking-wide">
                🕒 Horaires de travail
              </h3>
              <p className="text-xs text-white/60 mb-4">
                Horaires du salon par défaut. Modifiez selon les disponibilités
                du tatoueur.
              </p>

              <div className="space-y-3">
                {daysOfWeek.map(({ key, label }) => {
                  const value = editingHours[key];
                  return (
                    <div
                      key={key}
                      className="bg-white/10 p-3 rounded-lg border border-white/20"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="w-20 text-xs text-white font-one">
                          {label}
                        </span>

                        {value ? (
                          <div className="flex items-center gap-2 flex-1">
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
                              className="p-1 bg-white/10 border border-white/20 rounded text-white text-xs focus:outline-none focus:border-tertiary-400"
                            />
                            <span className="text-white/70 text-xs">à</span>
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
                              className="p-1 bg-white/10 border border-white/20 rounded text-white text-xs focus:outline-none focus:border-tertiary-400"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setEditingHours((prev) => ({
                                  ...prev,
                                  [key]: null,
                                }))
                              }
                              className="cursor-pointer px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded text-xs hover:bg-red-500/30 transition-colors"
                            >
                              Fermé
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-1 justify-end">
                            <span className="text-red-300 text-xs">Fermé</span>
                            <button
                              type="button"
                              onClick={() =>
                                setEditingHours((prev) => ({
                                  ...prev,
                                  [key]: { start: "09:00", end: "18:00" },
                                }))
                              }
                              className="cursor-pointer px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded text-xs hover:bg-green-500/30 transition-colors"
                            >
                              Ouvrir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </form>
        </div>

        {/* Footer fixe */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium font-one text-xs"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            onClick={form.handleSubmit(onSubmit)}
            className="cursor-pointer px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs"
          >
            {loading
              ? existingTatoueur
                ? "Modification..."
                : "Création..."
              : existingTatoueur
              ? "Modifier le tatoueur"
              : "Créer le tatoueur"}
          </button>
        </div>
      </div>
    </div>
  );
}
