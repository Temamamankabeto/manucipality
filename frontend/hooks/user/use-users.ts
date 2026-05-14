"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user/user.service";
import type {
  AssignUserRolePayload,
  CreateUserPayload,
  ResetUserPasswordPayload,
  UpdateUserPayload,
  UserListParams,
} from "@/types/user-management/user.type";

export const userManagementKeys = {
  all: ["user-management"] as const,
  users: () => [...userManagementKeys.all, "users"] as const,
  usersList: (params: UserListParams = {}) => [...userManagementKeys.users(), "list", params] as const,
  userDetail: (id: number | string) => [...userManagementKeys.users(), "detail", id] as const,
  rolesLite: () => [...userManagementKeys.users(), "roles-lite"] as const,
  officesLite: (params: Record<string, unknown> = {}) => [...userManagementKeys.users(), "offices-lite", params] as const,
};

export function useUsersQuery(params: UserListParams = {}) {
  return useQuery({
    queryKey: userManagementKeys.usersList(params),
    queryFn: () => userService.list(params),
  });
}

export function useUserQuery(id?: number | string) {
  return useQuery({
    queryKey: userManagementKeys.userDetail(id ?? ""),
    queryFn: () => userService.show(id as number | string),
    enabled: Boolean(id),
  });
}

export function useRolesLiteQuery() {
  return useQuery({
    queryKey: userManagementKeys.rolesLite(),
    queryFn: () => userService.rolesLite(),
  });
}

export function useOfficesLiteQuery(params: { type?: string; parent_id?: number | string | null } = {}) {
  return useQuery({
    queryKey: userManagementKeys.officesLite(params),
    queryFn: () => userService.officesLite(params),
  });
}

export function useCreateUserMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userManagementKeys.users() });
      queryClient.invalidateQueries({ queryKey: userManagementKeys.rolesLite() });
      onSuccess?.();
    },
  });
}

export function useUpdateUserMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: UpdateUserPayload }) => userService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: userManagementKeys.users() });
      queryClient.invalidateQueries({ queryKey: userManagementKeys.userDetail(variables.id) });
      onSuccess?.();
    },
  });
}

export function useDeleteUserMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => userService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userManagementKeys.users() });
      onSuccess?.();
    },
  });
}

export function useToggleUserMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => userService.toggle(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: userManagementKeys.users() });
      queryClient.invalidateQueries({ queryKey: userManagementKeys.userDetail(id) });
      onSuccess?.();
    },
  });
}

export function useResetUserPasswordMutation(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: ResetUserPasswordPayload }) => userService.resetPassword(id, payload),
    onSuccess,
  });
}

export function useAssignUserRoleMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: AssignUserRolePayload }) => userService.assignRole(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: userManagementKeys.users() });
      queryClient.invalidateQueries({ queryKey: userManagementKeys.userDetail(variables.id) });
      onSuccess?.();
    },
  });
}
