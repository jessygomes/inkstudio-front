/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect } from "react";

interface Client {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Tatoueur {
  id: string;
  name: string;
  userId: string;
  img: string;
}

interface TattooDetail {
  id: string;
  clientId: string;
  appointmentId: string;
  description: string;
  zone: string;
}

interface RendezVous {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  prestation: string;
  client: Client;
  clientId: string;
  tatoueur: Tatoueur;
  tatoueurId: string;
  tattooDetail: TattooDetail;
  tattooDetailId: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export default function RendezVousToday({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<RendezVous[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchTodayAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/today/${userId}`
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des rendez-vous");
      }

      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "Confirmé";
      case "PENDING":
        return "En attente";
      case "CANCELLED":
        return "Annulé";
      default:
        return status;
    }
  };

  console.log("Appointments for today:", appointments);

  if (loading) {
    return (
      <div className="bg-noir-700 rounded-xl border border-white/20 p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white font-one">RDV du jour</h3>
          <div className="w-4 h-4 border-2 border-tertiary-500/50 rounded-full animate-spin border-t-tertiary-400"></div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-slate-300/10 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-noir-700 rounded-xl border border-white/20 p-4 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-4 font-one">
          RDV du jour
        </h3>
        <div className="text-center py-6">
          <div className="w-10 h-10 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-5 h-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-red-400 mb-3 text-sm font-medium">{error}</p>
          <button
            onClick={fetchTodayAppointments}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[550px] bg-noir-700 rounded-xl border border-white/20 p-4 overflow-y shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white font-one">RDV du jour</h3>
        <div className="px-2 py-1 bg-tertiary-500/20 text-tertiary-400 rounded-full text-xs font-medium border border-tertiary-500/50">
          {appointments.length}
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-2-2v6a2 2 0 01-2 2H10a2 2 0 01-2-2v-6"
              />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">Aucun RDV aujourd'hui</p>
        </div>
      ) : (
        <div className="space-y-2">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="border border-white/20 rounded-lg p-3 hover:bg-slate-400/10 transition-all duration-200 bg-slate-300/10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-tertiary-500 to-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-xs">
                      {appointment.client.firstName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-white text-sm truncate font-one">
                      {appointment.client.firstName}{" "}
                      {appointment.client.lastName}
                    </h4>
                    <p className="text-[10px] font-one text-gray-300 truncate">
                      {appointment.title}
                    </p>
                    <div className="flex items-center gap-3 text-xs font-one text-gray-400 mt-1">
                      <span>{formatTime(appointment.start)}</span>
                      <span>•</span>
                      <span>
                        {calculateDuration(appointment.start, appointment.end)}
                        min
                      </span>
                      {appointment.tattooDetail?.zone && (
                        <>
                          <span>•</span>
                          <span className="truncate">
                            {appointment.tattooDetail.zone}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-one font-medium border flex-shrink-0 ml-2 ${
                    appointment.status === "CONFIRMED"
                      ? "bg-green-900/50 text-green-400 border-green-600/30"
                      : appointment.status === "PENDING"
                      ? "bg-amber-900/50 text-amber-400 border-amber-600/30"
                      : "bg-red-900/50 text-red-400 border-red-600/30"
                  }`}
                >
                  {getStatusLabel(appointment.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
