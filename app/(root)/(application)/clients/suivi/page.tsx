import ShowSuivis from "@/components/Application/Clients/ShowSuivis";
import React from "react";

export default function ClientAvisPage() {
  return (
    <div className="bg-noir-700 flex flex-col items-center justify-center gap-4 pb-10 lg:pb-0">
      <div className="px-3 lg:px-10 w-full mt-4 xl:mt-23">
        <ShowSuivis />
      </div>
    </div>
  );
}
