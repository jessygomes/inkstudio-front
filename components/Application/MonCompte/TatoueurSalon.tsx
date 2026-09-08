"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Users, CalendarCheck, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { extractUploadThingKey } from "@/lib/utils/uploadImg/extractUploadThingKey";
import {
  deleteTatoueurAction,
  unlinkLinkedTatoueurAction,
  updateLinkedTatoueurAppointmentBookingAction,
} from "@/lib/queries/tatoueur";
import { TatoueurProps } from "@/lib/type"; // Utiliser le type centralisé
import DashboardButton from "@/components/Shared/DashboardButton";

type TeamTatoueur = TatoueurProps & {
  canBeEditedBySalon?: boolean;
  isLinkedAccount?: boolean;
  isLinkedUser?: boolean;
  isReadOnly?: boolean;
  linkedUserId?: string;
  tatoueurUserId?: string;
  role?: string;
  image?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  appointmentBookingEnabled?: boolean;
};

const isAppointmentBookingEnabled = (tatoueur: TeamTatoueur) => {
  if (typeof tatoueur.appointmentBookingEnabled === "boolean") {
    return tatoueur.appointmentBookingEnabled;
  }

  return Boolean(tatoueur.rdvBookingEnabled);
};

const isReadOnlyLinkedTatoueur = (tatoueur: TeamTatoueur) => {
  if (tatoueur.canBeEditedBySalon === false) return true;
  if (tatoueur.isLinkedAccount) return true;
  if (tatoueur.isReadOnly) return true;
  if (tatoueur.isLinkedUser) return true;
  if (tatoueur.linkedUserId || tatoueur.tatoueurUserId) return true;
  if (tatoueur.role === "user_tatoueur") return true;
  return false;
};

