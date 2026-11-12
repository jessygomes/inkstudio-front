export function getAppointmentActions(status: string, end: string | Date, now = new Date()) {
  const pending = status === "PENDING";
  const confirmed = status === "CONFIRMED";
  const ended = new Date(end).getTime() <= now.getTime();
  const editable = pending || status === "RESCHEDULING" || (confirmed && !ended);
  return {
    confirm: pending,
    // Un rendez-vous confirmé reste modifiable par le salon, même une fois l'horaire passé (corrections après coup).
    edit: editable || confirmed,
    reschedule: false,
    cancel: editable,
    attendance: confirmed && ended,
    email: true,
  };
}
