"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { citizenService } from "@/services/citizen/citizen.service";
import type { CitizenListParams, CitizenPayload, CitizenWorkflowListParams, DocumentVerificationPayload, DuplicateCheckPayload, WorkflowActionPayload } from "@/types/citizen/citizen.type";

export const citizenKeys = {
  all: ["citizens"] as const,
  list: (params: CitizenListParams = {}) => [...citizenKeys.all, "list", params] as const,
  detail: (id: number | string) => [...citizenKeys.all, "detail", id] as const,
  workflowQueue: (params: CitizenWorkflowListParams = {}) => [...citizenKeys.all, "workflow-queue", params] as const,
  workflow: (id: number | string) => [...citizenKeys.all, "workflow", id] as const,
  duplicateFlags: (params: Record<string, unknown> = {}) => [...citizenKeys.all, "duplicate-flags", params] as const,
};

function invalidateCitizen(queryClient: ReturnType<typeof useQueryClient>, id?: number | string) {
  queryClient.invalidateQueries({ queryKey: citizenKeys.all });
  if (id) {
    queryClient.invalidateQueries({ queryKey: citizenKeys.detail(id) });
    queryClient.invalidateQueries({ queryKey: citizenKeys.workflow(id) });
  }
}

export function useCitizensQuery(params: CitizenListParams = {}) {
  return useQuery({ queryKey: citizenKeys.list(params), queryFn: () => citizenService.list(params) });
}

export function useCitizenQuery(id?: number | string) {
  return useQuery({ queryKey: citizenKeys.detail(id ?? ""), queryFn: () => citizenService.show(id as number | string), enabled: Boolean(id) });
}

export function useCreateCitizenMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload: CitizenPayload) => citizenService.create(payload), onSuccess: () => { invalidateCitizen(queryClient); toast.success("Citizen created"); onSuccess?.(); } });
}

export function useUpdateCitizenMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }: { id: number | string; payload: CitizenPayload }) => citizenService.update(id, payload), onSuccess: (_data, variables) => { invalidateCitizen(queryClient, variables.id); toast.success("Citizen updated"); onSuccess?.(); } });
}

export function useDeleteCitizenMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: number | string) => citizenService.remove(id), onSuccess: () => { invalidateCitizen(queryClient); toast.success("Citizen deleted"); onSuccess?.(); } });
}

export function useSubmitCitizenMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: number | string) => citizenService.submit(id), onSuccess: (_data, id) => { invalidateCitizen(queryClient, id); toast.success("Citizen submitted"); onSuccess?.(); } });
}

export function useUploadCitizenDocumentMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }: { id: number | string; payload: Parameters<typeof citizenService.uploadDocument>[1] }) => citizenService.uploadDocument(id, payload), onSuccess: (_data, variables) => { invalidateCitizen(queryClient, variables.id); toast.success("Document uploaded"); onSuccess?.(); } });
}

export function useDeleteCitizenDocumentMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, documentId }: { id: number | string; documentId: number | string }) => citizenService.deleteDocument(id, documentId), onSuccess: (_data, variables) => { invalidateCitizen(queryClient, variables.id); toast.success("Document deleted"); onSuccess?.(); } });
}

export function useDuplicateCitizenMutation() {
  return useMutation({ mutationFn: (payload: DuplicateCheckPayload) => citizenService.checkDuplicates(payload) });
}

export function useCitizenWorkflowQueueQuery(params: CitizenWorkflowListParams = {}) {
  return useQuery({ queryKey: citizenKeys.workflowQueue(params), queryFn: () => citizenService.workflowQueue(params) });
}

export function useCitizenWorkflowQuery(id?: number | string) {
  return useQuery({ queryKey: citizenKeys.workflow(id ?? ""), queryFn: () => citizenService.workflow(id as number | string), enabled: Boolean(id) });
}

export function useCitizenDuplicateFlagsQuery(params: { status?: string; page?: number; per_page?: number } = {}) {
  return useQuery({ queryKey: citizenKeys.duplicateFlags(params), queryFn: () => citizenService.duplicateFlags(params) });
}

function workflowMutation(name: string, fn: (id: number | string, payload?: WorkflowActionPayload) => Promise<unknown>) {
  return function useWorkflowMutation(onSuccess?: () => void) {
    const queryClient = useQueryClient();
    return useMutation({ mutationFn: ({ id, payload }: { id: number | string; payload?: WorkflowActionPayload }) => fn(id, payload), onSuccess: (_data, variables) => { invalidateCitizen(queryClient, variables.id); toast.success(name); onSuccess?.(); } });
  };
}

export const useStartCitizenReviewMutation = workflowMutation("Review started", citizenService.startReview);
export const useWoredaVerifyCitizenMutation = workflowMutation("Woreda verification completed", citizenService.woredaVerify);
export const useSubcityApproveCitizenMutation = workflowMutation("Subcity approval completed", citizenService.subcityApprove);
export const useGenerateCitizenIdMutation = workflowMutation("Citizen ID generated", citizenService.generateId);
export const useActivateCitizenMutation = workflowMutation("Citizen activated", citizenService.activate);
export const useRejectCitizenMutation = workflowMutation("Citizen rejected", citizenService.reject);
export const useFlagCitizenMutation = workflowMutation("Citizen flagged", citizenService.flag);
export const useSuspendCitizenMutation = workflowMutation("Citizen suspended", citizenService.suspend);

export function useVerifyCitizenDocumentsMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }: { id: number | string; payload?: DocumentVerificationPayload }) => citizenService.verifyDocuments(id, payload ?? {}), onSuccess: (_data, variables) => { invalidateCitizen(queryClient, variables.id); toast.success("Documents verified"); onSuccess?.(); } });
}
