import StockList from "@/components/Application/Stocks/StockList";
import React from "react";

export default function StockPage() {
  return (
    <div className="wrapper-global pb-10 lg:pb-0">
      <div className="w-full mt-4">
        <StockList />
      </div>
    </div>
  );
}
