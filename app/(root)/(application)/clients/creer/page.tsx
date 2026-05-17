
import { currentUser } from "@/lib/auth.server";
import Link from "next/link";
import { FiUserPlus } from "react-icons/fi";
import PageHeader from "@/components/Shared/PageHeader";
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
    <div className="bg-noir-700 flex flex-col items-center justify-center gap-4 pb-20">
      <div className="flex flex-col relative w-full bg-noir-700 mt-4 pb-4 px-3 sm:px-6 lg:px-10">
        <PageHeader
          icon={<FiUserPlus size={15} className="text-tertiary-400 animate-pulse" />} 
          title="Créer un client"
        >
        </PageHeader>
        <div className="w-full">
          <CreateClientForm userId={userId ?? ""} />
        </div>
      </div>
    </div>
  );
}
