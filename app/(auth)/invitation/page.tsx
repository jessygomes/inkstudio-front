import Link from "next/link";
import { currentUser } from "@/lib/auth.server";
import InvitationRegister from "@/components/Auth/Form/InvitationRegister";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Votre invitation Inkera Studio",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default async function InvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const query = await searchParams;
  const token = typeof query.token === "string" ? query.token : "";
  const user = await currentUser();
  let offer = null;
  let message = "Ce lien d’invitation est invalide, expiré ou déjà utilisé.";
  if (/^[a-f0-9]{64}$/.test(token)) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/auth/invitation?token=${encodeURIComponent(token)}`,
        { cache: "no-store" },
      );
      if (response.ok) offer = await response.json();
      else if (response.status >= 500 || response.status === 429)
        message =
          "Le service est temporairement indisponible. Réessayez dans quelques instants.";
    } catch {
      message =
        "Impossible de vérifier l’invitation. Réessayez dans quelques instants.";
    }
  }
  return (
    <section className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 py-12 text-white">
      <div className="w-full max-w-xl rounded-2xl border border-white/15 bg-white/5 p-6 sm:p-8">
        {user ? (
          <div className="space-y-4">
            <h1 className="text-xl font-semibold">Vous êtes déjà connecté</h1>
            <p>
              Cette invitation permet de créer un nouveau compte.
              Déconnectez-vous pour utiliser le lien avec l’email invité.
            </p>
            <Link className="underline" href="/dashboard">
              Retour à mon compte
            </Link>
          </div>
        ) : offer ? (
          <InvitationRegister offer={offer} token={token} />
        ) : (
          <div className="space-y-4">
            <h1 className="text-xl font-semibold">Invitation indisponible</h1>
            <p role="alert">{message}</p>
            <Link className="underline" href="/connexion">
              Se connecter
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
