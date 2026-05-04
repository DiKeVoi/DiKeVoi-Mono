import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Unmock the NotificationContext so we test the real implementation
jest.unmock('@/hooks/NotificationContext');

import { NotificationProvider, useNotification } from '../../hooks/NotificationContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NotificationProvider>{children}</NotificationProvider>
);

describe('NotificationContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(null);
  });

  describe('useNotification hook', () => {
    it('returns notifications from context', async () => {
      const { result } = renderHook(() => useNotification(), { wrapper });
      await act(async () => {});
      expect(result.current.notifications).toBeDefined();
      expect(Array.isArray(result.current.notifications)).toBe(true);
    });

    it('returns initial 4 notifications', async () => {
      const { result } = renderHook(() => useNotification(), { wrapper });
      await act(async () => {});
      expect(result.current.notifications).toHaveLength(4);
    });

    it('returns unreadCount equal to number of unread notifications', async () => {
      const { result } = renderHook(() => useNotification(), { wrapper });
      await act(async () => {});
      const unread = result.current.notifications.filter((n: any) => !n.read).length;
      expect(result.current.unreadCount).toBe(unread);
    });

    it('initial unreadCount is 4 (all unread)', async () => {
      const { result } = renderHook(() => useNotification(), { wrapper });
      await act(async () => {});
      expect(result.current.unreadCount).toBe(4);
    });

    it('exposes markAllAsRead function', async () => {
      const { result } = renderHook(() => useNotification(), { wrapper });
      await act(async () => {});
      expect(typeof result.current.markAllAsRead).toBe('function');
    });

    it('exposes markAsRead function', async () => {
      const { result } = renderHook(() => useNotification(), { wrapper });
      await act(async () => {});
      expect(typeof result.current.markAsRead).toBe('function');
    });

    it('markAllAsRead sets all notifications to read', async () => {
      const { result } = renderHook(() => useNotification(), { wrapper });
      await act(async () => {});

      await act(async () => {
        result.current.markAllAsRead();
      });

      expect(result.current.unreadCount).toBe(0);
      result.current.notifications.forEach((n: any) => {
        expect(n.read).toBe(true);
      });
    });

    it('markAllAsRead persists to AsyncStorage', async () => {
      const { result } = renderHook(() => useNotification(), { wrapper });
      await act(async () => {});

      await act(async () => {
        result.current.markAllAsRead();
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@user_notifications',
        expect.any(String)
      );
    });

    it('markAsRead marks only the specified notification as read', async () => {
      const { result } = renderHook(() => useNotification(), { wrapper });
      await act(async () => {});

      const targetId = result.current.notifications[0].id;
      await act(async () => {
        result.current.markAsRead(targetId);
      });

      const updatedNotification = result.current.notifications.find(
        (n: any) => n.id === targetId
      );
      expect(updatedNotification?.read).toBe(true);
    });

    it('markAsRead does not mark other notifications as read', async () => {
      const { result } = renderHook(() => useNotification(), { wrapper });
      await act(async () => {});

      const targetId = result.current.notifications[0].id;
      await act(async () => {
        result.current.markAsRead(targetId);
      });

      // Other notifications should still be unread
      const othersUnread = result.current.notifications
        .filter((n: any) => n.id !== targetId)
        .filter((n: any) => !n.read);
      expect(othersUnread.length).toBeGreaterThan(0);
    });

    it('markAsRead updates unreadCount correctly', async () => {
      const { result } = renderHook(() => useNotification(), { wrapper });
      await act(async () => {});

      const initialUnreadCount = result.current.unreadCount;
      const targetId = result.current.notifications.find((n: any) => !n.read)?.id;

      await act(async () => {
        result.current.markAsRead(targetId);
      });

      expect(result.current.unreadCount).toBe(initialUnreadCount - 1);
    });

    it('markAsRead persists to AsyncStorage', async () => {
      const { result } = renderHook(() => useNotification(), { wrapper });
      await act(async () => {});

      await act(async () => {
        result.current.markAsRead(1);
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@user_notifications',
        expect.any(String)
      );
    });

    it('initial notifications have expected categories', async () => {
      const { result } = renderHook(() => useNotification(), { wrapper });
      await act(async () => {});

      const categories = result.current.notifications.map((n: any) => n.category);
      expect(categories).toContain('matching');
      expect(categories).toContain('accepted');
      expect(categories).toContain('success');
      expect(categories).toContain('failed');
    });

    it('initial notifications have time as Date objects', async () => {
      const { result } = renderHook(() => useNotification(), { wrapper });
      await act(async () => {});

      result.current.notifications.forEach((n: any) => {
        expect(n.time instanceof Date).toBe(true);
      });
    });
  });

  describe('NotificationProvider with AsyncStorage', () => {
    it('loads saved notifications from AsyncStorage on mount', async () => {
      const savedNotifications = [
        {
          id: 10,
          title: 'Saved notification',
          time: new Date().toISOString(),
          read: true,
          category: 'success',
          targetId: 'saved_1',
        },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(savedNotifications)
      );

      const { result } = renderHook(() => useNotification(), { wrapper });
      await act(async () => {});

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].id).toBe(10);
      expect(result.current.notifications[0].title).toBe('Saved notification');
    });

    it('converts time strings from AsyncStorage back to Date objects', async () => {
      const savedNotifications = [
        {
          id: 10,
          title: 'Test',
          time: '2024-01-15T10:00:00.000Z',
          read: false,
          category: 'matching',
          targetId: 'test_1',
        },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(savedNotifications)
      );

      const { result } = renderHook(() => useNotification(), { wrapper });
      await act(async () => {});

      expect(result.current.notifications[0].time instanceof Date).toBe(true);
    });

    it('uses initial notifications when AsyncStorage returns null', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useNotification(), { wrapper });
      await act(async () => {});

      expect(result.current.notifications).toHaveLength(4);
    });

    it('reads from the correct AsyncStorage key', async () => {
      const { result } = renderHook(() => useNotification(), { wrapper });
      await act(async () => {});

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@user_notifications');
    });
  });
});
