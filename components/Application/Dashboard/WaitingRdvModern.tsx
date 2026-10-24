"use client";
import DashboardAppointments, { type DashboardAppointmentProps } from "./DashboardAppointments";
export default function WaitingRdvModern(props: DashboardAppointmentProps) { return <DashboardAppointments {...props} mode="waiting" />; }
