"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  createTeamRequestAction,
  searchTatoueurUsersAction,
  type SearchTatoueurUser,
} from "@/lib/queries/team-requests";

export default function InviteRegisteredTatoueurSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchTatoueurUser[]>([]);
  const [isSearchingTatoueurs, setIsSearchingTatoueurs] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [invitingTatoueurId, setInvitingTatoueurId] = useState<string | null>(
    null
  );

  const handleSearchRegisteredTatoueurs = async () => {
    const trimmed = searchQuery.trim();

    if (trimmed.length < 2) {
      setSearchError("Saisissez au moins 2 caractères pour lancer la recherche.");
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearchingTatoueurs(true);
    setSearchError("");

    try {
      const result = await searchTatoueurUsersAction(trimmed);

      if (!result.ok) {
        setSearchError(result.message || "Recherche impossible.");
        setSearchResults([]);
        setHasSearched(true);
        return;
      }

      setSearchResults(result.tatoueurs);
      setHasSearched(true);
    } catch (searchErr) {
      console.error("Erreur recherche tatoueurs inscrits:", searchErr);
      setSearchError("Une erreur est survenue pendant la recherche.");
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsSearchingTatoueurs(false);
    }
  };

  const handleInviteTatoueur = async (tatoueur: SearchTatoueurUser) => {
    if (tatoueur.isAlreadyInTeam || tatoueur.hasPendingRequestFromThisSalon) {
      return;
    }

    setInvitingTatoueurId(tatoueur.id);

    try {
      const result = await createTeamRequestAction({
        tatoueurUserId: tatoueur.id,
        message: inviteMessage,
      });

      if (!result.ok) {
        const businessError = result.message || "Impossible d'envoyer la demande.";
        toast.error(businessError);

        if (
          businessError.toLowerCase().includes("en attente") ||
          businessError.toLowerCase().includes("déjà")
        ) {
          setSearchResults((prev) =>
            prev.map((item) => {
              if (item.id !== tatoueur.id) {
                return item;
              }

              if (businessError.toLowerCase().includes("en attente")) {
                return { ...item, hasPendingRequestFromThisSalon: true };
              }

              return { ...item, isAlreadyInTeam: true };
            })
          );
        }

        return;
      }

      toast.success(result.message || "Demande envoyée avec succès.");
      setSearchResults((prev) =>
        prev.map((item) =>
          item.id === tatoueur.id
            ? { ...item, hasPendingRequestFromThisSalon: true }
            : item
        )
      );
      setInviteMessage("");
    } catch (inviteErr) {
      console.error("Erreur envoi demande équipe:", inviteErr);
      toast.error("Une erreur est survenue lors de l'envoi de la demande.");
    } finally {
      setInvitingTatoueurId(null);
    }
  };

  return (
    <div className="w-full rounded-3xl border border-white/10 bg-white/4 p-3 sm:p-4">
      <h3 className="mb-2 text-[14px] font-semibold tracking-wide text-white font-one">
        Inviter un tatoueur déjà inscrit
      </h3>
      <p className="mb-3 text-[11px] text-white/65 font-one">
        Recherchez un tatoueur inscrit par nom, prénom ou email.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearchRegisteredTatoueurs();
            }
          }}
          placeholder="Ex: julie, martin, email@..."
          className="w-full rounded-2xl border border-white/10 bg-white/6 px-3 py-2 text-xs text-white placeholder:text-white/35 focus:border-tertiary-400/40 focus:outline-none font-one"
        />
        <button
          type="button"
          onClick={handleSearchRegisteredTatoueurs}
          disabled={isSearchingTatoueurs}
          className="cursor-pointer rounded-2xl bg-gradient-to-r from-tertiary-400 to-tertiary-500 px-4 py-2 text-xs text-white font-one transition-all duration-200 hover:from-tertiary-500 hover:to-tertiary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSearchingTatoueurs ? "Recherche..." : "Rechercher"}
        </button>
      </div>

      <div className="mt-2">
        <input
          value={inviteMessage}
          onChange={(e) => setInviteMessage(e.target.value)}
          placeholder="Message optionnel à joindre à la demande"
          className="w-full rounded-2xl border border-white/10 bg-white/6 px-3 py-2 text-xs text-white placeholder:text-white/35 focus:border-tertiary-400/40 focus:outline-none font-one"
        />
      </div>

      {searchError && (
        <p className="mt-2 text-xs text-red-300 font-one">{searchError}</p>
      )}

      {hasSearched && !searchError && searchResults.length === 0 && (
        <p className="mt-3 text-xs text-white/60 font-one">
          Aucun tatoueur inscrit trouvé pour cette recherche.
        </p>
      )}

      {searchResults.length > 0 && (
        <div className="mt-3 space-y-2">
          {searchResults.map((tatoueur) => {
            const fullName = `${tatoueur.firstName || ""} ${tatoueur.lastName || ""}`.trim();
            const displayName = fullName || tatoueur.salonName || tatoueur.email;
            const canInvite =
              !tatoueur.isAlreadyInTeam &&
              !tatoueur.hasPendingRequestFromThisSalon;

            return (
              <article
                key={tatoueur.id}
                className="rounded-2xl border border-white/10 bg-white/6 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-white/10">
                      {tatoueur.image ? (
                        <Image
                          src={tatoueur.image}
                          alt={displayName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-white/50 font-one">
                          T
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm text-white font-one">{displayName}</p>
                      <p className="truncate text-[11px] text-white/55 font-one">
                        {tatoueur.email}
                      </p>
                      <p className="truncate text-[11px] text-white/45 font-one">
                        Instagram : {tatoueur.instagram || "Non renseigné"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    {tatoueur.isAlreadyInTeam && (
                      <span className="rounded-full border border-emerald-500/35 bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300 font-one">
                        Déjà dans l&apos;équipe
                      </span>
                    )}
                    {tatoueur.hasPendingRequestFromThisSalon && (
                      <span className="rounded-full border border-amber-500/35 bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-300 font-one">
                        Demande en attente
                      </span>
                    )}

                    <button
                      type="button"
                      disabled={!canInvite || invitingTatoueurId === tatoueur.id}
                      onClick={() => handleInviteTatoueur(tatoueur)}
                      className="cursor-pointer rounded-2xl border border-tertiary-500/40 bg-tertiary-500/15 px-3 py-1.5 text-[11px] text-white font-one transition-colors hover:bg-tertiary-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {invitingTatoueurId === tatoueur.id
                        ? "Envoi..."
                        : "Envoyer une demande"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
