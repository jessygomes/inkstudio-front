"use client";
import { useActivityNotifications } from "@/components/Providers/ActivityNotificationsProvider";

import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import { format } from "date-fns";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { fr } from "date-fns/locale/fr";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useMemo } from "react";
import { View } from "react-big-calendar";
import CalendarTimeHeader from "./CalendarTimeHeader";
import styles from "./CalendarTimeViews.module.css";

const locales = {
  fr: fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export type CalendarEvent = Event & {
  venueSalonId?: string | null;
  venueName?: string | null;
  venueAddress?: string | null;
  venueCity?: string | null;
  venuePostalCode?: string | null;

  id: string;
  status?: string;
  prestation?: string;
  skin?: string | null;
  client: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  clientId?: string;
  allDay?: boolean;
  start: Date | string;
  end: Date | string;
  title: string;
  isPayed?: boolean;
  tatoueur: {
    id: string;
    name: string;
  };
  performerUser?: {
    id: string;
    firstName?: string;
    lastName?: string;
    salonName?: string;
  };
  conversation?: {
    id: string;
  };
  notes?: string;
  visio?: boolean;
  visioRoom?: string;
  tattooDetail?: {
    id: string;
    type: string;
    zone: string;
    size: string;
    colorStyle: string;
    reference: string;
    sketch: string;
    price?: number;
    estimatedPrice: number;
    description?: string;
    piercingZone?: string;
    piercingServicePriceId?: string;
  };
  moodboard?: {
    id: string;
    name?: string | null;
    description?: string | null;
  } | null;
  salonReview?: {
    id: string;
    rating: number;
    title?: string;
    comment?: string;
    photos?: string[];
    isVerified?: boolean;
    createdAt: string;
    salonResponse?: string | null;
    salonRespondedAt?: string | null;
  };
};

interface CalendarViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  currentView: View;
  setCurrentView: (view: View) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
}

//! Fonction pour définir le style des événements en fonction de leur statut
const eventStyleGetter = (event: CalendarEvent) => {
  let backgroundColor = "rgba(148, 163, 184, 0.72)";
  let borderColor = "rgba(148, 163, 184, 0.95)";

  switch (event.status) {
    case "PENDING":
      backgroundColor = "rgba(245, 158, 11, 0.82)";
      borderColor = "rgba(251, 191, 36, 0.95)";
      break;
    case "CONFIRMED":
      backgroundColor = "rgba(16, 185, 129, 0.82)";
      borderColor = "rgba(52, 211, 153, 0.95)";
      break;
    case "COMPLETED":
      backgroundColor = "rgba(20, 184, 166, 0.8)";
      borderColor = "rgba(45, 212, 191, 0.95)";
      break;
    case "NO_SHOW":
      backgroundColor = "rgba(249, 115, 22, 0.82)";
      borderColor = "rgba(251, 146, 60, 0.95)";
      break;
    case "RESCHEDULING":
      backgroundColor = "rgba(59, 130, 246, 0.82)";
      borderColor = "rgba(96, 165, 250, 0.95)";
      break;
    case "DECLINED":
      backgroundColor = "rgba(239, 68, 68, 0.82)";
      borderColor = "rgba(248, 113, 113, 0.95)";
      break;
    case "CANCELED":
      backgroundColor = "rgba(107, 114, 128, 0.82)";
      borderColor = "rgba(156, 163, 175, 0.95)";
      break;
  }

  return {
    style: {
      backgroundColor,
      borderRadius: "10px",
      color: "white",
      border: `1px solid ${borderColor}`,
      borderLeft: `3px solid ${borderColor}`,
      padding: "2px 6px",
      fontWeight: 600,
      boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    },
  };
};

