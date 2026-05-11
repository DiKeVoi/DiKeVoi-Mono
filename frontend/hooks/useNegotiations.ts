import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  negotiationsService,
  CreateNegotiationPayload,
  UpdateNegotiationPayload,
} from "@/services/negotiations";
import type { NegotiationStatus } from "@/types/api";
import { supabase } from "@/lib/supabase";

export const NEGOTIATIONS_KEY = "negotiations";

export function useNegotiations(status?: NegotiationStatus) {
  const qc = useQueryClient();
  const channelId = useRef(`negotiations-list-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    const channel = supabase
      .channel(channelId)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "Negotiation" }, () =>
        qc.invalidateQueries({ queryKey: [NEGOTIATIONS_KEY] })
      )
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "Negotiation" }, () =>
        qc.invalidateQueries({ queryKey: [NEGOTIATIONS_KEY] })
      )
      .subscribe((status, err) => {
        if (__DEV__) console.log("[Realtime] negotiations-list →", status, err ?? "");
      });
    return () => { supabase.removeChannel(channel); };
  }, [qc]); // eslint-disable-line react-hooks/exhaustive-deps

  return useQuery({
    queryKey: [NEGOTIATIONS_KEY, status],
    queryFn: () => negotiationsService.list(status),
  });
}

export function useNegotiation(id: string) {
  const qc = useQueryClient();
  const channelId = useRef(`negotiation-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "Negotiation", filter: `id=eq.${id}` },
        () => qc.invalidateQueries({ queryKey: [NEGOTIATIONS_KEY, id] })
      )
      .subscribe((status, err) => {
        if (__DEV__) console.log(`[Realtime] negotiation:${id} →`, status, err ?? "");
      });
    return () => { supabase.removeChannel(channel); };
  }, [id, qc]); // eslint-disable-line react-hooks/exhaustive-deps

  return useQuery({
    queryKey: [NEGOTIATIONS_KEY, id],
    queryFn: () => negotiationsService.get(id),
    enabled: !!id,
  });
}

export function useNegotiationUsers(id: string) {
  return useQuery({
    queryKey: [NEGOTIATIONS_KEY, id, "users"],
    queryFn: () => negotiationsService.getUsers(id),
    enabled: !!id, // Chỉ chạy khi có id
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
