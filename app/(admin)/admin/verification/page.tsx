"use client";

import Link from "next/link";
import { FiChevronLeft, FiFileText } from "react-icons/fi";
import PendingVerificationList from "../../../../components/Admin/PendingVerificationList";

export default function VerificationPage() {
  return (
    <div className="bg-noir-700 flex flex-col gap-4 px-3 lg:px-20 pb-10 min-h-screen">
      <div className="flex flex-col relative gap-6 w-full mt-2 lg:mt-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row sm:items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-3 rounded-xl shadow-xl border border-white/10">
          <div className="flex items-center gap-3 mb-3 sm:mb-0">
            <div className="w-10 h-10 bg-tertiary-500/30 rounded-full flex items-center justify-center">
              <FiFileText size={20} className="text-tertiary-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white font-one tracking-wide uppercase">
                Salons en attente de vérification
              </h1>
              <p className="text-white/70 text-[10px] font-one mt-0.5">
                Consultez et vérifiez les documents soumis
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

        {/* Content */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-4">
          <PendingVerificationList />
        </div>
      </div>
    </div>
  );
}
