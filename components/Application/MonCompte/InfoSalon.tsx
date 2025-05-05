"use client";
import { UpdateSalonUserProps } from "@/lib/type";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateSalonSchema } from "@/lib/zod/validator.schema";
import { z } from "zod";

interface InfoSalonProps {
  salon: UpdateSalonUserProps;
}

export default function InfoSalon({ salon }: InfoSalonProps) {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof updateSalonSchema>>({
    resolver: zodResolver(updateSalonSchema),
    defaultValues: {
      ...salon,
      instagram: salon.instagram ?? undefined,
      facebook: salon.facebook ?? undefined,
      tiktok: salon.tiktok ?? undefined,
      website: salon.website ?? undefined,
      description: salon.description ?? undefined,
    },
  });

  const onSubmit = async (data: z.infer<typeof updateSalonSchema>) => {
    console.log("Form data:", data);
    setIsSubmitting(true);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/users/${salon.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    if (res.ok) {
      setShowModal(false);
      location.reload(); // ou mieux, déclencher un refetch React Query si utilisé
    }

    setIsSubmitting(false);
  };

  return (
    <>
      <article className="flex flex-col items-end p-2 rounded-[20px]">
        <article className="flex gap-8 w-full ">
          <div className="relative min-w-[200px] min-h-[200px] rounded-full overflow-hidden">
            {salon.image ? (
              <Image
                src={salon.image}
                alt="Salon Image"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-500 font-two">No Image</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 justify-center">
            <h1 className="text-white uppercase text-3xl font-one">
              {salon.salonName}
            </h1>
            <p className="text-white font-two text-sm">
              Lieu : {salon.address}, {salon.postalCode} {salon.city}
            </p>
            <p className="text-white text-sm">{salon.description}</p>
            <div>
              {salon.instagram && (
                <Link
                  href={salon.instagram}
                  target="_blank"
                  className="text-white"
                >
                  Instagram
                </Link>
              )}
              {salon.facebook && (
                <Link
                  href={`https://www.facebook.com/${salon.facebook}`}
                  target="_blank"
                  className="text-white"
                >
                  Facebook
                </Link>
              )}
              {salon.tiktok && (
                <Link
                  href={`https://www.facebook.com/${salon.facebook}`}
                  target="_blank"
                  className="text-white"
                >
                  Tik Tok
                </Link>
              )}
              {salon.website && (
                <Link
                  href={salon.website}
                  target="_blank"
                  className="text-white"
                >
                  Site Web
                </Link>
              )}
            </div>
          </div>
        </article>
        <button
          onClick={() => setShowModal(true)}
          className="text-xs cursor-pointer bg-gradient-to-l from-tertiary-400 to-tertiary-500 min-w-[200px] max-w-[200px] text-center text-white font-one py-2 px-4 rounded-[20px] hover:scale-105 transition-all ease-in-out duration-300"
        >
          Modifier les informations
        </button>
      </article>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="bg-primary-500 p-6 rounded-[20px] w-[90%] max-w-[900px] h-[90%] overflow-auto space-y-4 text-white text-sm font-one"
          >
            <h2 className="text-center font-bold text-lg uppercase tracking-widest">
              Modifier le salon
            </h2>
            <div className="flex flex-col gap-1">
              <label className="text-sm">Nom du salon</label>
              <input
                placeholder="Nom du salon"
                {...form.register("salonName")}
                className="w-full p-2 bg-white/30 rounded-[20px]"
              />
            </div>

            <div className="flex gap-4">
              <div className="w-full flex flex-col gap-1">
                <label className="text-sm">Prénom du propriétaire</label>
                <input
                  placeholder="Prénom"
                  {...form.register("firstName")}
                  className="w-full p-2 bg-white/30 rounded-[20px]"
                />
              </div>
              <div className="w-full flex flex-col gap-1">
                <label className="text-sm">Nom du propriétaire</label>
                <input
                  placeholder="Nom"
                  {...form.register("lastName")}
                  className="w-full p-2 bg-white/30 rounded-[20px]"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-full flex flex-col gap-1">
                <label className="text-sm">N° de téléphone du salon</label>
                <input
                  placeholder="Téléphone"
                  {...form.register("phone")}
                  className="w-full p-2 bg-white/30 rounded-[20px]"
                />
              </div>
              <div className="w-full flex flex-col gap-1">
                <label className="text-sm">Adresse du salon</label>
                <input
                  placeholder="Adresse"
                  {...form.register("address")}
                  className="w-full p-2 bg-white/30 rounded-[20px]"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-full flex flex-col gap-1">
                <label className="text-sm">Ville</label>
                <input
                  placeholder="Ville"
                  {...form.register("city")}
                  className="w-full p-2 bg-white/30 rounded-[20px]"
                />
              </div>
              <div className="w-full flex flex-col gap-1">
                <label className="text-sm">Code postal</label>
                <input
                  placeholder="Code postal"
                  {...form.register("postalCode")}
                  className="w-full p-2 bg-white/30 rounded-[20px]"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-full flex flex-col gap-1">
                <label className="text-sm">Lien instagram (optionnel)</label>
                <input
                  placeholder="Instagram"
                  {...form.register("instagram")}
                  className="w-full p-2 bg-white/30 rounded-[20px]"
                />
              </div>
              <div className="w-full flex flex-col gap-1">
                <label className="text-sm">Lien Facebook (optionnel)</label>
                <input
                  placeholder="Facebook"
                  {...form.register("facebook")}
                  className="w-full p-2 bg-white/30 rounded-[20px]"
                />
              </div>
              <div className="w-full flex flex-col gap-1">
                <label className="text-sm">Lien TikTok (optionnel)</label>
                <input
                  placeholder="TikTok"
                  {...form.register("tiktok")}
                  className="w-full p-2 bg-white/30 rounded-[20px]"
                />
              </div>
            </div>

            <div className="w-full flex flex-col gap-1">
              <label className="text-sm">Votre site Web (optionnel)</label>
              <input
                placeholder="Site Web"
                {...form.register("website")}
                className="w-full p-2 bg-white/30 rounded-[20px]"
              />
            </div>

            <div className="w-full flex flex-col gap-1">
              <label className="text-sm">Description du salon</label>
              <textarea
                placeholder="Description"
                {...form.register("description")}
                className="w-full min-h-[100px] p-2 bg-white/30 rounded-[20px]"
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="cursor-pointer text-xs p-2 rounded-[20px] bg-red-900 text-white"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="text-xs cursor-pointer bg-gradient-to-l from-tertiary-400 to-tertiary-500 min-w-[200px] max-w-[400px] text-center text-white py-2 px-4 rounded-[20px] hover:scale-105 transition"
              >
                {isSubmitting ? "Enregistrement..." : "Sauvegarder"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
