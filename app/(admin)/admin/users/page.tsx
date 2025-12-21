"use client";

import { useState } from "react";
import Link from "next/link";
import { FiUsers, FiChevronLeft } from "react-icons/fi";
import { LuStore } from "react-icons/lu";
import SalonsList from "@/components/Admin/SalonsList";
import ClientsList from "@/components/Admin/ClientsList";

type TabType = "salons" | "clients";

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<TabType>("salons");

  return (
    <div className="bg-noir-700 flex flex-col gap-4 px-3 lg:px-20 pb-10 min-h-screen">
      <div className="flex flex-col relative gap-6 w-full mt-2 lg:mt-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row sm:items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-3 rounded-xl shadow-xl border border-white/10">
          <div className="flex items-center gap-3 mb-3 sm:mb-0">
            <div className="w-10 h-10 bg-tertiary-500/30 rounded-full flex items-center justify-center">
              <FiUsers size={20} className="text-tertiary-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white font-one tracking-wide uppercase">
                Gestion des Utilisateurs
              </h1>
              <p className="text-white/70 text-[10px] font-one mt-0.5">
                Gérez les salons et clients inscrits
              </p>
            </div>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/10 font-one text-xs transition-colors"
          >
            <FiChevronLeft size={14} /> Retour
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-1">
          <button
            onClick={() => setActiveTab("salons")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-one font-medium transition-all duration-300 text-sm ${
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
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-one font-medium transition-all duration-300 text-sm ${
              activeTab === "clients"
                ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white shadow-lg"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <FiUsers size={16} />
            <span>Clients</span>
          </button>
        </div>

        {/* Content */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-4">
          {activeTab === "salons" ? <SalonsList /> : <ClientsList />}
        </div>
      </div>
    </div>
  );
}
