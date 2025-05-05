/* eslint-disable react/no-unescaped-entities */
"use client";

import { useUser } from "@/components/Auth/Context/UserContext";
import { SalonUserProps } from "@/lib/type";
import { useEffect, useState } from "react";
import Horaire from "./Horaire";
import InfoSalon from "./InfoSalon";
import TatoueurSalon from "./TatoueurSalon";

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

  if (!salon) {
    return <div className="text-white">Loading...</div>;
  }

  //! HORAIRES D'OUVERTURE

  return (
    <>
      <section className="w-full flex flex-col gap-8">
        {/* INFO SALON */}
        <InfoSalon salon={salon} />

        {/* HORAIRES */}
        <Horaire
          isHoursVisible={isHoursVisible}
          setIsHoursVisible={setIsHoursVisible}
          hours={salon.salonHours}
          salonId={salonId || ""}
        />

        <div className="h-[1px] w-full bg-white" />

        {/* TATOUERS */}
        <TatoueurSalon
          tatoueurs={salon.Tatoueur}
          salonId={salonId || ""}
          salonHours={salon.salonHours || ""}
        />
      </section>
    </>
  );
}
