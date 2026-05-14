"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { citizenService } from "@/services/citizen/citizen.service";
import type { CitizenDocumentType, CitizenListParams, CitizenPayload, DuplicateCheckPayload, OfficeListParams } from "@/types/citizen/citizen.type";

export const citizenKeys = {
  all: ["citizens"] as const,
  list: (params: CitizenListParams = {}) => [...citizenKeys.all, "list", params] as const,
  detail: (id: number | string) => [...citizenKeys.all, "detail", id] as const,
  offices: (params: OfficeListParams = {}) => ["offices", params] as const,
};

export function useOfficesQuery(params: OfficeListParams = {}) {
  return useQuery({
    queryKey: citizenKeys.offices(params),
    queryFn: () => citizenService.offices(params),
  });
}

export function useCitizensQuery(params: CitizenListParams = {}) {
  return useQuery({
    queryKey: citizenKeys.list(params),
    queryFn: () => citizenService.list(params),
  });
}

export function useCitizenQuery(id?: number | string) {
  return useQuery({
    queryKey: citizenKeys.detail(id ?? ""),
    queryFn: () => citizenService.show(id as number | string),
    enabled: Boolean(id),
  });
}

export function useCreateCitizenMutation(onSuccess?: (id: number | string) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CitizenPayload) => citizenService.create(payload),
    onSuccess: (citizen) => {
      queryClient.invalidateQueries({ queryKey: citizenKeys.all });
      onSuccess?.(citizen.id);
    },
  });
}

export function useUpdateCitizenMutation(onSuccess?: (id: number | string) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: CitizenPayload }) => citizenService.update(id, payload),
    onSuccess: (citizen) => {
      queryClient.invalidateQueries({ queryKey: citizenKeys.all });
      queryClient.invalidateQueries({ queryKey: citizenKeys.detail(citizen.id) });
      onSuccess?.(citizen.id);
    },
  });
}

export function useDeleteCitizenMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => citizenService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: citizenKeys.all });
      onSuccess?.();
    },
  });
}

export function useSubmitCitizenMutation(onSuccess?: (id: number | string) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => citizenService.submit(id),
    onSuccess: (citizen) => {
      queryClient.invalidateQueries({ queryKey: citizenKeys.all });
      queryClient.invalidateQueries({ queryKey: citizenKeys.detail(citizen.id) });
      onSuccess?.(citizen.id);
    },
  });
}

export function useUploadCitizenDocumentMutation(onSuccess?: (citizenId: number | string) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, type, title, file }: { id: number | string; type: CitizenDocumentType; title?: string; file: File }) =>
      citizenService.uploadDocument(id, { type, title, file }),
    onSuccess: (_doc, variables) => {
      queryClient.invalidateQueries({ queryKey: citizenKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: citizenKeys.all });
      onSuccess?.(variables.id);
    },
  });
}

export function useDeleteCitizenDocumentMutation(onSuccess?: (citizenId: number | string) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, documentId }: { id: number | string; documentId: number | string }) => citizenService.deleteDocument(id, documentId),
    onSuccess: (_doc, variables) => {
      queryClient.invalidateQueries({ queryKey: citizenKeys.detail(variables.id) });
      onSuccess?.(variables.id);
    },
  });
}

export function useDuplicateCitizenMutation() {
  return useMutation({
    mutationFn: (payload: DuplicateCheckPayload) => citizenService.checkDuplicates(payload),
  });
}
