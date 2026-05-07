import { apiClient } from "@/lib/axios";
import type { Vehicle } from "@/types/api";

export interface CreateVehiclePayload {
  make: string;
  model: string;
  year: number;
  plate: string;
  color?: string;
  seats?: number;
}

export const vehiclesService = {
  async list(): Promise<Vehicle[]> {
    const { data } = await apiClient.get<Vehicle[]>("/vehicles");
    return data;
  },

  async create(payload: CreateVehiclePayload): Promise<Vehicle> {
    const { data } = await apiClient.post<Vehicle>("/vehicles", payload);
    return data;
  },

  async activate(id: string): Promise<Vehicle> {
    const { data } = await apiClient.patch<Vehicle>(`/vehicles/${id}/activate`);
    return data;
  },

  async update(id: string, payload: Partial<CreateVehiclePayload>): Promise<Vehicle> {
    const { data } = await apiClient.patch<Vehicle>(`/vehicles/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/vehicles/${id}`);
  },
};
