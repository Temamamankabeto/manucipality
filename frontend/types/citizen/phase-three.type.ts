import type { CitizenItem } from "@/types/citizen/citizen.type";
import type { OfficeItem, PaginationMeta } from "@/types/location/office.type";

export type PaginatedResponse<T> = {
  success?: boolean;
  message?: string;
  data: T[];
  meta: PaginationMeta;
};

export type HouseholdStatus = "active" | "inactive" | "suspended";
export type RelationshipType = "head" | "spouse" | "child" | "parent" | "sibling" | "dependent" | "other";

export type HouseholdCitizenSummary = {
  id: number;
  registration_number?: string;
  citizen_uid?: string | null;
  full_name: string;
  gender?: string;
  date_of_birth?: string | null;
  age?: number | null;
  phone?: string | null;
  status?: string;
};

export type HouseholdMemberItem = {
  id: number;
  household_id: number;
  citizen_id: number;
  citizen?: HouseholdCitizenSummary | null;
  relationship: RelationshipType;
  is_head: boolean;
  is_dependent: boolean;
  joined_at?: string | null;
  left_at?: string | null;
  status: "active" | "inactive";
};

export type HouseholdItem = {
  id: number;
  household_number: string;
  head_citizen_id?: number | null;
  head_citizen?: HouseholdCitizenSummary | null;
  city_id: number;
  subcity_id: number;
  woreda_id: number;
  zone_id: number;
  city?: OfficeItem | null;
  subcity?: OfficeItem | null;
  woreda?: OfficeItem | null;
  zone?: OfficeItem | null;
  house_number?: string | null;
  address?: string | null;
  status: HouseholdStatus;
  members_count?: number;
  members?: HouseholdMemberItem[];
  created_at?: string;
  updated_at?: string;
};

export type HouseholdListParams = {
  search?: string;
  status?: HouseholdStatus | "all";
  city_id?: number | string;
  subcity_id?: number | string;
  woreda_id?: number | string;
  zone_id?: number | string;
  page?: number;
  per_page?: number;
};

export type HouseholdPayload = {
  head_citizen_id: number | string;
  city_id: number | string;
  subcity_id: number | string;
  woreda_id: number | string;
  zone_id: number | string;
  house_number?: string;
  address?: string;
  status?: HouseholdStatus;
};

export type HouseholdMemberPayload = {
  citizen_id?: number | string;
  relationship: RelationshipType;
  is_dependent?: boolean;
  joined_at?: string;
  left_at?: string;
  status?: "active" | "inactive";
};

export type CitizenProfile = {
  personal_information: Record<string, unknown>;
  family_information: { relationship?: string; is_head?: boolean; is_dependent?: boolean; members: HouseholdMemberItem[] };
  household_information: HouseholdItem | null;
  documents: unknown[];
  property_ownership: { items: unknown[]; message: string };
  service_history: { items: unknown[]; message: string };
  payment_history: { items: unknown[]; message: string };
  employment_information: Record<string, unknown>;
  audit: Record<string, unknown>;
};

export type CitizenDashboardMetrics = {
  total_households: number;
  total_registered_citizens: number;
  active_citizens: number;
  pending_verifications: number;
  escalated_cases: number;
  duplicate_alerts: number;
  suspended_citizens: number;
  household_statistics: { average_members: number; active_households: number };
};

export type CitizenReportParams = {
  from_date?: string;
  to_date?: string;
  city_id?: number | string;
  subcity_id?: number | string;
  woreda_id?: number | string;
  zone_id?: number | string;
};

export type NotificationItem = {
  id: number;
  type: string;
  channel: string;
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
  read_at?: string | null;
  sent_at?: string | null;
  created_at?: string;
  citizen?: CitizenItem | null;
};
