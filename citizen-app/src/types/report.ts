export const ISSUE_CATEGORIES = [
  "pothole",
  "streetlight",
  "garbage",
  "water_leakage",
  "other",
] as const;

export type IssueCategory = (typeof ISSUE_CATEGORIES)[number];

export type SyncStatus = "pending" | "synced" | "failed";

export type GeoLocation = {
  latitude: number;
  longitude: number;
  address?: string;
};

export type StoredReport = {
  id: string;
  description: string;
  category: IssueCategory | "uncategorized";
  photoDataUrl?: string;
  location: GeoLocation;
  timestamp: number;
  synced: 0 | 1;
  backendReportId?: number;
  masterTicketId?: number;
  isDuplicate?: boolean;
  lastError?: string;
  status?: string;
};

export type CreateReportResponse = {
  status: string;
  message: string;
  report_id: number;
  master_ticket_id: number | null;
  is_duplicate: boolean;
  ai_analysis?: {
    is_valid_damage?: boolean;
    damage_type?: string;
    severity?: string;
    description?: string;
  };
};
