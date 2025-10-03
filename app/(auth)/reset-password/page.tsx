import ResetPasswordForm from "@/components/Auth/Form/ResetPasword";
import { getAuthenticatedUser } from "@/lib/auth.server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Réinitialisation du mot de passe | InkStudio",
  description:
    "Créez un nouveau mot de passe sécurisé pour votre compte InkStudio. Processus simple et rapide pour retrouver l'accès complet à vos outils de gestion de salon de tatouage.",
  keywords: [
    "nouveau mot de passe",
    "réinitialisation sécurisée",
    "accès compte tatoueur",
    "sécurité InkStudio",
  ],
};

export default async function ResetPasswordPage() {
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
            <ResetPasswordForm />
          </Suspense>
        </div>
      </section>
    );
  }
}
