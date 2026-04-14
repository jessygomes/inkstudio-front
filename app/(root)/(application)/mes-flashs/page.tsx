import React from "react";
import ShowFlash from "@/components/Application/Flash/ShowFlash";

export default function MesFlashsPage() {
  return (
    <div className="min-h-screen bg-noir-700 flex flex-col items-center gap-4 px-3 lg:px-10">
      <div className="flex relative gap-8 w-full mt-4 xl:mt-23">
        <ShowFlash />
      </div>
    </div>
  );
}
