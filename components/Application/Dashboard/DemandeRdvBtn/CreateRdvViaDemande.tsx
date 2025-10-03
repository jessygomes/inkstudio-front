"use client";
import React, { useState } from "react";

export default function CreateRdvViaDemande() {
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <button
        onClick={() => {
          setLoading(false);
        }}
        disabled={loading}
        className="cursor-pointer px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-600/30 rounded text-xs font-one font-medium transition-colors flex items-center gap-1 disabled:opacity-60"
      >
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 0l3 3m-3-3l-3 3"
          />
        </svg>
        Créer le rendez-vous
      </button>
    </div>
  );
}
