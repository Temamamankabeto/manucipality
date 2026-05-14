export {
  useAssignUserRoleMutation,
  useCreateUserMutation,
  useDeleteUserMutation,
  useOfficesLiteQuery,
  useResetUserPasswordMutation,
  useRolesLiteQuery,
  useRolesLiteQuery as useUserRolesLiteQuery,
  useToggleUserMutation,
  useUpdateUserMutation,
  useUserQuery,
  useUsersQuery,
  userManagementKeys,
} from "@/hooks/user/use-users";

export {
  useAssignRolePermissionsMutation,
  useCreateRoleMutation,
  useRolePermissionsQuery,
  useRolesQuery,
  useUpdateRoleMutation,
} from "@/hooks/user/use-roles";

export {
  useAllPermissionsQuery,
  useCreatePermissionMutation,
  useDeletePermissionMutation,
  usePermissionsQuery,
  useUpdatePermissionMutation,
} from "@/hooks/user/use-permissions";

export { useAuditLogsQuery } from "@/hooks/user/use-audit-logs";

export {
  useCitizensQuery,
  useCitizenQuery,
  useCreateCitizenMutation,
  useDeleteCitizenDocumentMutation,
  useDeleteCitizenMutation,
  useDuplicateCitizenMutation,
  useSubmitCitizenMutation,
  useUpdateCitizenMutation,
  useUploadCitizenDocumentMutation,
} from "@/hooks/citizen/use-citizens";

export {
  useAllOfficesQuery,
  useCreateOfficeMutation,
  useDeleteOfficeMutation,
  useOfficesQuery,
  useOfficeQuery,
  useOfficeTreeQuery,
  useToggleOfficeMutation,
  useUpdateOfficeMutation,
} from "@/hooks/location/use-offices";
