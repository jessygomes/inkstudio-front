export function getAppointmentActions(status: string, end: string | Date, now = new Date()) {
  const pending = status === "PENDING";
  const confirmed = status === "CONFIRMED";
  const ended = new Date(end).getTime() <= now.getTime();
  const editable = pending || status === "RESCHEDULING" || (confirmed && !ended);
  return {
    confirm: pending,
    edit: editable,
    reschedule: false,
    cancel: editable,
    attendance: confirmed && ended,
    email: true,
  };
}
