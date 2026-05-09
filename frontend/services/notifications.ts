import { apiClient } from "@/lib/axios";
import type { Notification } from "@/types/api";

export const notificationsService = {
  async list(): Promise<Notification[]> {
    const { data } = await apiClient.get<Notification[]>("/notifications");
    return data;
  },

  async unreadCount(): Promise<number> {
    const { data } = await apiClient.get<{ count: number }>("/notifications/unread-count");
    return data.count;
  },

  async markRead(id: string): Promise<Notification> {
    const { data } = await apiClient.patch<Notification>(`/notifications/${id}`, {
      is_read: true,
    });
    return data;
  },

  async markAllRead(): Promise<void> {
    await apiClient.patch("/notifications/mark-all-read");
  },
};
