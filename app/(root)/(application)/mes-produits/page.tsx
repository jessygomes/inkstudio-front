import ProductList from "@/components/Application/ProductSalon/ProductList";
import React from "react";

export default function MesProduitsPage() {
  return (
    <div className="min-h-screen bg-noir-700 flex flex-col items-center gap-4 px-3 sm:px-20">
      <div className="flex relative gap-8 w-full mt-23">
        <ProductList />
      </div>
    </div>
  );
}
