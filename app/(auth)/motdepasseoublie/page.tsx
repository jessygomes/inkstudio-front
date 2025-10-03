import ForgotPassword from "@/components/Auth/Form/ForgetPassword";
import { getAuthenticatedUser } from "@/lib/auth.server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Mot de passe oublié | InkStudio",
  description:
    "Récupérez l'accès à votre compte InkStudio en réinitialisant votre mot de passe. Processus simple et sécurisé pour retrouver l'accès à vos outils de gestion de salon de tatouage.",
  keywords: [
    "récupération mot de passe",
    "réinitialisation compte",
    "accès compte tatoueur",
    "sécurité compte",
  ],
};

export default async function ForgotPasswordPage() {
  try {
    // Si l'utilisateur est connecté, on le redirige
    await getAuthenticatedUser();
    redirect("/dashboard");
  } catch {
    // L'utilisateur n'est pas connecté, on affiche le formulaire
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
            <ForgotPassword />
          </Suspense>
        </div>
      </section>
    );
  }
}
