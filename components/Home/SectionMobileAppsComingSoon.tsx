import React from "react";

export default function SectionMobileAppsComingSoon() {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-tertiary-500 to-tertiary-400 px-4 sm:px-8 lg:px-20"
      style={{ paddingTop: "3.5rem", paddingBottom: "3.5rem" }}
    >
      <div className="relative mx-auto w-full max-w-6xl">
        <div className="mb-8 text-center sm:mb-10">
          <span className="inline-flex items-center rounded-full border border-white shadow-2xl px-3 py-1 text-[10px] font-one uppercase tracking-[0.2em] text-white sm:text-xs">
            Nouveauté
          </span>
          <h2 className="mt-3 text-2xl font-two font-bold text-white sm:text-3xl lg:text-4xl">
            Nos applications mobiles arrivent très bientôt
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm font-one leading-relaxed text-white/80 sm:text-base">
            Deux expériences dédiées sont en préparation: une application pour
            les artistes tatoueurs, et une application pour les clients.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/50 bg-gradient-to-br from-noir-500/40 to-noir-700/45 p-5 backdrop-blur-sm sm:p-6">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-tertiary-500/20 text-xl text-tertiary-300">
              🎨
            </div>
            <h3 className="text-lg font-two font-bold text-white sm:text-xl">
              Application Artistes Tatoueurs
            </h3>
            <p className="mt-3 text-sm font-one leading-relaxed text-white/80 sm:text-base">
              Pilotage du studio depuis mobile: agenda, rendez-vous, suivi des
              clients, portfolio et outils métier pour garder le contrôle même
              en déplacement.
            </p>
          </article>

          <article className="rounded-2xl border border-white/50 bg-gradient-to-br from-noir-500/40 to-noir-700/45 p-5 backdrop-blur-sm sm:p-6">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-tertiary-500/20 text-xl text-tertiary-300">
              📱
            </div>
            <h3 className="text-lg font-two font-bold text-white sm:text-xl">
              Application Clients
            </h3>
            <p className="mt-3 text-sm font-one leading-relaxed text-white/80 sm:text-base">
              Un espace simple pour trouver un salon via l&apos;annuaire, gérer son
              compte client, préparer ses idées dans un moodboard et suivre ses
              projets de tatouage.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
