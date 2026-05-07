import React, { createContext, useContext } from "react";
import {
  useNotificationList,
  useMarkRead,
  useMarkAllRead,
  useUnreadCount,
} from "@/hooks/useNotifications";
import type { Notification } from "@/types/api";

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: notifications = [] } = useNotificationList();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead: (id: string) => markRead.mutate(id),
        markAllAsRead: () => markAllRead.mutate(),
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be inside NotificationProvider");
  return ctx;
};
