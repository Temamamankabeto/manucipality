export {
  useUsersQuery,
  useUserQuery,
  useRolesLiteQuery,
  useRolesLiteQuery as useUserRolesLiteQuery,
  useOfficesLiteQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleUserMutation,
  useResetUserPasswordMutation,
  useAssignUserRoleMutation,
} from "@/hooks/user/use-users";

export {
  useRolesQuery,
  useRolePermissionsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useAssignRolePermissionsMutation,
  useAvailableRolePermissionsQuery,
} from "@/hooks/user/use-roles";

export {
  usePermissionsQuery,
  useAllPermissionsQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
} from "@/hooks/user/use-permissions";

export {
  useCitizensQuery,
  useCitizenQuery,
  useCreateCitizenMutation,
  useUpdateCitizenMutation,
  useDeleteCitizenMutation,
  useSubmitCitizenMutation,
  useUploadCitizenDocumentMutation,
  useDeleteCitizenDocumentMutation,
  useDuplicateCitizenMutation,
  useCitizenWorkflowQueueQuery,
  useCitizenWorkflowQuery,
  useCitizenDuplicateFlagsQuery,
  useStartCitizenReviewMutation,
  useVerifyCitizenDocumentsMutation,
  useWoredaVerifyCitizenMutation,
  useSubcityApproveCitizenMutation,
  useGenerateCitizenIdMutation,
  useActivateCitizenMutation,
  useRejectCitizenMutation,
  useFlagCitizenMutation,
  useSuspendCitizenMutation,
} from "@/hooks/citizen/use-citizens";

export {
  useOfficesQuery,
  useAllOfficesQuery,
  useOfficeTreeQuery,
  useOfficeQuery,
  useCreateOfficeMutation,
  useUpdateOfficeMutation,
  useToggleOfficeMutation,
  useDeleteOfficeMutation,
} from "@/hooks/location/use-offices";

export { useAuditLogsQuery } from "@/hooks/user/use-audit-logs";
