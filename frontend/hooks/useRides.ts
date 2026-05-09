import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ridesService } from "@/services/rides";
import type { RideStatus } from "@/types/api";

export const RIDES_KEY = "rides";

export function useRides(status?: RideStatus) {
  return useQuery({
    queryKey: [RIDES_KEY, status],
    queryFn: () => ridesService.list(status),
  });
}

export function useRide(id: string) {
  return useQuery({
    queryKey: [RIDES_KEY, id],
    queryFn: () => ridesService.get(id),
    enabled: !!id,
  });
}

export function useUpdateRideStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RideStatus }) =>
      ridesService.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [RIDES_KEY] }),
  });
}
