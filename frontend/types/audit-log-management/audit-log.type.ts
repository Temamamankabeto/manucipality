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
  actor?: string | number;
  actor_id?: string | number;
  action?: string;
  module?: string;
  entity_type?: string;
  page?: number;
  per_page?: number;
};

export type AuditLogItem = {
  id: number;
  actor_id?: number | null;
  user_id?: number | null;
  actor?: { id: number; name: string } | null;
  module?: string | null;
  entity_type?: string | null;
  entity_id?: number | string | null;
  action: string;
  ip_address?: string | null;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
};
