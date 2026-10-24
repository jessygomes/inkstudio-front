"use client";

import { useCallback, useState } from "react";
import RendezVousTodayModern from "./RendezVousTodayModern";
import WaitingRdvModern from "./WaitingRdvModern";
import LastMessage from "./LastMessage";

export default function DashboardOperations({ userId }: { userId: string }) {
  const [active, setActive] = useState<"today" | "waiting" | null>(null);
  const todayChanged = useCallback((open: boolean) => setActive(current => open ? "today" : current === "today" ? null : current), []);
  const waitingChanged = useCallback((open: boolean) => setActive(current => open ? "waiting" : current === "waiting" ? null : current), []);
  return <div className="dashboard-operations-scroll"><div className="dashboard-operations" data-active={active || "none"}>
    <div className="dashboard-operation-slot"><RendezVousTodayModern userId={userId} active={active === "today"} onDetailsChange={todayChanged} /></div>
    <div className="dashboard-operation-slot"><WaitingRdvModern userId={userId} active={active === "waiting"} onDetailsChange={waitingChanged} /></div>
    <div className="dashboard-operation-slot"><LastMessage userId={userId} /></div>
  </div></div>;
}
