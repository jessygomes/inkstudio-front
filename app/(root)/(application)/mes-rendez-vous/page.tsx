import RDV from "@/components/Application/RDV/RDV";
import { Search } from "@/components/Shared/Search";
import Link from "next/link";

export default function RendezVousPage() {
  return (
    <div className="bg-noir-700 flex flex-col items-center justify-center gap-4 ">
      <div className="flex justify-between relative gap-8 w-full bg-noir-700 px-20 mt-24 pb-4">
        {/* <input
          placeholder="Rechercher un rendez-vous"
          type="text"
          className="text-sm text-white placeholder:text-white/30 placeholder:text-xs px-4 min-w-[200px] max-w-[400px] font-one border-[1px] border-white rounded-[20px]"
        /> */}
        <Link
          href={"/mes-rendez-vous/creer"}
          className="relative text-xs cursor-pointer bg-gradient-to-l from-tertiary-400 to-tertiary-500 min-w-[200px] max-w-[400px] text-center text-white font-one py-2 px-4 rounded-[20px] hover:scale-105 transition-all ease-in-out duration-300"
        >
          Créer un rendez-vous
        </Link>
        <Search />
      </div>
      <div className="px-20 w-full">
        <RDV />
      </div>
    </div>
  );
}
