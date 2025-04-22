import CreateRdvForm from "@/components/Application/RDV/CreateRdvForm";
import { currentUser } from "@/lib/auth.server";
import Link from "next/link";
import React from "react";

export default async function CreerRDVpage() {
  const user = await currentUser();
  if (!user) {
    return (
      <div className="bg-noir-700 flex flex-col items-center justify-center gap-4 ">
        <h1 className="text-white">
          Vous devez être connecté pour créer un rendez-vous.
        </h1>
        <Link
          href={"/connexion"}
          className="relative text-xs cursor-pointer bg-gradient-to-l from-tertiary-400 to-tertiary-500 min-w-[200px] max-w-[400px] text-center text-white font-one py-2 px-4 rounded-[20px] hover:scale-105 transition-all ease-in-out duration-300"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  const userId =
    typeof user !== "string" && "userId" in user ? user.userId : null;

  console.log("userId", userId);

  return (
    <div className="bg-noir-700 flex flex-col items-center justify-center gap-4 ">
      <div className="flex relative gap-8 w-full bg-secondary-500/30 px-20 mt-16 pb-4">
        <Link
          href={"/mes-rendez-vous"}
          className="relative text-xs cursor-pointer bg-gradient-to-l from-tertiary-400 to-tertiary-500 min-w-[200px] max-w-[400px] text-center text-white font-one py-2 px-4 rounded-[20px] hover:scale-105 transition-all ease-in-out duration-300"
        >
          Revenir à la liste des rendez-vous
        </Link>
      </div>
      <div className="px-20 w-full">
        <CreateRdvForm userId={userId} />
        {/* IL FAUT VOIR LES HORAIRES DISPONIBLES EN FONCTION DU OU DES TATOUEURS ET DES HORAIRES INDIQUE POUR CHACUN */}
        {/* FORMULAIRE RDV : voir si c'est pour un client qui existe deja ou un nouveau client */}
        {/* Rechercher le client pour voir s'il est dans le database, si oui remplir le formulaire avec les données du client deja en database. POur créer le redv plus rapidement, donc ajouter seulement les infos supplémentaire au rdv */}
        {/* Le rendez-vous doit etre directemetn connecté au client */}
      </div>
    </div>
  );
}
