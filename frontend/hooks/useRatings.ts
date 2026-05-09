import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ratingsService } from "@/services/ratings";

export const RATINGS_KEY = "ratings";

export function useRatingsReceived(userId?: string) {
  return useQuery({
    queryKey: [RATINGS_KEY, "received", userId],
    queryFn: () => ratingsService.list("received", userId),
  });
}

export function useRatingsGiven() {
  return useQuery({
    queryKey: [RATINGS_KEY, "given"],
    queryFn: () => ratingsService.list("given"),
  });
}

export function useCreateRating() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ratingsService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: [RATINGS_KEY] }),
  });
}
