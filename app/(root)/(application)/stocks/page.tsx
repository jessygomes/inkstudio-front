import StockList from "@/components/Application/Stocks/StockList";
import React from "react";

export default function StockPage() {
  return (
    <div className="min-h-screen bg-noir-700 flex flex-col items-center gap-4 px-3 lg:px-20">
      <div className="flex relative gap-8 w-full mt-23">
        <StockList />
      </div>
    </div>
  );
}
