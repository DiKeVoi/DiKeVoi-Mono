import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ridePostsService, CreateRidePostPayload } from "@/services/ridePosts";
import { useAuth } from "@/hooks/AuthContext";
import type { PostType } from "@/types/api";
import { supabase } from "@/lib/supabase";

export const RIDE_POSTS_KEY = "ridePosts";

export function useRidePosts(type?: PostType) {
  return useQuery({
    queryKey: [RIDE_POSTS_KEY, type],
    queryFn: () => ridePostsService.list(type),
  });
}

export function useMyRidePosts() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const channelId = useRef(`my-ride-posts-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    if (!user) return;

    const invalidate = () => qc.invalidateQueries({ queryKey: [RIDE_POSTS_KEY, "mine", user.id] });

    const ridePostChannel = supabase
      .channel(channelId)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "RidePost" }, invalidate)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "Negotiation" }, invalidate)
      .subscribe((status, err) => {
        if (__DEV__) console.log("[Realtime] my-ride-posts →", status, err ?? "");
      });

    return () => { supabase.removeChannel(ridePostChannel); };
  }, [user, qc]); // eslint-disable-line react-hooks/exhaustive-deps

  return useQuery({
    queryKey: [RIDE_POSTS_KEY, "mine", user?.id],
    queryFn: async () => {
      const all = await ridePostsService.listMine();
      return all.filter((p) => p.userId === user?.id);
    },
    enabled: !!user,
  });
}

export function useCreateRidePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRidePostPayload) =>
      ridePostsService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [RIDE_POSTS_KEY] }),
  });
}

export function useDeleteRidePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ridePostsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [RIDE_POSTS_KEY] }),
  });
}
