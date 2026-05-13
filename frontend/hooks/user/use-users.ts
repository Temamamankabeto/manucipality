"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { permissionService } from "@/services/user/permission.service";
import { roleService } from "@/services/user/role.service";
import { userService } from "@/services/user/user.service";
import type {
  AssignRolePermissionsPayload,
  AssignUserRolePayload,
  CreateUserPayload,
  PermissionListParams,
  PermissionPayload,
  RoleListParams,
  RolePayload,
  UpdateUserPayload,
  UserListParams,
  ResetUserPasswordPayload,
} from "@/types/user-management/user.type";

export const userManagementKeys = {
  all: ["user-management"] as const,
  users: () => [...userManagementKeys.all, "users"] as const,
  usersList: (params: UserListParams = {}) => [...userManagementKeys.users(), "list", params] as const,
  userDetail: (id: number | string) => [...userManagementKeys.users(), "detail", id] as const,
  rolesLite: () => [...userManagementKeys.users(), "roles-lite"] as const,
  officesLite: (params: Record<string, unknown> = {}) => [...userManagementKeys.users(), "offices-lite", params] as const,
  waitersLite: (search?: string) => [...userManagementKeys.users(), "waiters-lite", search ?? ""] as const,
  roles: () => [...userManagementKeys.all, "roles"] as const,
  rolesList: (params: RoleListParams = {}) => [...userManagementKeys.roles(), "list", params] as const,
  rolePermissions: (id: number | string) => [...userManagementKeys.roles(), "permissions", id] as const,
  availableRolePermissions: (search?: string) => [...userManagementKeys.roles(), "available-permissions", search ?? ""] as const,
  permissions: () => [...userManagementKeys.all, "permissions"] as const,
  permissionsList: (params: PermissionListParams = {}) => [...userManagementKeys.permissions(), "list", params] as const,
  allPermissions: (search?: string) => [...userManagementKeys.permissions(), "all", search ?? ""] as const,
};

export function useUsersQuery(params: UserListParams = {}) {
  return useQuery({ queryKey: userManagementKeys.usersList(params), queryFn: () => userService.list(params) });
}

export function useUserQuery(id?: number | string) {
  return useQuery({ queryKey: userManagementKeys.userDetail(id ?? ""), queryFn: () => userService.show(id as number | string), enabled: Boolean(id) });
}

export function useRolesLiteQuery() {
  return useQuery({ queryKey: userManagementKeys.rolesLite(), queryFn: () => userService.rolesLite() });
}

export function useOfficesLiteQuery(params: { type?: string; parent_id?: number | string | null } = {}) {
  return useQuery({ queryKey: userManagementKeys.officesLite(params), queryFn: () => userService.officesLite(params) });
}

export function useWaitersLiteQuery(search?: string) {
  return useQuery({ queryKey: userManagementKeys.waitersLite(search), queryFn: () => userService.waitersLite(search) });
}

export function useCreateUserMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userService.create(payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: userManagementKeys.users() }); queryClient.invalidateQueries({ queryKey: userManagementKeys.rolesLite() }); onSuccess?.(); },
  });
}

export function useUpdateUserMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: UpdateUserPayload }) => userService.update(id, payload),
    onSuccess: (_data, variables) => { queryClient.invalidateQueries({ queryKey: userManagementKeys.users() }); queryClient.invalidateQueries({ queryKey: userManagementKeys.userDetail(variables.id) }); onSuccess?.(); },
  });
}

export function useDeleteUserMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: number | string) => userService.remove(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: userManagementKeys.users() }); onSuccess?.(); } });
}

export function useToggleUserMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => userService.toggle(id),
    onSuccess: (_data, id) => { queryClient.invalidateQueries({ queryKey: userManagementKeys.users() }); queryClient.invalidateQueries({ queryKey: userManagementKeys.userDetail(id) }); onSuccess?.(); },
  });
}

export function useResetUserPasswordMutation(onSuccess?: () => void) {
  return useMutation({ mutationFn: ({ id, payload }: { id: number | string; payload: ResetUserPasswordPayload }) => userService.resetPassword(id, payload), onSuccess });
}

