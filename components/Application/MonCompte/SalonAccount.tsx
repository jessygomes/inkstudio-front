/* eslint-disable react/no-unescaped-entities */
"use client";

import { useUser } from "@/components/Auth/Context/UserContext";
import { SalonUserProps } from "@/lib/type";
import { CSSProperties, useEffect, useState } from "react";
import Horaire from "./Horaire";
import InfoSalon from "./InfoSalon";
import TatoueurSalon from "./TatoueurSalon";
import BarLoader from "react-spinners/BarLoader";
import SalonPhoto from "./SalonPhoto";

import { IoBusinessOutline } from "react-icons/io5";
import { TbClockHour5 } from "react-icons/tb";
import { PiUsersLight } from "react-icons/pi";
import { HiOutlinePhotograph } from "react-icons/hi";

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
    <div className="min-h-screen w-full bg-noir-700">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <div className="w-full bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg p-6 border-b border-white/20">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-white font-one tracking-wide">
                Mon Compte
              </h1>
              <p className="text-white/70 text-sm">
                Gérez les informations de votre salon, les horaires d'ouverture
                et les tatoueurs associés
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Section INFO SALON */}
          <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="flex gap-2 items-center text-sm text-white mb-3 font-one uppercase tracking-widest">
                <IoBusinessOutline /> Informations du salon
              </h3>
              <InfoSalon salon={salon} />
            </div>
          </div>

          {/* Section HORAIRES */}
          <div className="bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
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
    </div>
  );
}
//           />
//         </div>
//       </section>
//     </div>
//   );
// }
