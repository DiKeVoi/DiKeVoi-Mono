import { apiClient } from "@/lib/axios";
import type { RidePost, PostType } from "@/types/api";

export interface CreateRidePostPayload {
  type: PostType;
  origin_location: string;
  destination_location: string;
  departure_time: string;
  is_recurring: boolean;
  seats_available?: number;
  preferred_gender?: string | null;
  description?: string | null;
}

export const ridePostsService = {
  async list(type?: PostType): Promise<RidePost[]> {
    const { data } = await apiClient.get<RidePost[]>("/ride-posts", {
      params: type ? { type } : {},
    });
    return data;
  },

  async get(id: string): Promise<RidePost> {
    const { data } = await apiClient.get<RidePost>(`/ride-posts/${id}`);
    return data;
  },

  async create(payload: CreateRidePostPayload): Promise<RidePost> {
    const { data } = await apiClient.post<RidePost>("/ride-posts", payload);
    return data;
  },

  async update(id: string, payload: Partial<CreateRidePostPayload>): Promise<RidePost> {
    const { data } = await apiClient.patch<RidePost>(`/ride-posts/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/ride-posts/${id}`);
  },
};
