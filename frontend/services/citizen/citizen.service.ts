import api, { unwrap } from "@/lib/api";
import type {
  ApiEnvelope,
  CitizenDocument,
  CitizenDocumentType,
  CitizenItem,
  CitizenListParams,
  CitizenPayload,
  DuplicateCheckPayload,
  DuplicateCheckResult,
  OfficeItem,
  OfficeListParams,
  PaginatedResponse,
} from "@/types/citizen/citizen.type";

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

function toFormData(payload: CitizenPayload) {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (value instanceof File) form.append(key, value);
    else if (typeof value === "boolean") form.append(key, value ? "1" : "0");
    else form.append(key, String(value));
  });
  return form;
}

export const citizenService = {
  async offices(params: OfficeListParams = {}) {
    const response = await api.get("/offices", { params: cleanParams(params) });
    const body = response.data;
    return Array.isArray(body?.data) ? (body.data as OfficeItem[]) : [];
  },

  async list(params: CitizenListParams = {}) {
    const response = await api.get("/citizens", { params: cleanParams(params) });
    return paginated<CitizenItem>(response.data);
  },

  async show(id: number | string) {
    const response = await api.get(`/citizens/${id}`);
    return unwrap<ApiEnvelope<CitizenItem>>(response).data;
  },

  async create(payload: CitizenPayload) {
    const response = await api.post("/citizens", toFormData(payload), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return unwrap<ApiEnvelope<CitizenItem>>(response).data;
  },

  async update(id: number | string, payload: CitizenPayload) {
    const form = toFormData(payload);
    form.append("_method", "PUT");
    const response = await api.post(`/citizens/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return unwrap<ApiEnvelope<CitizenItem>>(response).data;
  },

  async remove(id: number | string) {
    const response = await api.delete(`/citizens/${id}`);
    return unwrap<ApiEnvelope<null>>(response);
  },

  async submit(id: number | string) {
    const response = await api.patch(`/citizens/${id}/submit`);
    return unwrap<ApiEnvelope<CitizenItem>>(response).data;
  },

  async uploadDocument(id: number | string, payload: { type: CitizenDocumentType; title?: string; file: File }) {
    const form = new FormData();
    form.append("type", payload.type);
    if (payload.title) form.append("title", payload.title);
    form.append("file", payload.file);

    const response = await api.post(`/citizens/${id}/documents`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return unwrap<ApiEnvelope<CitizenDocument>>(response).data;
  },

  async deleteDocument(id: number | string, documentId: number | string) {
    const response = await api.delete(`/citizens/${id}/documents/${documentId}`);
    return unwrap<ApiEnvelope<null>>(response);
  },

  async checkDuplicates(payload: DuplicateCheckPayload) {
    const response = await api.post("/citizens/validate-duplicate", payload);
    return unwrap<ApiEnvelope<DuplicateCheckResult>>(response).data;
  },
};

export default citizenService;
