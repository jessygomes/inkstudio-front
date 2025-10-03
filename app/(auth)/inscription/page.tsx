import { Register } from "@/components/Auth/Form/RegisterForm";
import { currentUser } from "@/lib/auth.server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
// import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Register | Shop Ton Alternance",
  description:
    "Connectez-vous à votre compte Téléphone du Monde pour gérer vos commandes, consulter vos informations personnelles et accéder à vos offres exclusives. Une expérience simple et rapide.",
  keywords: [
    "se connecter",
    "compte utilisateur",
    "gestion de compte",
    "offres exclusives",
  ],
};

export default async function page() {
  const user = await currentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <section className="">
      <div
        className="flex h-screen w-full bg-cover bg-center items-center justify-center px-4"
        style={{
          backgroundImage: "url('/images/bv.png')",
          backgroundSize: "cover",
        }}
      >
        {/* Ajoutez ici d'autres éléments si nécessaire */}
        <Suspense>
          <Register />
        </Suspense>
      </div>
    </section>
  );
}
