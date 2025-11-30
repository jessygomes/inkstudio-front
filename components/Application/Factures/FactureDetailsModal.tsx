"use client";
import { FactureProps } from "@/lib/type";
import React from "react";
import FactureDetailsModalMobile from "./FactureDetailsModalMobile";
import FactureDetailsModalDesktop from "./FactureDetailsModalDesktop";

interface FactureDetailsModalProps {
  facture: FactureProps | null;
  onClose: () => void;
  onUpdate?: (updatedFacture: FactureProps) => void;
}

export default function FactureDetailsModal({
  facture,
  onClose,
  onUpdate,
}: FactureDetailsModalProps) {
  if (!facture) return null;

  return (
    <>
      {/* Version Mobile */}
      <div className="block md:hidden">
        <FactureDetailsModalMobile facture={facture} onClose={onClose} onUpdate={onUpdate} />
      </div>

      {/* Version Desktop */}
      <div className="hidden md:block">
        <FactureDetailsModalDesktop facture={facture} onClose={onClose} onUpdate={onUpdate} />
      </div>
    </>
  );
}
