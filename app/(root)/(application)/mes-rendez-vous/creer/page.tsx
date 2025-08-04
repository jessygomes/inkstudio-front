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

  return (
    <div className="bg-noir-700 flex flex-col items-center justify-center gap-4 ">
      <div className="flex flex-col relative gap-8 w-full bg-noir-700  mt-24 pb-4">
        <div className="w-full bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg pb-4 border-b border-white/20">
          <h1 className="text-3xl font-bold text-white font-one tracking-wide text-center">
            Créer un rendez-vous
          </h1>
          <p className="text-white/70 text-xs font-one text-center mt-2">
            Remplissez le formulaire pour créer un nouveau rendez-vous pour un
            client existant ou un nouveau client.
          </p>
        </div>

        <div className="px-20 w-full">
          <CreateRdvForm userId={userId} />
        </div>
      </div>
    </div>
  );
}
