export interface ActivityFilters {
  year: string;
  month: string;
  role: string;
  accountId: string;
  status: string;
}

export interface ActivityStats {
  totals: { appointments: number; clientRecords: number; moodboards: number; sharedMoodboards: number };
  filtered: { appointments: number; clientRecords: number; moodboards: number; sharedMoodboards: number };
  sharedByStatus: { status: string; count: number }[];
}

export const projectStatusLabels: Record<string, string> = {
  PRIVATE: "Privé", OPEN: "Ouvert", MATCHED: "Mis en relation", CLOSED: "Clôturé",
};
