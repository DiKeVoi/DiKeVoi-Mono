import { apiClient } from "@/lib/axios";
import type { Report, ReportStatus } from "@/types/api";

export const reportsService = {
  async list(status?: ReportStatus): Promise<Report[]> {
    const { data } = await apiClient.get<Report[]>("/reports", {
      params: status ? { status } : {},
    });
    return data;
  },

  async get(id: string): Promise<Report> {
    const { data } = await apiClient.get<Report>(`/reports/${id}`);
    return data;
  },

  async create(payload: {
    reported_user_id?: string;
    ride_id?: string;
    reason: string;
    image_url?: string;
  }): Promise<Report> {
    const { data } = await apiClient.post<Report>("/reports", payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/reports/${id}`);
  },
};
