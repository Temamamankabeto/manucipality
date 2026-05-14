import api, { unwrap } from "@/lib/api";
import type { ApiEnvelope, OfficeItem, OfficeListParams, OfficePayload, OfficeType, PaginatedResponse } from "@/types/location/office.type";

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

function endpoint(type: OfficeType) {
  return type === "city" ? "/cities" : type === "subcity" ? "/subcities" : type === "woreda" ? "/woredas" : "/zones";
}

function normalizePayload(payload: OfficePayload, type?: OfficeType) {
  return {
    name: payload.name,
    code: payload.code?.trim() || undefined,
    type: type ?? payload.type,
    parent_id: (type ?? payload.type) === "city" ? null : payload.parent_id,
    is_active: payload.is_active ?? true,
  };
}

export const officeService = {
  async list(params: OfficeListParams = {}) {
    const response = await api.get("/offices", { params: cleanParams(params) });
    return paginated<OfficeItem>(response.data);
  },

  async all(params: OfficeListParams = {}) {
    const response = await api.get("/offices", { params: cleanParams({ ...params, all: true }) });
    return rows<OfficeItem>(response.data);
  },

  async tree(status: OfficeListParams["status"] = "active") {
    const response = await api.get("/locations/tree", { params: cleanParams({ status }) });
    return rows<OfficeItem>(response.data);
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

  async listLevel(type: OfficeType, params: OfficeListParams = {}) {
    const response = await api.get(endpoint(type), { params: cleanParams(params) });
    return paginated<OfficeItem>(response.data);
  },

  async allLevel(type: OfficeType, params: OfficeListParams = {}) {
    const response = await api.get(endpoint(type), { params: cleanParams({ ...params, all: true }) });
    return rows<OfficeItem>(response.data);
  },

  async showLevel(type: OfficeType, id: number | string) {
    const response = await api.get(`${endpoint(type)}/${id}`);
    return unwrap<ApiEnvelope<OfficeItem>>(response).data;
  },

  async createLevel(type: OfficeType, payload: OfficePayload) {
    const response = await api.post(endpoint(type), normalizePayload(payload, type));
    return unwrap<ApiEnvelope<OfficeItem>>(response).data;
  },

  async updateLevel(type: OfficeType, id: number | string, payload: OfficePayload) {
    const response = await api.put(`${endpoint(type)}/${id}`, normalizePayload(payload, type));
    return unwrap<ApiEnvelope<OfficeItem>>(response).data;
  },

  async toggleLevel(type: OfficeType, id: number | string) {
    const response = await api.patch(`${endpoint(type)}/${id}/toggle`);
    return unwrap<ApiEnvelope<OfficeItem>>(response).data;
  },

  async removeLevel(type: OfficeType, id: number | string) {
    const response = await api.delete(`${endpoint(type)}/${id}`);
    return unwrap<ApiEnvelope<null>>(response);
  },
};

export default officeService;
