/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { changePlanAction } from "@/lib/queries/stripe";

export default function PaymentCancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const plan = searchParams.get("plan");

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryError(null);

    if (!plan) {
      // Pas de plan dans l'URL → l'utilisateur retourne aux paramètres pour relancer manuellement
      router.push("/parametres");
      return;
    }

    try {
      const result = await changePlanAction(plan);
      if (!result.updated && result.url) {
        window.location.href = result.url;
      } else {
        // Plan déjà actif ou mise à jour directe
        router.push("/parametres");
      }
    } catch (err) {
      setRetryError(
        err instanceof Error ? err.message : "Une erreur est survenue.",
      );
      setIsRetrying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center lg:pt-20 px-4 py-8 bg-gradient-to-b from-noir-500 to-noir-700">
      <div className="max-w-md w-full">
        <div className="text-center space-y-6">
          {/* Icône d'annulation */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center border-2 border-amber-500">
              <svg
                className="w-8 h-8 text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Paiement annulé</h1>
            <p className="text-white/70 text-sm">
              Votre paiement n'a pas été traité. Aucune charge n'a été effectuée
              sur votre compte.
            </p>
          </div>

          {/* Information importante */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2">
            <p className="text-sm text-blue-400 font-semibold">
              ℹ️ Votre compte a quand même été créé
            </p>
            <p className="text-xs text-blue-300">
              Vous pouvez utiliser la version gratuite de notre service.
              Upgrader votre plan est optionnel et peut être fait à tout moment
              depuis les paramètres de votre compte.
            </p>
          </div>

          {/* Raisons possibles */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-xs text-white/70 font-semibold mb-2">
              Raisons possibles :
            </p>
            <ul className="text-xs text-white/60 space-y-1 text-left">
              <li>• Vous avez fermé la fenêtre de paiement</li>
              <li>• Vous avez cliqué sur "Retour"</li>
              <li>• Problème de connexion</li>
              <li>• Informations de paiement invalides</li>
            </ul>
          </div>

          {/* Boutons */}
          <div className="space-y-2 pt-4">
            {retryError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                {retryError}
              </p>
            )}
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full px-6 py-3 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRetrying
                ? "Redirection..."
                : plan
                  ? "Réessayer le paiement"
                  : "Gérer mon abonnement"}
            </button>

            <Link
              href="/mon-compte"
              className="block w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors font-medium text-center"
            >
              Accéder à mon compte (version gratuite)
            </Link>
          </div>

          {/* Support */}
          <p className="text-xs text-white/50 pt-4">
            Besoin d'aide ?{" "}
            <Link
              href="/contactez-nous"
              className="text-tertiary-400 hover:text-tertiary-500"
            >
              Contactez-moi
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
