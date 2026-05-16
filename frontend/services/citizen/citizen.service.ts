import api, { unwrap } from "@/lib/api";
import type { ApiEnvelope, CitizenDocument, CitizenDocumentType, CitizenDuplicateFlag, CitizenItem, CitizenListParams, CitizenPayload, CitizenWorkflowListParams, DocumentVerificationPayload, DuplicateCheckPayload, DuplicateCheckResult, OfficeItem, OfficeListParams, PaginatedResponse, WorkflowActionPayload } from "@/types/citizen/citizen.type";
function cleanParams<T extends Record<string, unknown>>(params: T = {} as T) { const out: Record<string, unknown> = {}; Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null && v !== "" && v !== "all") out[k] = v; }); return out; }
function paginated<T>(body: any): PaginatedResponse<T> { const data = Array.isArray(body?.data) ? body.data : []; const meta = body?.meta ?? {}; return { success: body?.success, message: body?.message, data, meta: { current_page: Number(meta.current_page ?? 1), per_page: Number(meta.per_page ?? data.length ?? 10), total: Number(meta.total ?? data.length ?? 0), last_page: Number(meta.last_page ?? 1) } }; }
function toFormData(payload: CitizenPayload) { const form = new FormData(); Object.entries(payload).forEach(([k,v]) => { if (v === undefined || v === null || v === "") return; if (v instanceof File) form.append(k, v); else if (typeof v === "boolean") form.append(k, v ? "1" : "0"); else form.append(k, String(v)); }); return form; }
async function workflowPatch(path: string, payload: WorkflowActionPayload = {}) { const r = await api.patch(path, payload); return unwrap<ApiEnvelope<CitizenItem>>(r).data; }
export const citizenService = {
 async offices(params: OfficeListParams = {}) { const r = await api.get("/offices", { params: cleanParams({ ...params, all: true }) }); return Array.isArray(r.data?.data) ? r.data.data as OfficeItem[] : []; },
 async list(params: CitizenListParams = {}) { const r = await api.get("/citizens", { params: cleanParams(params) }); return paginated<CitizenItem>(r.data); },
 async show(id: number | string) { const r = await api.get(`/citizens/${id}`); return unwrap<ApiEnvelope<CitizenItem>>(r).data; },
 async create(payload: CitizenPayload) { const r = await api.post("/citizens", toFormData(payload), { headers: { "Content-Type": "multipart/form-data" } }); return unwrap<ApiEnvelope<CitizenItem>>(r).data; },
 async update(id: number | string, payload: CitizenPayload) { const form = toFormData(payload); form.append("_method", "PUT"); const r = await api.post(`/citizens/${id}`, form, { headers: { "Content-Type": "multipart/form-data" } }); return unwrap<ApiEnvelope<CitizenItem>>(r).data; },
 async remove(id: number | string) { const r = await api.delete(`/citizens/${id}`); return unwrap<ApiEnvelope<null>>(r); },
 async submit(id: number | string) { const r = await api.patch(`/citizens/${id}/submit`); return unwrap<ApiEnvelope<CitizenItem>>(r).data; },
 async uploadDocument(id: number | string, payload: { type: CitizenDocumentType; title?: string; file: File }) { const form = new FormData(); form.append("type", payload.type); if (payload.title) form.append("title", payload.title); form.append("file", payload.file); const r = await api.post(`/citizens/${id}/documents`, form, { headers: { "Content-Type": "multipart/form-data" } }); return unwrap<ApiEnvelope<CitizenDocument>>(r).data; },
 async deleteDocument(id: number | string, documentId: number | string) { const r = await api.delete(`/citizens/${id}/documents/${documentId}`); return unwrap<ApiEnvelope<null>>(r); },
 async checkDuplicates(payload: DuplicateCheckPayload) { const r = await api.post("/citizens/validate-duplicate", payload); return unwrap<ApiEnvelope<DuplicateCheckResult>>(r).data; },
 async workflowQueue(params: CitizenWorkflowListParams = {}) { const r = await api.get("/citizens/workflow/pending", { params: cleanParams(params) }); return paginated<CitizenItem>(r.data); },
 async workflow(id: number | string) { const r = await api.get(`/citizens/${id}/workflow`); return unwrap<ApiEnvelope<CitizenItem>>(r).data; },
 async duplicateFlags(params: { status?: string; page?: number; per_page?: number } = {}) { const r = await api.get("/citizens/duplicates", { params: cleanParams(params) }); return paginated<CitizenDuplicateFlag>(r.data); },
 startReview: (id: number | string, payload?: WorkflowActionPayload) => workflowPatch(`/citizens/${id}/start-review`, payload),
 woredaVerify: (id: number | string, payload?: WorkflowActionPayload) => workflowPatch(`/citizens/${id}/woreda-verify`, payload),
 subcityApprove: (id: number | string, payload?: WorkflowActionPayload) => workflowPatch(`/citizens/${id}/subcity-approve`, payload),
 generateId: (id: number | string, payload?: WorkflowActionPayload) => workflowPatch(`/citizens/${id}/generate-id`, payload),
 activate: (id: number | string, payload?: WorkflowActionPayload) => workflowPatch(`/citizens/${id}/activate`, payload),
 reject: (id: number | string, payload?: WorkflowActionPayload) => workflowPatch(`/citizens/${id}/reject`, payload),
 flag: (id: number | string, payload?: WorkflowActionPayload) => workflowPatch(`/citizens/${id}/flag`, payload),
 suspend: (id: number | string, payload?: WorkflowActionPayload) => workflowPatch(`/citizens/${id}/suspend`, payload),
 async verifyDocuments(id: number | string, payload: DocumentVerificationPayload = {}) { const r = await api.patch(`/citizens/${id}/documents/verify`, payload); return unwrap<ApiEnvelope<CitizenItem>>(r).data; },
};
export default citizenService;
