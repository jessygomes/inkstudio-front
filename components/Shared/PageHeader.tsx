import React from "react";

interface PageHeaderProps {
  /** Icône affichée à gauche du titre */
  icon: React.ReactNode;
  /** Titre principal */
  title: string;
  /** Boutons d'action affichés à droite (optionnel) */
  children?: React.ReactNode;
}

/**
 * Header standard pour les pages de l'application.
 * Utilise le design du dashboard : icône + titre à gauche, actions à droite.
 */
export default function PageHeader({ icon, title, children }: PageHeaderProps) {
  return (
    <div className="dashboard-hero px-4 py-4 lg:px-6 lg:py-2">
      <div className="relative z-10 flex flex-col gap-4 md:flex-row xl:items-center md:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            
            <div className="flex h-10 w-10 bg-tertiary-400/20 rounded-full shrink-0 items-center justify-center lg:h-12 lg:w-12">
              {icon}
            </div>
            <h1 className="text-xl font-bold uppercase tracking-[0.14em] text-white font-one sm:text-2xl">
              {title}
            </h1>
          </div>
        </div>

        {children && (
          <div className="flex flex-col gap-2.5 sm:flex-row xl:justify-end">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
