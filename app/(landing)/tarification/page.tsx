import Tarifs from "@/components/TarifPage/Tarifs";
import { FaArrowDown } from "react-icons/fa";

export default function TarificationPage() {
  return (
    <>
      <section className="h-screen bg-noir-700 flex items-center justify-center">
        <div
          className="h-screen w-full bg-cover bg-center flex items-center justify-center"
          style={{
            backgroundImage: "url('/images/bgsol.png')",
            backgroundSize: "cover",
          }}
        >
          <div className="flex flex-col justify-center items-center gap-8">
            <h2 className="text-white font-two">INKSTUDIO</h2>
            <h1 className="text-2xl sm:text-3xl font-bold text-white uppercase font-two tracking-wide text-center">
              Tarification de nos services
            </h1>
            <p className="text-white/70 text-sm font-one text-center max-w-md">
              Découvrez nos tarifs compétitifs pour tous vos besoins en
              tatouage, piercing et plus encore. Nous offrons une gamme de
              services adaptés à tous les budgets.
            </p>

            <FaArrowDown
              size={35}
              className="text-tertiary-400 animate-pulse"
            />
          </div>
        </div>
      </section>

      <Tarifs />
    </>
  );
}