//! Composant principal du calendrier
export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  currentDate,
  setCurrentDate,
  currentView,
  setCurrentView,
  onSelectEvent,
}) => {
  const { isNew } = useActivityNotifications();
  const styledEvents = useMemo(() => {
    if (!Array.isArray(events) || events.length === 0) {
      return [];
    }

    const styled = events.map((event) => ({
      ...event,
      title: `${event.venueName ? event.venueName + " · " : ""}${event.title} - ${
        event.client.firstName + " " + event.client.lastName || ""
      }`,
      allDay: event.allDay ?? false,
      start: new Date(event.start ?? Date.now()),
      end: new Date(event.end ?? Date.now()),
    }));

    return styled;
  }, [events]);

  const displayLabel = useMemo(() => {
    if (currentView === "week") {
      const startWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
      const endWeek = new Date(startWeek);
      endWeek.setDate(startWeek.getDate() + 6);

      return `${startWeek.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      })} - ${endWeek.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`;
    }

    return currentDate.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      ...(currentView === "day" && {
        weekday: "long",
        day: "numeric",
      }),
    });
  }, [currentDate, currentView]);

  const statusLegend = [
    { label: "En attente", color: "bg-amber-400" },
    { label: "Confirmé", color: "bg-emerald-400" },
    { label: "Complété", color: "bg-teal-400" },
    { label: "Annulé", color: "bg-red-400" },
  ];

  const slotStep = 30;
  const slotGroups = 2;

  return (
    <div className="h-full w-full p-0">
      <div className="dashboard-embedded-panel flex h-full min-h-0 w-full flex-col overflow-hidden !rounded-none !border-0 !p-0 !shadow-none">
        <div className="dashboard-embedded-header border-b border-white/8 px-3 py-2 lg:px-3.5 lg:py-2.5">
          <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="col-span-1 flex flex-wrap items-center gap-1.5 lg:col-span-2 lg:justify-between">
              <div className="flex w-full flex-wrap items-center justify-between gap-2">
                 <div className="flex items-center gap-1.5">
                  <p className="text-[10px] uppercase tracking-[0.1em] text-white/65 font-two whitespace-nowrap">
                    {displayLabel}
                  </p>
                  <div className="inline-flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/5 p-0.5">
                    <button
                      onClick={() => {
                        const newDate = new Date(currentDate);
                        if (currentView === "month") {
                          newDate.setMonth(newDate.getMonth() - 1);
                        } else if (currentView === "week") {
                          newDate.setDate(newDate.getDate() - 7);
                        } else {
                          newDate.setDate(newDate.getDate() - 1);
                        }
                        setCurrentDate(newDate);
                      }}
                      className="cursor-pointer flex h-6 w-6 items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-tertiary-400/15"
                      aria-label="Période précédente"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        const newDate = new Date(currentDate);
                        if (currentView === "month") {
                          newDate.setMonth(newDate.getMonth() + 1);
                        } else if (currentView === "week") {
                          newDate.setDate(newDate.getDate() + 7);
                        } else {
                          newDate.setDate(newDate.getDate() + 1);
                        }
                        setCurrentDate(newDate);
                      }}
                      className="cursor-pointer flex h-6 w-6 items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-tertiary-400/15"
                      aria-label="Période suivante"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="ml-auto flex shrink-0 items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-0.5 w-fit">
                  {(["month", "week", "day"] as View[]).map((view) => (
                    <button
                      key={view}
                      onClick={() => setCurrentView(view)}
                      className={`cursor-pointer rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all duration-200 font-one ${
                        currentView === view
                          ? "bg-tertiary-500 text-white shadow-[0_4px_14px_rgba(255,85,0,0.35)]"
                          : "text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {view === "month" ? "Mois" : view === "week" ? "Semaine" : "Jour"}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            

            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
                {statusLegend.map((item) => (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap text-[10px] text-white/55 font-one"
                  >
                    <span className={`h-2 w-2 rounded-full ${item.color}`} />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <div className={`inkera-calendar h-full w-full overflow-hidden bg-white/[0.02] ${currentView !== "month" ? styles.timeViews : ""}`}>
        <style jsx global>{`
          .inkera-calendar .rbc-month-view,
          .inkera-calendar .rbc-time-view {
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }

          .inkera-calendar .rbc-calendar {
            background: transparent !important;
            color: var(--app-ink) !important;
            font-family: inherit !important;
            font-size: 11px !important;
            border: none !important;
          }

          .inkera-calendar .rbc-toolbar {
            display: none !important;
          }

          .inkera-calendar .rbc-header {
            background: rgb(var(--app-ink-rgb) / 0.06) !important;
            color: rgb(var(--app-ink-rgb) / max(85%, var(--app-muted-opacity))) !important;
            padding: 5px 4px !important;
            font-weight: 500 !important;
            font-size: 10px !important;
            letter-spacing: 0.03em;
            text-transform: uppercase;
            border: none !important;
          }

          .inkera-calendar .rbc-time-header,
          .inkera-calendar .rbc-time-header-content,
          .inkera-calendar .rbc-time-header-gutter {
            border: none !important;
            padding: 0 !important;
          }

          .inkera-calendar .rbc-time-view {
            border: none !important;
            padding: 0 !important;
            display: flex;
            flex-direction: column;
          }

          .inkera-calendar .rbc-time-view .rbc-time-header {
            margin: 0 !important;
          }

          .inkera-calendar .rbc-date-cell {
            padding: 4px 3px !important;
            background: transparent !important;
            font-size: 9px !important;
            color: rgb(var(--app-ink-rgb) / max(65%, var(--app-muted-opacity))) !important;
          }

          .inkera-calendar .rbc-day-bg {
            background: transparent !important;
            transition: background-color 0.2s ease;
          }

          .inkera-calendar .rbc-day-bg:hover {
            background: rgb(var(--app-ink-rgb) / 0.03) !important;
          }

          .inkera-calendar .rbc-off-range-bg {
            background: rgba(0, 0, 0, 0.14) !important;
          }

          .inkera-calendar .rbc-today {
            background: transparent !important;
            border-radius: 0 !important;
          }

          .inkera-calendar .rbc-header.rbc-today {
            border-radius: 0 !important;
          }

          .inkera-calendar .rbc-time-slot {
            color: rgb(var(--app-ink-rgb) / max(52%, var(--app-muted-opacity))) !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .inkera-calendar .rbc-day-slot {
            border: none !important;
            padding: 0 !important;
          }

          .inkera-calendar .rbc-time-gutter {
            background: rgb(var(--app-ink-rgb) / 0.03) !important;
            border: none !important;
          }

          .inkera-calendar .rbc-time-gutter .rbc-label {
            font-size: 10px !important;
            color: rgb(var(--app-ink-rgb) / max(62%, var(--app-muted-opacity))) !important;
            font-variant-numeric: tabular-nums;
            letter-spacing: 0.02em;
            font-weight: 500;
          }

          .inkera-calendar .rbc-time-content .rbc-timeslot-group:nth-child(even) {
            background: rgb(var(--app-ink-rgb) / 0.02) !important;
          }

          .inkera-calendar .rbc-time-content {
            border: none !important;
            padding: 0 !important;
          }

          .inkera-calendar .rbc-timeslot-group {
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .inkera-calendar .rbc-time-view .rbc-day-slot .rbc-events-container {
            margin-right: 4px !important;
          }

          .inkera-calendar .rbc-current-time-indicator {
            display: none !important;
          }

          .inkera-calendar .rbc-event {
            border-radius: 10px !important;
            padding: 3px 6px !important;
            font-size: 10px !important;
            font-weight: 500 !important;
            margin: 1px 0 !important;
          }

          .inkera-calendar .rbc-event:hover {
            transform: translateY(-1px) !important;
            transition: transform 0.15s ease !important;
          }

          .inkera-calendar .rbc-show-more {
            color: var(--color-tertiary-400) !important;
            font-weight: 600 !important;
            font-size: 10px !important;
            background: color-mix(in srgb, var(--color-tertiary-400) 14%, transparent) !important;
            border: 1px solid color-mix(in srgb, var(--color-tertiary-400) 30%, transparent) !important;
            border-radius: 999px !important;
            padding: 2px 6px !important;
          }

          .inkera-calendar .rbc-row,
          .inkera-calendar .rbc-row-cell {
            border: none !important;
          }

          .inkera-calendar .rbc-row-content {
            z-index: 1 !important;
          }

          .inkera-calendar .rbc-label,
          .inkera-calendar .rbc-time-header-content .rbc-header,
          .inkera-calendar .rbc-time-gutter .rbc-timeslot-group {
            font-family: var(--font-one), sans-serif !important;
          }

          .inkera-calendar .rbc-day-slot .rbc-time-slot {
            min-height: 28px !important;
          }

          .inkera-calendar .rbc-time-view .rbc-day-slot .rbc-time-slot {
            min-height: 20px !important;
          }

          .inkera-calendar .rbc-time-view .rbc-time-content,
          .inkera-calendar .rbc-time-view .rbc-time-header-content,
          .inkera-calendar .rbc-time-view .rbc-time-gutter {
            background-clip: padding-box;
          }

          .inkera-calendar .rbc-agenda-view table.rbc-agenda-table {
            border: none !important;
          }

          .inkera-calendar .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
            border-color: rgb(var(--app-ink-rgb) / max(8%, var(--app-muted-opacity))) !important;
          }

          .inkera-calendar .rbc-addons-dnd .rbc-addons-dnd-drag-preview {
            opacity: 0.8 !important;
          }

          @media (max-width: 768px) {
            .inkera-calendar .rbc-header {
              font-size: 9px !important;
              padding: 8px 4px !important;
            }

            .inkera-calendar .rbc-event {
              font-size: 9px !important;
              padding: 2px 4px !important;
            }

            .inkera-calendar .rbc-date-cell {
              font-size: 9px !important;
              padding: 6px 4px !important;
            }
          }
        `}</style>

        <Calendar
          localizer={localizer}
          culture="fr"
          events={styledEvents}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={(event) => { const result = eventStyleGetter(event); return isNew("appointments", event.id) ? { ...result, style: { ...result.style, outline: "2px solid var(--color-tertiary-400)", outlineOffset: "2px", fontWeight: 700 } } : result; }}
          components={{ week: { header: CalendarTimeHeader }, day: { header: CalendarTimeHeader } }}
          style={{ height: "100%", width: "100%", minHeight: 0 }}
          views={["month", "week", "day"]}
          date={currentDate}
          view={currentView}
          onNavigate={(date) => setCurrentDate(date)}
          onView={(view) => setCurrentView(view)}
          min={new Date(1970, 1, 1, 9, 0)}
          max={new Date(1970, 1, 1, 19, 0)}
          onSelectEvent={onSelectEvent}
          selectable
          onSelectSlot={(slotInfo) => {
            if (currentView === "month") {
              setCurrentDate(slotInfo.start);
              setCurrentView("day");
            }
          }}
          step={slotStep}
          timeslots={slotGroups}
          messages={{
            next: "Suivant",
            previous: "Précédent",
            today: "Aujourd'hui",
            month: "Mois",
            week: "Semaine",
            day: "Jour",
            agenda: "Agenda",
            event: "Événement",
            showMore: (total) => `+${total} autres`,
            allDay: "Toute la journée",
            noEventsInRange: "Aucun événement",
          }}
          formats={{
            weekdayFormat: (date, culture, localizer) =>
              localizer?.format(date, "eeee", culture) ?? "",
            dayFormat: (date, culture, localizer) =>
              localizer?.format(date, "d", culture) ?? "",
            timeGutterFormat: (date, culture, localizer) =>
              localizer?.format(date, "HH:mm", culture) ?? "",
            eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
              `${localizer?.format(start, "HH:mm", culture) ?? ""} - ${
                localizer?.format(end, "HH:mm", culture) ?? ""
              }`,
            agendaTimeFormat: (date, culture, localizer) =>
              localizer?.format(date, "HH:mm", culture) ?? "",
            agendaDateFormat: (date, culture, localizer) =>
              localizer?.format(date, "EEEE dd MMMM yyyy", culture) ?? "",
          }}
        />
          </div>
        </div>
      </div>
    </div>
  );
};
