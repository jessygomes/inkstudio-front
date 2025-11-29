import ClientList from "@/components/Application/Clients/ClientList";
import React from "react";

export default function ClientsPage() {
  return (
    <div className="min-h-screen bg-noir-700 flex flex-col items-center gap-4 px-3 lg:px-20 pb-10 lg:pb-0">
      <div className="w-full mt-4 lg:mt-23">
        <ClientList />
      </div>
    </div>
  );
}
