"use client";

import { useSession } from "next-auth/react";
import { SalonUserProps } from "@/lib/type";
import { useEffect, useState } from "react";
import styles from "./AccountProfile.module.css";
import Horaire from "./Horaire";
import InfoSalon from "./InfoSalon";
import TatoueurSalon from "./TatoueurSalon";
import SalonPhoto from "./SalonPhoto";
import IndependentTeamSection from "./IndependentTeamSection";

import { IoBusinessOutline } from "react-icons/io5";
import { TbClockHour5 } from "react-icons/tb";
import { PiUsersLight } from "react-icons/pi";
import { HiOutlinePhotograph } from "react-icons/hi";
import AccountSkeleton from "@/components/Skeleton/AccountSkeleton";
import { getTatoueursByUserIdAction } from "@/lib/queries/tatoueur";
import { TatoueurProps } from "@/lib/type";

export default function SalonAccount() {
  const { data: session } = useSession();
  const salonId = session?.user?.id;
  const isIndependentAccount = session?.user?.role === "user_tatoueur";

  const [activeSection, setActiveSection] = useState("profil");
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

  useEffect(() => {
    if (!salon) return;
    const sections = ["profil", "horaires", "equipe", "galerie"].map(id => document.getElementById(id)).filter((element): element is HTMLElement => Boolean(element));
    const updateActive = () => {
      const current = sections.filter(section => section.getBoundingClientRect().top <= 180).at(-1);
      setActiveSection(current?.id || "profil");
    };
    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    return () => window.removeEventListener("scroll", updateActive);
  }, [salon]);

  if (!salon) {
    return (
      <section className="w-full space-y-3">
        <AccountTitle />
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
    <section className="mx-auto w-full space-y-6 pb-6 font-one [&_button]:min-h-10 [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-4 [&_a]:focus-visible:outline-tertiary-400 [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-4 [&_button]:focus-visible:outline-tertiary-400">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <AccountTitle />

      <nav
        aria-label="Rubriques du compte"
        className={styles.tabs}
      >
        {accountSections.map(({ id, label, icon }) => (
          <a
            key={id}
            href={`#${id}`}
            className={styles.tab}
            aria-current={activeSection === id ? "location" : undefined}
          >
            {icon}
            {label}
          </a>
        ))}
      </nav>
      </header>
      <div id="profil" className="scroll-mt-6">
        <InfoSalon salon={salon} />
      </div>
      <AccountSection
        id="horaires"
        title="Horaires & disponibilités"
        description="Organisez votre semaine et gérez vos absences."
        compact
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
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section
      id={id}
      aria-labelledby={id + "-title"}
      className="scroll-mt-6 overflow-hidden rounded-3xl border border-white/10 bg-noir-700"
    >
      <header className={compact ? "border-b border-white/[0.07] bg-white/[0.025] px-4 py-3 sm:px-5" : "border-b border-white/8 bg-white/[0.025] p-5 sm:px-6"}>
        <h2
          id={id + "-title"}
          className={compact ? "text-base font-one font-semibold tracking-tight text-white" : "text-lg font-one font-semibold text-white"}
        >
          {title}
        </h2>
        <p className={compact ? "mt-1 text-xs text-white/40" : "mt-1 text-sm text-white/60"}>{description}</p>
      </header>
      <div className={compact ? "p-3 sm:p-4" : "p-4 sm:p-6"}>{children}</div>
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
