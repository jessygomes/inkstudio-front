import HeroSection from "@/components/Home/HeroSection";
import Section2 from "@/components/Home/Section2";
import Section3 from "@/components/Home/Section3";
import Section4 from "@/components/Home/Section4";
import Section5 from "@/components/Home/Section5";
import Section6 from "@/components/Home/Section6";
import Header from "@/components/Shared/Header";
// import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="absolute top-0 left-0 w-full h-screen">
        <Header />
      </div>
      <div
        className="hidden sm:flex h-screen w-full bg-cover bg-center items-center justify-center"
        style={{
          backgroundImage: "url('/images/bv.png')",
          backgroundSize: "cover",
        }}
      >
        {/* Ajoutez ici d'autres éléments si nécessaire */}
        <HeroSection />
      </div>

      <div
        className="sm:hidden h-screen w-full bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: "url('/images/bvp.png')",
          backgroundSize: "cover",
        }}
      >
        {/* Ajoutez ici d'autres éléments si nécessaire */}
        <HeroSection />
      </div>
      {/* <div className="relative w-full h-screen sm:hidden">
        <Image
          src="/images/bvp.png"
          alt="Background"
          fill
          className="object-cover sm:hidden w-full"
          style={{
            objectPosition: "right center", // Décale l'image vers la droite
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <HeroSection />
        </div>
      </div> */}
      <Section2 />
      <Section3 />
      <Section4 />
      <Section5 />
      <Section6 />
    </>
  );
}
