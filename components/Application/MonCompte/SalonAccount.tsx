"use client";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

import { useSession } from "next-auth/react";
import { SalonUserProps } from "@/lib/type";
import { useEffect, useState } from "react";
import RdvActionButton from "@/components/Application/RDV/RdvActionButton";
import { CalendarClock, Gem, Plus } from "lucide-react";
import Horaire from "./Horaire";
import InfoSalon from "./InfoSalon";
import TatoueurSalon from "./TatoueurSalon";
import SalonPhoto from "./SalonPhoto";
import IndependentTeamSection from "./IndependentTeamSection";

import AccountSkeleton from "@/components/Skeleton/AccountSkeleton";
import { getTatoueursByUserIdAction } from "@/lib/queries/tatoueur";
import { TatoueurProps } from "@/lib/type";

export default function SalonAccount() {
  const { data: session } = useSession();
  const salonId = session?.user?.id;
  const isIndependentAccount = session?.user?.role === "user_tatoueur";

  const [salon, setSalon] = useState<SalonUserProps>();
  const [teamTatoueurs, setTeamTatoueurs] = useState<TatoueurProps[]>([]);

  useEffect(() => {
    const fetchSalon = async () => {
      try {
        const response = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/users/${salonId}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setSalon(data);
      } catch (error) {
        console.error("Error fetching salon data:", error);
      }
    };

    if (salonId) {
      fetchSalon();
    }
  }, [salonId]);

  useEffect(() => {
    const fetchTeamTatoueurs = async () => {
      if (!salonId || isIndependentAccount) return;

      const result = await getTatoueursByUserIdAction(salonId);

      if (!result.ok) {
        console.error("Erreur récupération équipe tatoueurs:", result.message);
        return;
      }

      setTeamTatoueurs((result.data || []) as TatoueurProps[]);
    };

    fetchTeamTatoueurs();
  }, [salonId, isIndependentAccount]);


  if (!salon) {
    return (
      <section className="w-full space-y-3">
        <AccountTitle />
        <AccountSkeleton />
      </section>
    );
  }

  const paidAccount = session?.user?.saasPlan === "PRO" || session?.user?.saasPlan === "BUSINESS";

  return (
    <section className="mx-auto w-full space-y-6 pb-6 font-one [&_button]:min-h-10 [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-4 [&_a]:focus-visible:outline-tertiary-400 [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-4 [&_button]:focus-visible:outline-tertiary-400">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <AccountTitle />

        {paidAccount && <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <RdvActionButton href="/mon-compte/rendez-vous" tone="neutral" icon={CalendarClock} className="flex-1 sm:!w-auto sm:flex-none">Rendez-vous</RdvActionButton>
          {salon.prestations?.includes("PIERCING") && <RdvActionButton href="/mon-compte/piercing" tone="neutral" icon={Gem} className="flex-1 sm:!w-auto sm:flex-none">Piercing</RdvActionButton>}
        </div>}

      </header>
      <div id="profil" className="scroll-mt-6">
        <InfoSalon salon={salon} />
      </div>
      <AccountSection
        id="horaires"
        title="Horaires & disponibilités"
        description="Organisez votre semaine et gérez vos absences."
        compact
        raised
      >
        <Horaire hours={salon.salonHours} salonId={salonId || ""} />
      </AccountSection>
      {isIndependentAccount ? (
        <div id="equipe" className="scroll-mt-6 space-y-6">
          <IndependentTeamSection />
        </div>
      ) : (
        <AccountSection
          id="equipe"
          title="Votre équipe"
          description="Retrouvez vos artistes et gérez leurs réservations."
          raised
          action={<RdvActionButton href="/mon-compte/ajouter-tatoueur" tone="primary" icon={Plus} className="!w-auto shrink-0">Ajouter un tatoueur</RdvActionButton>}
        >
          <TatoueurSalon
            tatoueurs={teamTatoueurs}
            salonId={salonId || ""}
            salonHours={salon.salonHours || ""}
          />
        </AccountSection>
      )}
      <AccountSection
        id="galerie"
        title="La vie du salon en images"
        description="Donnez envie de pousser votre porte avec une galerie qui vous ressemble."
      >
        <SalonPhoto />
      </AccountSection>
    </section>
  );
}

function AccountSection({
  id,
  title,
  description,
  children,
  compact = false,
  raised = false,
  action,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
  compact?: boolean;
  /** Fond un cran plus foncé que les autres sections (le deuxième noir le plus foncé). */
  raised?: boolean;
  /** Bouton affiché à droite du titre de la section. */
  action?: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={id + "-title"}
      className={"scroll-mt-6 overflow-hidden rounded-3xl " + (raised ? "bg-[var(--app-surface-raised)]" : "bg-noir-600")}
    >
      <header className={compact ? "px-4 pt-4 sm:px-5" : "px-5 pt-5 sm:px-6"}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2
              id={id + "-title"}
              className={compact ? "text-base font-one font-medium tracking-tight text-white" : "text-lg font-one font-medium tracking-tight text-white"}
            >
              {title}
            </h2>
            <p className={compact ? "mt-1 text-xs text-white/40" : "mt-1 text-sm text-white/60"}>{description}</p>
          </div>
          {action}
        </div>
      </header>
      <div className={compact ? "p-3 pt-4 sm:p-4 sm:pt-4" : "p-4 pt-5 sm:p-6 sm:pt-5"}>{children}</div>
    </section>
  );
}

function AccountTitle() {
  return <div className="font-one">
    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-tertiary-400">Votre studio</p>
    <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-white">Mon compte</h1>
    <p className="mt-1.5 text-xs text-white/45">Votre identité, votre organisation et votre vitrine, au même endroit.</p>
  </div>;
}
