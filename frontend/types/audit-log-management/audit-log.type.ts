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

export type AuditLogFilters = {
  actor?: string;
  action?: string;
  module?: string;
  page?: number;
  per_page?: number;
};

export type AuditLogItem = {
  id: number;
  actor_id?: number | null;
  user_id?: number | null;
  action: string;
  module?: string | null;
  entity_type?: string | null;
  entity_id?: number | string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  before?: unknown;
  after?: unknown;
  created_at?: string;
  updated_at?: string;
};
