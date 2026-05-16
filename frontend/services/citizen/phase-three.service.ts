import api, { unwrap } from "@/lib/api";
import type { ApiEnvelope, PaginatedResponse } from "@/types/citizen/citizen.type";
import type { CitizenDashboardMetrics, CitizenProfile, CitizenReportParams, HouseholdItem, HouseholdListParams, HouseholdMemberItem, HouseholdMemberPayload, HouseholdPayload, NotificationItem } from "@/types/citizen/phase-three.type";
function cleanParams<T extends Record<string, unknown>>(params: T = {} as T) { const out: Record<string, unknown> = {}; Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null && v !== "" && v !== "all") out[k] = v; }); return out; }
function paginated<T>(body: any): PaginatedResponse<T> { const data = Array.isArray(body?.data) ? body.data : []; const meta = body?.meta ?? {}; return { success: body?.success, message: body?.message, data, meta: { current_page: Number(meta.current_page ?? 1), per_page: Number(meta.per_page ?? data.length ?? 10), total: Number(meta.total ?? data.length ?? 0), last_page: Number(meta.last_page ?? 1) } }; }
export const phaseThreeCitizenService = {
 async households(params: HouseholdListParams = {}) { const r = await api.get("/households", { params: cleanParams(params) }); return paginated<HouseholdItem>(r.data); },
 async household(id: number | string) { const r = await api.get(`/households/${id}`); return unwrap<ApiEnvelope<HouseholdItem>>(r).data; },
 async createHousehold(payload: HouseholdPayload) { const r = await api.post("/households", payload); return unwrap<ApiEnvelope<HouseholdItem>>(r).data; },
 async updateHousehold(id: number | string, payload: HouseholdPayload) { const r = await api.put(`/households/${id}`, payload); return unwrap<ApiEnvelope<HouseholdItem>>(r).data; },
 async deleteHousehold(id: number | string) { const r = await api.delete(`/households/${id}`); return unwrap<ApiEnvelope<null>>(r); },
 async addMember(householdId: number | string, payload: HouseholdMemberPayload) { const r = await api.post(`/households/${householdId}/members`, payload); return unwrap<ApiEnvelope<HouseholdMemberItem>>(r).data; },
 async updateMember(householdId: number | string, memberId: number | string, payload: HouseholdMemberPayload) { const r = await api.put(`/households/${householdId}/members/${memberId}`, payload); return unwrap<ApiEnvelope<HouseholdMemberItem>>(r).data; },
 async deleteMember(householdId: number | string, memberId: number | string) { const r = await api.delete(`/households/${householdId}/members/${memberId}`); return unwrap<ApiEnvelope<null>>(r); },
 async citizenProfile(id: number | string) { const r = await api.get(`/citizens/${id}/profile`); return unwrap<ApiEnvelope<CitizenProfile>>(r).data; },
 async dashboardMetrics(params: CitizenReportParams = {}) { const r = await api.get("/citizen-dashboard/metrics", { params: cleanParams(params) }); return unwrap<ApiEnvelope<CitizenDashboardMetrics>>(r).data; },
 async report(name: string, params: CitizenReportParams = {}) { const r = await api.get(`/citizen-reports/${name}`, { params: cleanParams(params) }); return unwrap<ApiEnvelope<any>>(r).data; },
 async notifications(params: { status?: "read" | "unread" | "all"; type?: string; page?: number; per_page?: number } = {}) { const r = await api.get("/notifications", { params: cleanParams(params) }); return paginated<NotificationItem>(r.data); },
 async unreadNotifications() { const r = await api.get("/notifications/unread-count"); return unwrap<ApiEnvelope<{ count: number }>>(r).data; },
 async markNotificationRead(id: number | string) { const r = await api.patch(`/notifications/${id}/read`); return unwrap<ApiEnvelope<NotificationItem>>(r).data; },
 async markAllNotificationsRead() { const r = await api.patch("/notifications/mark-all-read"); return unwrap<ApiEnvelope<null>>(r); },
 async deleteNotification(id: number | string) { const r = await api.delete(`/notifications/${id}`); return unwrap<ApiEnvelope<null>>(r); },
};
export default phaseThreeCitizenService;
