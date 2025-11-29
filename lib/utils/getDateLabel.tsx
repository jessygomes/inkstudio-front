/*
 *  Fonction pour formater la date avec les labels intelligents
 */
export const getDateLabel = (currentDate: string) => {
  // Date d'aujourd'hui
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Date d'hier
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  // Date de demain
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  if (currentDate === todayStr) {
    return "Aujourd'hui";
  } else if (currentDate === yesterdayStr) {
    return "Hier";
  } else if (currentDate === tomorrowStr) {
    return "Demain";
  } else {
    // Afficher la date au format français
    const date = new Date(currentDate);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
};
