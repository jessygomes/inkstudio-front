"use client";
import DashboardAppointments, { type DashboardAppointmentProps } from "./DashboardAppointments";
export default function RendezVousTodayModern(props: DashboardAppointmentProps) { return <DashboardAppointments {...props} mode="today" />; }
