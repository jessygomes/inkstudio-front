// import { LoginForm } from "@/components/Auth/Form/LoginForm";
// import { currentUser } from "@/lib/authAction/auth";
import { LoginForm } from "@/components/Auth/Form/ConnexionForm";
import { currentUser } from "@/lib/auth.server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
// import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Connexion | Inkera Studio",
  description:
    "Connectez-vous à votre compte Inkera Studio pour gérer votre salon de tatouage, vos rendez-vous clients, votre portfolio et développer votre activité. Interface intuitive et sécurisée.",
  keywords: [
    "connexion tatoueur",
    "compte Inkera Studio",
    "gestion salon tatouage",
    "rendez-vous tatouage",
    "portfolio tattoo",
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
        className="flex h-screen w-full bg-cover bg-center items-center justify-center px-4"
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
