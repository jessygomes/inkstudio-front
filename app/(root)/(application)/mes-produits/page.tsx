import ProductList from "@/components/Application/ProductSalon/ProductList";
import React from "react";

export default function MesProduitsPage() {
  return (
    <div className="bg-noir-700 flex flex-col items-center justify-center gap-4">
      <div className="flex justify-between relative gap-8 w-full bg-noir-700  mt-24">
        <div className="w-full bg-gradient-to-br from-noir-500/10 to-noir-500/5 backdrop-blur-lg pb-4 border-b border-white/20">
          <h1 className="text-3xl font-bold text-white font-one tracking-wide text-center">
            Produits
          </h1>
          <p className="text-white/70 text-sm font-one text-center mt-2">
            Gérez vos produits, consultez les détails de chaque article et
            proposez-les à la vente.
          </p>
        </div>
      </div>
      <div className="px-20 w-full min-h-[400px]">
        <ProductList />
      </div>
    </div>
  );
}
