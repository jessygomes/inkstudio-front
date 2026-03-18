// import { LoginForm } from "@/components/Auth/Form/LoginForm";
// import { currentUser } from "@/lib/authAction/auth";
import { LoginForm } from "@/components/Auth/Form/ConnexionForm";
import { currentUser } from "@/lib/auth.server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
// import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Se connecter",
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

type AuthPageProps = {
  searchParams?:
    | {
        callbackUrl?: string | string[];
      }
    | Promise<{
        callbackUrl?: string | string[];
      }>;
};

export default async function page({ searchParams }: AuthPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const callbackParam = Array.isArray(resolvedSearchParams?.callbackUrl)
    ? resolvedSearchParams.callbackUrl[0]
    : resolvedSearchParams?.callbackUrl;
  const safeCallbackUrl = callbackParam?.startsWith("/") ? callbackParam : null;

  const user = await currentUser();
  if (user) {
    redirect(safeCallbackUrl || "/dashboard");
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
