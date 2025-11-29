import ShowSuivis from "@/components/Application/Clients/ShowSuivis";
import React from "react";

export default function ClientAvisPage() {
  return (
    <div className="bg-noir-700 flex flex-col items-center justify-center gap-4">
      <div className="px-3 lg:px-20 w-full mt-4 lg:mt-23">
        <ShowSuivis />
      </div>
    </div>
  );
}
