import StockList from "@/components/Application/Stocks/StockList";
import React from "react";

export default function StockPage() {
  return (
    <div className="wrapper-global pb-24 lg:pb-4">
      <div className="w-full mt-4">
        <StockList />
      </div>
    </div>
  );
}
