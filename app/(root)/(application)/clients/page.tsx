import ClientList from "@/components/Application/Clients/ClientList";
import React from "react";

export default function ClientsPage() {
  return (
    <div className="min-h-screen bg-noir-700 flex flex-col items-center gap-4 px-20">
      <div className="w-full">
        <ClientList />
      </div>
    </div>
  );
}
