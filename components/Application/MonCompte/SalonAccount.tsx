/* eslint-disable react/no-unescaped-entities */
"use client";

import { useSession } from "next-auth/react";
import { SalonUserProps } from "@/lib/type";
import { useEffect, useState } from "react";
import Horaire from "./Horaire";
import InfoSalon from "./InfoSalon";
import TatoueurSalon from "./TatoueurSalon";
import SalonPhoto from "./SalonPhoto";

import { IoBusinessOutline } from "react-icons/io5";
import { TbClockHour5 } from "react-icons/tb";
import { PiUsersLight } from "react-icons/pi";
import { HiOutlinePhotograph } from "react-icons/hi";
import AccountSkeleton from "@/components/Skeleton/AccountSkeleton";

export default function SalonAccount() {
  const { data: session } = useSession();
  const salonId = session?.user?.id;

  const [salon, setSalon] = useState<SalonUserProps>();

  useEffect(() => {
    const fetchSalon = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/users/${salonId}`,
          {
            method: "GET",
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

  if (!salon) {
    return (
      <section className="w-full space-y-3">
        <div className="dashboard-hero flex flex-col gap-3 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-5 lg:py-2.5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-10 w-10 bg-tertiary-400/30 rounded-full flex items-center justify-center">
              <IoBusinessOutline
                size={18}
                className="text-tertiary-400 animate-pulse"
              />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white font-one tracking-wide uppercase mb-1">
                Mon Compte
              </h1>
              <p className="text-white/60 text-[11px] font-one">
                <span className="hidden sm:inline">
                  Gérez les infos du salon, horaires, équipe et galerie.
                </span>
                <span className="sm:hidden">Gérez votre salon</span>
              </p>
            </div>
          </div>
        </div>

        {/* Skeletons de chargement */}
        <AccountSkeleton />
      </section>
    );
  }

  return (
    <section className="w-full space-y-3">
      <div className="dashboard-hero flex flex-col gap-3 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-5 lg:py-2.5">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-10 w-10 bg-tertiary-400/30 rounded-full flex items-center justify-center">
            <IoBusinessOutline
              size={18}
              className="text-tertiary-400 animate-pulse"
            />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white font-one tracking-wide uppercase mb-1">
              Mon Compte
            </h1>
            <p className="text-white/60 text-[11px] font-one">
              <span className="hidden sm:inline">
                Gérez les infos du salon, horaires, équipe et galerie.
              </span>
              <span className="sm:hidden">Gérez votre salon</span>
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard-embedded-panel p-3 sm:p-8 bg-blue-500">
          <h3 className="flex gap-2 items-center text-sm text-white mb-3 font-one uppercase tracking-widest">
            <IoBusinessOutline size={16} className="sm:w-5 sm:h-5" />{" "}
            <span className="hidden sm:inline">Informations du salon</span>
            <span className="sm:hidden">Infos salon</span>
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

      <div className="dashboard-embedded-panel p-3 sm:p-8">
          <h3 className="flex gap-2 items-center text-sm text-white mb-3 font-one uppercase tracking-widest">
            <PiUsersLight size={16} className="sm:w-5 sm:h-5" />{" "}
            <span className="hidden sm:inline">Équipe de tatoueurs</span>
            <span className="sm:hidden">Tatoueurs</span>
          </h3>
          <TatoueurSalon
            tatoueurs={salon.Tatoueur}
            salonId={session?.user?.id || ""}
            salonHours={salon.salonHours || ""}
          />
      </div>

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
