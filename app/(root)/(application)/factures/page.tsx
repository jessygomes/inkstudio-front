import FactureList from "@/components/Application/Factures/FactureList";
import React from "react";

export default function FacturePage() {
  return (
    <div className="wrapper-global pb-24 lg:pb-0">
      <div className="w-full mt-4">
        <FactureList />
      </div>
    </div>
  );
}
