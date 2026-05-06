"use client";

import { useState } from "react";
import Link from "next/link";
import { FiUsers, FiChevronLeft } from "react-icons/fi";
import { LuStore } from "react-icons/lu";
import SalonsList from "@/components/Admin/SalonsList";
import ClientsList from "@/components/Admin/ClientsList";
import PageHeader from "@/components/Shared/PageHeader";

type TabType = "salons" | "clients";

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<TabType>("salons");

  return (
    <div className="wrapper-global pb-10">
      <section className="w-full space-y-3 pt-4">
        <PageHeader
          icon={<FiUsers size={20} className="text-tertiary-400" />}
          title="Gestion des utilisateurs"
        >
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/8 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/15 font-one"
          >
            <FiChevronLeft size={14} /> Retour
          </Link>
        </PageHeader>

       

        <div className="">
          <div className="flex gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => setActiveTab("salons")}
            className={`cursor-pointer flex-1 flex items-center justify-center gap-1.5 rounded-2xl px-4 py-2 font-one text-sm font-medium transition-all duration-300 ${
              activeTab === "salons"
                ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white shadow-lg"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <LuStore size={16} />
            <span>Salons</span>
          </button>

          <button
            onClick={() => setActiveTab("clients")}
            className={`cursor-pointer flex-1 flex items-center justify-center gap-1.5 rounded-2xl px-4 py-2 font-one text-sm font-medium transition-all duration-300 ${
              activeTab === "clients"
                ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white shadow-lg"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <FiUsers size={16} />
            <span>Clients</span>
          </button>
        </div>
        </div>

        <div className="dashboard-embedded-panel p-3 sm:p-4">
          {activeTab === "salons" ? <SalonsList /> : <ClientsList />}
        </div>
      </section>
    </div>
  );
}
