import { apiClient } from "@/lib/axios";
import type { UserRating } from "@/types/api";

export const ratingsService = {
  async list(kind?: "given" | "received", userId?: string): Promise<UserRating[]> {
    const { data } = await apiClient.get<UserRating[]>("/ratings", {
      params: { ...(kind && { kind }), ...(userId && { user_id: userId }) },
    });
    return data;
  },

  async create(payload: {
    ride_id: string;
    rated_user_id: string;
    score: number;
    comment?: string;
  }): Promise<UserRating> {
    const { data } = await apiClient.post<UserRating>("/ratings", payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/ratings/${id}`);
  },
};
