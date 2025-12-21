"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/Auth/Context/UserContext";
import { CgDanger } from "react-icons/cg";

export default function VerificationNotification() {
  const user = useUser();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // N'afficher la notification que si le salon n'est pas vérifié
    if (user && user.verifiedSalon === false) {
      setIsVisible(true);
    }
  }, [user]);

  if (!isVisible || (user && user.verifiedSalon !== false)) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm">
      <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/50 rounded-xl p-4 shadow-xl backdrop-blur-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-lg bg-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CgDanger className="text-amber-400" size={25} />
            </div>
            <div className="flex-1">
              <h3 className="text-white text-sm font-one mb-1">
                Vérifiez votre salon
              </h3>
              <p className="text-white/80 text-xs font-one leading-relaxed">
                Envoyez vos documents pour vérifier votre salon et augmenter la
                confiance de vos clients.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white/50 hover:text-white/80 transition-colors flex-shrink-0 cursor-pointer"
          >
            <svg
              className="w-5 h-5"
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
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setIsVisible(false)}
            className="cursor-pointer flex-1 px-3 py-1.5 text-xs font-one rounded-lg border border-amber-500/40 text-amber-100 bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
          >
            Fermer
          </button>
          <button
            onClick={() => router.push("/parametres")}
            className="cursor-pointer flex-1 px-3 py-1.5 text-xs font-one rounded-lg border border-amber-500/60 text-white bg-amber-500/40 hover:bg-amber-500/50 transition-colors font-semibold"
          >
            Aller aux paramètres
          </button>
        </div>
      </div>
    </div>
  );
}
