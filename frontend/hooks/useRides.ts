import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ridesService } from "@/services/rides";
import type { RideStatus } from "@/types/api";
import { supabase } from "@/lib/supabase";

export const RIDES_KEY = "rides";

export function useRides(status?: RideStatus) {
  const qc = useQueryClient();
  const channelId = useRef(`rides-list-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "Ride" },
        () => qc.invalidateQueries({ queryKey: [RIDES_KEY] })
      )
      .subscribe((status, err) => {
        if (__DEV__) console.log("[Realtime] rides-list →", status, err ?? "");
      });
    return () => { supabase.removeChannel(channel); };
  }, [qc]); // eslint-disable-line react-hooks/exhaustive-deps

  return useQuery({
    queryKey: [RIDES_KEY, status],
    queryFn: () => ridesService.list(status),
  });
}

const ACTIVE_STATUSES = ["confirmed", "in_progress", "awaiting_payment"] as const;

export function useActiveRides() {
  const qc = useQueryClient();
  const channelId = useRef(`active-rides-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "Ride" },
        () => qc.invalidateQueries({ queryKey: [RIDES_KEY, "active"] })
      )
      .subscribe((status, err) => {
        if (__DEV__) console.log("[Realtime] active-rides →", status, err ?? "");
      });
    return () => { supabase.removeChannel(channel); };
  }, [qc]); // eslint-disable-line react-hooks/exhaustive-deps

  return useQuery({
    queryKey: [RIDES_KEY, "active"],
    queryFn: async () => {
      const results = await Promise.all(ACTIVE_STATUSES.map((s) => ridesService.list(s)));
      return results.flat().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
  });
}

export function useRide(id: string) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`ride:${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "Ride", filter: `id=eq.${id}` },
        () => {
          qc.invalidateQueries({ queryKey: [RIDES_KEY, id] });
          qc.invalidateQueries({ queryKey: [RIDES_KEY] });
        }
      )
      .subscribe((status, err) => {
        if (__DEV__) {
          console.log(`[Realtime] ride:${id} →`, status, err ?? "");
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [id, qc]);

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

export function useStartRide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ridesService.start(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: [RIDES_KEY] });
      qc.invalidateQueries({ queryKey: [RIDES_KEY, id] });
    },
  });
}

export function useFinishRide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ridesService.finish(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: [RIDES_KEY] });
      qc.invalidateQueries({ queryKey: [RIDES_KEY, id] });
    },
  });
}

export function useConfirmPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ridesService.pay(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: [RIDES_KEY] });
      qc.invalidateQueries({ queryKey: [RIDES_KEY, id] });
    },
  });
}
