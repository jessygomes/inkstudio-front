/* eslint-disable react/no-unescaped-entities */
"use client";

import { useUser } from "@/components/Auth/Context/UserContext";
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

export default function SalonAccount() {
  const user = useUser();
  const salonId = user?.id;

  const [salon, setSalon] = useState<SalonUserProps>();
  const [isHoursVisible, setIsHoursVisible] = useState(true);

  useEffect(() => {
    const fetchSalon = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/users/${salonId}`,
          {
            method: "GET",
          }
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
      <section className="w-full">
        <div className="mb-6 flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-tertiary-400/30 rounded-full flex items-center justify-center ">
              <IoBusinessOutline
                size={28}
                className="text-tertiary-400 animate-pulse"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-one tracking-wide uppercase mb-1">
                Mon Compte
              </h1>
              <p className="text-white/60 text-xs font-one">
                Gérez les infos du salon, horaires, équipe et galerie.
              </p>
            </div>
          </div>
        </div>
        <div className="w-full flex items-center justify-center py-20">
          <div className="w-full rounded-2xl p-10 flex flex-col items-center justify-center gap-6 mx-auto">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tertiary-400 mx-auto mb-4"></div>
            <p className="text-white/60 font-two text-xs text-center">
              Chargement des informations...
            </p>
          </div>
        </div>
      </section>
    );
  }

  //! HORAIRES D'OUVERTURE
  return (
    <section className="w-full">
      <div className="">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-tertiary-400/30 rounded-full flex items-center justify-center ">
              <IoBusinessOutline
                size={28}
                className="text-tertiary-400 animate-pulse"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-one tracking-wide uppercase mb-1">
                Mon Compte
              </h1>
              <p className="text-white/60 text-xs font-one">
                Gérez les infos du salon, horaires, équipe et galerie.
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="space-y-6 mx-auto">
          {/* Section INFO SALON */}
          <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-xl p-8 border border-white/20 shadow-2xl">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="flex gap-2 items-center text-sm text-white mb-3 font-one uppercase tracking-widest">
                <IoBusinessOutline /> Informations du salon
              </h3>
              <InfoSalon salon={salon} />
            </div>
          </div>

          {/* Section HORAIRES */}
          <div className="w-full bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="flex gap-2 items-center text-sm text-white mb-3 font-one uppercase tracking-widest">
                <TbClockHour5 size={20} /> Horaires d'ouverture
              </h3>
              <Horaire
                isHoursVisible={isHoursVisible}
                setIsHoursVisible={setIsHoursVisible}
                hours={salon.salonHours}
                salonId={salonId || ""}
              />
            </div>
          </div>

          {/* Section TATOUEURS */}
          <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="flex gap-2 items-center text-sm text-white mb-3 font-one uppercase tracking-widest">
                <PiUsersLight size={20} /> Équipe de tatoueurs
              </h3>
              <TatoueurSalon
                tatoueurs={salon.Tatoueur}
                salonId={salonId || ""}
                salonHours={salon.salonHours || ""}
              />
            </div>
          </div>

          {/* Section PHOTOS */}
          <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="flex gap-2 items-center text-sm text-white mb-3 font-one uppercase tracking-widest">
                <HiOutlinePhotograph size={20} /> Galerie photos
              </h3>
              <SalonPhoto />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
