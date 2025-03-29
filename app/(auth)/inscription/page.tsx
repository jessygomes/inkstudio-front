import { Register } from "@/components/Auth/Form/RegisterForm";
import type { Metadata } from "next";
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
  // const user = await currentUser();
  // if (user) {
  //   redirect("/");
  // }

  return (
    <section className="">
      <Suspense>
        <Register />
      </Suspense>
    </section>
  );
}
