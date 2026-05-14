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
  actor_id?: number | string | null;
  user_id?: number | string | null;
  module?: string | null;
  entity_type?: string | null;
  entity_id?: number | string | null;
  action?: string | null;
  description?: string | null;
  properties?: Record<string, unknown> | null;
  created_at?: string | null;
};
