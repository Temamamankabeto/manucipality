import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { roleService } from "@/services/user/role.service";
import { queryKeys } from "@/hooks/queryKeys";
import type { AssignRolePermissionsPayload, RoleListParams, RolePayload } from "@/types/user-management/user.type";

export function useRolesQuery(params: RoleListParams = {}) {
  return useQuery({ queryKey: queryKeys.roles.list(params), queryFn: () => roleService.list(params) });
}

export function useRolePermissionsQuery(id?: number | string) {
  return useQuery({ queryKey: queryKeys.roles.permissions(id ?? ""), queryFn: () => roleService.rolePermissions(id as number | string), enabled: Boolean(id) });
}

export function useAvailableRolePermissionsQuery(search?: string) {
  return useQuery({ queryKey: queryKeys.permissions.catalog(search), queryFn: () => roleService.permissions(search) });
}

export function useCreateRoleMutation(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (payload: RolePayload) => roleService.create(payload), onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.roles.root() }); toast.success("Role created"); onSuccess?.(); } });
}

export function useUpdateRoleMutation(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }: { id: number | string; payload: RolePayload }) => roleService.update(id, payload), onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.roles.root() }); toast.success("Role updated"); onSuccess?.(); } });
}

export function useAssignRolePermissionsMutation(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }: { id: number | string; payload: AssignRolePermissionsPayload }) => roleService.assignPermissions(id, payload), onSuccess: (_data, variables) => { qc.invalidateQueries({ queryKey: queryKeys.roles.root() }); qc.invalidateQueries({ queryKey: queryKeys.roles.permissions(variables.id) }); toast.success("Permissions assigned"); onSuccess?.(); } });
}
