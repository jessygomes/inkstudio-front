import { Register } from "@/components/Auth/Form/RegisterForm";
import { currentUser } from "@/lib/auth.server";
import { isOfferActive } from "@/lib/offers";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
// import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ROUTES } from "@/lib/routes";
import AuthShell from "@/components/Auth/AuthShell";

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
  // Next.js 16 fournit les paramètres d'URL sous forme de Promise.
  searchParams?: Promise<{
    callbackUrl?: string | string[];
  }>;
};

export default async function page({ searchParams }: AuthPageProps) {
  const isTatoueurProOfferActive = isOfferActive(process.env.OFFRE_ACTIVE);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const callbackParam = Array.isArray(resolvedSearchParams?.callbackUrl)
    ? resolvedSearchParams.callbackUrl[0]
    : resolvedSearchParams?.callbackUrl;
  const safeCallbackUrl = callbackParam?.startsWith("/") ? callbackParam : null;

  const user = await currentUser();
  if (user) {
    redirect(safeCallbackUrl || ROUTES.dashboard);
  }

  return (
    <AuthShell mode="register">
      <Suspense>
        <Register isTatoueurProOfferActive={isTatoueurProOfferActive} />
      </Suspense>
    </AuthShell>
  );
}
