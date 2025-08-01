export const fetchAppointments = async (
  userId: string,
  start: string,
  end: string,
  page: number = 1,
  limit: number = 5
) => {
  try {
    /* Format de réponse des données : 
      error: false,
      appointments,
  */
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/range?userId=${userId}&start=${start}&end=${end}&page=${page}&limit=${limit}`
    );
    if (!res.ok) throw new Error("Erreur lors du chargement des rendez-vous");
    const data = await res.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
};

export const fetchAllAppointments = async (
  userId: string,
  page: number = 1,
  limit: number = 5
) => {
  /* Format de réponse des données : 
      error: false,
      appointments,
      pagination: {
      currentPage: page,
      totalPages,
      totalAppointments,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
  */
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/appointments/salon/${userId}?page=${page}&limit=${limit}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched appointments:", data);
    return data || [];
  } catch (error) {
    console.error("Error fetching all appointments:", error);
    throw error;
  }
};
