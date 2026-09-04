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
import DashboardButton from "@/components/Shared/DashboardButton";
import { CalendarDays, ClipboardCheck, ShieldCheck, X } from "lucide-react";


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
    "infos" | "appointments" | "followups" | "medical"
  >("infos");

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
        <div className="relative border-b border-white/10 bg-noir-500 px-4 pb-3 pt-4 lg:px-6">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-5">
            <div className="flex min-w-0 items-start justify-between gap-4 xl:flex-1">
              <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-tertiary-400/30 bg-gradient-to-br from-tertiary-400/30 to-tertiary-500/15 shadow-lg">
                <span className="text-base font-bold text-white font-one">
                  {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-start">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-tertiary-400/80 font-one">
                  Fiche client
                </p>
                <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-bold tracking-tight text-white font-one">
                    {client.firstName} {client.lastName}
                  </h2>
                  <span className="client-header-count"><CalendarDays size={12} /> {client.appointments?.length ?? 0} RDV</span>
                  <span className="client-header-count"><ClipboardCheck size={12} /> {client.FollowUpSubmission?.length ?? 0} suivis</span>
                </div>
              </div>
              </div>

            </div>
            <div className="client-info-header-tabs scrollbar-hidden min-w-0 overflow-x-auto rounded-2xl border border-white/10 bg-black/15 p-1 xl:flex-1">
              <div className="flex min-w-max items-center gap-1">
                <ClientTab
                  active={activeSection === "infos"}
                  icon={<ClipboardCheck size={14} />}
                  label="Infos"
                  onClick={() => setActiveSection("infos")}
                />
                <ClientTab
                  active={activeSection === "appointments"}
                  icon={<CiCalendarDate size={16} />}
                  label={`RDV${client.appointments?.length ? ` ${client.appointments.length}` : ""}`}
                  onClick={() => setActiveSection("appointments")}
                />
                <ClientTab
                  active={activeSection === "followups"}
                  icon={<MdOutlineRateReview size={15} />}
                  label={`Suivis${client.FollowUpSubmission?.length ? ` ${client.FollowUpSubmission.length}` : ""}`}
                  onClick={() => setActiveSection("followups")}
                />
                <ClientTab
                  active={activeSection === "medical"}
                  icon={<RiHealthBookLine size={15} />}
                  label="Médical"
                  onClick={() => setActiveSection("medical")}
                />
              </div>
            </div>

            <button
                onClick={onClose}
                aria-label="Fermer la fiche client"
                className="group cursor-pointer rounded-xl border border-white/10 bg-white/[0.04] p-2 transition-colors hover:bg-white/10 xl:order-2"
              >
                <X size={16} className="text-white/60 transition-colors group-hover:text-white" />
            </button>
          </div>
        </div>

        {/* Contenu scrollable responsive */}
        <div className="flex-1 overflow-y-auto p-3 lg:p-6 min-h-0">
          <div className="w-full space-y-4">
            {activeSection === "infos" && <BaseInfoSection client={client} />}

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
        <div className="border-t border-white/10 bg-gradient-to-r from-noir-500 to-noir-700 p-2 px-4 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="hidden items-center gap-2 text-[10px] text-white/35 font-one sm:flex">
              <ShieldCheck size={14} className="text-emerald-300/70" /> Données client sécurisées
            </div>
            <DashboardButton onClick={onClose} className="ml-auto min-w-[110px] !rounded-xl px-5 py-1.5 text-sm">
              Fermer
            </DashboardButton>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ClientTab({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] transition-all duration-200 font-one sm:text-[11px] ${
        active
          ? "border border-tertiary-400/35 bg-tertiary-400/15 text-tertiary-400 shadow-[0_0_18px_rgba(199,159,139,0.12)]"
          : "border border-transparent text-white/45 hover:border-white/10 hover:bg-white/[0.06] hover:text-white/85"
      }`}
    >
      <span className={active ? "text-tertiary-400" : "text-white/40"}>{icon}</span>
      {label}
    </button>
  );
}
