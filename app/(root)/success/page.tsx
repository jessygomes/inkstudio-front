/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
// import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentSuccessPage() {
  // const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler un délai pour laisser le webhook Stripe se traiter
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // const sessionId = searchParams.get("session_id");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-b from-noir-700  to-noir-500">
      <div className="max-w-md w-full">
        {isLoading && (
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-white/10 rounded-full mx-auto w-16"></div>
            <div className="h-8 bg-white/10 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-white/10 rounded w-full"></div>
          </div>
        )}

        {!isLoading && (
          <div className="text-center space-y-6">
            {/* Icône de succès */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500">
                <svg
                  className="w-8 h-8 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">
                Paiement réussi ! 🎉
              </h1>
              <p className="text-white/70 text-sm">
                Votre abonnement est maintenant actif et votre salon de tatouage
                est prêt.
              </p>
              <p className="text-white/70 text-sm">
                Reconnectez-vous pour accéder à vos nouvelles fonctionnalités et
                gérer votre salon.
              </p>
            </div>

            {/* Détails */}
            {/* <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2 text-left">
              <p className="text-xs text-white/50">Session ID</p>
              <p className="text-sm text-white font-mono break-all">
                {sessionId || "N/A"}
              </p>
            </div> */}

            {/* Message informatif */}
            <div className="bg-tertiary-500/10 border border-tertiary-500/30 rounded-lg p-3">
              <p className="text-sm text-tertiary-400">
                💡 Un email de confirmation a été envoyé à votre adresse email.
                Vérifiez votre boîte de réception.
              </p>
            </div>

            {/* Boutons */}
            <div className="space-y-2 pt-4">
              <Link
                href="/dashboard"
                className="block w-full px-6 py-3 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium text-center"
              >
                Accéder au Dashboard →
              </Link>

              <Link
                href="/"
                className="block w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium text-center"
              >
                Retour à l'accueil
              </Link>
            </div>

            {/* Message de pied de page */}
            {/* <p className="text-xs text-white/50 pt-4">
              Si vous n'êtes pas redirigé automatiquement,{" "}
              <Link
                href="/app"
                className="text-tertiary-400 hover:text-tertiary-500"
              >
                cliquez ici
              </Link>
            </p> */}
          </div>
        )}
      </div>
    </div>
  );
}
