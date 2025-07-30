import SalonAccount from "@/components/Application/MonCompte/SalonAccount";
import React from "react";

export default function MonCompte() {
  return (
    <div className="bg-noir-700 flex flex-col items-center justify-center gap-4 ">
      <div className="flex relative gap-8 w-full pb-4 mt-24">
        <SalonAccount />
      </div>
    </div>
  );
}
