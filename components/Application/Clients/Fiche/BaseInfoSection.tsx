"use client";
import React from "react";
import { CiUser } from "react-icons/ci";
import { ClientProps } from "@/lib/type";

interface BaseInfoSectionProps {
  client: ClientProps;
}

export default function BaseInfoSection({ client }: BaseInfoSectionProps) {
  return (
    <div className="rounded-2xl p-4 border border-white/10 shadow-lg">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-tertiary-400/30 to-tertiary-500/20 flex items-center justify-center border border-tertiary-400/30">
          <CiUser size={18} className="text-tertiary-400" />
        </div>
        <h3 className="text-base font-semibold text-white font-one uppercase tracking-wide">
          Informations personnelles
        </h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <div className="bg-white/5 rounded-2xl p-2 border border-white/10">
          <p className="text-xs text-tertiary-400 font-one font-semibold mb-1">
            Email
          </p>
          <p className="text-white font-two text-sm break-all">{client.email}</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-2 border border-white/10">
          <p className="text-xs text-tertiary-400 font-one font-semibold mb-1">
            Téléphone
          </p>
          <p className="text-white font-two text-sm">
            {client.phone || "Non renseigné"}
          </p>
        </div>
        <div className="bg-white/5 rounded-2xl p-2 border border-white/10">
          <p className="text-xs text-tertiary-400 font-one font-semibold mb-1">
            Date de naissance
          </p>
          <p className="text-white font-two text-sm">
            {client.birthDate
              ? new Date(client.birthDate).toLocaleDateString("fr-FR")
              : "Non renseignée"}
          </p>
        </div>
        <div className="bg-white/5 rounded-lg p-2 border border-white/10">
          <p className="text-xs text-tertiary-400 font-one font-semibold mb-1">
            Adresse
          </p>
          <p className="text-white font-two text-sm break-words">
            {client.address || "Non renseignée"}
          </p>
        </div>
      </div>
    </div>
  );
}
