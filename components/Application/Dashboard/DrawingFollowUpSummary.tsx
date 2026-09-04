"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Brush, CheckCircle2, Clock3, Loader2 } from "lucide-react";
import { getDrawingCards } from "@/lib/queries/suiviDessin";
import type { DrawingCard, DrawingCardStatus } from "@/lib/types/suiviDessin";

const statusMeta: Record<
  DrawingCardStatus,
  { label: string; color: string; icon: typeof Clock3 }
> = {
  A_DESSINER: { label: "À dessiner", color: "text-slate-300", icon: Clock3 },
  EN_COURS: { label: "En cours", color: "text-sky-300", icon: Brush },
  A_MODIFIER: { label: "À modifier", color: "text-amber-300", icon: Brush },
  TERMINE: { label: "Terminées", color: "text-violet-300", icon: CheckCircle2 },
  APPROUVE: { label: "Approuvées", color: "text-emerald-300", icon: CheckCircle2 },
};

const clientName = (card: DrawingCard) => {
  const client = card.client ?? card.clientUser;
  return (
    [client?.firstName, client?.lastName].filter(Boolean).join(" ") ||
    "Client non renseigné"
  );
};

export default function DrawingFollowUpSummary() {
  const [cards, setCards] = useState<DrawingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getDrawingCards()
      .then((data) => {
        if (!cancelled) setCards(data);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Impossible de charger le suivi dessin",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        Object.keys(statusMeta).map((status) => [
          status,
          cards.filter((card) => card.status === status).length,
        ]),
      ) as Record<DrawingCardStatus, number>,
    [cards],
  );

  const recentCards = cards
    .slice()
    .sort(
      (first, second) =>
        new Date(second.updatedAt).getTime() -
        new Date(first.updatedAt).getTime(),
    )
    .slice(0, 3);

  return (
    <section className="dashboard-panel h-full p-4 lg:p-5">
      <div className="dashboard-panel-content">
        <div className="dashboard-card-header mb-4">
          <div>
            <span className="dashboard-card-kicker">Suivi dessin</span>
            <h3 className="dashboard-card-title mt-3">Avancement des projets</h3>
            <p className="dashboard-card-subtitle">
              Gardez une vue rapide sur les cards en cours.
            </p>
          </div>
          <Link
            href="/suiviDessin"
            aria-label="Ouvrir le suivi dessin"
            className="dashboard-icon-action"
          >
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="flex min-h-32 items-center justify-center text-sm text-white/45">
            <Loader2 size={17} className="mr-2 animate-spin" /> Chargement…
          </div>
        ) : error ? (
          <div className="dashboard-empty-state px-4 py-7 text-center text-sm text-rose-300">
            {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-5 gap-1.5">
              {(Object.keys(statusMeta) as DrawingCardStatus[]).map((status) => {
                const meta = statusMeta[status];
                const Icon = meta.icon;
                return (
                  <div
                    key={status}
                    className="rounded-2xl border border-white/8 bg-white/[0.035] px-2 py-2.5 text-center"
                  >
                    <Icon size={14} className={`mx-auto ${meta.color}`} />
                    <p className="mt-2 text-lg font-semibold text-white font-one">
                      {counts[status]}
                    </p>
                    <p className="truncate text-[9px] text-white/40 font-one">
                      {meta.label}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 space-y-2">
              {recentCards.length ? (
                recentCards.map((card) => (
                  <Link
                    key={card.id}
                    href={`/suiviDessin?cardId=${encodeURIComponent(card.id)}`}
                    className="dashboard-list-item flex items-center justify-between gap-3 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-white font-one">
                        {card.title}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-white/45 font-one">
                        {clientName(card)}
                      </p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-medium ${statusMeta[card.status].color}`}>
                      {statusMeta[card.status].label}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="dashboard-empty-state px-4 py-7 text-center text-sm text-white/45">
                  Aucune card de dessin pour le moment.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
