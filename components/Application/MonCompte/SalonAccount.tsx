/* eslint-disable react/no-unescaped-entities */
"use client";

import { useUser } from "@/components/Auth/Context/UserContext";
import { SalonUserProps } from "@/lib/type";
import { CSSProperties, useEffect, useState } from "react";
import Horaire from "./Horaire";
import InfoSalon from "./InfoSalon";
import TatoueurSalon from "./TatoueurSalon";
import { CgProfile } from "react-icons/cg";
import BarLoader from "react-spinners/BarLoader";

export default function SalonAccount() {
  const user = useUser();
  const salonId = user?.id;

  const [salon, setSalon] = useState<SalonUserProps>();
  const [isHoursVisible, setIsHoursVisible] = useState(false);

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

  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "none",
  };
  const color = "#ff5500";

  if (!salon) {
    return (
      <div className="text-white mx-auto h-screen flex items-center justify-center">
        {" "}
        <BarLoader
          color={color}
          loading={!salon}
          cssOverride={override}
          // size={150}
          width={300}
          height={5}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    );
  }

  //! HORAIRES D'OUVERTURE
  return (
    <div className="flex flex-col gap-8">
      <div className="">
        <div className="w-full bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg pb-4 border-b border-white/20">
          <h1 className="text-3xl font-bold text-white font-one tracking-wide text-center">
            Mon Compte
          </h1>
          <p className="text-white/70 text-sm font-one text-center mt-2">
            Gérez les informations de votre salon, les horaires d'ouverture et
            les tatoueurs associés.
          </p>
        </div>
      </div>
      <section className="w-full space-y-12 px-20">
        {/* Section INFO SALON avec design moderne */}
        <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
              <CgProfile size={30} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white font-one tracking-wide">
              Informations du salon
            </h2>
          </div>
          <InfoSalon salon={salon} />
        </div>

        {/* Section HORAIRES avec design moderne */}
        <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🕒</span>
            </div>
            <h2 className="text-2xl font-bold text-white font-one tracking-wide">
              Horaires d'ouverture
            </h2>
          </div>
          <Horaire
            isHoursVisible={isHoursVisible}
            setIsHoursVisible={setIsHoursVisible}
            hours={salon.salonHours}
            salonId={salonId || ""}
          />
        </div>

        {/* Ligne de séparation moderne */}
        {/* <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-gradient-to-r from-noir-700 to-noir-800 px-6 py-2 rounded-full border border-white/20">
              <span className="text-white/70 text-sm font-two">💫</span>
            </div>
          </div>
        </div> */}

        {/* Section TATOUEURS avec design moderne */}
        <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
          <TatoueurSalon
            tatoueurs={salon.Tatoueur}
            salonId={salonId || ""}
            salonHours={salon.salonHours || ""}
          />
        </div>
      </section>
    </div>
  );
}
