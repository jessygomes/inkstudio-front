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

  const userId =
    typeof user !== "string" && "userId" in user ? user.userId : null;

  return (
    <div className="bg-noir-700 flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col relative gap-8 w-full bg-noir-700 mt-24 pb-4 px-3 sm:px-20">
        <div className="flex flex-col md:flex-row sm:items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10 w-full">
          <div className="w-full flex items-center gap-4 mb-4 sm:mb-0">
            <div className="w-22 sm:w-12 h-12 bg-tertiary-400/30 rounded-full flex items-center justify-center">
              <FaRegCalendarTimes
                size={28}
                className="text-tertiary-400 animate-pulse"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-one tracking-wide uppercase">
                Créer un rendez-vous
              </h1>
              <p className="text-white/70 text-xs font-one mt-1">
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
