export interface ActivityFilters {
  year: string;
  month: string;
  role: string;
  accountId: string;
  status: string;
}

export type ActivityMetric = "appointments" | "clientRecords" | "moodboards" | "sharedMoodboards";

export interface ActivityChartData {
  total: number;
  selected: number;
  grouping: "year" | "month" | "day";
  series: { period: string; count: number }[];
}

export const projectStatusLabels: Record<string, string> = {
  PRIVATE: "Privé", OPEN: "Ouvert", MATCHED: "Mis en relation", CLOSED: "Clôturé",
};
