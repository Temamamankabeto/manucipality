import api, { unwrap } from "@/lib/api";
import type { ApiEnvelope, OfficeItem, OfficeListParams, OfficePayload, PaginatedResponse } from "@/types/location/office.type";

function cleanParams<T extends Record<string, unknown>>(params: T = {} as T) {
  const output: Record<string, unknown> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "all") return;
    output[key] = value;
  });
  return output;
}

function paginated<T>(body: any): PaginatedResponse<T> {
  const data = Array.isArray(body?.data) ? body.data : [];
  const meta = body?.meta ?? {};
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

function normalizePayload(payload: OfficePayload) {
  return {
    ...payload,
    code: payload.code?.trim() || undefined,
    parent_id: payload.type === "city" ? null : payload.parent_id,
  };
}

export const officeService = {
  async list(params: OfficeListParams = {}) {
    const response = await api.get("/offices", { params: cleanParams(params) });
    return paginated<OfficeItem>(response.data);
  },

  async all(params: OfficeListParams = {}) {
    const response = await api.get("/offices", { params: cleanParams({ ...params, all: true }) });
    const body = response.data;
    return Array.isArray(body?.data) ? (body.data as OfficeItem[]) : [];
  },

  async tree(status: OfficeListParams["status"] = "active") {
    const response = await api.get("/offices/tree", { params: cleanParams({ status }) });
    const body = response.data;
    return Array.isArray(body?.data) ? (body.data as OfficeItem[]) : [];
  },

  async show(id: number | string) {
    const response = await api.get(`/offices/${id}`);
    return unwrap<ApiEnvelope<OfficeItem>>(response).data;
  },

  async create(payload: OfficePayload) {
    const response = await api.post("/offices", normalizePayload(payload));
    return unwrap<ApiEnvelope<OfficeItem>>(response).data;
  },

  async update(id: number | string, payload: OfficePayload) {
    const response = await api.put(`/offices/${id}`, normalizePayload(payload));
    return unwrap<ApiEnvelope<OfficeItem>>(response).data;
  },

  async toggle(id: number | string) {
    const response = await api.patch(`/offices/${id}/toggle`);
    return unwrap<ApiEnvelope<OfficeItem>>(response).data;
  },

  async remove(id: number | string) {
    const response = await api.delete(`/offices/${id}`);
    return unwrap<ApiEnvelope<null>>(response);
  },
};

export default officeService;
