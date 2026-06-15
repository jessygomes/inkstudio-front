/* eslint-disable react/no-unescaped-entities */
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

  return (
    <section className="w-full space-y-6">
      {/* <PageHeader
        icon={<IoBusinessOutline size={15} className="text-tertiary-400" />}
        title="Mon Compte"
      /> */}

      <div className="pt-3">
          <h3 className="flex gap-2 items-center text-sm text-white mb-3 font-one uppercase tracking-widest">
            {/* <IoBusinessOutline size={16} className="sm:w-5 sm:h-5" />{" "} */}
            {/* <span className="hidden sm:inline">Informations du salon</span>
            <span className="sm:hidden">Infos salon</span> */}
          </h3>
          <InfoSalon salon={salon} />
      </div>

      <div className="dashboard-embedded-panel p-3 sm:p-8">
          <h3 className="flex gap-2 items-center text-sm text-white mb-3 font-one uppercase tracking-widest">
            <TbClockHour5 size={16} className="sm:w-5 sm:h-5" />{" "}
            <span className="hidden sm:inline">Horaires d'ouverture</span>
            <span className="sm:hidden">Horaires</span>
          </h3>
          <Horaire
            hours={salon.salonHours}
            salonId={session?.user?.id || ""}
          />
      </div>

      {!isIndependentAccount && (
        <div className="dashboard-embedded-panel p-3 sm:p-8">
            <h3 className="flex gap-2 items-center text-sm text-white mb-3 font-one uppercase tracking-widest">
              <PiUsersLight size={16} className="sm:w-5 sm:h-5" />{" "}
              <span className="hidden sm:inline">Équipe de tatoueurs</span>
              <span className="sm:hidden">Tatoueurs</span>
            </h3>
            <TatoueurSalon
              tatoueurs={teamTatoueurs}
              salonId={session?.user?.id || ""}
              salonHours={salon.salonHours || ""}
            />
        </div>
      )}

          {isIndependentAccount && <IndependentTeamSection />}

      <div className="dashboard-embedded-panel p-3 sm:p-8">
          <h3 className="flex gap-2 items-center text-sm text-white mb-3 font-one uppercase tracking-widest">
            <HiOutlinePhotograph size={16} className="sm:w-5 sm:h-5" />{" "}
            <span className="hidden sm:inline">Galerie photos</span>
            <span className="sm:hidden">Photos</span>
          </h3>
          <SalonPhoto />
        </div>
    </section>
  );
}
