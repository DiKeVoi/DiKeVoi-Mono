import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NotificationData } from "@/types/homeData"; // Nhớ import đúng đường dẫn của bạn

const NOTIFICATION_STORAGE_KEY = "@user_notifications";

const INITIAL_NOTIFICATIONS: NotificationData[] = [
  { 
    id: 1, 
    title: "Nguyễn Văn A yêu cầu kết nối với bạn", 
    time: new Date(), 
    read: false, 
    category: "matching" 
  },
  { 
    id: 2, 
    title: "Nguyễn Văn A đã đồng ý kết nối với bạn", 
    time: new Date(), 
    read: false, 
    category: "accepted" 
  },
  {
    id: 3,
    title: "Bạn đã hoàn thành chuyến đi với Nguyễn Văn A",
    time: new Date(),
    read: false,
    category: "success",
  },
  {
    id: 4,
    title: "Nguyễn Văn A đã hủy chuyến đi với bạn.",
    time: new Date(),
    read: false,
    category: "failed",
  },
];

const NotificationContext = createContext<any>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>(INITIAL_NOTIFICATIONS);

  useEffect(() => {
    const loadSavedNotifications = async () => {
      const savedData = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData).map((item: any) => ({
          ...item,
          time: new Date(item.time),
        }));
        setNotifications(parsedData);
      }
    };
    loadSavedNotifications();
  }, []);

  const saveAndSetNotifications = async (newNotifications: NotificationData[]) => {
    setNotifications(newNotifications);
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(newNotifications));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    saveAndSetNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: number) => {
    saveAndSetNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllAsRead, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);