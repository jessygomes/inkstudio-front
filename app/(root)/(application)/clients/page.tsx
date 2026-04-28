import ClientList from "@/components/Application/Clients/ClientList";
import React from "react";

export default function ClientsPage() {
  return (
    <div className="min-h-screen bg-noir-700 flex flex-col items-center gap-4 px-3 lg:px-10 pb-24 lg:pb-0">
      <div className="w-full mt-4">
        <ClientList />
      </div>
    </div>
  );
}
