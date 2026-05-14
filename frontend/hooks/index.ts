export * from "@/hooks/user/use-users";
export { useRolesLiteQuery as useUserRolesLiteQuery } from "@/hooks/user/use-users";
export * from "@/hooks/user/use-roles";
export * from "@/hooks/user/use-permissions";

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
