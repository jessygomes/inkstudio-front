import AvisList from "@/components/Application/Review/AvisList";
import React from "react";

export default function page() {
  return (
    <div className="min-h-screen bg-noir-700 flex flex-col items-center gap-4 px-3 lg:px-20">
      <div className="flex relative gap-8 w-full mt-4 lg:mt-23">
        <AvisList />
      </div>
    </div>
  );
}
