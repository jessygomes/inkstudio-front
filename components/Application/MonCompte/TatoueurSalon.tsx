"use client";
import { useEffect, useState } from "react";
import { Plus, Users, CalendarCheck, Search, X } from "lucide-react";
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
import TeamMemberCard, { teamMemberName } from "./TeamMemberCard";

export type TeamTatoueur = TatoueurProps & {
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
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "bookable" | "linked">("all");
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

  const linkedCount = teamTatoueurs.filter(isReadOnlyLinkedTatoueur).length;
  const query = search.trim().toLocaleLowerCase("fr");
  const filteredTeam = teamTatoueurs.filter((member) => {
    const matchesFilter = filter === "all" || (filter === "bookable" ? isAppointmentBookingEnabled(member) : isReadOnlyLinkedTatoueur(member));
    const searchable = [teamMemberName(member), member.email, member.description, ...(member.style || []), ...(member.skills || [])].filter(Boolean).join(" ").toLocaleLowerCase("fr");
    return matchesFilter && (!query || searchable.includes(query));
  });

  return (
    <div className="w-full space-y-5 font-one [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed [&_a]:cursor-pointer [&_a:focus-visible]:outline-none [&_a:focus-visible]:ring-2 [&_a:focus-visible]:ring-tertiary-400 [&_button:focus-visible]:outline-none [&_button:focus-visible]:ring-2 [&_button:focus-visible]:ring-tertiary-400">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/45">
          <span className="inline-flex items-center gap-2"><Users size={15} className="text-white/35" /><strong className="text-base font-semibold text-white">{teamTatoueurs.length}</strong> artiste{teamTatoueurs.length > 1 ? "s" : ""}</span>
          <span className="inline-flex items-center gap-2"><CalendarCheck size={15} className="text-emerald-400/65" /><strong className="font-medium text-white/80">{rdvEnabledCount}</strong> avec réservation active</span>
        </div>
        <DashboardButton href="/mon-compte/ajouter-tatoueur" className="!min-w-0 !rounded-xl !shadow-none"><Plus size={15} />Ajouter un tatoueur</DashboardButton>
      </div>

      {teamTatoueurs.length > 0 ? <>
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/10 p-2.5 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block min-w-0 lg:w-72 xl:w-80"><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35" /><span className="sr-only">Rechercher un artiste ou une spécialité</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Un artiste, un style, une compétence…" className="h-10 w-full rounded-xl border border-white/10 bg-noir-700/70 py-2 pl-9 pr-3 text-xs text-white outline-none transition placeholder:text-white/30 focus:border-tertiary-400/60 focus:ring-2 focus:ring-tertiary-400/10" /></label>
          <div role="group" aria-label="Filtrer les artistes" className="flex flex-wrap gap-1">
            {([{ id: "all", label: "Toute l’équipe", count: teamTatoueurs.length }, { id: "bookable", label: "Réservation active", count: rdvEnabledCount }, { id: "linked", label: "Comptes liés", count: linkedCount }] as const).map((item) => <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)} className={"inline-flex min-h-9 items-center gap-2 rounded-lg px-3 py-2 text-[11px] transition " + (filter === item.id ? "bg-white/[0.08] text-white" : "text-white/45 hover:bg-white/[0.04] hover:text-white/80")}>{item.label}<span className={"rounded-md px-1.5 py-0.5 text-[10px] " + (filter === item.id ? "bg-white/10 text-white/75" : "bg-white/5 text-white/35")}>{item.count}</span></button>)}
          </div>
        </div>
        <p role="status" className="sr-only">{filteredTeam.length} artiste{filteredTeam.length > 1 ? "s" : ""} affiché{filteredTeam.length > 1 ? "s" : ""}</p>
        {filteredTeam.length ? <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {filteredTeam.map((member) => <TeamMemberCard key={member.id} member={member} linked={isReadOnlyLinkedTatoueur(member)} bookingEnabled={isAppointmentBookingEnabled(member)} updating={!!isUpdatingRdvById[member.id]} removing={!!isUnlinkingById[member.id]} onToggleBooking={() => void handleToggleLinkedTatoueurRdv(member)} onRemove={() => {
            if (isReadOnlyLinkedTatoueur(member)) { void handleUnlinkLinkedTatoueur(member); }
            else { setSelectedTatoueur(member); setIsDeleteModalOpen(true); }
          }} />)}
        </div> : <div className="rounded-2xl border border-white/10 bg-noir-600 px-5 py-12 text-center"><Search size={25} className="mx-auto mb-4 text-white/25" /><h3 className="text-sm font-medium text-white">Aucun artiste ne correspond</h3><p className="mt-2 text-xs text-white/40">Essayez un autre nom, une spécialité ou un autre filtre.</p><button type="button" onClick={() => { setSearch(""); setFilter("all"); }} className="mx-auto mt-5 inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/65 transition hover:bg-white/5"><X size={13} />Effacer les filtres</button></div>}
      </> : <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/15 bg-noir-600 px-5 py-12 text-center sm:py-16">
        <div className="mb-5 flex size-14 items-center justify-center rounded-2xl border border-tertiary-400/20 bg-tertiary-400/10 text-tertiary-400"><Users size={24} /></div>
        <h3 className="text-lg font-semibold tracking-tight text-white">Votre équipe commence ici</h3>
        <p className="mt-2 max-w-sm text-xs leading-6 text-white/45">Ajoutez votre premier artiste ou invitez un tatoueur déjà inscrit sur Inkera pour construire votre équipe.</p>
        <Link href="/mon-compte/ajouter-tatoueur" className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-xl bg-tertiary-400 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-tertiary-500"><Plus size={15} />Ajouter le premier tatoueur</Link>
      </div>}

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
