"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { officeService } from "@/services/location/office.service";
import type { OfficeListParams, OfficePayload } from "@/types/location/office.type";

export const officeKeys = {
  all: ["offices"] as const,
  list: (params: OfficeListParams = {}) => [...officeKeys.all, "list", params] as const,
  allList: (params: OfficeListParams = {}) => [...officeKeys.all, "all", params] as const,
  tree: (status?: string) => [...officeKeys.all, "tree", status ?? "active"] as const,
  detail: (id: number | string) => [...officeKeys.all, "detail", id] as const,
};

export function useOfficesQuery(params: OfficeListParams = {}) {
  return useQuery({
    queryKey: officeKeys.list(params),
    queryFn: () => officeService.list(params),
  });
}

export function useAllOfficesQuery(params: OfficeListParams = {}) {
  return useQuery({
    queryKey: officeKeys.allList(params),
    queryFn: () => officeService.all(params),
  });
}

export function useOfficeTreeQuery(status: OfficeListParams["status"] = "active") {
  return useQuery({
    queryKey: officeKeys.tree(status),
    queryFn: () => officeService.tree(status),
  });
}

export function useOfficeQuery(id?: number | string) {
  return useQuery({
    queryKey: officeKeys.detail(id ?? ""),
    queryFn: () => officeService.show(id as number | string),
    enabled: Boolean(id),
  });
}

export function useCreateOfficeMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OfficePayload) => officeService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: officeKeys.all });
      onSuccess?.();
    },
  });
}

export function useUpdateOfficeMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: OfficePayload }) => officeService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: officeKeys.all });
      queryClient.invalidateQueries({ queryKey: officeKeys.detail(variables.id) });
      onSuccess?.();
    },
  });
}

export function useToggleOfficeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => officeService.toggle(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: officeKeys.all });
      queryClient.invalidateQueries({ queryKey: officeKeys.detail(id) });
    },
  });
}

export function useDeleteOfficeMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => officeService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: officeKeys.all });
      onSuccess?.();
    },
  });
}
