import type { OfficeItem, OfficeListParams, OfficeType, PaginatedResponse, PaginationMeta, ApiEnvelope } from "@/types/location/office.type";

export type { ApiEnvelope, OfficeItem, OfficeListParams, OfficeType, PaginatedResponse, PaginationMeta };

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

export type CitizenGender = "male" | "female" | "other";
export type RegistrationChannel = "municipal_office" | "mobile_registration";
export type CitizenDocumentType = "national_id" | "birth_certificate" | "kebele_letter" | "passport_photo" | "other";
export type CitizenDocumentVerificationStatus = "pending" | "valid" | "invalid";
export type CitizenWorkflowStage = "document_verification" | "woreda_validation" | "subcity_approval" | "city_id_generation" | "activation" | "flagged";

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
  file_url?: string | null;
  verification_status?: CitizenDocumentVerificationStatus;
  verification_remarks?: string | null;
  verified_at?: string | null;
  created_at?: string;
};

export type CitizenApproval = {
  id: number;
  citizen_id: number;
  stage: string;
  action: string;
  from_status?: string | null;
  to_status?: string | null;
  remarks?: string | null;
  decided_by?: { id: number; name: string; email?: string } | null;
  decided_at?: string | null;
};

export type CitizenDuplicateFlag = {
  id: number;
  citizen_id: number;
  citizen?: CitizenItem | null;
  matched_citizen_id?: number | null;
  matched_citizen?: CitizenItem | null;
  national_id?: string | null;
  phone?: string | null;
  status: "open" | "resolved" | string;
  severity?: string;
  remarks?: string | null;
  flagged_at?: string | null;
};

export type CitizenUniqueId = { id: number; citizen_id: number; citizen_uid: string; generated_at?: string | null };

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
  current_workflow_stage?: string | null;
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
  approvals?: CitizenApproval[];
  duplicate_flags?: CitizenDuplicateFlag[];
  unique_id?: CitizenUniqueId | null;
  missing_required_documents?: CitizenDocumentType[];
  submitted_at?: string | null;
  reviewed_at?: string | null;
  woreda_verified_at?: string | null;
  subcity_approved_at?: string | null;
  city_id_generated_at?: string | null;
  activated_at?: string | null;
  rejected_at?: string | null;
  flagged_at?: string | null;
  suspended_at?: string | null;
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

export type CitizenWorkflowListParams = CitizenListParams & { stage?: CitizenWorkflowStage | "all" };

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
  city_id: number | string;
  subcity_id: number | string;
  woreda_id: number | string;
  zone_id: number | string;
  photo?: File | null;
};

export type DuplicateCheckPayload = { national_id?: string; phone?: string; exclude_citizen_id?: number | string };
export type DuplicateCheckResult = { has_duplicates: boolean; matches: CitizenItem[] };
export type WorkflowActionPayload = { remarks?: string; reason?: string };
export type DocumentVerificationPayload = { remarks?: string; documents?: Array<{ id: number; status: CitizenDocumentVerificationStatus; remarks?: string }> };
