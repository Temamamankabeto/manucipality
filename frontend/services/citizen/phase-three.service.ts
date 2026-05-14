import api, { unwrap } from "@/lib/api";
import type { ApiEnvelope } from "@/types/user-management/user.type";
import type {
  CitizenDashboardMetrics,
  CitizenProfile,
  CitizenReportParams,
  HouseholdItem,
  HouseholdListParams,
  HouseholdMemberItem,
  HouseholdMemberPayload,
  HouseholdPayload,
  NotificationItem,
  PaginatedResponse,
} from "@/types/citizen/phase-three.type";

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

export const phaseThreeCitizenService = {
  async households(params: HouseholdListParams = {}) {
    const response = await api.get("/households", { params: cleanParams(params) });
    return paginated<HouseholdItem>(response.data);
  },

  async household(id: number | string) {
    const response = await api.get(`/households/${id}`);
    return unwrap<ApiEnvelope<HouseholdItem>>(response).data;
  },

  async createHousehold(payload: HouseholdPayload) {
    const response = await api.post("/households", payload);
    return unwrap<ApiEnvelope<HouseholdItem>>(response).data;
  },

  async updateHousehold(id: number | string, payload: HouseholdPayload) {
    const response = await api.put(`/households/${id}`, payload);
    return unwrap<ApiEnvelope<HouseholdItem>>(response).data;
  },

  async deleteHousehold(id: number | string) {
    const response = await api.delete(`/households/${id}`);
    return unwrap<ApiEnvelope<null>>(response);
  },

  async addMember(householdId: number | string, payload: HouseholdMemberPayload) {
    const response = await api.post(`/households/${householdId}/members`, payload);
    return unwrap<ApiEnvelope<HouseholdMemberItem>>(response).data;
  },

  async updateMember(householdId: number | string, memberId: number | string, payload: HouseholdMemberPayload) {
    const response = await api.put(`/households/${householdId}/members/${memberId}`, payload);
    return unwrap<ApiEnvelope<HouseholdMemberItem>>(response).data;
  },

  async deleteMember(householdId: number | string, memberId: number | string) {
    const response = await api.delete(`/households/${householdId}/members/${memberId}`);
    return unwrap<ApiEnvelope<null>>(response);
  },

  async citizenProfile(id: number | string) {
    const response = await api.get(`/citizens/${id}/profile`);
    return unwrap<ApiEnvelope<CitizenProfile>>(response).data;
  },

  async dashboardMetrics(params: CitizenReportParams = {}) {
    const response = await api.get("/citizen-dashboard/metrics", { params: cleanParams(params) });
    return unwrap<ApiEnvelope<CitizenDashboardMetrics>>(response).data;
  },

  async report(name: "gender-distribution" | "age-distribution" | "households" | "registration-trends" | "suspended", params: CitizenReportParams = {}) {
    const response = await api.get(`/citizen-reports/${name}`, { params: cleanParams(params) });
    return unwrap<ApiEnvelope<any[]>>(response).data;
  },

  async notifications(params: { status?: "read" | "unread" | "all"; type?: string; page?: number; per_page?: number } = {}) {
    const response = await api.get("/notifications", { params: cleanParams(params) });
    return paginated<NotificationItem>(response.data);
  },

  async unreadNotifications() {
    const response = await api.get("/notifications/unread-count");
    return unwrap<ApiEnvelope<{ count: number }>>(response).data;
  },

  async markNotificationRead(id: number | string) {
    const response = await api.patch(`/notifications/${id}/read`);
    return unwrap<ApiEnvelope<NotificationItem>>(response).data;
  },

  async markAllNotificationsRead() {
    const response = await api.patch("/notifications/mark-all-read");
    return unwrap<ApiEnvelope<null>>(response);
  },

  async deleteNotification(id: number | string) {
    const response = await api.delete(`/notifications/${id}`);
    return unwrap<ApiEnvelope<null>>(response);
  },
};

export default phaseThreeCitizenService;