export default function TatoueurSalon({
  tatoueurs,
}: {
  tatoueurs: TatoueurProps[];
  salonId: string;
  salonHours: string | null;
}) {
  const [selectedTatoueur, setSelectedTatoueur] =
    useState<TeamTatoueur | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUnlinkingById, setIsUnlinkingById] = useState<Record<string, boolean>>({});
  const [isUpdatingRdvById, setIsUpdatingRdvById] = useState<Record<string, boolean>>({});
  const [teamTatoueurs, setTeamTatoueurs] = useState<TeamTatoueur[]>(
    (tatoueurs as TeamTatoueur[]) || []
  );

  // Met à jour la liste des tatoueurs lorsque la prop tatoueurs change
  useEffect(() => {
    setTeamTatoueurs((tatoueurs as TeamTatoueur[]) || []);
  }, [tatoueurs]);

  // Fonction pour supprimer un fichier d'UploadThing
  const deleteFromUploadThing = async (fileKey: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/uploadthing/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileKeys: [fileKey],
        }),
      });

      if (!response.ok) {
        console.error(
          "Erreur lors de la suppression UploadThing:",
          response.statusText
        );
        return false;
      }

      const result = await response.json();
      console.log("Suppression UploadThing réussie:", result);
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression UploadThing:", error);
      return false;
    }
  };

  // Gestion de la suppression d'un tatoueur
  const handleDeleteTatoueur = async () => {
    if (!selectedTatoueur) return;

    if (isReadOnlyLinkedTatoueur(selectedTatoueur as TeamTatoueur)) {
      toast.info("Ce profil est lié à un compte indépendant et ne peut pas être supprimé ici.");
      setIsDeleteModalOpen(false);
      setSelectedTatoueur(null);
      return;
    }

    setIsDeleting(true);

    try {
      const response = await deleteTatoueurAction(selectedTatoueur.id);

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du tatoueur");
      }

      // 2. Supprimer de UploadThing si l'image provient d'UploadThing
      if (selectedTatoueur.img && selectedTatoueur.img.includes("utfs.io")) {
        const fileKey = extractUploadThingKey(selectedTatoueur.img);
        if (fileKey) {
          const uploadThingDeleted = await deleteFromUploadThing(fileKey);
          if (!uploadThingDeleted) {
            console.warn(
              "Le tatoueur a été supprimé de la base de données mais pas d'UploadThing"
            );
            toast.warning(
              "Tatoueur supprimé mais fichier distant non supprimé"
            );
          }
        }
      }

      toast.success("Tatoueur supprimé avec succès");
      setTeamTatoueurs((prev) => prev.filter((item) => item.id !== selectedTatoueur.id));
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression du tatoueur");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setSelectedTatoueur(null);
    }
  };

  // Gestion du retrait d'un tatoueur lié
  const handleUnlinkLinkedTatoueur = async (tatoueur: TeamTatoueur) => {
    const linkedUserId = tatoueur.linkedUserId || tatoueur.tatoueurUserId;

    if (!linkedUserId) {
      toast.error("Impossible de retirer ce profil: identifiant lié introuvable.");
      return;
    }

    setIsUnlinkingById((prev) => ({ ...prev, [tatoueur.id]: true }));

    try {
      const result = await unlinkLinkedTatoueurAction(linkedUserId);

      if (!result.ok) {
        toast.error(result.message || "Retrait impossible.");
        return;
      }

      setTeamTatoueurs((prev) => prev.filter((item) => item.id !== tatoueur.id));
      toast.success(result.message || "Tatoueur retiré de l'équipe.");
    } catch (error) {
      console.error("Erreur lors du retrait du tatoueur lié:", error);
      toast.error("Une erreur est survenue lors du retrait.");
    } finally {
      setIsUnlinkingById((prev) => ({ ...prev, [tatoueur.id]: false }));
    }
  };

  // Compte le nombre de tatoueurs avec la prise de rendez-vous activée
  const rdvEnabledCount = teamTatoueurs.filter(
    (tatoueur) => isAppointmentBookingEnabled(tatoueur)
  ).length;

  // Gestion de l'activation/désactivation de la prise de rendez-vous pour un tatoueur
  const handleToggleLinkedTatoueurRdv = async (tatoueur: TeamTatoueur) => {
    const linkedUserId = tatoueur.linkedUserId || tatoueur.tatoueurUserId;

    if (!linkedUserId) {
      toast.error("Impossible de modifier le RDV: identifiant lie introuvable.");
      return;
    }

    const nextValue = !isAppointmentBookingEnabled(tatoueur);
    setIsUpdatingRdvById((prev) => ({ ...prev, [tatoueur.id]: true }));

    try {
      const result = await updateLinkedTatoueurAppointmentBookingAction(
        linkedUserId,
        nextValue
      );

      if (!result.ok) {
        toast.error(result.message || "Mise a jour RDV impossible.");
        return;
      }

      setTeamTatoueurs((prev) =>
        prev.map((item) =>
          item.id === tatoueur.id
            ? {
                ...item,
                appointmentBookingEnabled: nextValue,
                rdvBookingEnabled: nextValue,
              }
            : item
        )
      );

      toast.success(
        result.message ||
          (nextValue
            ? "Prise de RDV activee pour ce tatoueur."
            : "Prise de RDV desactivee pour ce tatoueur.")
      );
    } catch (error) {
      console.error("Erreur lors du changement d'etat RDV:", error);
      toast.error("Une erreur est survenue lors de la mise a jour RDV.");
    } finally {
      setIsUpdatingRdvById((prev) => ({ ...prev, [tatoueur.id]: false }));
    }
  };

  return (
    <div className="w-full flex flex-col font-one [&_button]:min-h-11 [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-tertiary-400 [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-tertiary-400">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3">
            <Users size={21} className="text-tertiary-400" aria-hidden="true" />
            <div><p className="text-lg font-semibold text-white">{teamTatoueurs.length}<span className="ml-2 text-sm font-normal text-white/60">artiste{teamTatoueurs.length > 1 ? "s" : ""}</span></p></div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3">
            <CalendarCheck size={21} className="text-emerald-300" aria-hidden="true" />
            <p className="text-sm text-white/60"><span className="mr-2 text-lg font-semibold text-white">{rdvEnabledCount}</span>avec réservation active</p>
          </div>
        </div>
        <DashboardButton href="/mon-compte/ajouter-tatoueur" >
          <Plus size={17} aria-hidden="true" />Ajouter un tatoueur
        </DashboardButton>
      </div>
      {/* Liste des tatoueurs */}
      {teamTatoueurs.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2 2xl:grid-cols-3">
          {teamTatoueurs.map((tatoueur) => {
            const isReadOnly = isReadOnlyLinkedTatoueur(tatoueur);
            const derivedName = `${tatoueur.firstName || ""} ${tatoueur.lastName || ""}`.trim();
            const displayName = tatoueur.name || derivedName || tatoueur.email || "Tatoueur";
            const displayImage = tatoueur.img || tatoueur.image;
            const isUnlinking = Boolean(isUnlinkingById[tatoueur.id]);
            const isUpdatingRdv = Boolean(isUpdatingRdvById[tatoueur.id]);
            const rdvEnabled = isAppointmentBookingEnabled(tatoueur);

            return (
              <article
                key={tatoueur.id}
                className="min-w-0 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.015] p-4 flex flex-col gap-3"
              >
                {/* Identité */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tertiary-400/25 to-tertiary-500/20 border border-tertiary-400/25 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {displayImage ? (
                      <Image
                        src={displayImage}
                        alt={displayName}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-tertiary-300 font-bold font-one text-sm">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="min-w-0 break-words text-white font-one text-base font-semibold">
                        {displayName}
                      </h4>
                      {rdvEnabled ? (
                        <span className="shrink-0 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300">
                          Réservation active
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/55">
                          Réservation inactive
                        </span>
                      )}
                    </div>
                    <p className="text-white/60 font-two text-xs leading-5 mt-1 break-words line-clamp-2">
                      {tatoueur.description || "Aucune description"}
                    </p>
                    {(tatoueur.phone || tatoueur.instagram?.trim()) && (
                      <div className="mt-2 flex items-center gap-3 text-xs text-white/60">
                        {tatoueur.phone && (
                          <a href={`tel:${tatoueur.phone}`} className="inline-flex min-w-0 items-center gap-1.5 py-1 hover:text-white">
                            <Phone size={12} className="shrink-0" aria-hidden="true" /><span className="truncate">{tatoueur.phone}</span>
                          </a>
                        )}
                        {tatoueur.instagram?.trim() && (
                          <a
                            href={/^https?:\/\//i.test(tatoueur.instagram.trim())
                              ? tatoueur.instagram.trim()
                              : /^(www\.)?instagram\.com\//i.test(tatoueur.instagram.trim())
                                ? `https://${tatoueur.instagram.trim()}`
                                : `https://www.instagram.com/${tatoueur.instagram.trim().replace(/^@/, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 py-1 hover:text-white hover:underline"
                          >
                            Instagram<span className="sr-only"> (nouvel onglet)</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 border-t border-white/8 pt-3 sm:grid-cols-2">
                  {[
                    { title: "Compétences", values: tatoueur.skills, empty: "Aucune compétence renseignée" },
                    { title: "Styles", values: tatoueur.style, empty: "Aucun style renseigné" },
                  ].map(({ title, values, empty }) => (
                    <div key={title} className="min-w-0">
                      <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">{title}</h5>
                      {values?.length ? (
                        <div className="flex flex-wrap gap-1.5">{values.map(value => <span key={value} className="max-w-full break-words rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/75">{value}</span>)}</div>
                      ) : <p className="text-sm text-white/45">{empty}</p>}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 mt-auto border-t border-white/10 pt-3">
                  {isReadOnly ? (
                    <div className="flex w-full flex-wrap items-center gap-2">
                      <span className="w-full mb-1 text-xs leading-5 text-sky-200/75">
                        Compte indépendant · Lecture seule
                      </span>
                      <button
                        type="button"
                        disabled={isUpdatingRdv}
                        aria-pressed={rdvEnabled}
                        onClick={() => handleToggleLinkedTatoueurRdv(tatoueur)}
                        className={`!min-h-8 cursor-pointer rounded-lg border px-2.5 py-1 text-xs transition-colors font-one disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${
                          rdvEnabled
                            ? "border-emerald-500/20 text-emerald-300/80 hover:bg-emerald-500/10 hover:text-emerald-300"
                            : "border-white/10 text-white/65 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {isUpdatingRdv
                          ? "Mise à jour…"
                          : rdvEnabled
                            ? "Désactiver les RDV"
                            : "Activer les RDV"}
                      </button>
                      <button
                        type="button"
                        disabled={isUnlinking}
                        onClick={() => handleUnlinkLinkedTatoueur(tatoueur)}
                        className="!min-h-8 cursor-pointer rounded-lg border border-transparent px-2.5 py-1 text-xs text-white/50 transition-colors hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-300 font-one disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUnlinking ? "Retrait..." : "Retirer"}
                      </button>
                    </div>
                  ) : (
                    <>
                      <Link
                        href={`/mon-compte/ajouter-tatoueur?id=${tatoueur.id}`}
                        className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-xs text-white/65 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <Pencil size={12} aria-hidden="true" />Modifier
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedTatoueur(tatoueur);
                          setIsDeleteModalOpen(true);
                        }}
                        className="!min-h-8 cursor-pointer rounded-lg border border-transparent px-2.5 py-1 text-xs text-white/50 transition-colors hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-300 font-one"
                      >
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-8 sm:p-12 text-center">
          <p className="text-white font-one text-base sm:text-lg font-semibold">
            Aucun tatoueur ajouté
          </p>
          <p className="text-white/60 font-two text-sm mt-1.5">
            Ajoutez votre premier profil pour commencer la gestion de l&apos;équipe.
          </p>
          <Link
            href="/mon-compte/ajouter-tatoueur"
            className="inline-flex mt-4 rounded-[14px] px-5 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white transition-all duration-300 font-medium font-one text-xs"
          >
            Ajouter le premier tatoueur
          </Link>
        </div>
      )}

      {/* Modale de suppression */}
      {isDeleteModalOpen && selectedTatoueur && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="dashboard-embedded-panel rounded-2xl w-full max-w-md max-h-[95vh] sm:max-h-none overflow-y-auto border border-white/20 shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-white/10 bg-white/5">
              <p className="text-white/50 font-one text-[10px] uppercase tracking-wider">
                Confirmation
              </p>
              <h2 className="text-white font-one text-base sm:text-lg font-semibold mt-1">
                Supprimer ce tatoueur
              </h2>
              <p className="text-white/60 font-two text-xs mt-1">
                Cette action est définitive et retirera aussi la photo distante.
              </p>
            </div>

            <div className="p-4 sm:p-5 space-y-3">
              <div className="rounded-xl border border-white/10 bg-white/4 p-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-tertiary-400/25 to-tertiary-500/20 border border-tertiary-400/25 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {selectedTatoueur.img ? (
                      <Image
                        src={selectedTatoueur.img}
                        alt={selectedTatoueur.name}
                        width={44}
                        height={44}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-tertiary-300 font-bold font-one text-sm">
                        {selectedTatoueur.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-one text-sm font-medium truncate">
                      {selectedTatoueur.name}
                    </p>
                    {selectedTatoueur.description && (
                      <p className="text-white/50 text-xs line-clamp-2 mt-0.5">
                        {selectedTatoueur.description}
                      </p>
                    )}
                    {selectedTatoueur.phone && (
                      <p className="text-white/60 text-xs mt-1">
                        {selectedTatoueur.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-white/80 text-sm">
                Confirmer la suppression de <strong>{selectedTatoueur.name}</strong>
                ?
              </p>
            </div>

            <div className="dashboard-embedded-footer p-4 sm:p-5 border-t border-white/10 flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedTatoueur(null);
                }}
                disabled={isDeleting}
                className="cursor-pointer rounded-[14px] border border-white/20 bg-white/10 px-4 py-2 text-xs text-white transition-colors hover:bg-white/20 font-medium font-one disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteTatoueur}
                disabled={isDeleting}
                className="cursor-pointer rounded-[14px] bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-4 py-2 text-white transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>Suppression...</span>
                  </>
                ) : (
                  <span>Supprimer</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
