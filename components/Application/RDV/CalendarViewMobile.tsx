"use client";

import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format } from "date-fns";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { fr } from "date-fns/locale/fr";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useMemo } from "react";
import { CalendarEvent } from "./Calendar";

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

interface CalendarViewMobileProps {
  events: CalendarEvent[];
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  currentView: View;
  setCurrentView: (view: View) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
}

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
      padding: "3px 5px",
      fontWeight: 600,
      boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
      fontSize: "9px",
    },
  };
};

export const CalendarViewMobile: React.FC<CalendarViewMobileProps> = ({
  events,
  currentDate,
  setCurrentDate,
  currentView,
  setCurrentView,
  onSelectEvent,
}) => {
  const styledEvents = useMemo(() => {
    if (!Array.isArray(events) || events.length === 0) {
      return [];
    }

    return events.map((event) => ({
      ...event,
      title: `${event.title} - ${event.client.firstName} ${event.client.lastName}`,
      allDay: event.allDay ?? false,
      start: new Date(event.start ?? Date.now()),
      end: new Date(event.end ?? Date.now()),
    }));
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
      })}`;
    }

    if (currentView === "day") {
      return currentDate.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    }

    return currentDate.toLocaleDateString("fr-FR", {
      month: "short",
      year: "numeric",
    });
  }, [currentDate, currentView]);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="dashboard-embedded-panel flex h-full min-h-0 w-full flex-col overflow-hidden !rounded-[16px] !p-0 md:!rounded-[20px]">
        {/* Header compact pour mobile */}
        <div className="dashboard-embedded-header flex items-center justify-between gap-2 border-b border-white/8 px-3 py-3 md:px-4 md:py-3.5">
          <div className="flex items-center gap-2 md:gap-2.5">
            <p className="whitespace-nowrap text-[10px] uppercase tracking-[0.1em] text-white/65 font-two md:text-xs">
              {displayLabel}
            </p>
            <div className="inline-flex items-center gap-0 rounded-lg border border-white/10 bg-white/5 p-0.5 md:rounded-xl">
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
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white md:h-8 md:w-8"
              >
                <svg
                  className="h-3.5 w-3.5 md:h-4 md:w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
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
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white md:h-8 md:w-8"
              >
                <svg
                  className="h-3.5 w-3.5 md:h-4 md:w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-0.5 md:rounded-xl md:p-1">
            {(["month", "week", "day"] as View[]).map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-[10px] font-medium transition-all duration-200 font-one md:px-3 md:py-1.5 md:text-xs ${
                  currentView === view
                    ? "bg-tertiary-500 text-white shadow-[0_2px_8px_rgba(255,85,0,0.3)]"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {view === "month" ? "Mois" : view === "day" ? "Jour" : "Sem."}
              </button>
            ))}
          </div>
        </div>

        {/* Calendrier avec CSS optimisé pour mobile */}
        <div className="flex-1 min-h-0 overflow-hidden p-1.5 md:p-2">
          <div className="inkera-calendar-mobile h-full w-full overflow-hidden rounded-lg bg-white/[0.02] md:rounded-xl">
            <style jsx global>{`
              .inkera-calendar-mobile .rbc-calendar {
                background: transparent !important;
                color: white !important;
                font-family: inherit !important;
                font-size: 11px !important;
                border: none !important;
                height: 100% !important;
              }

              .inkera-calendar-mobile .rbc-toolbar {
                display: none !important;
              }

              .inkera-calendar-mobile .rbc-header {
                background: rgba(255, 255, 255, 0.06) !important;
                color: rgba(255, 255, 255, 0.85) !important;
                padding: 5px 3px !important;
                font-weight: 500 !important;
                font-size: 10px !important;
                letter-spacing: 0.02em;
                text-transform: uppercase;
                border: none !important;
              }

              @media (min-width: 768px) {
                .inkera-calendar-mobile .rbc-header {
                  padding: 7px 4px !important;
                  font-size: 11px !important;
                }
              }

              .inkera-calendar-mobile .rbc-time-header,
              .inkera-calendar-mobile .rbc-time-header-content,
              .inkera-calendar-mobile .rbc-time-header-gutter {
                border: none !important;
                padding: 0 !important;
              }

              .inkera-calendar-mobile .rbc-time-view {
                border: none !important;
                padding: 0 !important;
                display: flex;
                flex-direction: column;
              }

              .inkera-calendar-mobile .rbc-time-view .rbc-time-header {
                margin: 0 !important;
              }

              .inkera-calendar-mobile .rbc-date-cell {
                padding: 4px 2px !important;
                background: transparent !important;
                font-size: 10px !important;
                color: rgba(255, 255, 255, 0.65) !important;
              }

              @media (min-width: 768px) {
                .inkera-calendar-mobile .rbc-date-cell {
                  font-size: 11px !important;
                }
              }

              .inkera-calendar-mobile .rbc-day-bg {
                background: transparent !important;
                transition: background-color 0.2s ease;
              }

              .inkera-calendar-mobile .rbc-day-bg:hover {
                background: rgba(255, 255, 255, 0.02) !important;
              }

              .inkera-calendar-mobile .rbc-off-range-bg {
                background: rgba(0, 0, 0, 0.1) !important;
              }

              .inkera-calendar-mobile .rbc-today {
                background: rgba(255, 157, 0, 0.08) !important;
                border-radius: 0 !important;
              }

              .inkera-calendar-mobile .rbc-header.rbc-today {
                background: rgba(255, 157, 0, 0.12) !important;
              }

              .inkera-calendar-mobile .rbc-time-slot {
                color: rgba(255, 255, 255, 0.52) !important;
                border: none !important;
                margin: 0 !important;
                padding: 0 !important;
              }

              .inkera-calendar-mobile .rbc-day-slot {
                border: none !important;
                padding: 0 !important;
              }

              .inkera-calendar-mobile .rbc-time-gutter {
                background: rgba(255, 255, 255, 0.02) !important;
                border: none !important;
                width: 42px !important;
              }

              .inkera-calendar-mobile .rbc-time-gutter .rbc-label {
                font-size: 9px !important;
                color: rgba(255, 255, 255, 0.55) !important;
                font-weight: 500;
              }

              @media (min-width: 768px) {
                .inkera-calendar-mobile .rbc-time-gutter {
                  width: 48px !important;
                }

                .inkera-calendar-mobile .rbc-time-gutter .rbc-label {
                  font-size: 10px !important;
                }
              }

              .inkera-calendar-mobile .rbc-time-content .rbc-timeslot-group:nth-child(even) {
                background: rgba(255, 255, 255, 0.01) !important;
              }

              .inkera-calendar-mobile .rbc-time-content {
                border: none !important;
                padding: 0 !important;
              }

              .inkera-calendar-mobile .rbc-timeslot-group {
                border: none !important;
                margin: 0 !important;
                padding: 0 !important;
              }

              .inkera-calendar-mobile .rbc-time-view .rbc-day-slot .rbc-events-container {
                margin-right: 1px !important;
              }

              .inkera-calendar-mobile .rbc-current-time-indicator {
                display: none !important;
              }

              .inkera-calendar-mobile .rbc-event {
                border-radius: 6px !important;
                padding: 2px 4px !important;
                font-size: 8px !important;
                font-weight: 600 !important;
                margin: 1px 0 !important;
              }

              @media (min-width: 768px) {
                .inkera-calendar-mobile .rbc-event {
                  font-size: 9px !important;
                  padding: 3px 5px !important;
                }
              }

              .inkera-calendar-mobile .rbc-event:hover {
                transform: translateY(-0.5px) !important;
                transition: transform 0.15s ease !important;
              }

              .inkera-calendar-mobile .rbc-show-more {
                color: #ff9d00 !important;
                font-weight: 600 !important;
                font-size: 8px !important;
                background: rgba(255, 157, 0, 0.12) !important;
                border: 1px solid rgba(255, 157, 0, 0.3) !important;
                border-radius: 4px !important;
                padding: 2px 4px !important;
              }

              .inkera-calendar-mobile .rbc-row,
              .inkera-calendar-mobile .rbc-row-cell {
                border: none !important;
              }

              .inkera-calendar-mobile .rbc-row-content {
                z-index: 1 !important;
              }

              .inkera-calendar-mobile .rbc-label,
              .inkera-calendar-mobile .rbc-time-header-content .rbc-header,
              .inkera-calendar-mobile .rbc-time-gutter .rbc-timeslot-group {
                font-family: var(--font-one), sans-serif !important;
              }

              .inkera-calendar-mobile .rbc-day-slot .rbc-time-slot {
                min-height: 28px !important;
              }

              .inkera-calendar-mobile .rbc-time-view .rbc-day-slot .rbc-time-slot {
                min-height: 20px !important;
              }

              @media (min-width: 768px) {
                .inkera-calendar-mobile .rbc-day-slot .rbc-time-slot {
                  min-height: 32px !important;
                }

                .inkera-calendar-mobile .rbc-time-view .rbc-day-slot .rbc-time-slot {
                  min-height: 24px !important;
                }
              }

              .inkera-calendar-mobile .rbc-agenda-view table.rbc-agenda-table {
                border: none !important;
              }

              .inkera-calendar-mobile .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
                border-color: rgba(255, 255, 255, 0.08) !important;
              }
            `}</style>

            <Calendar
              localizer={localizer}
              culture="fr"
              events={styledEvents}
              startAccessor="start"
              endAccessor="end"
              eventPropGetter={eventStyleGetter}
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
              step={60}
              timeslots={1}
              messages={{
                next: "Suivant",
                previous: "Précédent",
                today: "Aujourd'hui",
                month: "Mois",
                week: "Semaine",
                day: "Jour",
                agenda: "Agenda",
                event: "Événement",
                showMore: (total) => `+${total}`,
                allDay: "Toute la journée",
                noEventsInRange: "Aucun événement",
              }}
              formats={{
                weekdayFormat: (date, culture, localizer) =>
                  localizer?.format(date, "eee", culture) ?? "",
                dayFormat: (date, culture, localizer) =>
                  localizer?.format(date, "d", culture) ?? "",
                timeGutterFormat: (date, culture, localizer) =>
                  localizer?.format(date, "HH", culture) ?? "",
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
