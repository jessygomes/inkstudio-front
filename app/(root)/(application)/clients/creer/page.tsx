
import { currentUser } from "@/lib/auth.server";
import Link from "next/link";
import { CreationPageHeader } from "@/components/Shared/CreationWorkspace";
import CreateClientForm from "@/components/Application/Clients/CreateClientForm";

export default async function CreerClientPage() {
  const user = await currentUser();
  if (!user) {
    return (
      <div className="bg-noir-700 flex flex-col items-center justify-center gap-4 ">
        <h1 className="text-white">
          Vous devez être connecté pour créer un client.
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

  const userId = user?.id ?? "";

  return (
    <main className="wrapper-global pb-24 pt-5 lg:pb-8">
      <div className="w-full">
        <CreationPageHeader
          category="Clients"
          title="Créer un client"
          description="Une fiche claire pour retrouver ses coordonnées, ses consentements et les informations utiles à son suivi."
          backHref="/clients"
          backLabel="Retour aux clients"
        />
        <div className="w-full">
          <CreateClientForm userId={userId ?? ""} />
        </div>
      </div>
    </main>
  );
}
