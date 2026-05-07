import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vehiclesService, CreateVehiclePayload } from "@/services/vehicles";

export const VEHICLES_KEY = "vehicles";

export function useVehicles() {
  return useQuery({
    queryKey: [VEHICLES_KEY],
    queryFn: () => vehiclesService.list(),
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVehiclePayload) => vehiclesService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [VEHICLES_KEY] }),
  });
}

export function useActivateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vehiclesService.activate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [VEHICLES_KEY] }),
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vehiclesService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [VEHICLES_KEY] }),
  });
}
