import RDV from "@/components/Application/RDV/RDV";
import { Search } from "@/components/Shared/Search";
import Link from "next/link";

export default function RendezVousPage() {
  return (
    <div className="bg-noir-700 flex flex-col items-center justify-center gap-4">
      <div className="flex justify-between relative gap-8 w-full bg-noir-700 mt-24">
        <div className="w-full bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg pb-4 border-b border-white/20">
          <h1 className="text-3xl font-bold text-white font-one tracking-wide text-center">
            Rendez-vous
          </h1>
          <p className="text-white/70 text-sm font-one text-center mt-2">
            Gérez vos rendez-vous, consultez les détails de chaque client et
            suivez l&apos;historique de vos visites.
          </p>
        </div>
        {/* <input
          placeholder="Rechercher un rendez-vous"
          type="text"
          className="text-sm text-white placeholder:text-white/30 placeholder:text-xs px-4 min-w-[200px] max-w-[400px] font-one border-[1px] border-white rounded-[20px]"
        /> */}
      </div>
      <div className="px-20 w-full">
        <div className="flex gap-4 mb-6 mt-2">
          <Link
            href={"/mes-rendez-vous/creer"}
            className="cursor-pointer w-[200px] text-center px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs"
          >
            Créer un rendez-vous
          </Link>
          <div className="w-full">
            <Search />
          </div>
        </div>

        <RDV />
      </div>
    </div>
  );
}
