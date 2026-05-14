import api from "@/lib/api";
import type { AuditLogFilters, AuditLogItem, PaginatedResponse } from "@/types/audit-log-management/audit-log.type";

function cleanParams<T extends Record<string, unknown>>(params: T = {} as T) {
  const output: Record<string, unknown> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "all") return;
    output[key] = value;
  });
  return output;
}

function rows<T>(body: any): T[] {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.data?.data)) return body.data.data;
  return [];
}

function paginated<T>(body: any): PaginatedResponse<T> {
  const data = rows<T>(body);
  const meta = body?.meta ?? body?.data ?? {};
  return {
    success: body?.success,
    message: body?.message,
    data,
    meta: {
      current_page: Number(meta.current_page ?? 1),
      per_page: Number(meta.per_page ?? data.length ?? 10),
      total: Number(meta.total ?? data.length ?? 0),
      last_page: Number(meta.last_page ?? 1),
    },
  };
}

export const auditLogService = {
  async list(params: AuditLogFilters = {}) {
    const response = await api.get("/admin/audit-logs", { params: cleanParams(params) });
    return paginated<AuditLogItem>(response.data);
  },
};

export default auditLogService;
