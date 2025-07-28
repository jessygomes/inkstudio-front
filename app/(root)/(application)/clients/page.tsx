import ClientList from "@/components/Application/Clients/ClientList";
import React from "react";

export default function ClientsPage() {
  return (
    <div className="bg-noir-700 flex flex-col items-center justify-center gap-4">
      <div className="flex justify-between relative gap-8 w-full bg-noir-700 px-20 mt-24">
        <h1 className="text-white font-three font-bold text-3xl">
          Liste des clients
        </h1>
      </div>
      <div className="px-20 w-full min-h-[400px]">
        <ClientList />
      </div>
    </div>
  );
}
