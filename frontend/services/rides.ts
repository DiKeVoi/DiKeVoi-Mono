import { apiClient } from "@/lib/axios";
import type { Ride, RideStatus } from "@/types/api";

export const ridesService = {
  async list(status?: RideStatus): Promise<Ride[]> {
    const { data } = await apiClient.get<Ride[]>("/rides", {
      params: status ? { status } : {},
    });
    return data;
  },

  async get(id: string): Promise<Ride> {
    const { data } = await apiClient.get<Ride>(`/rides/${id}`);
    return data;
  },

  async create(payload: {
    offer_user_id?: string;
    request_user_id?: string;
    origin_location: string;
    destination_location: string;
    departure_time: string;
    status?: RideStatus;
    negotiated_cost?: number;
    is_recurring?: boolean;
  }): Promise<Ride> {
    const { data } = await apiClient.post<Ride>("/rides", payload);
    return data;
  },

  async update(id: string, payload: { status?: RideStatus; negotiated_cost?: number }): Promise<Ride> {
    const { data } = await apiClient.patch<Ride>(`/rides/${id}`, payload);
    return data;
  },
};
