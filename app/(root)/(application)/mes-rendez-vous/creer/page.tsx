import CreateRdvForm from "@/components/Application/RDV/CreateRdvForm";
import { currentUser } from "@/lib/auth.server";
import Link from "next/link";
import { FaRegCalendarTimes } from "react-icons/fa";

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

  const userId = user?.id ?? "";

  return (
    <div className="bg-noir-700 flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col relative w-full bg-noir-700 mt-4 pb-4 px-3 sm:px-6 lg:px-10">
        <div className="dashboard-hero mb-4 flex flex-col gap-3 px-3 py-3 sm:gap-4 sm:px-5 sm:py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6 lg:py-3">
          <div className="w-full min-w-0 flex items-center gap-3 sm:gap-4 mb-0">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-tertiary-400/30 rounded-full flex items-center justify-center shrink-0">
              <FaRegCalendarTimes
                size={24}
                className="text-tertiary-400 animate-pulse"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-xl font-bold text-white font-one tracking-wide uppercase truncate">
                Créer un rendez-vous
              </h1>
              <p className="hidden sm:block text-white/70 text-xs font-one mt-1">
                Remplissez le formulaire pour créer un nouveau rendez-vous pour
                un client existant ou un nouveau client.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full">
          <CreateRdvForm userId={userId ?? ""} />
        </div>
      </div>
    </div>
  );
}
