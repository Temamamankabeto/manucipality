import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  propertyService,
} from "@/services/property";

export function useProperties(params?: any) {
  return useQuery({
    queryKey: ["properties", params],
    queryFn: () =>
      propertyService.getProperties(params),
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) =>
      propertyService.createProperty(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["properties"],
      });
    },
  });
}

export function usePropertyCategories(params?: any) {
  return useQuery({
    queryKey: ["property-categories", params],
    queryFn: () =>
      propertyService.getPropertyCategories(params),
  });
}

export function useCreatePropertyCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) =>
      propertyService.createPropertyCategory(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["property-categories"],
      });
    },
  });
}

export function useCitizenProperties(params?: any) {
  return useQuery({
    queryKey: ["citizen-properties", params],
    queryFn: () =>
      propertyService.getCitizenProperties(params),
  });
}

export function useAssignCitizenProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) =>
      propertyService.assignCitizenProperty(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["citizen-properties"],
      });
    },
  });
}
