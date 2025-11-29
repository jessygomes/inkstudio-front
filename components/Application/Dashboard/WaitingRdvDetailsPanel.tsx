"use client";
import WaitingRdvDetailsPanelMobile from "./WaitingRdvDetailsPanelMobile";
import WaitingRdvDetailsPanelDesktop from "./WaitingRdvDetailsPanelDesktop";
import { PendingAppointment } from "./WaitingRdv";

interface WaitingRdvDetailsPanelProps {
  selectedAppointment: PendingAppointment;
  onClose: () => void;
  handleRdvUpdated: (updatedId: string) => void;
  handlePaymentStatusChange: (rdvId: string, isPayed: boolean) => void;
  userId: string;
}

export default function WaitingRdvDetailsPanel({
  selectedAppointment,
  onClose,
  handleRdvUpdated,
  handlePaymentStatusChange,
  userId,
}: WaitingRdvDetailsPanelProps) {
  return (
    <>
      {/* Version Mobile */}
      <div className="lg:hidden">
        <WaitingRdvDetailsPanelMobile
          selectedAppointment={selectedAppointment}
          onClose={onClose}
          handleRdvUpdated={handleRdvUpdated}
          handlePaymentStatusChange={handlePaymentStatusChange}
          userId={userId}
        />
      </div>

      {/* Version Desktop */}
      <div className="hidden lg:block absolute">
        <WaitingRdvDetailsPanelDesktop
          selectedAppointment={selectedAppointment}
          onClose={onClose}
          handleRdvUpdated={handleRdvUpdated}
          handlePaymentStatusChange={handlePaymentStatusChange}
          userId={userId}
        />
      </div>
    </>
  );
}
