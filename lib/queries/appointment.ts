export const fetchAppointments = async (
  userId: string,
  start: string,
  end: string
) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/range?userId=${userId}&start=${start}&end=${end}`
  );
  if (!res.ok) throw new Error("Erreur lors du chargement des rendez-vous");
  return res.json();
};
