"use client";
import { useState } from "react";
import Link from "next/link";

type Offer = {
  email: string | null;
  role: "user_salon" | "user_tatoueur" | null;
  plan: "PRO" | "BUSINESS" | null;
  durationMonths: number;
};
const inputClass =
  "w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white";
export default function InvitationRegister({
  offer,
  token,
}: {
  offer: Offer;
  token: string;
}) {
  const [role, setRole] = useState(offer.role || "");
  const selectedPlan =
    offer.plan || (role === "user_salon" ? "BUSINESS" : "PRO");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [email, setEmail] = useState(offer.email || "");
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    if (data.get("password") !== data.get("confirmation")) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setPending(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            role,
            saasPlan: selectedPlan,
            invitationToken: token,
            salonName: data.get("salonName") || undefined,
            firstName: data.get("firstName"),
            lastName: data.get("lastName"),
            phone: data.get("phone") || "",
            password: data.get("password"),
            website: data.get("website") || "",
          }),
        },
      );
      const result = await response.json();
      if (!response.ok || result.error)
        throw new Error(
          Array.isArray(result.message)
            ? result.message.join(" ")
            : result.message || "Inscription impossible.",
        );
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de joindre le serveur.",
      );
    } finally {
      setPending(false);
    }
  };
  if (done)
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Votre compte est créé</h1>
        <p>
          Un email de vérification a été envoyé à {email}. Vérifiez votre
          adresse pour vous connecter et profiter de votre abonnement offert.
        </p>
        <Link href="/connexion" className="underline">
          Se connecter
        </Link>
      </div>
    );
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">
        Vous êtes invité sur Inkera Studio
      </h1>
      <p className="rounded-xl bg-emerald-400/10 p-3 text-emerald-200">
        {role
          ? `Formule ${selectedPlan} offerte pendant ${offer.durationMonths} mois pour votre compte ${role === "user_salon" ? "salon" : "tatoueur"}.`
          : `${offer.durationMonths} mois offerts : choisissez un compte tatoueur avec Pro ou un compte salon avec Business.`}
      </p>
      <p className="text-sm text-white/70">
        Sans carte bancaire. La durée débute à la création du compte. À son
        terme, votre compte repassera en Free, sans prélèvement automatique.
      </p>
      <form onSubmit={submit} className="space-y-3">
        {!offer.role && (
          <label className="block text-sm">
            Type de compte
            <select
              name="role"
              required
              value={role}
              disabled={pending}
              onChange={(e) => setRole(e.target.value)}
              className={inputClass}
            >
              <option value="" disabled className="bg-neutral-900">
                Choisir mon type de compte
              </option>
              <option value="user_tatoueur" className="bg-neutral-900">
                Tatoueur indépendant — Pro
              </option>
              <option value="user_salon" className="bg-neutral-900">
                Salon — Business
              </option>
            </select>
          </label>
        )}
        <label className="block text-sm">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            readOnly={!!offer.email}
            required
            autoComplete="email"
            className={inputClass}
          />
        </label>
        {role === "user_salon" && (
          <label className="block text-sm">
            Nom du salon
            <input
              name="salonName"
              required
              maxLength={150}
              className={inputClass}
            />
          </label>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            Prénom
            <input
              name="firstName"
              required
              autoComplete="given-name"
              className={inputClass}
            />
          </label>
          <label className="block text-sm">
            Nom
            <input
              name="lastName"
              required
              autoComplete="family-name"
              className={inputClass}
            />
          </label>
        </div>
        <label className="block text-sm">
          Téléphone
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            className={inputClass}
          />
        </label>
        <label className="block text-sm">
          Mot de passe
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className={inputClass}
          />
        </label>
        <label className="block text-sm">
          Confirmer le mot de passe
          <input
            name="confirmation"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className={inputClass}
          />
        </label>
        <div className="hidden" aria-hidden="true">
          <input name="website" tabIndex={-1} autoComplete="off" />
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-300">
            {error}
          </p>
        )}
        <button
          disabled={pending}
          className="w-full rounded-xl bg-tertiary-500 px-4 py-3 font-semibold disabled:opacity-50"
        >
          {pending
            ? "Création en cours…"
            : "Créer mon compte et activer mon offre"}
        </button>
      </form>
    </div>
  );
}
