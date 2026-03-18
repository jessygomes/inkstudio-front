import { Register } from "@/components/Auth/Form/RegisterForm";
import { currentUser } from "@/lib/auth.server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
// import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Créer un compte",
  description:
    "Rejoignez Inkera Studio et transformez votre passion du tatouage en business florissant. Créez votre compte professionnel pour gérer clients, rendez-vous et développer votre réputation.",
  keywords: [
    "inscription tatoueur",
    "créer compte Inkera Studio",
    "salon de tatouage",
    "tatoueur professionnel",
    "business tattoo",
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
          <Register />
        </Suspense>
      </div>
    </section>
  );
}
