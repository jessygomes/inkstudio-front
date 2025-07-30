import ShowPortfolio from "@/components/Application/Portfolio/ShowPortfolio";
import React from "react";

export default function MonPortfolioPage() {
  return (
    <div className="bg-noir-700 flex flex-col items-center justify-center gap-4">
      <div className="flex relative gap-8 w-full pb-4 mt-24">
        <ShowPortfolio />
      </div>
    </div>
  );
}
