import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "@/services/notifications";

export const NOTIFICATIONS_KEY = "notifications";

export function useNotificationList(enabled = true) {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY],
    queryFn: () => notificationsService.list(),
    enabled,
  });
}

export function useUnreadCount(enabled = true) {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, "unreadCount"],
    queryFn: () => notificationsService.unreadCount(),
    enabled,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] }),
  });
}
