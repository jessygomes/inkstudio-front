"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ClientProps } from "@/lib/type";
import AppointmentSection from "./Fiche/AppointmentSection";
import BaseInfoSection from "./Fiche/BaseInfoSection";
import FollowUpSection from "./Fiche/FollowUpSection";
import MedicalHistorySection from "./Fiche/MedicalHistorySection";
import { MdOutlineRateReview } from "react-icons/md";
import { CiCalendarDate } from "react-icons/ci";
import { RiHealthBookLine } from "react-icons/ri";
import { FiFileText } from "react-icons/fi";
import DashboardButton from "@/components/Shared/DashboardButton";


interface InfoClientProps {
  client: ClientProps;
  isOpen: boolean;
  onClose: () => void;
  salonName?: string;
}
export default function InfoClient({
  client,
  isOpen,
  onClose,
}: InfoClientProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [topOffset, setTopOffset] = useState(0);
  const [bottomOffset, setBottomOffset] = useState(0);
  const [activeSection, setActiveSection] = useState<
    "appointments" | "followups" | "medical"
  >("appointments");

  useEffect(() => {
    setIsMounted(true);

    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    const computeOffsets = () => {
      const header = document.querySelector(
        "div.sticky.bg-noir-700.top-0.left-0.w-full.z-50",
      ) as HTMLElement | null;
      const mobileBottomNavbar = document.querySelector(
        "div.fixed.bottom-0.left-0.right-0.z-40",
      ) as HTMLElement | null;

      setTopOffset(header?.offsetHeight ?? 0);
      setBottomOffset(mobileBottomNavbar?.offsetHeight ?? 0);
    };

    computeOffsets();
    window.addEventListener("resize", computeOffsets);

    return () => {
      window.removeEventListener("resize", computeOffsets);
    };
  }, []);

  if (!isOpen || !client || !isMounted) return null;

  return createPortal(
    <div
      data-modal
      className="fixed left-0 right-0 z-[45] bg-noir-700 lg:bg-noir-700/60 lg:backdrop-blur-sm flex items-stretch justify-center overflow-hidden"
      style={{
        top: `${topOffset}px`,
        bottom: `${bottomOffset}px`,
      }}
    >
      <div className="bg-noir-500 rounded-none w-full h-full overflow-hidden flex flex-col border-0 min-h-0">
        {/* Header fixe responsive moderne */}
        <div className="relative bg-noir-700 to-transparent border-b border-white/10 px-6 pt-4 pb-2">
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white font-one tracking-wide truncate">
                Client - {client.firstName} {client.lastName}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer p-2 hover:bg-white/10 rounded-2xl transition-all duration-200 hover:rotate-90 ml-2 group"
            >
              <svg
                className="w-4 h-4 text-white/70 group-hover:text-white transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenu scrollable responsive */}
        <div className="flex-1 overflow-y-auto p-3 lg:p-6 min-h-0">
          <div className="space-y-3">
            {/* Informations de base */}
            <BaseInfoSection client={client} />

            {/* Sous-menu des sections client */}
            <div className="">
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-1">
                <button
                  onClick={() => setActiveSection("appointments")}
                  className={`rounded-xl px-3 py-2 text-xs font-one font-semibold uppercase tracking-wide transition-all duration-200 cursor-pointer flex gap-2 justify-center ${
                    activeSection === "appointments"
                      ? "bg-tertiary-500/20 text-tertiary-500 shadow-sm border border-tertiary-400/30"
                      : "bg-transparent text-white/55 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <CiCalendarDate size={18} className="text-white/55" />
                  RDV {client.appointments ? `(${client.appointments.length})` : ""}
                </button>
                <button
                  onClick={() => setActiveSection("followups")}
                  className={`rounded-xl px-3 py-2 text-xs font-one font-semibold uppercase tracking-wide transition-all duration-200 cursor-pointer flex gap-2 justify-center ${
                    activeSection === "followups"
                      ? "bg-tertiary-500/20 text-tertiary-500 shadow-sm border border-tertiary-400/30"
                      : "bg-transparent text-white/55 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <MdOutlineRateReview size={16} className="text-white/55" />
                  Suivis {client.FollowUpSubmission ? `(${client.FollowUpSubmission.length})` : ""}
                </button>
                <button
                  onClick={() => setActiveSection("medical")}
                  className={`rounded-xl px-3 py-2 text-xs font-one font-semibold uppercase tracking-wide transition-all duration-200 cursor-pointer flex gap-2 justify-center ${
                    activeSection === "medical"
                      ? "bg-tertiary-500/20 text-tertiary-500 shadow-sm border border-tertiary-400/30"
                      : "bg-transparent text-white/55 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <RiHealthBookLine size={16} className="text-white/55" />
                  Médical
                </button>
              </div>
            </div>

            {activeSection === "appointments" && (
              <AppointmentSection appointments={client.appointments} />
            )}

            {activeSection === "followups" && (
              <FollowUpSection followUpSubmissions={client.FollowUpSubmission} />
            )}

            {activeSection === "medical" && (
              <MedicalHistorySection medicalHistory={client.medicalHistory} />
            )}

          </div>
        </div>

        {/* Footer fixe responsive moderne */}
        <div className="p-3 px-8 border-t border-white/10 bg-gradient-to-r from-white/5 to-white/[0.02]">
          <div className="flex justify-end gap-3">
            <DashboardButton onClick={onClose} className="min-w-[120px] px-5 py-1.5 text-sm">
              Fermer
            </DashboardButton>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
