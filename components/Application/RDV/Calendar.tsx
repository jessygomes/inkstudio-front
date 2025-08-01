/* eslint-disable react/no-unescaped-entities */
"use client";

import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import { format } from "date-fns";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { fr } from "date-fns/locale/fr";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useMemo } from "react";
import { View } from "react-big-calendar";

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
  id: string;
  status?: string;
  prestation?: string;
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
  tattooDetail?: {
    id: string;
    type: string;
    zone: string;
    size: string;
    colorStyle: string;
    reference: string;
    sketch: string;
    estimatedPrice: number;
    description?: string;
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
  let backgroundColor = "#9CA3AF"; // default grey

  switch (event.status) {
    case "PENDING":
      backgroundColor = "#F59E0B"; // orange
      break;
    case "CONFIRMED":
      backgroundColor = "#10B981"; // green
      break;
    case "DECLINED":
      backgroundColor = "#EF4444"; // red
      break;
    case "CANCELED":
      backgroundColor = "#6B7280"; // dark gray
      break;
  }

  return {
    style: {
      backgroundColor,
      borderRadius: "8px",
      color: "white",
      border: "none",
      padding: "4px",
      fontWeight: "bold",
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
  const styledEvents = useMemo(() => {
    if (!Array.isArray(events) || events.length === 0) {
      return [];
    }

    const styled = events.map((event) => ({
      ...event,
      title: `${event.title} - ${
        event.client.firstName + " " + event.client.lastName || ""
      }`,
      allDay: event.allDay ?? false,
      start: new Date(event.start ?? Date.now()),
      end: new Date(event.end ?? Date.now()),
    }));

    return styled;
  }, [events]);

  return (
    <div className="h-full w-full flex flex-col p-6">
      {/* Header personnalisé avec navigation */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          {/* Boutons de vue */}
          <div className="flex bg-white/10 rounded-xl border border-white/20 overflow-hidden">
            {(["month", "week", "day"] as View[]).map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`px-4 py-2 text-xs font-medium transition-all duration-200 ${
                  currentView === view
                    ? "bg-secondary-500 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {view === "month"
                  ? "Mois"
                  : view === "week"
                  ? "Semaine"
                  : "Jour"}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation de date */}
        <div className="flex items-center gap-3">
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
            className="cursor-pointer p-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-xl border border-white/20 transition-colors"
          >
            ←
          </button>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-tertiary-400/20 hover:bg-tertiary-400/30 text-white text-xs rounded-xl border border-tertiary-400/50 transition-colors font-medium"
          >
            Aujourd'hui
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
            className="cursor-pointer p-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-xl border border-white/20 transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {/* Date actuelle affichée */}
      <div className="mb-4">
        <p className="text-white/80 font-two text-xs uppercase">
          {currentDate.toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            ...(currentView === "day" && { weekday: "long", day: "numeric" }),
            ...(currentView === "week" && { day: "numeric" }),
          })}
        </p>
      </div>

      {/* Calendrier */}
      <div className="flex-1 bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <style jsx global>{`
          .rbc-calendar {
            background: transparent !important;
            color: white !important;
            font-family: inherit !important;
            font-size: 10px !important;
          }

          .rbc-toolbar {
            display: none !important;
          }

          .rbc-header {
            background: rgba(255, 255, 255, 0.1) !important;
            color: white !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
            padding: 12px 8px !important;
            font-weight: 600 !important;
            font-size: 10px !important;
          }

          .rbc-month-view,
          .rbc-time-view {
            background: transparent !important;
            border: none !important;
          }

          .rbc-date-cell {
            padding: 8px !important;
            background: transparent !important;
            border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
            font-size: 10px !important;
          }

          .rbc-day-bg {
            background: transparent !important;
            border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          }

          .rbc-day-bg:hover {
            background: rgba(255, 255, 255, 0.05) !important;
          }

          .rbc-off-range-bg {
            background: rgba(0, 0, 0, 0.1) !important;
          }

          .rbc-today {
            background: rgba(255, 138, 0, 0.1) !important;
            border-radius: 0 !important;
          }

          .rbc-header.rbc-today {
            border-radius: 0 !important;
          }

          .rbc-time-slot {
            border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
            color: rgba(255, 255, 255, 0.7) !important;
          }

          .rbc-time-gutter {
            background: rgba(255, 255, 255, 0.05) !important;
            border-right: 1px solid rgba(255, 255, 255, 0.2) !important;
          }

          .rbc-timeslot-group {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          }

          .rbc-time-content {
            border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
          }

          .rbc-current-time-indicator {
            background-color: #ff8500 !important;
            height: 2px !important;
          }

          .rbc-event {
            border-radius: 8px !important;
            border: none !important;
            padding: 4px 8px !important;
            font-size: 10px !important;
            font-weight: 500 !important;
            margin: 1px !important;
          }

          .rbc-event:hover {
            transform: scale(1.02) !important;
            transition: transform 0.2s ease !important;
          }

          .rbc-show-more {
            color: #ff8500 !important;
            font-weight: 600 !important;
            font-size: 10px !important;
            background: rgba(255, 133, 0, 0.1) !important;
            padding: 2px 6px !important;
          }

          .rbc-row-content {
            z-index: 1 !important;
          }

          .rbc-addons-dnd .rbc-addons-dnd-drag-preview {
            opacity: 0.8 !important;
          }
        `}</style>

        <Calendar
          localizer={localizer}
          culture="fr"
          events={styledEvents}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={eventStyleGetter}
          style={{ height: "100%", width: "100%" }}
          views={["month", "week", "day"]}
          date={currentDate}
          view={currentView}
          onNavigate={() => {}} // Désactivé car on utilise nos propres boutons
          onView={() => {}} // Désactivé car on utilise nos propres boutons
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
          step={30}
          timeslots={2}
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
  );
};
