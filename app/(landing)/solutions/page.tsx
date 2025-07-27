import ClientSection from "@/components/SolutionsPage/ClientSection";
import ProfilSection from "@/components/SolutionsPage/ProfilSection";
import ReservationSection from "@/components/SolutionsPage/ReservationSection";
import { FaArrowDown } from "react-icons/fa";

export default function SolutionsPage() {
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
              Toutes les solutions pour gérer votre salon de tatouage
            </h1>
            <FaArrowDown
              size={35}
              className="text-tertiary-400 animate-pulse"
            />
          </div>
        </div>
      </section>

      <ReservationSection />

      <ClientSection />

      <ProfilSection />
    </>
  );
}
