"use client";

import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import { format } from "date-fns";
import { parse } from "date-fns/parse";
import { startOfWeek } from "date-fns/startOfWeek";
import { getDay } from "date-fns/getDay";
import { fr } from "date-fns/locale/fr";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useMemo } from "react";

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
  clientName?: string;
};

interface CalendarViewProps {
  events: CalendarEvent[];
}

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

export const CalendarView: React.FC<CalendarViewProps> = ({ events }) => {
  const styledEvents = useMemo(() => {
    return events.map((event) => ({
      ...event,
      title: `${event.title} - ${event.clientName || ""}`,
      allDay: event.allDay ?? false,
      start: new Date(event.start ?? Date.now()),
      end: new Date(event.end ?? Date.now()),
    }));
  }, [events]);

  return (
    <div className="h-[80vh] w-full rounded-[20px]">
      <Calendar
        localizer={localizer}
        culture="fr"
        events={styledEvents}
        startAccessor="start"
        endAccessor="end"
        eventPropGetter={eventStyleGetter}
        style={{ height: "100%", width: "100%" }}
        min={new Date(1970, 1, 1, 9, 0)} // 10:00
        max={new Date(1970, 1, 1, 19, 0)} // 19:00
        messages={{
          next: "Suivant",
          previous: "Précédent",
          today: "Aujourd'hui",
          month: "Mois",
          week: "Semaine",
          day: "Jour",
          agenda: "Agenda",
          event: "Événement",
          showMore: (total) => `+ ${total} de plus`,
          allDay: "Toute la journée",
          noEventsInRange: "Aucun événement dans cette plage horaire",
        }}
        formats={{
          // weekdayFormat: (date, culture, localizer) =>
          //   localizer?.format(date, "eeee", culture) ?? "", // "EEEE" = nom complet du jour en français
          // dayFormat: (date, culture, localizer) =>
          //   localizer?.format(date, "dd/MM", culture) ?? "", // "dd/MM" = jour et mois
          timeGutterFormat: (date, culture, localizer) =>
            localizer?.format(date, "HH:mm", culture) ?? "", // ⏰ 24h
          eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
            `${localizer?.format(start, "HH:mm", culture) ?? ""} - ${
              localizer?.format(end, "HH:mm", culture) ?? ""
            }`,
          agendaTimeFormat: (date, culture, localizer) =>
            localizer?.format(date, "HH:mm", culture) ?? "",
          agendaDateFormat: (date, culture, localizer) =>
            localizer?.format(date, "EEEE dd MMMM yyyy", culture) ?? "",
        }}
        // className="rounded-[20px] border-4 border-tertiary-500 text-white font-two"
      />
    </div>
  );
};
