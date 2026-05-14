"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { officeService } from "@/services/location/office.service";
import type { OfficeListParams, OfficePayload, OfficeType } from "@/types/location/office.type";

export const officeKeys = {
  all: ["locations"] as const,
  legacyList: (params: OfficeListParams = {}) => [...officeKeys.all, "offices", params] as const,
  legacyAll: (params: OfficeListParams = {}) => [...officeKeys.all, "offices-all", params] as const,
  tree: (status?: string) => [...officeKeys.all, "tree", status ?? "active"] as const,
  levelList: (type: OfficeType, params: OfficeListParams = {}) => [...officeKeys.all, type, "list", params] as const,
  levelAll: (type: OfficeType, params: OfficeListParams = {}) => [...officeKeys.all, type, "all", params] as const,
  levelDetail: (type: OfficeType, id: number | string) => [...officeKeys.all, type, "detail", id] as const,
};

export function useOfficesQuery(params: OfficeListParams = {}) {
  return useQuery({ queryKey: officeKeys.legacyList(params), queryFn: () => officeService.list(params) });
}

export function useAllOfficesQuery(params: OfficeListParams = {}) {
  return useQuery({ queryKey: officeKeys.legacyAll(params), queryFn: () => officeService.all(params) });
}

export function useOfficeTreeQuery(status: OfficeListParams["status"] = "active") {
  return useQuery({ queryKey: officeKeys.tree(status), queryFn: () => officeService.tree(status) });
}

export function useOfficeQuery(id?: number | string) {
  return useQuery({ queryKey: officeKeys.levelDetail("city", id ?? ""), queryFn: () => officeService.show(id as number | string), enabled: Boolean(id) });
}

export function useLocationLevelQuery(type: OfficeType, params: OfficeListParams = {}) {
  return useQuery({ queryKey: officeKeys.levelList(type, params), queryFn: () => officeService.listLevel(type, params) });
}

export function useLocationLevelAllQuery(type: OfficeType, params: OfficeListParams = {}) {
  return useQuery({ queryKey: officeKeys.levelAll(type, params), queryFn: () => officeService.allLevel(type, params) });
}

export function useCitiesQuery(params: OfficeListParams = {}) {
  return useLocationLevelQuery("city", params);
}

export function useAllCitiesQuery(params: OfficeListParams = {}) {
  return useLocationLevelAllQuery("city", params);
}

export function useSubcitiesQuery(params: OfficeListParams = {}) {
  return useLocationLevelQuery("subcity", params);
}

export function useAllSubcitiesQuery(params: OfficeListParams = {}) {
  return useLocationLevelAllQuery("subcity", params);
}

export function useWoredasQuery(params: OfficeListParams = {}) {
  return useLocationLevelQuery("woreda", params);
}

export function useAllWoredasQuery(params: OfficeListParams = {}) {
  return useLocationLevelAllQuery("woreda", params);
}

export function useZonesQuery(params: OfficeListParams = {}) {
  return useLocationLevelQuery("zone", params);
}

export function useAllZonesQuery(params: OfficeListParams = {}) {
  return useLocationLevelAllQuery("zone", params);
}

export function useCreateOfficeMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload: OfficePayload) => officeService.create(payload), onSuccess: () => { queryClient.invalidateQueries({ queryKey: officeKeys.all }); onSuccess?.(); } });
}

export function useUpdateOfficeMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }: { id: number | string; payload: OfficePayload }) => officeService.update(id, payload), onSuccess: () => { queryClient.invalidateQueries({ queryKey: officeKeys.all }); onSuccess?.(); } });
}

export function useToggleOfficeMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: number | string) => officeService.toggle(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: officeKeys.all }); onSuccess?.(); } });
}

export function useDeleteOfficeMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: number | string) => officeService.remove(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: officeKeys.all }); onSuccess?.(); } });
}

export function useCreateLocationMutation(type: OfficeType, onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload: OfficePayload) => officeService.createLevel(type, payload), onSuccess: () => { queryClient.invalidateQueries({ queryKey: officeKeys.all }); onSuccess?.(); } });
}

export function useUpdateLocationMutation(type: OfficeType, onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }: { id: number | string; payload: OfficePayload }) => officeService.updateLevel(type, id, payload), onSuccess: () => { queryClient.invalidateQueries({ queryKey: officeKeys.all }); onSuccess?.(); } });
}

export function useToggleLocationMutation(type: OfficeType, onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: number | string) => officeService.toggleLevel(type, id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: officeKeys.all }); onSuccess?.(); } });
}

export function useDeleteLocationMutation(type: OfficeType, onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: number | string) => officeService.removeLevel(type, id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: officeKeys.all }); onSuccess?.(); } });
}
