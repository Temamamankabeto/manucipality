import api, { unwrap } from "@/lib/api";
import type { ApiEnvelope, AssignUserRolePayload, CreateUserPayload, OfficeItem, PaginatedResponse, PermissionItem, PermissionListParams, ResetUserPasswordPayload, RoleItem, RoleListParams, UpdateUserPayload, UserItem, UserListParams } from "@/types/user-management/user.type";
function cleanParams<T extends Record<string, unknown>>(params: T = {} as T) { const out: Record<string, unknown> = {}; Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null && v !== "" && v !== "all") out[k] = v; }); return out; }
function paginated<T>(body: any): PaginatedResponse<T> { const data = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : []; const meta = body?.meta ?? {}; return { success: body?.success, message: body?.message, data, meta: { current_page: Number(meta.current_page ?? 1), per_page: Number(meta.per_page ?? data.length ?? 10), total: Number(meta.total ?? data.length ?? 0), last_page: Number(meta.last_page ?? 1) } }; }
export const userService = {
  async list(params: UserListParams = {}) { const r = await api.get("/admin/users", { params: cleanParams(params) }); return paginated<UserItem>(r.data); },
  async show(id: number | string) { const r = await api.get(`/admin/users/${id}`); return unwrap<ApiEnvelope<UserItem>>(r).data; },
  async create(payload: CreateUserPayload) { const r = await api.post("/admin/users", payload); return unwrap<ApiEnvelope<UserItem>>(r); },
  async update(id: number | string, payload: UpdateUserPayload) { const r = await api.put(`/admin/users/${id}`, payload); return unwrap<ApiEnvelope<UserItem>>(r); },
  async remove(id: number | string) { const r = await api.delete(`/admin/users/${id}`); return unwrap<ApiEnvelope<null>>(r); },
  async toggle(id: number | string) { const r = await api.patch(`/admin/users/${id}/toggle`); return unwrap<ApiEnvelope<UserItem>>(r); },
  async resetPassword(id: number | string, payload: ResetUserPasswordPayload) { const r = await api.post(`/admin/users/${id}/reset-password`, payload); return unwrap<ApiEnvelope<{ id: number | string }>>(r); },
  async assignRole(id: number | string, payload: AssignUserRolePayload) { const r = await api.post(`/admin/users/${id}/roles`, payload); return unwrap<ApiEnvelope<UserItem>>(r); },
  async rolesLite() { const r = await api.get("/admin/users/roles-lite"); return Array.isArray(r.data?.data) ? r.data.data as RoleItem[] : []; },
  async officesLite(params: { type?: string; parent_id?: number | string | null } = {}) { const r = await api.get("/admin/users/offices-lite", { params: cleanParams(params) }); return Array.isArray(r.data?.data) ? r.data.data as OfficeItem[] : []; },
  async roles(params: RoleListParams = {}) { const r = await api.get("/admin/roles", { params: cleanParams(params) }); return paginated<RoleItem>(r.data); },
  async permissions(params: PermissionListParams = { all: true }) { const r = await api.get("/admin/permissions", { params: cleanParams(params) }); return Array.isArray(r.data?.data) ? r.data.data as PermissionItem[] : []; },
};
export default userService;
