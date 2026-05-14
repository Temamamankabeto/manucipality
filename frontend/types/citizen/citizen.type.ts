import type { OfficeItem, OfficeListParams, OfficeType } from "@/types/location/office.type";

export type { OfficeItem, OfficeListParams, OfficeType };

export type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
  meta?: PaginationMeta;
};

export type PaginationMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export type PaginatedResponse<T> = {
  success?: boolean;
  message?: string;
  data: T[];
  meta: PaginationMeta;
};

export type CitizenStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "woreda_verified"
  | "subcity_approved"
  | "city_id_generated"
  | "active"
  | "approved"
  | "rejected"
  | "flagged"
  | "suspended";

export type CitizenWorkflowStage =
  | "document_verification"
  | "woreda_validation"
  | "subcity_approval"
  | "city_id_generation"
  | "activation"
  | "submitted"
  | "under_review"
  | "woreda_verified"
  | "subcity_approved"
  | "city_id_generated"
  | "active"
  | "rejected"
  | "flagged"
  | "suspended";

export type CitizenGender = "male" | "female" | "other";
export type RegistrationChannel = "municipal_office" | "mobile_registration";
export type CitizenDocumentType = "national_id" | "birth_certificate" | "kebele_letter" | "passport_photo" | "other";

export type CitizenAddress = {
  id?: number;
  address: string;
  house_number?: string | null;
  city_id?: number | null;
  subcity_id?: number | null;
  woreda_id?: number | null;
  zone_id?: number | null;
};

export type CitizenDocument = {
  id: number;
  citizen_id: number;
  type: CitizenDocumentType;
  title?: string | null;
  original_name?: string | null;
  mime_type?: string | null;
  size?: number;
  is_required?: boolean;
  is_verified?: boolean;
  verified_at?: string | null;
  verified_by?: number | null;
  file_url?: string | null;
  created_at?: string;
};

export type CitizenWorkflowHistory = {
  id: number;
  citizen_id: number;
  action: string;
  from_status?: CitizenStatus | null;
  to_status?: CitizenStatus | null;
  remarks?: string | null;
  reason?: string | null;
  actor_id?: number | null;
  created_at?: string;
};

export type CitizenDuplicateFlag = {
  id: number;
  citizen_id: number;
  matched_citizen_id?: number | null;
  match_type?: string | null;
  match_value?: string | null;
  national_id?: string | null;
  phone?: string | null;
  remarks?: string | null;
  status?: string | null;
  flagged_at?: string | null;
  citizen?: CitizenItem;
  matched_citizen?: CitizenItem;
  created_at?: string;
};

export type CitizenItem = {
  id: number;
  registration_number: string;
  citizen_uid?: string | null;
  national_id?: string | null;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  full_name: string;
  gender: CitizenGender;
  date_of_birth?: string;
  place_of_birth?: string | null;
  nationality?: string;
  marital_status?: string | null;
  phone?: string | null;
  email?: string | null;
  occupation?: string | null;
  education_level?: string | null;
  disability_status?: boolean;
  emergency_contact?: string | null;
  photo_url?: string | null;
  registration_channel?: RegistrationChannel;
  status: CitizenStatus;
  city_id?: number | null;
  subcity_id?: number | null;
  woreda_id?: number | null;
  zone_id?: number | null;
  city?: OfficeItem | null;
  subcity?: OfficeItem | null;
  woreda?: OfficeItem | null;
  zone?: OfficeItem | null;
  address?: CitizenAddress | null;
  documents?: CitizenDocument[];
  workflow_history?: CitizenWorkflowHistory[];
  duplicate_flags?: CitizenDuplicateFlag[];
  missing_required_documents?: CitizenDocumentType[];
  submitted_at?: string | null;
  reviewed_at?: string | null;
  verified_at?: string | null;
  approved_at?: string | null;
  activated_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CitizenListParams = {
  search?: string;
  status?: CitizenStatus | "all";
  gender?: CitizenGender | "all";
  city_id?: number | string;
  subcity_id?: number | string;
  woreda_id?: number | string;
  zone_id?: number | string;
  registration_channel?: RegistrationChannel | "all";
  page?: number;
  per_page?: number;
};

export type CitizenWorkflowListParams = CitizenListParams & {
  stage?: CitizenWorkflowStage;
};

export type CitizenPayload = {
  national_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: CitizenGender;
  date_of_birth: string;
  place_of_birth?: string;
  nationality: string;
  marital_status?: string;
  phone: string;
  email?: string;
  occupation?: string;
  education_level?: string;
  disability_status?: boolean;
  emergency_contact?: string;
  registration_channel: RegistrationChannel;
  address: string;
  house_number?: string;
  city_id?: number | string | null;
  subcity_id?: number | string | null;
  woreda_id?: number | string | null;
  zone_id?: number | string | null;
  photo?: File | null;
};

export type DuplicateCheckPayload = {
  national_id?: string;
  phone?: string;
  exclude_citizen_id?: number | string;
};

export type DuplicateCheckResult = {
  has_duplicates: boolean;
  matches: CitizenItem[];
};

export type WorkflowActionPayload = {
  remarks?: string;
  reason?: string;
};

export type DocumentVerificationPayload = {
  remarks?: string;
  documents?: Array<{
    id: number | string;
    is_verified: boolean;
    status?: "pending" | "valid" | "invalid";
    remarks?: string;
  }>;
};
