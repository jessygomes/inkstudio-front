import HeroSection from "@/components/Home/HeroSection";
import Section2 from "@/components/Home/Section2";
import Section3 from "@/components/Home/Section3";
import Section4 from "@/components/Home/Section4";
import Section5 from "@/components/Home/Section5";
import Section6 from "@/components/Home/Section6";
import Footer from "@/components/Shared/Footer/Footer";
import Header from "@/components/Shared/Header";
// import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="fixed top-0 left-0 w-full z-[9999]">
        <Header />
      </div>
      <div
        className="hidden lg:flex h-screen w-full bg-cover bg-center items-center justify-center"
        style={{
          backgroundImage: "url('/images/bv.png')",
          backgroundSize: "cover",
        }}
      >
        <HeroSection />
      </div>

      <div
        className="lg:hidden h-screen w-full bg-cover bg-center flex items-center justify-center relative"
        style={{
          backgroundImage: "url('/images/bvp.png')",
          backgroundSize: "cover",
          backgroundPosition: "right center", // Décale l'image vers la droite
        }}
      >
        {/* Overlay semi-transparent */}
        <div className="absolute inset-0 bg-noir-700/80"></div>

        {/* Contenu par-dessus l'overlay */}
        <div className="relative z-10">
          <HeroSection />
        </div>
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
      <Footer />
    </>
  );
}
