"use client";

import { useSession } from "next-auth/react";
import { SalonUserProps } from "@/lib/type";
import { useEffect, useState } from "react";
import Horaire from "./Horaire";
import InfoSalon from "./InfoSalon";
import TatoueurSalon from "./TatoueurSalon";
import SalonPhoto from "./SalonPhoto";
import IndependentTeamSection from "./IndependentTeamSection";

import { IoBusinessOutline } from "react-icons/io5";
import { TbClockHour5 } from "react-icons/tb";
import { PiUsersLight } from "react-icons/pi";
import { HiOutlinePhotograph } from "react-icons/hi";
import PageHeader from "@/components/Shared/PageHeader";
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
        const response = await fetch(
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
        <PageHeader
          icon={<IoBusinessOutline size={15} className="text-tertiary-400" />}
          title="Mon Compte"
        />
        <AccountSkeleton />
      </section>
    );
  }

  const accountSections = [
    { id: "profil", label: "Profil", icon: <IoBusinessOutline /> },
    { id: "horaires", label: "Horaires", icon: <TbClockHour5 /> },
    {
      id: "equipe",
      label: isIndependentAccount ? "Mes salons" : "Équipe",
      icon: <PiUsersLight />,
    },
    { id: "galerie", label: "Galerie", icon: <HiOutlinePhotograph /> },
  ];

  return (
    <section className="mx-auto w-full space-y-6 pb-6 [&_button]:min-h-10 [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-4 [&_a]:focus-visible:outline-tertiary-400 [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-4 [&_button]:focus-visible:outline-tertiary-400">
      <header className="lg:flex lg:items-end lg:justify-between lg:gap-8">
        <div>
          {/* <p className="mb-2 text-xs font-one uppercase tracking-[0.2em] text-tertiary-400">Mon espace professionnel</p> */}
          <h1 className="text-2xl font-one font-semibold text-white sm:text-3xl">Mon compte</h1>
          <p className="mt-2 text-sm text-white/60">Votre identité, votre organisation et votre vitrine, au même endroit.</p>
        </div>
        <nav aria-label="Rubriques du compte" className="hidden shrink-0 gap-1 overflow-x-auto border-b border-white/10 sm:border-0 pb-2 lg:flex">
          {accountSections.map(({ id, label, icon }) => (
            <a key={id} href={`#${id}`} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-tertiary-400">{icon}{label}</a>
          ))}
        </nav>
      </header>
      <nav aria-label="Rubriques du compte" className="flex gap-1 overflow-x-auto border-b border-white/10 pb-2 lg:hidden">
        {accountSections.map(({ id, label, icon }) => (
          <a key={id} href={`#${id}`} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-tertiary-400">{icon}{label}</a>
        ))}
      </nav>
      <div id="profil" className="scroll-mt-6"><InfoSalon salon={salon} /></div>
      <AccountSection id="horaires" title="Horaires & disponibilités" description="Organisez votre semaine et gérez vos absences.">
        <Horaire hours={salon.salonHours} salonId={salonId || ""} />
      </AccountSection>
      {isIndependentAccount ? (
        <div id="equipe" className="scroll-mt-6 space-y-6"><IndependentTeamSection /></div>
      ) : (
        <AccountSection id="equipe" title="Votre équipe" description="Retrouvez vos artistes et gérez leurs réservations.">
          <TatoueurSalon tatoueurs={teamTatoueurs} salonId={salonId || ""} salonHours={salon.salonHours || ""} />
        </AccountSection>
      )}
      <AccountSection id="galerie" title="La vie du salon en images" description="Donnez envie de pousser votre porte avec une galerie qui vous ressemble.">
        <SalonPhoto />
      </AccountSection>
    </section>
  );
}

function AccountSection({ id, title, description, children }: {
  id: string; title: string; description: string; children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={id + "-title"} className="scroll-mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
      <header className="border-b border-white/8 p-5 sm:px-6">
        <h2 id={id + "-title"} className="text-lg font-one font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-white/60">{description}</p>
      </header>
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  );
}
