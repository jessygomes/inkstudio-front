"use client";
import {
  CalendarEvent,
  CalendarView,
} from "@/components/Application/RDV/Calendar";
import { CSSProperties, useEffect, useState } from "react";
import BarLoader from "react-spinners/BarLoader";

export default function RDV() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  // const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
  //   null
  // );

  //! Loader
  const [loading, setLoading] = useState(true);

  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "none",
  };
  const color = "#ff5500";

  //! DATA
  useEffect(() => {
    const fetchEvents = async () => {
      setTimeout(() => {
        setLoading(true);
      }, 30000); // Simulate a delay for loading
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACK_URL}/appointments`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  console.log("Events:", events);

  return (
    <div className="w-full flex gap-2">
      {loading ? (
        <div className="h-[80vh] w-full flex items-center justify-center">
          {/* <p className="text-white text-2xl font-two text-center">
            Chargement...
          </p> */}
          <BarLoader
            color={color}
            loading={loading}
            cssOverride={override}
            // size={150}
            width={300}
            height={5}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      ) : error ? (
        <div className="h-[80vh] w-full flex items-center justify-center">
          <p className="text-white text-2xl font-two text-center">{error}</p>
        </div>
      ) : (
        <>
          <div className="w-full bg-primary-500">hein</div>
          {/* <h1 className="text-2xl font-bold mb-4">Agenda des Rendez-vous</h1> */}
          <div className="w-full">
            <CalendarView events={events} />
          </div>
        </>
      )}
    </div>
  );
}
