// import { LoginForm } from "@/components/Auth/Form/LoginForm";
// import { currentUser } from "@/lib/authAction/auth";
import { LoginForm } from "@/components/Auth/Form/ConnexionForm";
import { currentUser } from "@/lib/auth.server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
// import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Connexion | Shop Ton Alternance",
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
    redirect("/dashboard"); // Redirigez vers le tableau de bord si l'utilisateur est déjà connecté
  }

  return (
    <section className="">
      <div
        className="hidden sm:flex h-screen w-full bg-cover bg-center items-center justify-center"
        style={{
          backgroundImage: "url('/images/bv.png')",
          backgroundSize: "cover",
        }}
      >
        {/* Ajoutez ici d'autres éléments si nécessaire */}
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </section>
  );
}
