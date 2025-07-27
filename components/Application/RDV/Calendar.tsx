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
      return []; // Retourne un tableau vide si `events` n'est pas un tableau ou est vide
    }

    return events.map((event) => ({
      ...event,
      title: `${event.title} - ${
        event.client.firstName + " " + event.client.lastName || ""
      }`,
      allDay: event.allDay ?? false,
      start: new Date(event.start ?? Date.now()),
      end: new Date(event.end ?? Date.now()),
    }));
  }, [events]);

  return (
    <div className="h-[85vh] w-full rounded-[20px] z-20">
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
        onNavigate={(date) => setCurrentDate(date)}
        onView={(view) => setCurrentView(view)}
        min={new Date(1970, 1, 1, 9, 0)} // 10:00
        max={new Date(1970, 1, 1, 19, 0)} // 19:00
        onSelectEvent={onSelectEvent}
        selectable
        onSelectSlot={(slotInfo) => {
          // Permet de cliquer sur un jour pour afficher la vue "day"
          if (currentView === "month") {
            setCurrentDate(slotInfo.start);
            setCurrentView("day");
          }
        }}
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
