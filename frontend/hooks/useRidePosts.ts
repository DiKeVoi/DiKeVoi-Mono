import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ridePostsService, CreateRidePostPayload } from "@/services/ridePosts";
import { useAuth } from "@/hooks/AuthContext";
import type { PostType } from "@/types/api";

export const RIDE_POSTS_KEY = "ridePosts";

export function useRidePosts(type?: PostType) {
  return useQuery({
    queryKey: [RIDE_POSTS_KEY, type],
    queryFn: () => ridePostsService.list(type),
  });
}

export function useMyRidePosts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [RIDE_POSTS_KEY, "mine", user?.id],
    queryFn: async () => {
      const all = await ridePostsService.list();
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
