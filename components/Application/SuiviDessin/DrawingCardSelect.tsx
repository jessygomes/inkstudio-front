"use client";

import { useEffect, useMemo, useState } from "react";
import { getDrawingCards } from "@/lib/queries/suiviDessin";
import type { DrawingCard } from "@/lib/types/suiviDessin";

export default function DrawingCardSelect({
  value,
  onChange,
  clientId,
  clientEmail,
}: {
  value?: string;
  onChange: (value: string | undefined) => void;
  clientId?: string;
  clientEmail?: string;
}) {
  const [cards, setCards] = useState<DrawingCard[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getDrawingCards({ status: "APPROUVE" })
      .then(setCards)
      .catch(() => setCards([]))
      .finally(() => setLoading(false));
  }, []);

  const compatibleCards = useMemo(
    () =>
      cards.filter((card) => {
        if (card.tattooAppointmentId && card.id !== value) return false;
        if (clientId) return card.clientId === clientId;
        if (clientEmail) {
          const email = (
            card.client?.email ||
            card.clientUser?.email ||
            ""
          ).toLowerCase();
          return email === clientEmail.toLowerCase();
        }
        return true;
      }),
    [cards, clientEmail, clientId, value],
  );

  return (
    <div className="space-y-1">
      <label className="text-xs text-white/70 font-one">Dessin approuvé</label>
      <select
        value={value || ""}
        onChange={(event) => onChange(event.target.value || undefined)}
        disabled={loading}
        className="w-full cursor-pointer rounded-lg border border-white/20 bg-noir-700 p-3 text-sm text-white outline-none transition-colors focus:border-tertiary-400 disabled:cursor-not-allowed sm:p-2 sm:text-xs"
      >
        <option value="">Aucun dessin associé</option>
        {compatibleCards.map((card) => (
          <option key={card.id} value={card.id}>
            {card.title} ·{" "}
            {new Date(card.sourceAppointment.start).toLocaleDateString("fr-FR")}
          </option>
        ))}
      </select>
      {!loading && !compatibleCards.length && (
        <p className="text-[10px] text-white/40">
          Aucune card approuvée compatible avec ce client.
        </p>
      )}
    </div>
  );
}
