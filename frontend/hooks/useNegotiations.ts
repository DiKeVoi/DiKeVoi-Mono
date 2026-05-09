import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  negotiationsService,
  CreateNegotiationPayload,
  UpdateNegotiationPayload,
} from "@/services/negotiations";
import type { NegotiationStatus } from "@/types/api";

export const NEGOTIATIONS_KEY = "negotiations";

export function useNegotiations(status?: NegotiationStatus) {
  return useQuery({
    queryKey: [NEGOTIATIONS_KEY, status],
    queryFn: () => negotiationsService.list(status),
    refetchInterval: 10_000,
  });
}

export function useNegotiation(id: string) {
  return useQuery({
    queryKey: [NEGOTIATIONS_KEY, id],
    queryFn: () => negotiationsService.get(id),
    enabled: !!id,
    refetchInterval: 5_000,
  });
}

export function useCreateNegotiation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateNegotiationPayload) => negotiationsService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [NEGOTIATIONS_KEY] }),
  });
}

export function useUpdateNegotiation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateNegotiationPayload }) =>
      negotiationsService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [NEGOTIATIONS_KEY] }),
  });
}

export function useConfirmNegotiation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => negotiationsService.confirm(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [NEGOTIATIONS_KEY] }),
  });
}
