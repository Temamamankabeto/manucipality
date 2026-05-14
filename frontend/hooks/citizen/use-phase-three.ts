"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { phaseThreeCitizenService } from "@/services/citizen/phase-three.service";
import type { CitizenReportParams, HouseholdListParams, HouseholdMemberPayload, HouseholdPayload } from "@/types/citizen/phase-three.type";

export const phaseThreeKeys = {
  households: ["households"] as const,
  householdsList: (params: HouseholdListParams = {}) => ["households", "list", params] as const,
  household: (id: number | string) => ["households", "detail", id] as const,
  profile: (id: number | string) => ["citizen-profile", id] as const,
  dashboard: (params: CitizenReportParams = {}) => ["citizen-dashboard", params] as const,
  report: (name: string, params: CitizenReportParams = {}) => ["citizen-report", name, params] as const,
  notifications: (params: Record<string, unknown> = {}) => ["notifications", params] as const,
  unread: ["notifications", "unread"] as const,
};

export function useHouseholdsQuery(params: HouseholdListParams = {}) {
  return useQuery({ queryKey: phaseThreeKeys.householdsList(params), queryFn: () => phaseThreeCitizenService.households(params) });
}

export function useHouseholdQuery(id?: number | string) {
  return useQuery({ queryKey: phaseThreeKeys.household(id ?? ""), queryFn: () => phaseThreeCitizenService.household(id as number | string), enabled: Boolean(id) });
}

export function useCreateHouseholdMutation(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (payload: HouseholdPayload) => phaseThreeCitizenService.createHousehold(payload), onSuccess: () => { qc.invalidateQueries({ queryKey: phaseThreeKeys.households }); toast.success("Household created"); onSuccess?.(); } });
}

export function useUpdateHouseholdMutation(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }: { id: number | string; payload: HouseholdPayload }) => phaseThreeCitizenService.updateHousehold(id, payload), onSuccess: (_data, variables) => { qc.invalidateQueries({ queryKey: phaseThreeKeys.households }); qc.invalidateQueries({ queryKey: phaseThreeKeys.household(variables.id) }); toast.success("Household updated"); onSuccess?.(); } });
}

export function useDeleteHouseholdMutation(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number | string) => phaseThreeCitizenService.deleteHousehold(id), onSuccess: () => { qc.invalidateQueries({ queryKey: phaseThreeKeys.households }); toast.success("Household deleted"); onSuccess?.(); } });
}

export function useAddHouseholdMemberMutation(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ householdId, payload }: { householdId: number | string; payload: HouseholdMemberPayload }) => phaseThreeCitizenService.addMember(householdId, payload), onSuccess: (_data, variables) => { qc.invalidateQueries({ queryKey: phaseThreeKeys.household(variables.householdId) }); toast.success("Member added"); onSuccess?.(); } });
}

export function useUpdateHouseholdMemberMutation(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ householdId, memberId, payload }: { householdId: number | string; memberId: number | string; payload: HouseholdMemberPayload }) => phaseThreeCitizenService.updateMember(householdId, memberId, payload), onSuccess: (_data, variables) => { qc.invalidateQueries({ queryKey: phaseThreeKeys.household(variables.householdId) }); toast.success("Member updated"); onSuccess?.(); } });
}

export function useDeleteHouseholdMemberMutation(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ householdId, memberId }: { householdId: number | string; memberId: number | string }) => phaseThreeCitizenService.deleteMember(householdId, memberId), onSuccess: (_data, variables) => { qc.invalidateQueries({ queryKey: phaseThreeKeys.household(variables.householdId) }); toast.success("Member removed"); onSuccess?.(); } });
}

export function useCitizenProfileQuery(id?: number | string) {
  return useQuery({ queryKey: phaseThreeKeys.profile(id ?? ""), queryFn: () => phaseThreeCitizenService.citizenProfile(id as number | string), enabled: Boolean(id) });
}

export function useCitizenDashboardMetricsQuery(params: CitizenReportParams = {}) {
  return useQuery({ queryKey: phaseThreeKeys.dashboard(params), queryFn: () => phaseThreeCitizenService.dashboardMetrics(params) });
}

export function useCitizenReportQuery(name: "gender-distribution" | "age-distribution" | "households" | "registration-trends" | "suspended", params: CitizenReportParams = {}) {
  return useQuery({ queryKey: phaseThreeKeys.report(name, params), queryFn: () => phaseThreeCitizenService.report(name, params) });
}

export function useNotificationsQuery(params: { status?: "read" | "unread" | "all"; type?: string; page?: number; per_page?: number } = {}) {
  return useQuery({ queryKey: phaseThreeKeys.notifications(params), queryFn: () => phaseThreeCitizenService.notifications(params) });
}

export function useUnreadNotificationsQuery() {
  return useQuery({ queryKey: phaseThreeKeys.unread, queryFn: () => phaseThreeCitizenService.unreadNotifications() });
}

export function useMarkNotificationReadMutation() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number | string) => phaseThreeCitizenService.markNotificationRead(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); } });
}

export function useMarkAllNotificationsReadMutation() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => phaseThreeCitizenService.markAllNotificationsRead(), onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); toast.success("Notifications marked as read"); } });
}

export function useDeleteNotificationMutation() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: number | string) => phaseThreeCitizenService.deleteNotification(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); toast.success("Notification deleted"); } });
}