export function useAssignUserRoleMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: AssignUserRolePayload }) => userService.assignRole(id, payload),
    onSuccess: (_data, variables) => { queryClient.invalidateQueries({ queryKey: userManagementKeys.users() }); queryClient.invalidateQueries({ queryKey: userManagementKeys.userDetail(variables.id) }); onSuccess?.(); },
  });
}

export function useRolesQuery(params: RoleListParams = {}) { return useQuery({ queryKey: userManagementKeys.rolesList(params), queryFn: () => roleService.list(params) }); }
export function useCreateRoleMutation(onSuccess?: () => void) { const queryClient = useQueryClient(); return useMutation({ mutationFn: (payload: RolePayload) => roleService.create(payload), onSuccess: () => { queryClient.invalidateQueries({ queryKey: userManagementKeys.roles() }); queryClient.invalidateQueries({ queryKey: userManagementKeys.rolesLite() }); onSuccess?.(); } }); }
export function useUpdateRoleMutation(onSuccess?: () => void) { const queryClient = useQueryClient(); return useMutation({ mutationFn: ({ id, payload }: { id: number | string; payload: RolePayload }) => roleService.update(id, payload), onSuccess: () => { queryClient.invalidateQueries({ queryKey: userManagementKeys.roles() }); queryClient.invalidateQueries({ queryKey: userManagementKeys.rolesLite() }); queryClient.invalidateQueries({ queryKey: userManagementKeys.users() }); onSuccess?.(); } }); }
export function useAvailableRolePermissionsQuery(search?: string) { return useQuery({ queryKey: userManagementKeys.availableRolePermissions(search), queryFn: () => roleService.permissions(search) }); }
export function useRolePermissionsQuery(id?: number | string) { return useQuery({ queryKey: userManagementKeys.rolePermissions(id ?? ""), queryFn: () => roleService.rolePermissions(id as number | string), enabled: Boolean(id) }); }
export function useAssignRolePermissionsMutation(onSuccess?: () => void) { const queryClient = useQueryClient(); return useMutation({ mutationFn: ({ id, payload }: { id: number | string; payload: AssignRolePermissionsPayload }) => roleService.assignPermissions(id, payload), onSuccess: (_data, variables) => { queryClient.invalidateQueries({ queryKey: userManagementKeys.roles() }); queryClient.invalidateQueries({ queryKey: userManagementKeys.rolePermissions(variables.id) }); queryClient.invalidateQueries({ queryKey: userManagementKeys.availableRolePermissions() }); onSuccess?.(); } }); }
export function usePermissionsQuery(params: PermissionListParams = {}) { return useQuery({ queryKey: userManagementKeys.permissionsList(params), queryFn: () => permissionService.list(params) }); }
export function useAllPermissionsQuery(search?: string) { return useQuery({ queryKey: userManagementKeys.allPermissions(search), queryFn: () => permissionService.all(search) }); }
export function useCreatePermissionMutation(onSuccess?: () => void) { const queryClient = useQueryClient(); return useMutation({ mutationFn: (payload: PermissionPayload) => permissionService.create(payload), onSuccess: () => { queryClient.invalidateQueries({ queryKey: userManagementKeys.permissions() }); queryClient.invalidateQueries({ queryKey: userManagementKeys.roles() }); onSuccess?.(); } }); }
export function useUpdatePermissionMutation(onSuccess?: () => void) { const queryClient = useQueryClient(); return useMutation({ mutationFn: ({ id, payload }: { id: number | string; payload: PermissionPayload }) => permissionService.update(id, payload), onSuccess: () => { queryClient.invalidateQueries({ queryKey: userManagementKeys.permissions() }); queryClient.invalidateQueries({ queryKey: userManagementKeys.roles() }); onSuccess?.(); } }); }
export function useDeletePermissionMutation(onSuccess?: () => void) { const queryClient = useQueryClient(); return useMutation({ mutationFn: (id: number | string) => permissionService.remove(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: userManagementKeys.permissions() }); queryClient.invalidateQueries({ queryKey: userManagementKeys.roles() }); onSuccess?.(); } }); }
